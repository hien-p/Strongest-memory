import type { Context } from "hono";
import type { WorkerEnv } from "./types";

/**
 * GET /api/health — cheap liveness probe. Confirms the Worker is up and
 * which chain / route family it is wired to. Does NOT touch the broker
 * or any RPC; safe to hit from CI without secrets configured.
 */
export function healthHandler(c: Context<{ Bindings: WorkerEnv }>) {
  return c.json({
    ok: true,
    route: "api",
    chain: 16602,
  });
}
