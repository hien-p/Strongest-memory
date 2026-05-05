# claude-cloudflare-template

A GitHub template for projects you build with Claude Code and ship on Cloudflare. Opinionated about three things:

1. **Claude never signs the commits.** Three layers — a Claude Code `PreToolUse` hook, a git `commit-msg` hook, and a `Commit Guard` GitHub Actions workflow — block any message containing `Claude`, `Anthropic`, `Co-Authored-By: Claude`, or `🤖 Generated with [Claude Code]`. The local hooks catch commits before they exist; the Action catches anything made via the GitHub web UI, API, or a fresh clone that skipped `install-hooks.sh`. The visible author list stays human.
2. **Every change shows up in `/logs`.** `apps/web/public/logs/index.html` is a devlog. Every commit/PR adds a card. The convention is enforced in `CLAUDE.md` and surfaced in the PR template.
3. **Cloudflare is the default runtime.** `wrangler.toml` ships static assets via Workers; `.github/workflows/deploy.yml` deploys on push to `main`. Local dev on `:8787`.

## Use this template

```bash
gh repo create my-new-thing --template hien-p/claude-cloudflare-template --private --clone
cd my-new-thing
./scripts/install-hooks.sh    # wires .githooks/ into git config
```

Then edit `wrangler.toml` (`name = "..."`) and replace placeholders in `apps/web/index.html` + `apps/web/public/logs/index.html`.

## Local dev

```bash
# static, no toolchain:
python3 -m http.server 8787 --directory apps/web

# or via wrangler (if you've installed it):
npx wrangler dev
```

Both serve `apps/web/` at `http://localhost:8787`. The devlog is at `/logs/`.

## Deploy

Push to `main`. The `Deploy` workflow runs `wrangler deploy` using two repo secrets:

- `CLOUDFLARE_API_TOKEN` — token with **Workers Scripts: Edit** + **Account: Read** scopes
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

Set them in **Settings → Secrets and variables → Actions**.

## What's in the box

```
.claude/settings.json          # PreToolUse hook blocking Claude attribution in `git commit`
.githooks/commit-msg           # git-side enforcement (works without Claude Code too)
.githooks/pre-push             # nudges if /logs wasn't touched in the pushed range
scripts/install-hooks.sh       # wires .githooks/ into core.hooksPath
apps/web/index.html            # landing page
apps/web/public/logs/index.html# devlog page — add a card per change
wrangler.toml                  # Cloudflare Workers + Static Assets
.github/workflows/deploy.yml         # CF deploy on push to main
.github/workflows/commit-guard.yml   # server-side block on Claude/Anthropic attribution
.github/PULL_REQUEST_TEMPLATE.md
CLAUDE.md                      # rules Claude Code reads on every session
CONTRIBUTING.md                # branch naming, commits, /logs requirement, CF workflow
```

## Make it a GitHub template

After pushing this repo, go to **Settings → General → Template repository** and tick the box. From then on, `gh repo create --template <owner>/claude-cloudflare-template` will scaffold copies.
