// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";

import {AgentNFT} from "../src/AgentNFT.sol";
import {Verifier, VerifierType} from "../src/verifiers/Verifier.sol";
import {RoyaltyHook} from "../src/RoyaltyHook.sol";

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/// @notice Deploys: Verifier (TEE) → AgentNFT impl → UpgradeableBeacon → BeaconProxy → RoyaltyHook.
/// @dev    Initializes the proxy via encoded `initialize` calldata in the BeaconProxy constructor,
///         matching the upstream Hardhat deploy in `contracts-fork/scripts/deploy/deploy.ts`.
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address platformTreasury = vm.envAddress("PLATFORM_TREASURY");

        string memory nftName = _envOr("ZG_NFT_NAME", "strongest Agent NFT");
        string memory nftSymbol = _envOr("ZG_NFT_SYMBOL", "STRA");
        string memory chainURL = _envOr("ZG_RPC_URL", "https://evmrpc-testnet.0g.ai");
        string memory indexerURL = _envOr("ZG_INDEXER_URL", "https://indexer-storage-testnet-turbo.0g.ai");

        vm.startBroadcast(deployerKey);

        // 1. Verifier (TEE-attested re-encryption proofs)
        Verifier verifier = new Verifier(address(0), VerifierType.TEE);
        console.log("Verifier:", address(verifier));

        // 2. AgentNFT implementation (constructor calls _disableInitializers)
        AgentNFT impl = new AgentNFT();
        console.log("AgentNFT impl:", address(impl));

        // 3. Beacon pointing at the impl
        UpgradeableBeacon beacon = new UpgradeableBeacon(address(impl), msg.sender);
        console.log("AgentNFT beacon:", address(beacon));

        // 4. BeaconProxy with initialize() calldata
        bytes memory initData = abi.encodeWithSelector(
            AgentNFT.initialize.selector, nftName, nftSymbol, address(verifier), chainURL, indexerURL
        );
        BeaconProxy proxy = new BeaconProxy(address(beacon), initData);
        console.log("AgentNFT proxy:", address(proxy));

        // 5. RoyaltyHook wired to the proxy address
        RoyaltyHook hook = new RoyaltyHook(address(proxy), platformTreasury);
        console.log("RoyaltyHook:", address(hook));

        vm.stopBroadcast();

        console.log("---");
        console.log("Set in .env:");
        console.log("NEXT_PUBLIC_TEE_VERIFIER_ADDRESS=", address(verifier));
        console.log("NEXT_PUBLIC_AGENT_NFT_ADDRESS=", address(proxy));
        console.log("NEXT_PUBLIC_ROYALTY_HOOK_ADDRESS=", address(hook));
    }

    function _envOr(string memory key, string memory fallbackValue) internal view returns (string memory) {
        try vm.envString(key) returns (string memory v) {
            return bytes(v).length == 0 ? fallbackValue : v;
        } catch {
            return fallbackValue;
        }
    }
}
