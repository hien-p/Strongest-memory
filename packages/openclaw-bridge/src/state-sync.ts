/**
 * Watches the local OpenClaw agents directory and pushes encrypted snapshots
 * to 0G Storage on every change.
 *
 * Spec: ../../../openclaw-0g-hackathon/architecture/openclaw-bridge.md (state-sync.ts)
 *       ../../../openclaw-0g-hackathon/architecture/inft-design.md (encryption scheme)
 */

import path from 'node:path';
import { promises as fs } from 'node:fs';
import { encryptBundle } from './crypto.js';

export interface StateSyncOptions {
  /** Path on disk that contains agents (e.g. /home/claude/agents). */
  agentsDir: string;
  /** ethers.Signer-compatible signer for the upload tx. */
  signer: unknown;
  /** 0G Storage Turbo indexer URL. */
  indexerUrl: string;
  /** Async callback fired with the new root hash after each successful upload. */
  onUpdate: (agentName: string, rootHash: string, txHash: string) => void | Promise<void>;
  /** Debounce window in ms (default 1500). */
  debounceMs?: number;
}

export class StateSync {
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly opts: StateSyncOptions) {}

  async watch(): Promise<void> {
    const chokidar = await import('chokidar');
    const watcher = chokidar.watch(this.opts.agentsDir, { persistent: true, ignoreInitial: true });

    watcher.on('all', (_event: string, file: string) => {
      const rel = path.relative(this.opts.agentsDir, file);
      const agentName = rel.split(path.sep)[0];
      if (!agentName) return;
      this.scheduleSync(agentName);
    });
  }

  private scheduleSync(agentName: string) {
    clearTimeout(this.timers.get(agentName));
    const t = setTimeout(() => {
      this.syncAgent(agentName).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[state-sync] failed for ${agentName}:`, err);
      });
    }, this.opts.debounceMs ?? 1500);
    this.timers.set(agentName, t);
  }

  async syncAgent(agentName: string): Promise<{ rootHash: string; txHash: string }> {
    const agentDir = path.join(this.opts.agentsDir, agentName);
    const bundle = await this.bundleAgent(agentDir);
    const encrypted = await encryptBundle(bundle, agentName);

    // Lazy import — @0gfoundation/0g-ts-sdk pulls in big deps.
    const sdk = (await import('@0gfoundation/0g-ts-sdk' as string).catch(() => {
      throw new Error('Install @0gfoundation/0g-ts-sdk to use StateSync');
    })) as { ZgFile: new (data: Buffer) => unknown; Indexer: new (url: string) => Indexer };

    type Indexer = { upload(file: unknown, signer: unknown): Promise<{ rootHash: string; txHash: string }> };

    const file = new sdk.ZgFile(encrypted.blob);
    const indexer = new sdk.Indexer(this.opts.indexerUrl);
    const { rootHash, txHash } = await indexer.upload(file, this.opts.signer);

    await this.opts.onUpdate(agentName, rootHash, txHash);
    return { rootHash, txHash };
  }

  /** Zip SOUL.md + MEMORY.md + skills/ into a single buffer. Stub: read-and-concat. */
  private async bundleAgent(agentDir: string): Promise<Buffer> {
    // TODO(Day 2): replace with proper zip (e.g. fflate). For now: dirty concat
    // so the rest of the pipeline can be tested with a small, deterministic blob.
    const soul = await fs.readFile(path.join(agentDir, 'SOUL.md')).catch(() => Buffer.alloc(0));
    const memory = await fs.readFile(path.join(agentDir, 'MEMORY.md')).catch(() => Buffer.alloc(0));
    const skillsDir = path.join(agentDir, 'skills');
    const skillFiles = await fs.readdir(skillsDir).catch(() => [] as string[]);
    const skills = await Promise.all(
      skillFiles.map((f) => fs.readFile(path.join(skillsDir, f)).catch(() => Buffer.alloc(0))),
    );
    return Buffer.concat([soul, memory, ...skills]);
  }
}
