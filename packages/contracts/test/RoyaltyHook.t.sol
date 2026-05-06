// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {RoyaltyHook, IAgentNFTOwner} from "../src/RoyaltyHook.sol";

contract MockAgentNFT is IAgentNFTOwner {
    address public owner;

    /// Backwards-compat for tests that used to set receiver/bps separately.
    /// The hook now hardcodes ROYALTY_BPS = 500 and uses ownerOf as receiver,
    /// so only `owner_` is honored — the other args are ignored.
    function set(address owner_, address /* receiver_ */, uint256 /* bps_ */) external {
        owner = owner_;
    }

    function ownerOf(uint256) external view returns (address) {
        return owner;
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

    function test_RoyaltyBpsConstant() public view {
        assertEq(hook.ROYALTY_BPS(), 500, "5% hardcoded");
    }

    function test_PayAndRun_EmitsInferenceRunEvent() public {
        nft.set(creator, creator, 500);
        uint256 fee = 2 ether;

        vm.expectEmit(true, true, false, true);
        emit RoyaltyHook.InferenceRun(42, runner, fee, 0.1 ether, creator);

        vm.prank(runner);
        hook.payAndRun{value: fee}(42, fee);
    }

    /// @dev Fuzz: for any fee, royalty + platform amounts always sum to fee
    ///      and never exceed it. Bps is hardcoded at 500 in v1.
    function testFuzz_PayAndRun_SplitConservesValue(uint128 feeRaw) public {
        uint256 fee = uint256(feeRaw) % 100 ether + 1; // [1 wei, 100 ether]
        nft.set(creator, address(0), 0);               // owner = creator
        vm.deal(runner, fee);

        uint256 creatorBefore = creator.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(runner);
        hook.payAndRun{value: fee}(1, fee);

        uint256 royaltyOut = creator.balance - creatorBefore;
        uint256 platformOut = treasury.balance - treasuryBefore;

        assertEq(royaltyOut + platformOut, fee, "split conserves value");
        assertLe(royaltyOut, fee, "royalty never exceeds fee");
        assertEq(royaltyOut, (fee * 500) / 10_000, "5% of fee");
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
