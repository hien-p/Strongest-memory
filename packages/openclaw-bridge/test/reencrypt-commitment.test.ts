import { describe, expect, it, vi } from 'vitest';
import { randomBytes } from 'node:crypto';
import { reencryptCommitment } from '../src/reencrypt-commitment.js';
import { deriveAgentKey, encryptBundle } from '../src/crypto.js';
import type { ZGLLMGateway } from '../src/llm-gateway.js';

function fakeGateway() {
  const calls: Array<{ tokenId: bigint; messages: Array<{ role: string; content: string }> }> = [];
  const gateway: Pick<ZGLLMGateway, 'chat'> = {
    chat: vi.fn(async (req) => {
      calls.push(req);
      // Echo the user message back wrapped in a JSON commitment shape to
      // simulate Sealed Inference behaving as the system prompt instructs.
      const userMsg = req.messages.find((m) => m.role === 'user');
      const parsed = userMsg ? JSON.parse(userMsg.content) : {};
      const witness = JSON.stringify({
        v: 1,
        old: parsed.old_hash,
        new: parsed.new_hash,
        sealed: parsed.sealed_key,
        to: parsed.new_owner,
        ts: parsed.ts,
      });
      return {
        content: witness,
        chatId: 'chat-' + Math.random().toString(36).slice(2, 10),
        attestation: async () => ({ stub: true, signedBy: '0xORACLE' }),
      };
    }),
  };
  return { gateway: gateway as unknown as ZGLLMGateway, calls };
}

describe('reencryptCommitment (Hack A flow)', () => {
  const masterKey = Buffer.alloc(32, 0x42);
  const oldOwner = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const newOwner = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const tokenId = 7n;
  const agentName = 'dev-orchestrator';

  function makeOldBlob(plaintext: Buffer): Buffer {
    const kOld = deriveAgentKey({ tokenId, ownerAddress: oldOwner, masterKey });
    return encryptBundle(plaintext, agentName, kOld).blob;
  }

  it('returns newBlob, sealedKey, oldHash/newHash, and a chatId', async () => {
    const { gateway } = fakeGateway();
    const plaintext = Buffer.from('SOUL.md...MEMORY.md...skills', 'utf8');
    const oldBlob = makeOldBlob(plaintext);

    const result = await reencryptCommitment(
      {
        tokenId,
        oldOwner,
        newOwner,
        oldBlob,
        newOwnerPubkey: randomBytes(33),
        masterKey,
        agentName,
      },
      gateway,
    );

    expect(result.newBlob.length).toBeGreaterThan(0);
    expect(result.sealedKey.length).toBeGreaterThan(0);
    expect(result.oldHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(result.newHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(result.chatId).toMatch(/^chat-/);
    expect(result.ts).toBeGreaterThan(0);
  });

  it('newBlob differs from oldBlob (re-encryption actually happened)', async () => {
    const { gateway } = fakeGateway();
    const plaintext = Buffer.from('persistent memory bytes', 'utf8');
    const oldBlob = makeOldBlob(plaintext);

    const result = await reencryptCommitment(
      { tokenId, oldOwner, newOwner, oldBlob, newOwnerPubkey: randomBytes(33), masterKey, agentName },
      gateway,
    );

    expect(result.newBlob.equals(oldBlob)).toBe(false);
    expect(result.oldHash).not.toBe(result.newHash);
  });

  it('the JSON commitment sent to the gateway contains old_hash, new_hash, sealed_key, new_owner, ts', async () => {
    const { gateway, calls } = fakeGateway();
    const oldBlob = makeOldBlob(Buffer.from('x', 'utf8'));

    await reencryptCommitment(
      { tokenId, oldOwner, newOwner, oldBlob, newOwnerPubkey: randomBytes(33), masterKey, agentName },
      gateway,
    );

    expect(calls.length).toBe(1);
    const userMsg = calls[0]!.messages.find((m) => m.role === 'user');
    expect(userMsg).toBeDefined();
    const payload = JSON.parse(userMsg!.content);
    expect(payload.old_hash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(payload.new_hash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(payload.sealed_key).toMatch(/^0x[0-9a-f]+$/);
    expect(payload.new_owner).toBe(newOwner);
    expect(typeof payload.ts).toBe('number');
  });

  it('the system prompt instructs deterministic JSON-only output', async () => {
    const { gateway, calls } = fakeGateway();
    const oldBlob = makeOldBlob(Buffer.from('x', 'utf8'));

    await reencryptCommitment(
      { tokenId, oldOwner, newOwner, oldBlob, newOwnerPubkey: randomBytes(33), masterKey, agentName },
      gateway,
    );

    const sysMsg = calls[0]!.messages.find((m) => m.role === 'system');
    expect(sysMsg).toBeDefined();
    expect(sysMsg!.content).toMatch(/deterministic/i);
    expect(sysMsg!.content).toMatch(/JSON/);
    expect(sysMsg!.content).toMatch(/no prose/i);
  });

  it('plaintext is preserved across re-encryption (the demo-defining property)', async () => {
    // This is THE invariant the demo hangs on: wallet B inherits wallet A's
    // memory. We re-derive K_new and decrypt result.newBlob, and assert it
    // matches the original plaintext byte-for-byte.
    const { decryptBundle } = await import('../src/crypto.js');
    const { gateway } = fakeGateway();

    const plaintext = Buffer.from(
      ['SOUL.md', '# Dev Orchestrator', '', 'MEMORY.md', '- recall: user asked about funding rates'].join('\n'),
      'utf8',
    );
    const oldBlob = makeOldBlob(plaintext);

    const result = await reencryptCommitment(
      { tokenId, oldOwner, newOwner, oldBlob, newOwnerPubkey: randomBytes(33), masterKey, agentName },
      gateway,
    );

    const kNew = deriveAgentKey({ tokenId, ownerAddress: newOwner, masterKey });
    const { plaintext: recovered } = decryptBundle(result.newBlob, kNew);
    expect(recovered.equals(plaintext)).toBe(true);
  });

  it('attestation() lazily resolves to the gateway response (TEE proof on demand)', async () => {
    const { gateway } = fakeGateway();
    const oldBlob = makeOldBlob(Buffer.from('x', 'utf8'));

    const result = await reencryptCommitment(
      { tokenId, oldOwner, newOwner, oldBlob, newOwnerPubkey: randomBytes(33), masterKey, agentName },
      gateway,
    );

    const proof = await result.attestation();
    expect(proof).toEqual({ stub: true, signedBy: '0xORACLE' });
  });
});
