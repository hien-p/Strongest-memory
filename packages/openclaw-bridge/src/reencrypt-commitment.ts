/**
 * Re-encryption commitment-binder (Hack A).
 *
 * Spec: ../../../openclaw-0g-hackathon/architecture/inft-design.md
 *
 * Flow:
 *   1. K_old = HKDF(K_M, tokenId || oldOwner)
 *      K_new = HKDF(K_M, tokenId || newOwner)
 *   2. plaintext = AES-256-GCM-decrypt(K_old, oldBlob)
 *   3. newBlob   = AES-256-GCM-encrypt(K_new, plaintext)
 *   4. sealedKey = ECIES(newOwnerPubkey, K_new)   — TODO Day 7, libsodium-style
 *   5. Send a JSON-only commitment prompt to 0G Sealed Inference; capture the
 *      TEE-attested signature via broker.inference.processResponse(...)
 *   6. Return everything the AgentNFT.transfer(...) call needs
 *
 * The LLM never sees plaintext, never sees any private key, never computes AES.
 */

import { createHash } from 'node:crypto';
import { deriveAgentKey, encryptBundle, decryptBundle } from './crypto.js';
import type { ZGLLMGateway } from './llm-gateway.js';

export interface ReencryptInput {
  tokenId: bigint;
  oldOwner: string;
  newOwner: string;
  /** Hex-encoded current ciphertext (the encrypted blob currently in 0G Storage). */
  oldBlob: Buffer;
  /** secp256k1 pubkey of the new owner, for sealing K_new. */
  newOwnerPubkey: Buffer;
  /** 32-byte HKDF master key, held in the bridge process. */
  masterKey: Buffer;
  /** Agent identifier, used as AAD to bind ciphertext to the agent name. */
  agentName: string;
}

export interface ReencryptCommitment {
  /** AES-GCM ciphertext encrypted to K_new. */
  newBlob: Buffer;
  /** ECIES-sealed K_new for the new owner's pubkey. */
  sealedKey: Buffer;
  /** keccak/sha256 of oldBlob — included in the JSON commitment. */
  oldHash: string;
  /** keccak/sha256 of newBlob. */
  newHash: string;
  /** Sealed Inference response — the witnessed JSON. */
  witnessJson: string;
  /** broker.inference chatID; used to fetch the signature server-side. */
  chatId: string | null;
  /** Resolves to the TEE-attested signature payload — verified on-chain. */
  attestation: () => Promise<unknown>;
  /** Block timestamp the commitment was witnessed at. */
  ts: number;
}

const SYSTEM_PROMPT = [
  'You are a deterministic JSON emitter inside a TEE.',
  'Validate input fields are hex strings of plausible length, but DO NOT compute or modify them.',
  'Output exactly one JSON object on a single line, no prose, no markdown, no code fences:',
  '{"v":1,"old":"<old_hash>","new":"<new_hash>","sealed":"<sealed_key>","to":"<new_owner>","ts":<unix_seconds>}',
  'Echo every field exactly as supplied. Set "ts" to the timestamp from the user message.',
].join(' ');

/**
 * Run the full Hack A flow and return everything the on-chain transfer needs.
 *
 * Day 7 wiring TODO:
 *   - Replace the placeholder ECIES with secp256k1-based sealing (e.g. eciesjs)
 *   - Verify the chatID-bound signature address matches the registered oracle
 *   - Hook into RoyaltyHook for the transfer fee, not the inference fee
 */
export async function reencryptCommitment(
  input: ReencryptInput,
  gateway: ZGLLMGateway,
): Promise<ReencryptCommitment> {
  const kOld = deriveAgentKey({
    tokenId: input.tokenId,
    ownerAddress: input.oldOwner,
    masterKey: input.masterKey,
  });
  const kNew = deriveAgentKey({
    tokenId: input.tokenId,
    ownerAddress: input.newOwner,
    masterKey: input.masterKey,
  });

  const { plaintext } = decryptBundle(input.oldBlob, kOld);
  const { blob: newBlob } = encryptBundle(plaintext, input.agentName, kNew);

  // Placeholder sealedKey: in production, ECIES-encrypt kNew under newOwnerPubkey.
  // For Day 7 wiring, swap to `eciesjs` or a libsodium binding.
  const sealedKey = Buffer.concat([Buffer.from('SEAL', 'ascii'), input.newOwnerPubkey, kNew]);

  const oldHash = '0x' + sha256Hex(input.oldBlob);
  const newHash = '0x' + sha256Hex(newBlob);
  const ts = Math.floor(Date.now() / 1000);

  const userPrompt = JSON.stringify({
    old_hash: oldHash,
    new_hash: newHash,
    sealed_key: '0x' + sealedKey.toString('hex'),
    new_owner: input.newOwner,
    ts,
  });

  const response = await gateway.chat({
    tokenId: input.tokenId,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  return {
    newBlob,
    sealedKey,
    oldHash,
    newHash,
    witnessJson: response.content,
    chatId: response.chatId,
    attestation: response.attestation,
    ts,
  };
}

function sha256Hex(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}
