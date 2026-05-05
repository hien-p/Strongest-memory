# Reference agents

Three pre-built OpenClaw agents that ship as the demo iNFTs on Aristotle mainnet. Each has a `SOUL.md` (system prompt + personality), `MEMORY.md` (accumulated long-term memory — populated with **real** sessions so the transfer demo lands), and a `skills/` directory of JSON capability descriptors.

| Agent | `.0g` name | Use case | Royalty target |
|---|---|---|---|
| dev-orchestrator | `dev-orchestrator.0g` | Coding helper — routes tasks to specialized sub-agents | 5% creator |
| funding-arb | `funding-arb.0g` | Pacifica perp funding-rate watcher | 5% creator |
| research-agent | `research-agent.0g` | Persistent technical researcher with citation memory | 5% creator |

## Why these three

The 11-day plan calls for two reference agents; competitive analysis (vs MindVault @ 87.1) wants three. The third — `research-agent` — is the one that *most clearly* shows the transfer-with-memory-persistence demo: a researcher whose `MEMORY.md` has a dozen logged citations from prior sessions. When wallet B buys it and asks "what did we conclude about X?", the agent recalls. That's the visceral 2:30-mark moment in the demo video.

## Bundle format

Each agent is a directory:

```
<agent-name>/
├── SOUL.md          system prompt + personality + invariants
├── MEMORY.md        accumulated long-term memory (markdown bullets)
└── skills/
    ├── <name>.json  one capability descriptor per file
    └── ...
```

Mint flow (`scripts/mint-reference-agents.ts`):

1. Zip the directory
2. AES-256-GCM encrypt with `K_agent = HKDF(K_M, tokenId || ownerAddress, "openclaw-0g-agent-v1")`
3. Upload to 0G Storage Turbo → `rootHash`
4. Call `AgentNFT.mintAgent(rootHash, deployer, deployer, 500)` (5% royalty, deployer as initial owner + creator)
5. Bind `<agent-name>.0g` via SPACE ID

## Where the memory comes from

The `MEMORY.md` files in this repo are seeded with **representative** sessions, not real user data. For the demo, after mint we run a few real Sealed Inference calls to grow the memory organically before recording the transfer take. README discloses this honestly.
