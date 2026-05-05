export default function MintPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mint an Agent</h1>
      <p className="text-zg-fg/70 mb-8">
        3-step wizard: upload OpenClaw bundle → choose name → set royalty → mint. Wired Day 8.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-zg-fg/80">
        <li>Drop a bundle (SOUL.md + MEMORY.md + skills/)</li>
        <li>Encrypt client-side, push to 0G Storage</li>
        <li>Mint AgentNFT with metadataRootHash + 5% royalty</li>
      </ol>
    </main>
  );
}
