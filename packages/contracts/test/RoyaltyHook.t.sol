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

    function test_PayAndRun_HonorsCustomBps() public {
        // 12.34% royalty → 0.1234 ether out of 1 ether
        nft.set(creator, creator, 1234);
        uint256 fee = 1 ether;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        assertEq(creator.balance, 0.1234 ether, "creator gets bps share");
        assertEq(treasury.balance, fee - 0.1234 ether, "platform gets remainder");
    }

    function test_PayAndRun_ZeroBps_AllToPlatform() public {
        nft.set(creator, creator, 0);
        uint256 fee = 1 ether;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        assertEq(creator.balance, 0, "creator gets nothing at 0 bps");
        assertEq(treasury.balance, fee, "platform gets full fee");
    }

    function test_PayAndRun_HundredPctBps_AllToCreator() public {
        nft.set(creator, creator, 10_000);
        uint256 fee = 1 ether;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        assertEq(creator.balance, fee, "creator gets full fee at 10000 bps");
        assertEq(treasury.balance, 0, "platform gets nothing");
    }

    function test_PayAndRun_EmitsInferenceRunEvent() public {
        nft.set(creator, creator, 500);
        uint256 fee = 2 ether;

        vm.expectEmit(true, true, false, true);
        emit RoyaltyHook.InferenceRun(42, runner, fee, 0.1 ether, creator);

        vm.prank(runner);
        hook.payAndRun{value: fee}(42, fee);
    }

    /// @dev Fuzz: for any reasonable fee + bps, royalty + platform amounts always sum to fee
    ///      and never exceed it. This is the invariant that protects creators from rounding
    ///      drift and the platform from overpayment.
    function testFuzz_PayAndRun_SplitConservesValue(uint128 feeRaw, uint16 bpsRaw) public {
        // Constrain to something the runner can fund and which exercises the math.
        uint256 fee = uint256(feeRaw) % 100 ether + 1; // [1 wei, 100 ether]
        uint256 bps = uint256(bpsRaw) % 10_001;        // [0, 10000]

        nft.set(creator, creator, bps);
        vm.deal(runner, fee);

        uint256 creatorBefore = creator.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        uint256 royaltyOut = creator.balance - creatorBefore;
        uint256 platformOut = treasury.balance - treasuryBefore;

        assertEq(royaltyOut + platformOut, fee, "split conserves value");
        assertLe(royaltyOut, fee, "royalty never exceeds fee");
    }

    function test_RevertsOnConstruction_ZeroAgentNFT() public {
        vm.expectRevert(bytes("Zero AgentNFT"));
        new RoyaltyHook(address(0), treasury);
    }

    function test_RevertsOnConstruction_ZeroTreasury() public {
        vm.expectRevert(bytes("Zero treasury"));
        new RoyaltyHook(address(nft), address(0));
    }
}
