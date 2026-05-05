# Contributing

Thanks for taking a look. This project has a small, opinionated workflow — read this once and you'll be fine.

## TL;DR

1. Branch off `main` with a `feat/`, `fix/`, `chore/`, or `docs/` prefix.
2. Make your change. **Add a card to `apps/web/public/logs/index.html` describing it.**
3. Commit with a Conventional-Commits–style message. **Do not include any "Claude" or "Anthropic" attribution.** The `commit-msg` hook will reject it.
4. Open a PR against `main`. Fill out the template.
5. CI deploys to Cloudflare on merge.

## First-time setup

After cloning:

```bash
./scripts/install-hooks.sh
```

This points `core.hooksPath` at `.githooks/`, enabling:

- **`commit-msg`** — blocks commits whose message contains `Claude`, `Anthropic`, or `Co-Authored-By: Claude` (case-insensitive).
- **`pre-push`** — warns if the commits you're pushing didn't touch `apps/web/public/logs/index.html`. It's a warning, not a block, so a `chore: typo` push won't be punished.

If you're using Claude Code, `.claude/settings.json` adds a `PreToolUse` hook that blocks `git commit` invocations with banned strings *before* the commit is created.

On top of the local hooks, `.github/workflows/commit-guard.yml` runs on every push and PR. It scans commit messages on the server and fails the workflow if any contain the banned patterns — so commits made through the GitHub web UI, the API, or a fresh clone that skipped `install-hooks.sh` still get caught. Three layers, belt-and-suspenders-and-airbag.

## Branch naming

| Prefix    | Use for                                  |
| --------- | ---------------------------------------- |
| `feat/`   | new functionality                        |
| `fix/`    | bug fix                                  |
| `chore/`  | tooling, deps, infra                     |
| `docs/`   | docs only — no code change               |
| `refactor/` | restructuring without behavior change |

Example: `feat/add-search`, `fix/logs-card-spacing`.

## Commit messages

Follow Conventional Commits roughly:

```
<type>(<optional scope>): <short summary>

<optional body — the why, not the what>
```

Examples:

```
feat(logs): add tag filter to devlog
fix(deploy): wrangler.toml was missing compatibility_date
chore: bump wrangler to 3.x
```

**Banned strings** (the hook will reject):

- `Co-Authored-By: Claude` (or any "Claude" / "Anthropic" mention)
- `🤖 Generated with [Claude Code]` and similar footers

If you used an AI assistant, that's fine — it just doesn't go on the commit. The author is you.

## The `/logs` requirement

Every change that lands on `main` should add an entry to `apps/web/public/logs/index.html`. The card sits at the top of `<main id="log-stream">`:

```html
<article class="log-card" data-date="2026-05-05">
  <header>
    <time datetime="2026-05-05">2026-05-05</time>
    <span class="log-tag">feat</span>
  </header>
  <h3>One-line summary</h3>
  <p>Two or three sentences on why and what's user-visible.</p>
</article>
```

Why: this gives the project a public, low-effort changelog that builds up as you ship. The `pre-push` hook will nudge you if you forgot.

Exceptions where you can skip the card (be honest with yourself):

- pure `chore:` changes that don't affect users (e.g., bumping a dev dep)
- `docs:` changes to `README.md` / `CONTRIBUTING.md` themselves

## Cloudflare workflow

The deploy target is **Cloudflare Workers with Static Assets**, configured in `wrangler.toml`. Static files live in `apps/web/`.

### Local

```bash
# Option A: Python — no Cloudflare toolchain required
python3 -m http.server 8787 --directory apps/web

# Option B: wrangler — closer to production
npx wrangler dev    # serves on :8787
```

### Production

Push to `main`. `.github/workflows/deploy.yml` runs `wrangler deploy` using two repo secrets:

- `CLOUDFLARE_API_TOKEN` — create at <https://dash.cloudflare.com/profile/api-tokens> with the **Edit Cloudflare Workers** template
- `CLOUDFLARE_ACCOUNT_ID` — top-right of your Cloudflare dashboard

Set both under **Settings → Secrets and variables → Actions**.

### Custom domains

After the first deploy succeeds, attach a domain in the Cloudflare dashboard: **Workers & Pages → \<your worker\> → Settings → Domains & Routes → Add → Custom Domain**. DNS is automatic if the zone is on Cloudflare.

### Environment variables

- **Public, non-secret** values: declare under `[vars]` in `wrangler.toml`. They're committed.
- **Secrets**: `npx wrangler secret put MY_SECRET` (or in the dashboard). Never commit them. Never paste them into `wrangler.toml`.

## PR checklist (also in the template)

- [ ] Branch is named `feat/…`, `fix/…`, `chore/…`, or `docs/…`
- [ ] Commits pass the `commit-msg` hook (no Claude/Anthropic attribution)
- [ ] `apps/web/public/logs/index.html` has a new card (or the change qualifies for an exception above)
- [ ] If UI changed, I've eyeballed it on `:8787` locally
- [ ] No secrets in the diff (`grep -i 'api[_-]?key\|token\|secret' <diff>` came back clean)

## Reviews

Be direct. "This is wrong because X" beats "have you considered Y?". If a comment is unclear, ask. Don't merge your own PRs unless the repo is solo and the change is trivial.
