# MEMORY — funding-arb

Funding signal log. Each entry: `[UTC] SYMBOL: rate | spot | rec | outcome`.

---

## 2026-04-30 — Pacifica funding-rate epoch
- `[2026-04-30 00:00] BTC-PERP: funding=0.012%/8h | spot=$67,420 | rec=NO TRADE` — spread under 4% APR after slip; below user threshold (8% APR).
- `[2026-04-30 08:00] ETH-PERP: funding=0.045%/8h | spot=$3,180 | rec=ENTER SHORT CARRY` — APR ~14.4% net; user accepted, opened 0.3 ETH notional.

## 2026-05-01
- `[2026-05-01 16:00] ETH-PERP carry status: funding still 0.038%/8h, position +0.04% PnL.` Reminded user this is funding income only, not delta.

## 2026-05-02 — backtest request
- User asked: "what's our hit rate on ETH carry calls in April?"
- Replied: 11 calls, 8 winners (72.7%), avg duration 14h, avg yield 0.21% per call. Pulled from this MEMORY.md.

## 2026-05-03 — anomaly
- `[2026-05-03 04:00] SOL-PERP: funding=0.21%/8h | spot=$148.20 | rec=NO TRADE` — spike correlated with a perp delisting rumor; spread is wide but adverse selection risk too high. Confidence: low.
- 6h later: rate normalized to 0.04%/8h. The "no trade" call was correct.

## 2026-05-04
- Closed the ETH short carry from 2026-04-30 — held 96h, realized +0.42% net of fees + slip. Logged for hit-rate stats.

## Calibration notes
- User's threshold: 8% APR after 5 bps slippage. Adjusted Apr 22 from 6% after their feedback that "marginal calls cost more in attention than they earn in yield."
- They prefer SHORT carry (sell perp, buy spot) over LONG carry — easier mental model and BTC funding has been positive most of 2026.
