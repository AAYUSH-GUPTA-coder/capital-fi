// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {IPoolAddressesProvider} from "./interfaces/aave/IPoolAddressesProvider.sol";
import {IPool} from "./interfaces/aave/IPool.sol";
import {DataTypes} from "./interfaces/aave/DataTypes.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

import "forge-std/console.sol";

error FAILED_TO_RECEIVED();
error AMOUNT_CANT_BE_ZERO();
error NOT_ENOUGH_SHARES();
error FAILED_TO_TRANSFER();
error CapitalFi_onlyOwnerCanCall(address caller);

contract CapitalFi is ERC20 {
    using Math for uint256;

    IPoolAddressesProvider private immutable addressesProvider;
    IPool private immutable pool;
    uint256 public constant PRECISION = 1e6;
    uint256 public totalPool;
    address private owner;
    address private immutable i_router;
    address private immutable i_link;

    event LendMessageSent(
        bytes32 messageId,
        address token,
        uint256 amount,
        uint64 destinationChainSelector,
        address receiver,
        uint256 gasFeeAmount
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert CapitalFi_onlyOwnerCanCall(msg.sender);
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
            sharesToMint = (_amount * totalSupply()) / totalPool;
        }

        // Update the total pool size
        totalPool += _amount;

        // Mint shares to the user
        _mint(msg.sender, sharesToMint);
    }

    // function just for testing
    function updatePool(uint256 newPoolSize) external {
        require(newPoolSize >= totalPool, "Pool size can only increase");
        totalPool = newPoolSize;
    }

    /**
     * @notice function to burn our protocol shares and give user USDC
     * @param _token address of USDC
     * @param _shares amount of shares
     */
    function withdraw(
        address _token,
        uint256 _shares
    ) external returns (uint256) {
        if (_shares == 0) revert AMOUNT_CANT_BE_ZERO();
        if (balanceOf(msg.sender) < _shares) revert NOT_ENOUGH_SHARES();

        uint256 amountToWithdraw = (_shares * totalPool) / totalSupply();

        // Burn the user's shares
        _burn(msg.sender, _shares);

        // Update the total pool size
        totalPool -= amountToWithdraw;

        // Transfer USDC back to the user
        IERC20(_token).transfer(msg.sender, amountToWithdraw);

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
     */
    function withdrawFromDefi(address _token, address _aTokenAddr) public {
        uint totalAtokenBalance = IERC20(_aTokenAddr).balanceOf(address(this));
        pool.withdraw(_token, totalAtokenBalance, address(this));
    }

    /**
     * @notice function to bride the tokens to different chain and call the SupplyToDefi function on that chain
     * @param _token address of usdc
     * @param _receiver address of the receiver contract address (CapitalFiGateway)
     * @param _gasFeeAmount gas required to execute this function
     * @param _destinationChainSelector ccip-chain ID of destination chain
     */
    function bridgeAndSupplyToDefi(
        address _token,
        address _receiver,
        uint256 _gasFeeAmount,
        uint64 _destinationChainSelector
    ) public {
        // create token amounts
        Client.EVMTokenAmount[] memory tokenAmounts = getTokenAmountMessage(
            _token,
            getContractErc20Balance(_token)
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

        bytes32 messageId;

        // approve router contract to use LINK token
        LinkTokenInterface(i_link).approve(i_router, fee);

        // approve router contract to use USDC token
        IERC20(_token).approve(i_router, getContractErc20Balance(_token));

        // execute the action
        messageId = IRouterClient(i_router).ccipSend(
            _destinationChainSelector,
            message
        );

        emit LendMessageSent(
            messageId,
            _token,
            getContractErc20Balance(_token),
            _destinationChainSelector,
            _receiver,
            _gasFeeAmount
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

    function getTotalPool() external view returns (uint256) {
        return totalPool;
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

// Ideally TotalPoolValue / totalPool = will be Amount in defi protocols in usd terms + value of pool in usd term. the problem is we have Pool in different chains, so also need to track that
