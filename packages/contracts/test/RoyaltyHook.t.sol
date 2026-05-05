// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {RoyaltyHook, IAgentNFTRoyalty} from "../src/RoyaltyHook.sol";

contract MockAgentNFT is IAgentNFTRoyalty {
    address public owner;
    address public royaltyReceiver;
    uint256 public royaltyBps;

    function set(address owner_, address receiver_, uint256 bps_) external {
        owner = owner_;
        royaltyReceiver = receiver_;
        royaltyBps = bps_;
    }

    function ownerOf(uint256) external view returns (address) {
        return owner;
    }

    function getRoyaltyInfo(uint256) external view returns (address, uint256) {
        return (royaltyReceiver, royaltyBps);
    }
}

contract RoyaltyHookTest is Test {
    RoyaltyHook hook;
    MockAgentNFT nft;
    address creator = address(0xC1EA);
    address treasury = address(0xBEEF);
    address runner = address(0x12);

    function setUp() public {
        nft = new MockAgentNFT();
        hook = new RoyaltyHook(address(nft), treasury);
        vm.deal(runner, 10 ether);
    }

    function test_PayAndRun_SplitsFee_5Percent() public {
        nft.set(creator, creator, 500); // 5%
        uint256 fee = 1 ether;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        assertEq(creator.balance, 0.05 ether, "creator royalty");
        assertEq(treasury.balance, 0.95 ether, "platform share");
    }

    function test_PayAndRun_FallsBackToOwner_WhenReceiverZero() public {
        nft.set(creator, address(0), 500);
        uint256 fee = 1 ether;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        assertEq(creator.balance, 0.05 ether, "creator (via ownerOf)");
    }

    function test_PayAndRun_RefundsOverpay() public {
        nft.set(creator, creator, 500);
        uint256 fee = 1 ether;
        uint256 sent = 1.5 ether;

        vm.prank(runner);
        hook.payAndRun{value: sent}(1, fee);

        assertEq(runner.balance, 10 ether - fee, "overpay refunded");
    }

    function test_PayAndRun_RevertsOnUnderpay() public {
        nft.set(creator, creator, 500);

        vm.prank(runner);
        vm.expectRevert(abi.encodeWithSelector(RoyaltyHook.InsufficientFee.selector, 0.5 ether, 1 ether));
        hook.payAndRun{value: 0.5 ether}(1, 1 ether);
    }
}
