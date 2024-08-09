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


import "forge-std/console.sol";

error FAILED_TO_RECEIVED();
error AMOUNT_CANT_BE_ZERO();
error NOT_ENOUGH_SHARES();
error FAILED_TO_TRANSFER();

contract CapitalFi is ERC20 {
    using Math for uint256;

    IPoolAddressesProvider private immutable addressesProvider;
    IPool private immutable pool;
    uint256 public constant PRECISION = 1e6;
    uint256 public totalPool;

    constructor(address _addressProvider) ERC20("CAPITALFI", "CAP") {
        addressesProvider = IPoolAddressesProvider(_addressProvider);
        pool = IPool(addressesProvider.getPool());
    }

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

    function supplyToDefi(address _token) public {
        uint totalTokenBalance = IERC20(_token).balanceOf(address(this));

        // Approve pool to use token
        IERC20(_token).approve(address(pool), totalTokenBalance);

        // Supply to Pool onbehalf of user
        pool.supply(_token, totalTokenBalance, address(this), 0);
    }

    function withdrawFromDefi(address _token, address _aTokenAddr) public {
        uint totalAtokenBalance = IERC20(_aTokenAddr).balanceOf(address(this));

        // Approve pool to use token
        IERC20(_aTokenAddr).approve(address(pool), totalAtokenBalance);

        pool.withdraw(_token, totalAtokenBalance, address(this));
    }

    function getTotalPool() external view returns (uint256) {
        return totalPool;
    }
}

// Ideally TotalPoolValue / totalPool = will be Amount in defi protocols in usd terms + value of pool in usd term. the problem is we have Pool in different chains, so also need to track that
