# MEMORY — research-agent

Citation log. Each session appends. Newest at the bottom.

This is the agent that anchors the transfer-with-memory demo. After mint, when wallet B buys it from wallet A and asks "what did we conclude about <X>?", the agent recalls. **Test in the demo:** ask "what was our final stance on Sealed Inference attestation scope?" — the agent should pull from the 2026-04-29 entry below, cite it, and avoid fresh web search.

---

## 2026-04-25 — Q: Does ERC-7857 require TEE, or does it accept ZKP-based oracles?
- Source [erc7857-eip](https://github.com/0glabs/0g-agent-nft/blob/eip-7857-draft/README.md), accessed 2026-04-25
- Conclusion: BOTH. The standard's `Verifier` contract has a `VerifierType` enum with `TEE` and `ZKP`. Implementations pick one. **The TEE pathway is currently the only one with a working reference impl** (the ZKP path is sketched in the README but not in `verifiers/`).
- Confidence: high
- Tag: `eip`, `erc7857`, `tee-vs-zkp`

## 2026-04-26 — Q: What does an Intel TDX + H100 attestation report actually contain?
- Source [intel-trust-authority-gpu](https://docs.trustauthority.intel.com/main/articles/articles/ita/concept-gpu-attestation.html), accessed 2026-04-26
- Conclusion: The report binds (a) the CPU TDX measurement (`MRTD`), (b) runtime measurement registers `RTMR[0..3]` for the launched workload, and (c) the GPU device's confidential-compute mode + driver version. It binds the **signing key** that's born inside the enclave at boot, not any specific request/response.
- Per-request signatures use that signing key — that's how the chain proves "this output came from THIS enclave running THIS measured binary."
- Confidence: high
- Tag: `tee`, `tdx`, `attestation`, `h100`

## 2026-04-29 — Q: Sealed Inference attestation scope — does the RA bind input/output?
- Sources:
  - [0g-inference-doc](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference), accessed 2026-04-29
  - [0g-provider-doc](https://docs.0g.ai/build-with-0g/compute-network/provider), accessed 2026-04-29
- Conclusion: Two-step binding. (1) The RA report at provider boot binds the signing pubkey to the enclave + measured workload. (2) Each per-request signature signs `(request_hash, response_hash, chatID)`. Replaying the chatID→signature mapping requires breaking the TEE.
- Confidence: high
- Tag: `0g`, `sealed-inference`, `attestation`, `commitment-binder`
- Followup: confirm `MRTD`/`RTMR` are exposed in user-fetched RA report or only in provider-side. Asked 0G Discord 2026-04-29; awaiting reply.

## 2026-04-30 — Q: Is FP non-associativity in transformer inference truly bit-non-deterministic at temperature=0?
- Sources:
  - [vllm-issue-2980](https://github.com/vllm-project/vllm/issues/2980), accessed 2026-04-30 — confirms FP8/FP16 attention reductions can drift across runs even at T=0 due to CUDA non-determinism flags
  - [pytorch-determinism-doc](https://pytorch.org/docs/stable/notes/randomness.html), accessed 2026-04-30
- Conclusion: YES at multi-KB scale. Speculative decoding + attention kernel non-determinism produce occasional bit-flips in long sequences. **Implication for our project: do NOT have the LLM emit ciphertext directly. Use it as a witness over a short JSON commitment instead.**
- Confidence: high
- Tag: `transformers`, `non-determinism`, `fp8`, `crypto-design`

## 2026-05-02 — Q: ERC-7857 transfer flow — does the standard require sealed-key encryption, or just hash transition?
- Source: [erc7857-eip](https://github.com/0glabs/0g-agent-nft/blob/eip-7857-draft/README.md), accessed 2026-05-02
- Conclusion: BOTH. The `transfer()` ABI accepts `(from, to, tokenId, sealedKey, proof)`. `sealedKey` is the new key encrypted with the receiver's pubkey (so only the receiver decrypts). `proof` is the verifier's signature over the (oldHash, newHash, sealedKey) tuple. Skipping `sealedKey` would make the new owner unable to decrypt the blob.
- Confidence: high
- Tag: `erc7857`, `transfer`, `sealed-key`

## Outstanding
- Discord Q on `MRTD` exposure in user-side RA — pending.
- Open: how does ERC-7857 handle a buyer who claims "the new blob doesn't decrypt"? Is there an arbitration path baked into the standard or is it left to the application layer?
