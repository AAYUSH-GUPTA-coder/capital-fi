// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {IERC20} from "../src/interfaces/IERC20.sol";
import {CapitalFi} from "../src/CapitalFi.sol";
import {ICreditDelegationToken} from "../src/interfaces/ICreditDelegationToken.sol";

import {IPool} from "../src/interfaces/aave/IPool.sol";
import {IPoolAddressesProvider} from "../src/interfaces/aave/IPoolAddressesProvider.sol";

contract TestPool is Test {
    IERC20 public opUsdc;
    CapitalFi public capitalFi;
    IPool public aavePoolOp;
    IPoolAddressesProvider public addressesProviderOp;

    address public usdcAddrOp = 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85;
    address public aUsdcAddrOp = 0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5;
    address public vUsdcAddrOp = 0x5D557B07776D12967914379C71a1310e917C7555;
    address public addressProviderOp =
        0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb;

    address user1 = address(123);
    address user2 = address(456);
    address user3 = address(333);
    address protocol = address(999);

    function setUp() public {
        opUsdc = IERC20(usdcAddrOp);
        capitalFi = new CapitalFi(addressProviderOp);

        addressesProviderOp = IPoolAddressesProvider(addressProviderOp);
        aavePoolOp = IPool(addressesProviderOp.getPool());

        // Setup addresses and fund them
        deal(usdcAddrOp, user1, 1000 * 1e6, false);
        deal(usdcAddrOp, user2, 1000 * 1e6, false);
        deal(usdcAddrOp, user3, 1000 * 1e6, false);
        deal(usdcAddrOp, protocol, 1000 * 1e6, false);
    }

    function testPoolDeposit() public {
        uint256 amount = 100 * 1e6;
        console.log("Address of CapitalFi", address(capitalFi));

        // deal(usdcAddrOp, user1, 1000 * 1e6, false);
        // deal(usdcAddrOp, user2, 1000 * 1e6, false);
        // deal(usdcAddrOp, user3, 1000 * 1e6, false);
        // deal(usdcAddrOp, protocol, 1000 * 1e6, false);

        vm.startPrank(user1);

        // 1. User approve capitalFi contract to use the usdc
        opUsdc.approve(address(capitalFi), type(uint256).max);

        // 2. Call the depsoit function
        capitalFi.deposit(usdcAddrOp, amount);
        vm.stopPrank();

        // 3. Check the capitalFi shares of user
        console.log("Balance of share of user", capitalFi.balanceOf(user1));

        assertGe(capitalFi.balanceOf(user1), 0);

        //! 4. Call the depsoit again to check shares change and adding 5 usdc before the call
        vm.startPrank(protocol);
        capitalFi.updatePool(105 * 1e6);
        vm.stopPrank();

        vm.startPrank(user2);
        // 5. User approve capitalFi contract to use the usdc
        opUsdc.approve(address(capitalFi), type(uint256).max);

        // 6. Call the deposit function
        console.log("totalPool1", capitalFi.getTotalPool());
        capitalFi.deposit(usdcAddrOp, amount);
        console.log("totalPool2", capitalFi.getTotalPool());
        vm.stopPrank();

        // 7. Check the capitalFi shares of user
        console.log("Balance of user2 share", capitalFi.balanceOf(user2));
        assertGe(capitalFi.balanceOf(user2), 0);

        //! 4. Call the depsoit again to check shares change and adding 5 usdc before the call
        vm.startPrank(protocol);
        opUsdc.transfer(address(capitalFi), 5 * 1e6);
        vm.stopPrank();

        vm.startPrank(user3);
        // 5. User approve capitalFi contract to use the usdc
        opUsdc.approve(address(capitalFi), type(uint256).max);

        // 6. Call the deposit function
        console.log("totalPool3", capitalFi.getTotalPool());
        capitalFi.deposit(usdcAddrOp, amount);
        console.log("totalPool4", capitalFi.getTotalPool());
        vm.stopPrank();

        // 7. Check the capitalFi shares of user
        console.log("Balance of user3 share", capitalFi.balanceOf(user3));
        assertGe(capitalFi.balanceOf(user3), 0);
    }

    function testPoolWithdraw() public {
        // deposit test
        testPoolDeposit();

        console.log("-----------------");
        console.log("total usdc in capitalFi", capitalFi.totalPool());
        console.log("amount of shares of user1", capitalFi.balanceOf(user1));
        console.log("total supply of shares", capitalFi.totalSupply());

        // user1 will withdraw all his funds from the protocol
        vm.startPrank(user1);
        capitalFi.withdraw(usdcAddrOp, capitalFi.balanceOf(user1));
        vm.stopPrank();

        assertGe(opUsdc.balanceOf(user1), 1000 * 1e6);
        console.log("New Balance of User1", opUsdc.balanceOf(user1));

        // user1 will withdraw all his funds from the protocol
        vm.startPrank(user2);
        capitalFi.withdraw(usdcAddrOp, capitalFi.balanceOf(user2));
        vm.stopPrank();

        assertGe(opUsdc.balanceOf(user2), 1000 * 1e6);
        console.log("New Balance of User2", opUsdc.balanceOf(user2));
    }

    function testCapitalFiSupply() public {
        uint256 amount = 100 * 1e6;
        console.log("Address of CapitalFi", address(capitalFi));

        vm.startPrank(user1);

        // 1. User approve capitalFi contract to use the usdc
        opUsdc.approve(address(capitalFi), type(uint256).max);

        // 2. Call the depsoit function
        capitalFi.deposit(usdcAddrOp, amount);
        vm.stopPrank();

        // 3. Check the capitalFi shares of capitalFi
        console.log(
            "Balance of share of capitalFi",
            capitalFi.balanceOf(user1)
        );

        assertGe(capitalFi.balanceOf(user1), 0);

        // call supplyToDefi to supply funds to defi
        capitalFi.supplyToDefi(usdcAddrOp);

        assertGe(IERC20(aUsdcAddrOp).balanceOf(address(capitalFi)), 0);
        console.log(
            "Balance of aUSDC OP of capitalFi",
            IERC20(aUsdcAddrOp).balanceOf(address(capitalFi))
        );
    }

    function testCapitalFiSupplyAndWithdraw() public {
        testCapitalFiSupply();
        capitalFi.withdrawFromDefi(usdcAddrOp, aUsdcAddrOp);
        console.log(
            "Balance of USDC of capitalFi",
            IERC20(usdcAddrOp).balanceOf(address(capitalFi))
        );
        console.log(
            "Balance of aUSDC OP of capitalFi",
            IERC20(aUsdcAddrOp).balanceOf(address(capitalFi))
        );
    }
}
