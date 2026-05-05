import { describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { deriveAgentKey, encryptBundle, decryptBundle } from '../src/crypto.js';

const MAGIC = Buffer.from('STR1', 'ascii');

describe('deriveAgentKey', () => {
  const masterKey = Buffer.alloc(32, 0xab);

  it('is deterministic for the same (tokenId, ownerAddress, masterKey)', () => {
    const a = deriveAgentKey({
      tokenId: 42n,
      ownerAddress: '0x1111111111111111111111111111111111111111',
      masterKey,
    });
    const b = deriveAgentKey({
      tokenId: 42n,
      ownerAddress: '0x1111111111111111111111111111111111111111',
      masterKey,
    });
    expect(a.equals(b)).toBe(true);
    expect(a.length).toBe(32);
  });

  it('produces different keys for different tokenIds', () => {
    const a = deriveAgentKey({ tokenId: 1n, ownerAddress: '0x1111111111111111111111111111111111111111', masterKey });
    const b = deriveAgentKey({ tokenId: 2n, ownerAddress: '0x1111111111111111111111111111111111111111', masterKey });
    expect(a.equals(b)).toBe(false);
  });

  it('produces different keys for different owners (the transfer scenario)', () => {
    const oldOwner = deriveAgentKey({
      tokenId: 7n,
      ownerAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      masterKey,
    });
    const newOwner = deriveAgentKey({
      tokenId: 7n,
      ownerAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      masterKey,
    });
    expect(oldOwner.equals(newOwner)).toBe(false);
  });

  it('produces different keys for different master keys (compromise containment)', () => {
    const a = deriveAgentKey({
      tokenId: 1n,
      ownerAddress: '0x1111111111111111111111111111111111111111',
      masterKey: Buffer.alloc(32, 0x11),
    });
    const b = deriveAgentKey({
      tokenId: 1n,
      ownerAddress: '0x1111111111111111111111111111111111111111',
      masterKey: Buffer.alloc(32, 0x22),
    });
    expect(a.equals(b)).toBe(false);
  });
});

describe('encrypt + decrypt round-trip', () => {
  const key = randomBytes(32);

  it('round-trips a small payload', () => {
    const plaintext = Buffer.from('hello strongest', 'utf8');
    const { blob } = encryptBundle(plaintext, 'dev-orchestrator', key);
    const { plaintext: decrypted, aad } = decryptBundle(blob, key);
    expect(decrypted.equals(plaintext)).toBe(true);
    expect(aad.toString('utf8')).toBe('dev-orchestrator');
  });

  it('round-trips a 50KB payload (realistic agent bundle size)', () => {
    const plaintext = randomBytes(50_000);
    const { blob } = encryptBundle(plaintext, 'big-agent', key);
    const { plaintext: decrypted } = decryptBundle(blob, key);
    expect(decrypted.equals(plaintext)).toBe(true);
  });

  it('uses a fresh random nonce on every encrypt (so identical plaintext yields different ciphertext)', () => {
    const plaintext = Buffer.from('same text', 'utf8');
    const a = encryptBundle(plaintext, 'agent', key);
    const b = encryptBundle(plaintext, 'agent', key);
    expect(a.blob.equals(b.blob)).toBe(false);
    expect(a.nonce.equals(b.nonce)).toBe(false);
    // But both decrypt to the same plaintext
    expect(decryptBundle(a.blob, key).plaintext.equals(plaintext)).toBe(true);
    expect(decryptBundle(b.blob, key).plaintext.equals(plaintext)).toBe(true);
  });

  it('blob starts with the STR1 magic + version bytes', () => {
    const { blob } = encryptBundle(Buffer.from('x'), 'agent', key);
    expect(blob.subarray(0, 4).equals(MAGIC)).toBe(true);
    // version bytes: 0x00 0x01
    expect(blob[4]).toBe(0x00);
    expect(blob[5]).toBe(0x01);
  });
});

describe('encrypt + decrypt failure modes', () => {
  const key = randomBytes(32);

  it('decrypt rejects a blob with the wrong magic', () => {
    const { blob } = encryptBundle(Buffer.from('x'), 'agent', key);
    blob[0] = 0xff;
    expect(() => decryptBundle(blob, key)).toThrow(/Bad magic/);
  });

  it('decrypt rejects a blob with a tampered ciphertext byte (auth tag mismatch)', () => {
    const { blob } = encryptBundle(Buffer.from('original'), 'agent', key);
    // Flip a byte in the middle (well past header, before tag)
    blob[blob.length - 20] ^= 0x01;
    expect(() => decryptBundle(blob, key)).toThrow();
  });

  it('decrypt rejects with the wrong key', () => {
    const { blob } = encryptBundle(Buffer.from('secret'), 'agent', key);
    const wrongKey = randomBytes(32);
    expect(() => decryptBundle(blob, wrongKey)).toThrow();
  });

  it('decrypt rejects when AAD changes (binds blob to agent name)', () => {
    // We don't expose AAD-tampering directly because AAD is embedded in the
    // header; but if a forger swaps the agent name in the header, the auth
    // tag won't match.
    const { blob } = encryptBundle(Buffer.from('x'), 'agent-a', key);
    // The AAD field starts at byte 18 (4 magic + 2 version + 12 nonce + 2 aad_len).
    // 'agent-a' is 7 bytes; flip the first byte.
    blob[18] ^= 0xff;
    expect(() => decryptBundle(blob, key)).toThrow();
  });
});

describe('end-to-end transfer scenario (the actual flow we ship)', () => {
  it('old owner encrypts → new owner can decrypt after K_new derivation, but not before', () => {
    const masterKey = Buffer.alloc(32, 0xcd);
    const tokenId = 42n;
    const oldOwner = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const newOwner = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    const agentName = 'dev-orchestrator';

    const kOld = deriveAgentKey({ tokenId, ownerAddress: oldOwner, masterKey });
    const kNew = deriveAgentKey({ tokenId, ownerAddress: newOwner, masterKey });

    const plaintext = Buffer.from('SOUL.md\n# Dev Orchestrator\n\nMEMORY.md\n- prior session 1', 'utf8');
    const oldBlob = encryptBundle(plaintext, agentName, kOld).blob;

    // New owner cannot decrypt with their key alone — that's the whole point.
    expect(() => decryptBundle(oldBlob, kNew)).toThrow();

    // Bridge re-encrypts: decrypt with kOld, encrypt with kNew.
    const { plaintext: recovered } = decryptBundle(oldBlob, kOld);
    const newBlob = encryptBundle(recovered, agentName, kNew).blob;

    // Now new owner can decrypt with their derived key.
    const { plaintext: final } = decryptBundle(newBlob, kNew);
    expect(final.equals(plaintext)).toBe(true);
  });
});
