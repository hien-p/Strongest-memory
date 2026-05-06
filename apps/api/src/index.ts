// strongest-api Worker entrypoint.
//
// Routing: hono (chosen over itty-router because hono ships first-class
// Cloudflare Workers types, built-in CORS middleware, and is already
// installed in the workspace via another transitive dep — keeps the
// install graph small). itty-router would also work; the surface area
// we use here is small enough to swap if needed.

import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthHandler } from "./health";
import { sealInferenceHandler } from "./seal-inference";
import type { WorkerEnv } from "./types";

const app = new Hono<{ Bindings: WorkerEnv }>();

// Permissive CORS — the React frontend on strongest.pages.dev (and any
// preview/staging Pages URL) needs to call this Worker cross-origin.
// Tighten the origin list before going to mainnet.
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.get("/api/health", healthHandler);
app.post("/api/seal-inference", sealInferenceHandler);

// Catch-all: keep the response shape consistent (JSON, never HTML).
app.notFound((c) => c.json({ error: "not_found" }, 404));
app.onError((err, c) => {
  const detail = err instanceof Error ? err.message : String(err);
  return c.json({ error: "internal_error", detail }, 500);
});

export default app;
