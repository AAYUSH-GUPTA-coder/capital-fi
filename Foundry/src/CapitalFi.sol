// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {IPoolAddressesProvider} from "./interfaces/aave/IPoolAddressesProvider.sol";
import {IPool} from "./interfaces/aave/IPool.sol";
import {DataTypes} from "./interfaces/aave/DataTypes.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

import "forge-std/console.sol";

error FAILED_TO_RECEIVED();
error AMOUNT_CANT_BE_ZERO();
error NOT_ENOUGH_SHARES();
error FAILED_TO_TRANSFER();
error CapitalFi__onlyOwnerCanCall(address caller);
error CapitalFi__onlyWhitelistedAddr(address caller);
error CapitalFi__NotEnoughLinkBalance(
    uint256 currentBalance,
    uint256 calculatedFees
);

contract CapitalFi is ERC20 {
    IPoolAddressesProvider private immutable addressesProvider;
    IPool private immutable pool;
    uint256 public constant PRECISION = 1e6;
    uint256 public totalProtocolValue;
    address private owner;
    address private immutable i_router;
    address private immutable i_link;

    mapping(address => bool) public isWhitelisted;

    event LendMessageSent(
        bytes32 messageId,
        address token,
        uint256 amount,
        uint64 destinationChainSelector,
        address receiver,
        uint256 gasFeeAmount
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert CapitalFi__onlyOwnerCanCall(msg.sender);
        _;
    }

    modifier onlyWhiteListed(address _caller) {
        if (isWhitelisted[_caller] != true)
            revert CapitalFi__onlyWhitelistedAddr(msg.sender);
        _;
    }

    constructor(
        address _owner,
        address _ccipRouter,
        address _link,
        address _addressProvider
    ) ERC20("CAPITALFI", "CAP") {
        owner = _owner;
        i_router = _ccipRouter;
        i_link = _link;
        addressesProvider = IPoolAddressesProvider(_addressProvider);
        pool = IPool(addressesProvider.getPool());
    }

    /**
     * @notice function to receive USDC from the user. User will get back protocol shares
     * @param _token address of the USDC
     * @param _amount amount to be deposited
     */
    function deposit(address _token, uint256 _amount) external {
        if (_amount == 0) revert AMOUNT_CANT_BE_ZERO();
        bool receiveToken = IERC20(_token).transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        if (!receiveToken) revert FAILED_TO_RECEIVED();

        uint256 sharesToMint;

        if (totalSupply() == 0) {
            // If this is the first deposit, mint 1:1 shares
            sharesToMint = _amount;
        } else {
            // Calculate shares based on the current pool size
            sharesToMint = (_amount * totalSupply()) / totalProtocolValue;
        }

        // Update the total pool size
        totalProtocolValue += _amount;

        // Mint shares to the user
        _mint(msg.sender, sharesToMint);
    }

    // function just for testing
    // This function is need to be updated by beckend server
    function updateProtocolValue(uint256 _newPoolSize) external {
        totalProtocolValue = _newPoolSize;
    }

    /**
     * @notice function to burn our protocol shares and give user USDC
     * @param _token address of USDC
     * @param _shares amount of shares
     */
    function withdraw(
        address _token,
        address _aToken,
        uint256 _shares
    ) external returns (uint256) {
        if (_shares == 0) revert AMOUNT_CANT_BE_ZERO();
        if (balanceOf(msg.sender) < _shares) revert NOT_ENOUGH_SHARES();

        uint256 amountToWithdraw = (_shares * totalProtocolValue) /
            totalSupply();

        // Burn the user's shares
        _burn(msg.sender, _shares);

        // Update the total pool size
        totalProtocolValue -= amountToWithdraw;

        if (amountToWithdraw <= IERC20(_token).balanceOf(address(this))) {
            // Transfer USDC back to the user
            IERC20(_token).transfer(msg.sender, amountToWithdraw);
        } else if (
            amountToWithdraw <= IERC20(_aToken).balanceOf(address(this))
        ) {
            pool.withdraw(_token, amountToWithdraw, address(this));
            IERC20(_token).transfer(msg.sender, amountToWithdraw);
        } else {}

        return amountToWithdraw;
    }

    /**
     * @notice function to supply Protocol USDC to the Defi protocol (currently only aave)
     * @param _token address of the token
     */
    function supplyToDefi(address _token) public {
        uint totalTokenBalance = IERC20(_token).balanceOf(address(this));

        // Approve pool to use token
        IERC20(_token).approve(address(pool), totalTokenBalance);

        // Supply to Pool onbehalf of user
        pool.supply(_token, totalTokenBalance, address(this), 0);
    }

    /**
     * @notice function to withdraw Protocol USDC from the Defi protocol (currently only aave)
     * @param _token address of the USDC
     * @param _aTokenAddr address of aToken / Lend Token
     */
    function withdrawFromDefi(address _token, address _aTokenAddr) public {
        uint totalAtokenBalance = IERC20(_aTokenAddr).balanceOf(address(this));
        pool.withdraw(_token, totalAtokenBalance, address(this));
    }

    /**
     * @notice function to bride the tokens to different chain and call the SupplyToDefi function on that chain.
     * @dev This function will work when our Protocol have token
     * @param _token address of usdc
     * @param _receiver address of the receiver contract address (CapitalFiGateway)
     * @param _gasFeeAmount gas required to execute this function
     * @param _destinationChainSelector ccip-chain ID of destination chain
     * NOTES: need onlyWhiteListed() address can call
     */
    function bridgeAndSupplyToDefi(
        address _token,
        address _receiver,
        uint256 _gasFeeAmount,
        uint64 _destinationChainSelector
    ) public onlyWhiteListed(msg.sender) returns (bytes32 messageId) {
        // get the balance of USDC in this protocol
        uint256 totalBalance = getContractErc20Balance(_token);

        // Create an EVM2AnyMessage struct in memory
        Client.EVMTokenAmount[] memory tokenAmounts = getTokenAmountMessage(
            _token,
            totalBalance
        );

        // create client message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: abi.encodeWithSignature("supplyToDefi(address)", _token),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: _gasFeeAmount})
            ),
            feeToken: i_link
        });

        // calculate fees
        uint256 fee = IRouterClient(i_router).getFee(
            _destinationChainSelector,
            message
        );

        if (fee > IERC20(i_link).balanceOf(address(this)))
            revert CapitalFi__NotEnoughLinkBalance(
                IERC20(i_link).balanceOf(address(this)),
                fee
            );

        bytes32 messageId;

        // approve router contract to use LINK token
        LinkTokenInterface(i_link).approve(i_router, fee);

        // approve router contract to use USDC token
        IERC20(_token).approve(i_router, totalBalance);

        // execute the action
        messageId = IRouterClient(i_router).ccipSend(
            _destinationChainSelector,
            message
        );

        emit LendMessageSent(
            messageId,
            _token,
            totalBalance,
            _destinationChainSelector,
            _receiver,
            _gasFeeAmount
        );

        // Return the message ID
        return messageId;
    }

    /**
     * @notice function to withdraw the tokens from AAVE protocol, bride the tokens to different chain and call the SupplyToDefi function on that chain.
     * @dev This function will work when our selected defi Protocol have tokens
     * @param _token address of usdc
     * @param _receiver address of the receiver contract address (CapitalFiGateway)
     * @param _gasFeeAmount gas required to execute this function
     * @param _destinationChainSelector ccip-chain ID of destination chain
     * NOTES: need onlyWhiteListed() address can call
     */
    function withdrawBridgeAndSupply(
        address _token,
        address _receiver,
        uint256 _gasFeeAmount,
        uint64 _destinationChainSelector,
        address _aToken
    ) public {
        withdrawFromDefi(_token, _aToken);
        bridgeAndSupplyToDefi(
            _token,
            _receiver,
            _gasFeeAmount,
            _destinationChainSelector
        );
    }

    function getTokenAmountMessage(
        address _token,
        uint256 _amount
    ) public pure returns (Client.EVMTokenAmount[] memory) {
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });
        return tokenAmounts;
    }

    function setWhitelist(address _whitelist) external onlyOwner {
        isWhitelisted[_whitelist] = true;
    }

    function getTotalPool() external view returns (uint256) {
        return totalProtocolValue;
    }

    function getOwnerAddr() public view returns (address) {
        return owner;
    }

    function getRouterAddress() public view returns (address) {
        return i_router;
    }

    function getLinkAddress() public view returns (address) {
        return i_link;
    }

    /**
     * @notice get the ERC20 token balance of the contract
     * @param _token: address of the token
     */
    function getContractErc20Balance(
        address _token
    ) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
}

// Ideally TotalPoolValue / totalProtocolValue = will be Amount in defi protocols in usd terms + value of pool in usd term. the problem is we have Pool in different chains, so also need to track that

// ! check totalProtocolValue again, after completing smart contract
