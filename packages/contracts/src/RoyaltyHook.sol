// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Splits inference fees on every Sealed Inference call.
/// @dev    Sits ON TOP of the 0G serving-broker billing (which only pays the
///         compute provider). This hook routes a configurable bps share of
///         each fee to the agent creator on-chain. Default: 5% (500 bps).
///
/// Royalty receiver and bps are fetched from the AgentNFT registry, where
/// they're stored at mint time and may be updated by the token owner.
interface IAgentNFTRoyalty {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getRoyaltyInfo(uint256 tokenId) external view returns (address receiver, uint256 bps);
}

contract RoyaltyHook {
    IAgentNFTRoyalty public immutable agentNFT;
    address public immutable platformTreasury;

    /// @dev   tokenId, runner (msg.sender), total fee paid, royalty share routed to creator
    event InferenceRun(
        uint256 indexed tokenId,
        address indexed runner,
        uint256 fee,
        uint256 royaltyPaid,
        address royaltyReceiver
    );

    error InsufficientFee(uint256 sent, uint256 required);
    error PayoutFailed();

    constructor(address agentNFTAddress, address platformTreasuryAddress) {
        require(agentNFTAddress != address(0), "Zero AgentNFT");
        require(platformTreasuryAddress != address(0), "Zero treasury");
        agentNFT = IAgentNFTRoyalty(agentNFTAddress);
        platformTreasury = platformTreasuryAddress;
    }

    /// @notice Pay a fee, route royaltyBps to creator, remainder to platform treasury.
    /// @param  tokenId  The iNFT being invoked
    /// @param  fee      The total fee for this inference call (must equal msg.value)
    /// @return ok       true on success (reverts otherwise)
    function payAndRun(uint256 tokenId, uint256 fee) external payable returns (bool ok) {
        if (msg.value < fee) revert InsufficientFee(msg.value, fee);

        (address receiver, uint256 bps) = agentNFT.getRoyaltyInfo(tokenId);
        // Default to token owner if no explicit royalty receiver set.
        if (receiver == address(0)) {
            receiver = agentNFT.ownerOf(tokenId);
        }

        uint256 royalty = (fee * bps) / 10_000;
        uint256 toPlatform = fee - royalty;

        if (royalty > 0) {
            (bool sentR,) = receiver.call{value: royalty}("");
            if (!sentR) revert PayoutFailed();
        }
        if (toPlatform > 0) {
            (bool sentP,) = platformTreasury.call{value: toPlatform}("");
            if (!sentP) revert PayoutFailed();
        }

        // Refund any overpayment.
        if (msg.value > fee) {
            (bool sentRefund,) = msg.sender.call{value: msg.value - fee}("");
            if (!sentRefund) revert PayoutFailed();
        }

        emit InferenceRun(tokenId, msg.sender, fee, royalty, receiver);
        return true;
    }
}
