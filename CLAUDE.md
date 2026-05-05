# CLAUDE.md

Instructions for Claude Code when working in this repo. These override defaults — follow them exactly.

## Commit conventions — NEVER attribute commits to Claude

**Do not include any of the following in commit messages, PR titles, PR descriptions, issue comments, or any other public artifact:**

- `Co-Authored-By: Claude …` trailers
- The strings `Claude`, `Anthropic`, `claude.com/claude-code`
- `🤖 Generated with [Claude Code]` footers
- Signing commits as `claude` or any Claude/Anthropic identity

The visible author and contributor list must show only the human owner of the repo. This applies to every commit regardless of how the change was produced. Two layers enforce this:

1. **Local `commit-msg` git hook** (`.githooks/commit-msg`) — rejects the commit before it's created. Do not bypass with `--no-verify`.
2. **`Commit Guard` GitHub Actions workflow** (`.github/workflows/commit-guard.yml`) — fails the workflow on push or PR if any commit message in the range contains the banned patterns. This catches commits made through the GitHub web UI, the API, or fresh clones that never ran `install-hooks.sh`.

If the workflow fails, fix the message with `git rebase -i` / `git commit --amend` and force-push.

References to "Claude Code" *inside* this `CLAUDE.md` file are fine — they describe how to operate the harness, not authorship of the codebase.

## Devlog convention — update `/logs` on every change

`apps/web/public/logs/index.html` is the project devlog. **Every commit or PR that lands on `main` (or staging) must add a new card to that page.** This is not optional polish; it is part of the change.

Card format (copy the existing pattern in the file):

```html
<article class="log-card" data-date="YYYY-MM-DD">
  <header>
    <time datetime="YYYY-MM-DD">YYYY-MM-DD</time>
    <span class="log-tag">feat | fix | chore | docs</span>
  </header>
  <h3>One-line summary of what changed</h3>
  <p>Two or three sentences on the why, the user-visible effect, and any followups.</p>
</article>
```

Add the newest card at the **top** of `<main id="log-stream">`. Keep entries terse — this is a changelog, not a blog. The `pre-push` git hook will warn (not block) if you push commits that don't touch the logs page.

## Local development

- The web app is plain static HTML in `apps/web/`. Serve with `python3 -m http.server 8787 --directory apps/web` or `npx wrangler dev`.
- Default port is `8787` (the wrangler dev default; also avoids collisions with `:3000` Next.js apps).
- For UI changes, run the dev server and verify in a browser before reporting the task complete. Type checks alone don't verify feature correctness.

## Cloudflare deploy

- `wrangler.toml` configures a Cloudflare Worker that serves `apps/web/` as static assets.
- Production deploy happens via `.github/workflows/deploy.yml` on push to `main`. Do not run `wrangler deploy` from a local machine to production unless explicitly asked.
- If you change the Worker `name` in `wrangler.toml`, tell the user — that changes the deployed URL.

## Things to avoid

- Do not run destructive git operations (`reset --hard`, `push --force`, `branch -D`) without explicit approval.
- Do not commit `.dev.vars`, `.env`, or any file containing API tokens. Cloudflare credentials live in GitHub Actions secrets only.
- Do not skip the commit-msg or pre-push hooks. If a hook fails, fix the underlying issue (usually: drop the Claude attribution, add the `/logs` card).
