// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error FailedToWithdrawEth(address owner, uint256 amount);
error CAPITALFI_GATEWAY_ERROR();
error ONLY_OWNER_CALL_THIS_FUNCTION();

contract CapitalFiGateway is CCIPReceiver, ReentrancyGuard {
    address public capitalFiAddr;
    address public i_tokenAddr;
    address public owner;

    modifier onlyOwner(address _address) {
        if (_address != owner) revert ONLY_OWNER_CALL_THIS_FUNCTION();
        _;
    }

    /**
     *
     * @param _ccipRouter Address of the CCIP Router contract
     * @param _capitalFi address of the capitalFi contract
     */
    constructor(
        address _ccipRouter,
        address _capitalFi,
        address _tokenAddr,
        address _owner
    ) CCIPReceiver(_ccipRouter) {
        capitalFiAddr = _capitalFi;
        i_tokenAddr = _tokenAddr;
        owner = _owner;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override nonReentrant {
        // logic to transfer the token received, to send CapitalFi
        IERC20(i_tokenAddr).transfer(
            capitalFiAddr,
            IERC20(i_tokenAddr).balanceOf(address(this))
        );

        // Call the CapitalFi function
        (bool success, ) = capitalFiAddr.call(message.data);
        if (!success) revert CAPITALFI_GATEWAY_ERROR();
    }

    /// @notice Fallback function to allow the contract to receive Ether.
    receive() external payable {}

    /// @notice Allows the contract owner to withdraw the entire balance of Ether from the contract.
    function withdraw() public onlyOwner(msg.sender) {
        uint256 amount = address(this).balance;
        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, amount);
    }

    /**
     * @notice Allows the contract owner to withdraw the entire balance of Ether from the contract.
     * @param token address of the ERC20 token
     */
    function withdrawToken(address token) public onlyOwner(msg.sender) {
        uint256 amount = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, amount);
    }
}
