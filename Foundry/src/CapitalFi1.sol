// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.24;

// import {IERC20} from "./interfaces/IERC20.sol";
// import {IPoolAddressesProvider} from "./interfaces/aave/IPoolAddressesProvider.sol";
// import {IPool} from "./interfaces/aave/IPool.sol";
// import {DataTypes} from "./interfaces/aave/DataTypes.sol";
// import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

// import "forge-std/console.sol";

// error FAILED_TO_RECEIVED();
// error AMOUNT_CANT_BE_ZERO();
// error NOT_ENOUGH_SHARES();
// error FAILED_TO_TRANSFER();

// contract Pool1 is ERC20 {
//     using Math for uint256;

//     IPoolAddressesProvider private immutable addressesProvider;
//     IPool private immutable pool;
//     uint256 public constant PRECISION = 1e6;
//     uint256 public totalPool;

//     constructor(address _addressProvider) ERC20("CAPITALFI", "CAP") {
//         addressesProvider = IPoolAddressesProvider(_addressProvider);
//         pool = IPool(addressesProvider.getPool());
//     }

//     // function deposit(address _token, uint256 _amount) external {
//     //     if (_amount == 0) revert AMOUNT_CANT_BE_ZERO();
//     //     bool receiveToken = IERC20(_token).transferFrom(
//     //         msg.sender,
//     //         address(this),
//     //         _amount
//     //     );
//     //     if (!receiveToken) revert FAILED_TO_RECEIVED();

//     //     // 10 ETH is just for testing
//     //     // Ideally it will be Amount in defi protocols in usd terms + value of pool in usd term. the problem is we have Pool in different chains, so also need to track that
//     //     uint256 totalPoolValue = IERC20(_token).balanceOf(address(this));
//     //     console.log("totalPoolValue:", totalPoolValue);
//     //     uint256 totalShares = totalSupply();
//     //     console.log("totalShares:", totalShares);

//     //     uint256 sharesToMint;
//     //     if (totalShares == 0) {
//     //         sharesToMint = _amount;
//     //     } else {
//     //         // uint256 pricePerShare = (totalPoolValue * PRECISION) / totalShares;
//     //         // sharesToMint = ((_amount * PRECISION) / pricePerShare);

//     //         uint256 pricePerShare = Math.mulDiv(
//     //             totalPoolValue,
//     //             PRECISION,
//     //             totalShares
//     //         );
//     //         console.log("pricePerShare:", pricePerShare);
//     //         sharesToMint = Math.mulDiv(_amount, PRECISION, pricePerShare);
//     //     }
//     //     _mint(msg.sender, sharesToMint);
//     //     console.log("sharesToMint:", sharesToMint);
//     //     console.log("-------------");
//     // }

//     function deposit(address _token, uint256 _amount) external {
//         if (_amount == 0) revert AMOUNT_CANT_BE_ZERO();
//         bool receiveToken = IERC20(_token).transferFrom(
//             msg.sender,
//             address(this),
//             _amount
//         );
//         if (!receiveToken) revert FAILED_TO_RECEIVED();

//         uint256 sharesToMint;

//         if (totalSupply() == 0) {
//             // If this is the first deposit, mint 1:1 shares
//             sharesToMint = _amount;
//         } else {
//             // Calculate shares based on the current pool size
//             sharesToMint = (_amount * totalSupply()) / totalPool;
//         }

//         // Update the total pool size
//         totalPool += _amount;

//         // Mint shares to the user
//         _mint(msg.sender, sharesToMint);
//     }

//     // function just for testing
//     function updatePool(uint256 newPoolSize) external {
//         require(newPoolSize >= totalPool, "Pool size can only increase");
//         totalPool = newPoolSize;
//     }

//     function withdraw(
//         address _token,
//         uint256 _shares
//     ) external returns (uint256) {
//         if (_shares == 0) revert AMOUNT_CANT_BE_ZERO();
//         if (balanceOf(msg.sender) < _shares) revert NOT_ENOUGH_SHARES();

//         uint256 amountToWithdraw = (_shares * totalPool) / totalSupply();

//         // Burn the user's shares
//         _burn(msg.sender, _shares);

//         // Update the total pool size
//         totalPool -= amountToWithdraw;

//         // Transfer USDC back to the user
//         IERC20(_token).transfer(msg.sender, amountToWithdraw);

//         return amountToWithdraw;
//     }

//     function getTotalPool() external view returns (uint256) {
//         return totalPool;
//     }

//     // function withdraw(uint256 _shares, address _token) external {
//     //     if (_shares == 0) revert AMOUNT_CANT_BE_ZERO();
//     //     if (balanceOf(msg.sender) < _shares) revert NOT_ENOUGH_SHARES();

//     //     // 10 ETH is just for testing
//     //     // Ideally it will be Amount in defi protocols in usd terms + value of pool in usd term. the problem is we have Pool in different chains, so also need to track that
//     //     uint256 totalPoolValue = 10 ether +
//     //         IERC20(_token).balanceOf(msg.sender);
//     //     uint256 totalShares = totalSupply();

//     //     uint256 pricePerShare = (totalPoolValue * PRECISION) / totalShares;
//     //     uint256 withdrawAmount = (_shares * pricePerShare) / PRECISION;

//     //     _burn(msg.sender, _shares);
//     //     bool transferToken = IERC20(_token).transfer(
//     //         msg.sender,
//     //         withdrawAmount
//     //     );
//     //     if (!transferToken) revert FAILED_TO_TRANSFER();
//     // }
// }

// // 100_000_000
// // 11_111_110

// // Balance of share of user 100_000_000
// // Balance of user2 share 11_111_111
// // Balance of user3 share 12_345_679

// // Ideally TotalPoolValue / totalPool = will be Amount in defi protocols in usd terms + value of pool in usd term. the problem is we have Pool in different chains, so also need to track that
