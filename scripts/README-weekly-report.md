# Weekly report generator

Fills the BrownFi weekly CSV from the **same indexer + competitor APIs the Pool
List page uses**, so the numbers match what the app shows. Runs locally, no build
needed (Node 18+; uses global `fetch`).

## Usage

```bash
node scripts/weekly-report.mjs            # beta API (default) -> weekly-report-<date>.csv
node scripts/weekly-report.mjs --prod     # production API (api.brownfi.io)
node scripts/weekly-report.mjs --out /path/to/report.csv
BROWNFI_API=https://api.brownfi.io node scripts/weekly-report.mjs   # explicit host
```

Output is written next to the script as `weekly-report-YYYY-MM-DD.csv` unless
`--out` is given.

## What it pulls

| Data | Source |
| --- | --- |
| Our pool LP prices + pair list | `${API}/indexer/v3?chainId=<id>` — GraphQL `PairListV3` |
| Our pool Vol / Fee / TVL (7-day) | same endpoint — `pairDayDatas` daily buckets (`totalVolume`/`totalFee`/`tvl`) summed/avg'd over the last 7 complete days |
| Kodiak (Bera) | Kodiak V3 subgraph (ormilabs) — `poolDayData` (vol, fees, daily TVL) |
| Project X (HyperEVM) | `api.prjx.com/pools` (pool address) + Goldsky uniswap-v3-hyperevm subgraph `poolDayData` (vol, fees, daily TVL) |
| Etherex (Linea) | Etherex Envio index `gateway.kingdom.dev/linea/converter/graphql` — `clPools.poolDayData` (vol, fees, daily TVL) |
| Uniswap (Arbitrum) | The Graph subgraph `poolDayData` **if `GRAPH_API_KEY` set** (vol, fees, daily TVL); else Uniswap gateway (real 7-day vol + **current** TVL) |

## Columns

- **LP-UniV2 / LP-BH** = the pool-detail LP chart's hover-tooltip values (latest point),
  signed % outperformance:
  - `LP-UniV2` = `(lpPrice − uniV2Price) / uniV2Price × 100` — "LP vs. UniV2" (from the pair list)
  - `LP-BH` = `(lpPrice − bnhPrice) / bnhPrice × 100` — "LP vs. BH" / buy-and-hold (from the
    per-pool `pairDayDatas` latest bucket; `bnhPrice` isn't on the pair list)
  - `uniV2Price` is deliberately read from the pair list, not `pairDayDatas`, because the
    **production** indexer only exposes it on the pair entity, not on day-data.
- **TVL (7d avg)** = 7-day-average TVL; **Vol / Fee** = **weekly** volume / fee totals (USD)
- **Vol/TVL, Fee/TVL** = **daily-average** turnover = `(weekly numerator ÷ 7) ÷ 7-day-avg TVL`,
  as a percentage, header-tagged `(daily)`. This is 1/7 of `Vol ÷ TVL` of the weekly $ columns.
  - Per-pair: `weekly vol ÷ 7 ÷ that pool's 7-day-avg TVL`
  - TOTAL rows: TVL-weighted → `Σ(weekly vol) ÷ 7 ÷ Σ(7-day-avg TVL)` (not the average of the rows)
  - Competitors follow the same rule (all `(daily)`). 7-day-avg TVL denominator where daily TVL
    exists — **our pools** (indexer `pairDayDatas.tvl`), **Kodiak** & **Project X** (subgraph
    `poolDayData.tvlUSD`). **Etherex** and **Uniswap** have no daily-TVL history, so those two
    competitor ratios fall back to current TVL. If a source is unavailable the cell blanks (never 0).
- **`<Comp>` Vol/TVL, `<Comp>` Fee/TVL** = competitor weekly ratios

**Timeframe & consistency:** our pools, **Kodiak**, and **Project X** are on one identical
basis — real daily buckets summed/averaged over the **last 7 complete UTC days**, with a
**7-day-average TVL** denominator (ours: indexer `pairDayDatas`; Kodiak & Project X: their
subgraphs' `poolDayData`). Project X's own API is 24h-only, so its 7-day comes from the
Goldsky uniswap-v3-hyperevm subgraph (a `24h × 7` would badly misread lumpy volume — real
7-day HYPE/UBTC ≈ $10.6M vs ~$6M implied by ×7).

**Etherex** is now on the same basis too — its Envio index exposes `clPools.poolDayData`
(daily vol/fees/TVL), so it uses the last-7-complete-days window + 7-day-avg TVL.

**Uniswap (Arbitrum)** is the one remaining exception: no key-free source exposes daily TVL.
- Volume: real 7-day (`cumulativeVolume WEEK`). Fee: `volume × feeTier` — exact for Uniswap V3
  (that IS the pool fee), not an approximation.
- TVL: **current** (gateway has no historical TVL). For a stable pool the gap vs 7-day-avg is small.
- To make it fully consistent, set a free **Graph API key**: `GRAPH_API_KEY=<key> node scripts/weekly-report.mjs --prod`.
  Get one at thegraph.com/studio (free tier, no card). The script then reads the official
  Uniswap-V3-Arbitrum subgraph's `poolDayData` (7-day-avg TVL like everyone else) and only
  falls back to the gateway if the key is missing or the query fails.

All ratios are ÷7 to a daily average.

## Editing the pair list

Pools are keyed by **pair address** (stable, identical on beta + prod) in the
`CHAINS` config at the top of `weekly-report.mjs`. To add/remove a pair, edit that
list. Find a new pool's address on the Pool List (`pair.id`) or by querying the
indexer.

## Notes

- LP-UniV2 / LP-BH mirror the `PairChartTV.tsx` tooltip (`+X.XX%` signed, 2 dp). They're
  the **latest** chart point. Ask if you want a period average instead of the latest value.
- A missing pool or failed competitor/day-data fetch logs a warning and leaves those cells
  blank rather than aborting the whole report.
