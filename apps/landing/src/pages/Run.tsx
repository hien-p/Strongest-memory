import { useState } from 'react';
import { createWalletClient, custom, defineChain, parseEther, formatEther, decodeEventLog } from 'viem';
import { Layout } from '@/components/Layout';
import { RouteBackground } from '@/components/RouteBackground';

const galileo = defineChain({
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai'] } },
  blockExplorers: { default: { name: 'chainscan-galileo', url: 'https://chainscan-galileo.0g.ai' } },
  testnet: true,
});

const ROYALTY_HOOK = '0x971a0A685c3b1B7dCb33FBeeA55cEe851D924c06' as const;

const ROYALTY_ABI = [
  {
    type: 'function',
    name: 'payAndRun',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
    ],
    outputs: [{ name: 'ok', type: 'bool' }],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'InferenceRun',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'runner', type: 'address', indexed: true },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'royaltyPaid', type: 'uint256', indexed: false },
      { name: 'royaltyReceiver', type: 'address', indexed: false },
    ],
  },
] as const;

const AGENTS = [
  { tokenId: 0n, name: 'dev-orchestrator.0g' },
  { tokenId: 1n, name: 'research-agent.0g' },
  { tokenId: 2n, name: 'funding-arb.0g' },
];

interface RunResult {
  status: 'ok' | 'bad';
  txHash?: string;
  fee?: bigint;
  royaltyPaid?: bigint;
  royaltyReceiver?: string;
  error?: string;
}

export default function Run() {
  const [tokenId, setTokenId] = useState<bigint>(0n);
  const [feeEth, setFeeEth] = useState('0.01');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const eth = (window as unknown as { ethereum?: any }).ethereum;
      if (!eth) throw new Error('No EVM wallet detected. Install MetaMask or another injected wallet.');

      // Make sure the wallet is on Galileo (chain 16602)
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x40DA' }], // 16602 in hex
        });
      } catch (switchErr: unknown) {
        // 4902 = chain not added; add it
        if (typeof switchErr === 'object' && switchErr !== null && 'code' in switchErr && (switchErr as { code: number }).code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x40DA',
                chainName: '0G Galileo Testnet',
                nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
                rpcUrls: ['https://evmrpc-testnet.0g.ai'],
                blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }

      const [account] = (await eth.request({ method: 'eth_requestAccounts' })) as `0x${string}`[];
      if (!account) throw new Error('No account selected');

      const wallet = createWalletClient({ chain: galileo, transport: custom(eth) });
      const fee = parseEther(feeEth);

      const txHash = await wallet.writeContract({
        account,
        address: ROYALTY_HOOK,
        abi: ROYALTY_ABI,
        functionName: 'payAndRun',
        args: [tokenId, fee],
        value: fee,
      });

      // Poll receipt — public RPC since wallet is the signer not reader.
      const { createPublicClient, http } = await import('viem');
      const pub = createPublicClient({ chain: galileo, transport: http() });
      const receipt = await pub.waitForTransactionReceipt({ hash: txHash });

      // Decode the InferenceRun event from the logs.
      let royaltyPaid: bigint | undefined;
      let royaltyReceiver: string | undefined;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== ROYALTY_HOOK.toLowerCase()) continue;
        try {
          const decoded = decodeEventLog({ abi: ROYALTY_ABI, data: log.data, topics: log.topics });
          if (decoded.eventName === 'InferenceRun') {
            royaltyPaid = decoded.args.royaltyPaid;
            royaltyReceiver = decoded.args.royaltyReceiver;
          }
        } catch {
          // ignore non-matching logs
        }
      }

      setResult({ status: 'ok', txHash, fee, royaltyPaid, royaltyReceiver });
    } catch (err) {
      setResult({ status: 'bad', error: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <RouteBackground variant="verify" />
      <main className="relative mx-auto max-w-[880px] px-6 pb-20 pt-8 sm:px-10">
        <header className="mb-10">
          <h1 className="font-serif text-4xl font-normal tracking-tight rgb-text-glitch">Run an agent</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/65">
            Pay a fee to invoke a minted agent. The <code className="rb-code">RoyaltyHook</code> contract on Galileo
            splits the fee 5% to the creator / 95% to the platform on the same tx, then emits an{' '}
            <code className="rb-code">InferenceRun</code> event the leaderboard reads. Pure on-chain settlement; no
            indexer.
          </p>
        </header>

        <section className="rb-card">
          <label className="rb-label" htmlFor="agent">
            Agent
          </label>
          <select
            id="agent"
            value={tokenId.toString()}
            onChange={(e) => setTokenId(BigInt(e.target.value))}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white outline-none focus:border-sky-400"
          >
            {AGENTS.map((a) => (
              <option key={a.tokenId.toString()} value={a.tokenId.toString()}>
                tokenId {a.tokenId.toString()} · {a.name}
              </option>
            ))}
          </select>
        </section>

        <section className="rb-card">
          <label className="rb-label" htmlFor="fee">
            Fee — paid in 0G
          </label>
          <input
            id="fee"
            value={feeEth}
            onChange={(e) => setFeeEth(e.target.value)}
            className="mt-2"
            placeholder="0.01"
          />
          <p className="mt-2 text-xs text-white/50">
            Of this, <strong className="text-white/80">5%</strong> goes to the creator (registered as the royalty
            receiver at mint), <strong className="text-white/80">95%</strong> to the platform treasury. Both transfers
            happen in the same tx as <code className="rb-code">payAndRun</code> via low-level <code className="rb-code">.call</code>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={run} disabled={busy} className="rb-btn rb-btn-primary disabled:opacity-50">
              {busy ? 'Sending tx…' : 'Pay royalty + run'}
            </button>
          </div>
          {result && (
            <div
              className={`rb-result ${result.status} mt-4`}
              dangerouslySetInnerHTML={{
                __html:
                  result.status === 'ok'
                    ? [
                        `<span class="badge ok">SUCCESS</span> Royalty paid + InferenceRun emitted on Galileo.`,
                        '',
                        `tx:        <a href="https://chainscan-galileo.0g.ai/tx/${result.txHash}" target="_blank" rel="noreferrer">${result.txHash}</a>`,
                        `fee:       ${result.fee ? formatEther(result.fee) : '—'} 0G`,
                        `royalty:   ${result.royaltyPaid ? formatEther(result.royaltyPaid) : '—'} 0G → <a href="https://chainscan-galileo.0g.ai/address/${result.royaltyReceiver}" target="_blank" rel="noreferrer">${result.royaltyReceiver}</a>`,
                      ].join('\n')
                    : `<span class="badge bad">ERROR</span> ${result.error ?? 'unknown'}`,
              }}
            />
          )}
        </section>

        <section className="rb-card mt-6 text-sm leading-relaxed text-white/65">
          <strong className="text-white">Mainnet path.</strong> Today the <code className="rb-code">payAndRun</code> call
          does the on-chain royalty split end-to-end on Galileo. The Sealed Inference call that would normally precede
          this — paying for the actual GLM-5/Qwen3.6 invocation through 0G Compute — is wired in{' '}
          <code className="rb-code">apps/api/</code> as a Cloudflare Worker, awaiting a funded compute account to go
          live. Day 4 ships the same flow on Aristotle mainnet.
        </section>
      </main>
    </Layout>
  );
}
