export default function TransferPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transfer an Agent</h1>
      <p className="text-zg-fg/70 mb-8">
        Send an iNFT to a new owner. The Phala-hosted oracle re-encrypts the encrypted blob to the new owner's key, signs the attestation, and the on-chain Verifier confirms the proof. Wired Day 7.
      </p>
    </main>
  );
}
