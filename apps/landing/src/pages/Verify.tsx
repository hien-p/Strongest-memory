import { useState } from 'react';
import { keccak256, recoverAddress, encodePacked, isAddress, isHex, getAddress, serializeSignature } from 'viem';
import { privateKeyToAccount, sign } from 'viem/accounts';
import { Layout } from '@/components/Layout';
import { RouteBackground } from '@/components/RouteBackground';

// Demo-only key. Used solely to generate a valid signature for the
// "Fill demo values" button so judges can click through end-to-end.
// NEVER hold real funds at this address.
const DEMO_PK = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const;

export default function Verify() {
  const [reqHash, setReqHash] = useState('');
  const [resHash, setResHash] = useState('');
  const [chatId, setChatId] = useState('');
  const [sig, setSig] = useState('');
  const [oracle, setOracle] = useState('');
  const [result, setResult] = useState<{ status: 'ok' | 'bad'; html: string } | null>(null);

  async function fillDemo() {
    // Generate a real signed payload so "Recover & verify" lands VERIFIED.
    const reqHashD = ('0x' + 'aa'.repeat(32)) as `0x${string}`;
    const resHashD = ('0x' + 'bb'.repeat(32)) as `0x${string}`;
    const chatIdD = 'chat-demo-001';
    const account = privateKeyToAccount(DEMO_PK);
    const digest = keccak256(encodePacked(['bytes32', 'bytes32', 'string'], [reqHashD, resHashD, chatIdD]));
    const sigObj = await sign({ hash: digest, privateKey: DEMO_PK });
    setReqHash(reqHashD);
    setResHash(resHashD);
    setChatId(chatIdD);
    setSig(serializeSignature(sigObj));
    setOracle(account.address);
    setResult(null);
  }

  async function verify() {
    try {
      if (!isHex(reqHash) || reqHash.length !== 66) throw new Error('reqHash must be 0x-prefixed 32-byte hex');
      if (!isHex(resHash) || resHash.length !== 66) throw new Error('resHash must be 0x-prefixed 32-byte hex');
      if (!isHex(sig) || sig.length !== 132) throw new Error('signature must be 0x-prefixed 65-byte hex');
      if (!isAddress(oracle)) throw new Error('oracle must be a 20-byte address');

      const digest = keccak256(
        encodePacked(['bytes32', 'bytes32', 'string'], [reqHash as `0x${string}`, resHash as `0x${string}`, chatId]),
      );
      const recovered = await recoverAddress({ hash: digest, signature: sig as `0x${string}` });
      const match = getAddress(recovered) === getAddress(oracle);

      const verdict = match
        ? '<span class="badge ok">VERIFIED</span> Response came from the registered oracle enclave.'
        : '<span class="badge bad">MISMATCH</span> Recovered address does NOT match the registered oracle. Reject.';

      setResult({
        status: match ? 'ok' : 'bad',
        html: [verdict, '', `digest:    ${digest}`, `recovered: ${getAddress(recovered)}`, `expected:  ${getAddress(oracle)}`].join(
          '\n',
        ),
      });
    } catch (err) {
      setResult({ status: 'bad', html: '<span class="badge bad">ERROR</span> ' + (err instanceof Error ? err.message : String(err)) });
    }
  }

  return (
    <Layout>
      <RouteBackground variant="verify" />
      <main className="relative mx-auto max-w-[880px] px-6 pb-20 pt-8 sm:px-10">
        <header className="mb-10">
          <h1 className="font-serif text-4xl font-normal tracking-tight rgb-text-glitch">Attestation Viewer</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/65">
            Recover the signing address from a Sealed Inference response payload + signature. If it matches the
            registered TEE oracle, the response provably came from a key generated inside an Intel TDX + H100 enclave at
            provider boot.
          </p>
        </header>

        <section className="rb-card">
          <Field label="Request hash" hint="32-byte hex">
            <input value={reqHash} onChange={(e) => setReqHash(e.target.value)} placeholder="0x…" spellCheck={false} />
          </Field>
        </section>
        <section className="rb-card">
          <Field label="Response hash" hint="32-byte hex">
            <input value={resHash} onChange={(e) => setResHash(e.target.value)} placeholder="0x…" spellCheck={false} />
          </Field>
        </section>
        <section className="rb-card">
          <Field label="ChatID" hint="from ZG-Res-Key header">
            <input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="e.g. chat-abc123…" spellCheck={false} />
          </Field>
        </section>
        <section className="rb-card">
          <Field label="Signature" hint="65-byte hex (r ‖ s ‖ v)">
            <textarea value={sig} onChange={(e) => setSig(e.target.value)} placeholder="0x…" spellCheck={false} />
          </Field>
        </section>
        <section className="rb-card">
          <Field label="Registered oracle address" hint="from on-chain Verifier">
            <input value={oracle} onChange={(e) => setOracle(e.target.value)} placeholder="0x…" spellCheck={false} />
          </Field>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={verify} className="rb-btn rb-btn-primary">
              Recover &amp; verify
            </button>
            <button onClick={fillDemo} className="rb-btn rb-btn-ghost">
              Fill demo values
            </button>
          </div>
          {result && (
            <pre
              className={`rb-result ${result.status}`}
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          )}
        </section>

        <section className="rb-card mt-6 text-sm leading-relaxed text-white/65">
          <strong className="text-white">How this works.</strong> 0G's broker signs each Sealed Inference response with a
          key born inside the TEE at provider boot. The signed payload is{' '}
          <code className="rb-code">keccak256(req_hash ‖ res_hash ‖ chatID)</code>. We <code className="rb-code">ecrecover</code>{' '}
          the signing address from <code className="rb-code">(r,s,v)</code> against that digest and check it matches the
          address registered as the oracle on the on-chain <code className="rb-code">Verifier</code>. A match means the
          response provably came from this enclave.
        </section>
      </main>
    </Layout>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="rb-label">
        {label} {hint && <span className="opacity-60">— {hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
