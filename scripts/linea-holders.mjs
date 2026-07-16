#!/usr/bin/env node
/**
 * Linea V2 LP-holder report. For every BrownFi V2 pool on Linea (chainId 59144)
 * with liquidity, lists each LP holder and their share (% of pool). Writes a CSV
 * (import into a Google Sheet). Run locally:
 *
 *   node scripts/linea-holders.mjs            # production API (api.brownfi.io)
 *   node scripts/linea-holders.mjs --beta     # beta API (beta-api.brownfi.io)
 *   node scripts/linea-holders.mjs --out holders.csv
 *
 * Data source: the V2 indexer's `pairAccount` entity (per holder, per pair):
 *   ${API}/indexer?chainId=59144  →  pairAccounts { id, lp, stakeLP, lpPortfolio }
 *   - `id` = "<holderAddress>-<pairAddress>"; holder = id.split('-')[0].
 *   - `lp` = wallet LP balance; `stakeLP` = staked LP (0 on Linea — BGT is Bera-only).
 *   - holder % of pool = (lp + stakeLP) / pair.totalSupply.
 *
 * Two rows must be filtered out or the numbers won't reconcile:
 *   1. the pool's own SELF-account (holder address == pair address) — the indexer
 *      emits a spurious aggregate row for it (lp ≫ totalSupply).
 *   2. zero-balance rows (exited LPs the indexer still keeps).
 * After filtering, the remaining holders' `lp` sums to exactly `totalSupply`
 * (verified across all 5 pools), which is the correctness check the script asserts.
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const API = process.env.BROWNFI_API || (argv.includes('--beta') ? 'https://beta-api.brownfi.io' : 'https://api.brownfi.io')
const outArg = (() => {
  const i = argv.indexOf('--out')
  return i >= 0 ? argv[i + 1] : undefined
})()
const CHAIN_ID = 59144
const __dirname = dirname(fileURLToPath(import.meta.url))
const stamp = new Date().toISOString().slice(0, 10)
const OUT = resolve(outArg || `${__dirname}/linea-v2-holders-${stamp}.csv`)

async function gql(query) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 15_000)
  try {
    const res = await fetch(`${API}/indexer?chainId=${CHAIN_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 200))
    return json.data
  } finally {
    clearTimeout(t)
  }
}

// CSV helpers
const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const row = (cells) => cells.map(csvCell).join(',')
const fmtNum = (n, d = 4) => (Number.isFinite(n) ? n.toFixed(d) : '')
const fmtPct = (n) => (Number.isFinite(n) ? `${(n * 100).toFixed(2)}%` : '')
const fmtUsd = (n) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : '')

async function poolHolders(pair) {
  const supply = Number(pair.totalSupply) || 0
  const raw = (await gql(`{ pairAccounts(first:1000, where:{pair:"${pair.id}"}, orderBy:lp, orderDirection:desc){ id lp stakeLP lpPortfolio } }`)).pairAccounts || []
  if (raw.length >= 1000) console.warn(`  ! ${pair.id}: hit 1000-row page cap — holder list may be truncated`)
  const holders = raw
    .map((r) => ({ account: r.id.split('-')[0], lp: (Number(r.lp) || 0) + (Number(r.stakeLP) || 0), usd: Number(r.lpPortfolio) || 0 }))
    .filter((h) => h.account.toLowerCase() !== pair.id.toLowerCase() && h.lp > 0)
    .sort((a, b) => b.lp - a.lp)
  const sumLp = holders.reduce((a, h) => a + h.lp, 0)
  return { supply, holders, sumLp, reconPct: supply > 0 ? sumLp / supply : NaN }
}

async function main() {
  const { pairs } = await gql(`{ pairs { id totalSupply reserve0 reserve1 tvl token0{symbol} token1{symbol} } }`)
  const pools = pairs.filter((p) => Number(p.totalSupply) > 0).sort((a, b) => Number(b.tvl) - Number(a.tvl))

  const lines = []
  lines.push(row([`Linea V2 LP Holders`, `Generated ${new Date().toISOString()} (UTC)`, `Source: ${API}`, `chainId ${CHAIN_ID}`]))
  lines.push('')

  // Summary section
  lines.push(row(['Pool', 'Pair address', 'TVL', 'Total LP supply', 'Holders']))
  const perPool = []
  for (const p of pools) {
    const h = await poolHolders(p)
    perPool.push({ p, h })
    lines.push(row([`${p.token0.symbol}-${p.token1.symbol}`, p.id, fmtUsd(Number(p.tvl) || 0), fmtNum(h.supply, 6), h.holders.length]))
  }
  lines.push('')

  // Per-pool holder tables
  for (const { p, h } of perPool) {
    const name = `${p.token0.symbol}-${p.token1.symbol}`
    lines.push(row([`${name} — holders`, p.id, `TVL ${fmtUsd(Number(p.tvl) || 0)}`, `supply ${fmtNum(h.supply, 6)}`, `${h.holders.length} holders`]))
    lines.push(row(['Rank', 'Holder', 'LP Balance', '% of Pool', 'LP Value (USD)']))
    h.holders.forEach((holder, i) => {
      lines.push(row([i + 1, holder.account, fmtNum(holder.lp, 6), fmtPct(holder.lp / h.supply), fmtUsd(holder.usd)]))
    })
    // reconciliation check
    const ok = Math.abs(h.reconPct - 1) < 0.0001
    lines.push(row(['', 'TOTAL', fmtNum(h.sumLp, 6), fmtPct(h.reconPct), ok ? 'reconciles ✓' : 'MISMATCH — check']))
    if (!ok) console.warn(`  ! ${name}: holders sum to ${(h.reconPct * 100).toFixed(2)}% of supply (expected 100%)`)
    lines.push('')
    console.log(`  ${name.padEnd(12)} ${h.holders.length} holders, sum ${(h.reconPct * 100).toFixed(2)}% of supply`)
  }

  writeFileSync(OUT, lines.join('\n'), 'utf8')
  console.log(`\nWrote ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
