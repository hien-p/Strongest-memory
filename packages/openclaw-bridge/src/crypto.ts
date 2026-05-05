/**
 * Per-agent encryption: AES-256-GCM with HKDF-derived key.
 *
 * Spec: ../../../openclaw-0g-hackathon/architecture/inft-design.md (Encryption scheme)
 *
 * K_agent = HKDF-SHA256(master = K_M, salt = tokenId || ownerAddress, info = "openclaw-0g-agent-v1", length = 32)
 *
 * For the demo, K_M is held in the re-encryption oracle TEE. Locally the bridge
 * receives `K_agent` directly (the oracle exposes a /derive endpoint) — we never
 * read K_M outside the TEE.
 */

import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const MAGIC = Buffer.from('STR1', 'ascii');           // 4 bytes
const VERSION = Uint8Array.from([0x00, 0x01]);        // 2 bytes
const NONCE_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
const INFO = Buffer.from('openclaw-0g-agent-v1', 'utf8');

export interface AgentKeyContext {
  tokenId: bigint;
  ownerAddress: string;
  /** Master key bytes — held by the TEE in production. */
  masterKey: Buffer;
}

export function deriveAgentKey(ctx: AgentKeyContext): Buffer {
  const tokenIdBuf = Buffer.from(ctx.tokenId.toString(16).padStart(64, '0'), 'hex');
  const ownerBuf = Buffer.from(ctx.ownerAddress.replace(/^0x/, ''), 'hex');
  const salt = Buffer.concat([tokenIdBuf, ownerBuf]);
  return Buffer.from(hkdfSync('sha256', ctx.masterKey, salt, INFO, KEY_LEN));
}

export interface EncryptedBlob {
  /** magic(4) || version(2) || nonce(12) || aad_len(2) || aad || ciphertext || tag(16) */
  blob: Buffer;
  nonce: Buffer;
  aad: Buffer;
}

/**
 * Encrypt a plaintext buffer with K_agent, prefixed with a self-describing header.
 *
 * @param plaintext  zip(SOUL.md + MEMORY.md + skills/)
 * @param agentName  used as AAD so a forged blob can't be replayed across agents
 * @param key        K_agent (derived via deriveAgentKey)
 */
export function encryptBundle(plaintext: Buffer, agentName: string, key?: Buffer): EncryptedBlob {
  const k = key ?? randomBytes(KEY_LEN); // dev fallback; real callers pass the derived key
  const nonce = randomBytes(NONCE_LEN);
  const aad = Buffer.from(agentName, 'utf8');

  const cipher = createCipheriv('aes-256-gcm', k, nonce);
  cipher.setAAD(aad);
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  const aadLen = Buffer.alloc(2);
  aadLen.writeUInt16BE(aad.length, 0);

  const blob = Buffer.concat([MAGIC, Buffer.from(VERSION), nonce, aadLen, aad, ct, tag]);
  return { blob, nonce, aad };
}

export function decryptBundle(blob: Buffer, key: Buffer): { plaintext: Buffer; aad: Buffer } {
  if (!blob.subarray(0, 4).equals(MAGIC)) throw new Error('Bad magic — not a strongest blob');
  // version: blob.subarray(4, 6)
  const nonce = blob.subarray(6, 6 + NONCE_LEN);
  const aadLen = blob.readUInt16BE(6 + NONCE_LEN);
  const aadStart = 6 + NONCE_LEN + 2;
  const aad = blob.subarray(aadStart, aadStart + aadLen);
  const tagStart = blob.length - TAG_LEN;
  const ct = blob.subarray(aadStart + aadLen, tagStart);
  const tag = blob.subarray(tagStart);

  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return { plaintext, aad };
}
