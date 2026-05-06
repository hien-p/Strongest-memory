// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {RoyaltyHook} from "../src/RoyaltyHook.sol";

/// @notice Redeploy ONLY the RoyaltyHook (Verifier + AgentNFT proxy stay).
///         Used after we removed the dependency on AgentNFT.getRoyaltyInfo()
///         (which the upstream contract doesn't expose), so payAndRun could
///         actually succeed. Reads AGENT_NFT + PLATFORM_TREASURY env vars.
contract DeployRoyaltyHook is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address agentNFT = vm.envAddress("AGENT_NFT");
        address platformTreasury = vm.envAddress("PLATFORM_TREASURY");

        vm.startBroadcast(deployerKey);
        RoyaltyHook hook = new RoyaltyHook(agentNFT, platformTreasury);
        vm.stopBroadcast();

        console.log("RoyaltyHook (v2):", address(hook));
    }
}
