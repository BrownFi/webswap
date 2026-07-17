#!/usr/bin/env bash
#
# check-hodl-price-staleness.sh
# --------------------------------------------------------------------------
# Verifies whether the BrownFi indexer's per-token prices (used for the HODL
# portfolio = bnhPortfolio = bnh0*token0Price + bnh1*token1Price) are FRESH, or
# still go stale on no-swap pools.
#
# It fetches each chain's stalest indexer token prices and compares them against
# the live Pyth price (Hermes). Today those prices are tx-driven — a token in a
# quiet pool freezes (e.g. ARB on Arbitrum was 22 days stale / -16% vs live).
#
# Use this to confirm when Manh's off-tx indexer price update goes live: once NO
# volatile token is materially stale, the FE Hermes recompute in
# YourPositionCard.tsx / PositionCard can be dropped. Until then, KEEP it.
#
# Usage:
#   scripts/check-hodl-price-staleness.sh              # all V3 chains
#   scripts/check-hodl-price-staleness.sh 42161        # one chain
#   STALE_HOURS=6 GAP_PCT=2 scripts/check-hodl-price-staleness.sh   # tune flags
#   BROWNFI_API=https://beta-api.brownfi.io scripts/check-hodl-price-staleness.sh
#
# Requires: curl, python3 (no extra deps — Hermes is fetched via curl to dodge
# Python's SSL cert issues).
# --------------------------------------------------------------------------

API="${BROWNFI_API:-https://api.brownfi.io}"
STALE_HOURS="${STALE_HOURS:-6}"   # flag tokens whose price is older than this
GAP_PCT="${GAP_PCT:-2}"           # ...AND that differ from live Pyth by more than this %

CHAINS=("80094:Bera" "999:HyperEVM" "42161:Arbitrum" "59144:Linea")
if [ "$#" -ge 1 ]; then CHAINS=("$1:chain-$1"); fi

overall_bad=0

for entry in "${CHAINS[@]}"; do
  cid="${entry%%:*}"; name="${entry##*:}"
  url="$API/indexer/v3?chainId=$cid"
  echo "===================================================================="
  echo " $name  (chainId $cid)   $url"
  echo "===================================================================="

  now=$(curl -s -m 15 -X POST "$url" -H 'Content-Type: application/json' \
    -d '{"query":"{ _meta { block { timestamp } } }"}' \
    | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['_meta']['block']['timestamp'])" 2>/dev/null)
  if [ -z "$now" ]; then echo "  (unreachable / no _meta)"; echo; continue; fi

  toks=$(curl -s -m 20 -X POST "$url" -H 'Content-Type: application/json' \
    -d '{"query":"{ tokens(first:15, orderBy:updatedAt, orderDirection:asc){ symbol price updatedAt priceFeedId } }"}')

  bad=$(NOW="$now" STALE_HOURS="$STALE_HOURS" GAP_PCT="$GAP_PCT" TOKS="$toks" python3 - <<'PY'
import sys, json, os, subprocess
now = int(os.environ['NOW']); stale_h = float(os.environ['STALE_HOURS']); gap_th = float(os.environ['GAP_PCT'])
try:
    toks = json.loads(os.environ['TOKS'])['data']['tokens']
except Exception as e:
    print(f"  query error: {e}", file=sys.stderr); print(0); sys.exit(0)

def real(fid):  # a non-zero 32-byte feed id
    return bool(fid) and set(fid.replace('0x', '')) != {'0'}

ids = [t['priceFeedId'] for t in toks if real(t.get('priceFeedId'))]
live = {}
if ids:
    q = '&'.join('ids[]=' + i for i in ids)
    try:
        out = subprocess.check_output(['curl', '-s', '-m', '20',
              'https://hermes.pyth.network/v2/updates/price/latest?' + q])
        for p in json.loads(out).get('parsed', []):
            live['0x' + p['id']] = int(p['price']['price']) * (10 ** int(p['price']['expo']))
    except Exception as e:
        print(f"  hermes fetch error: {e}", file=sys.stderr)

bad = 0
print(f"  {'token':<10}{'indexer':>15}{'age(h)':>9}{'live(Pyth)':>15}{'gap%':>9}  flag", file=sys.stderr)
for t in toks:
    age = (now - int(t['updatedAt'])) / 3600
    idx = float(t['price'])
    fid = t.get('priceFeedId', '') or ''
    lv = live.get(fid) or live.get(fid.lower())
    gap = (idx - lv) / lv * 100 if lv else None
    flag = ''
    if age > stale_h and gap is not None and abs(gap) > gap_th:
        flag = '<< STALE + WRONG'; bad += 1
    elif age > stale_h:
        flag = 'stale (value still ~ok)'
    gaps = f"{gap:+.1f}" if gap is not None else "n/a"
    lvs = f"{lv:.5f}" if lv else "n/a"
    print(f"  {t['symbol']:<10}{idx:>15.5f}{age:>9.0f}{lvs:>15}{gaps:>9}  {flag}", file=sys.stderr)
print(bad)  # stdout = machine-readable count
PY
)
  echo "  --> $bad token(s) STALE + materially WRONG (>${STALE_HOURS}h old AND >${GAP_PCT}% off live Pyth)"
  echo
  overall_bad=$((overall_bad + bad))
done

echo "===================================================================="
if [ "$overall_bad" -gt 0 ]; then
  echo " RESULT: $overall_bad stale+wrong token price(s) found."
  echo " => Indexer HODL value is still STALE on those tokens' no-swap pools."
  echo " => KEEP the FE Hermes recompute (YourPositionCard.tsx / PositionCard)."
else
  echo " RESULT: no stale+wrong token prices."
  echo " => Indexer prices look fresh (Manh's off-tx update may be live)."
  echo " => Safe to consider dropping the FE Hermes recompute (re-verify a few pools)."
fi
echo "===================================================================="
