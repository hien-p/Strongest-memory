// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";

import {AgentNFT} from "../src/AgentNFT.sol";
import {Verifier, VerifierType} from "../src/verifiers/Verifier.sol";
import {RoyaltyHook} from "../src/RoyaltyHook.sol";

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/// @notice End-to-end deploy + initialize sanity test mirroring script/Deploy.s.sol.
///         Catches "the BeaconProxy was forgotten" or "initialize signature drifted"
///         regressions that wouldn't show up in unit tests.
contract IntegrationTest is Test {
    AgentNFT public proxiedNFT;
    Verifier public verifier;
    UpgradeableBeacon public beacon;
    RoyaltyHook public hook;

    address constant TREASURY = address(0xBEEF);

    function setUp() public {
        // 1. Verifier (TEE mode)
        verifier = new Verifier(address(0), VerifierType.TEE);

        // 2. AgentNFT impl (constructor disables initializers on impl itself)
        AgentNFT impl = new AgentNFT();

        // 3. Beacon
        beacon = new UpgradeableBeacon(address(impl), address(this));

        // 4. BeaconProxy with initialize(...) calldata
        bytes memory initData = abi.encodeWithSelector(
            AgentNFT.initialize.selector,
            "strongest Agent NFT",
            "STRA",
            address(verifier),
            "https://evmrpc.0g.ai",
            "https://indexer-storage-testnet-turbo.0g.ai"
        );
        BeaconProxy proxy = new BeaconProxy(address(beacon), initData);
        proxiedNFT = AgentNFT(address(proxy));

        // 5. Hook (against the proxy address, not the impl)
        hook = new RoyaltyHook(address(proxiedNFT), TREASURY);
    }

    function test_ProxyExposesNameAndSymbol() public view {
        assertEq(proxiedNFT.name(), "strongest Agent NFT");
        assertEq(proxiedNFT.symbol(), "STRA");
    }

    function test_ProxyVerifierIsRegistered() public view {
        assertEq(address(proxiedNFT.verifier()), address(verifier));
    }

    function test_ImplIsLockedAgainstReinit() public {
        // Calling initialize on the impl directly must revert because the
        // impl's constructor calls _disableInitializers().
        AgentNFT freshImpl = new AgentNFT();
        vm.expectRevert();
        freshImpl.initialize("x", "X", address(verifier), "", "");
    }

    function test_HookPointsAtProxyNotImpl() public view {
        // Critical: if Deploy.s.sol passed the impl address by mistake, the
        // RoyaltyHook would call ownerOf/getRoyaltyInfo on a contract that
        // never finished initialize() and revert. Make sure the wired address
        // is the proxy.
        assertEq(address(hook.agentNFT()), address(proxiedNFT));
    }

    function test_HookTreasuryIsCorrect() public view {
        assertEq(hook.platformTreasury(), TREASURY);
    }
}
