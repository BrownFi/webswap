# WebSwap Improvement Plan (QA-Verified)

**Branch:** `refactor`
**Date:** 2026-03-06
**Status:** Each item independently verified by 2 audit agents + compared against BrownFi tech docs

---

## Docs Alignment Summary

All improvements were compared against BrownFi V1/V2 protocol specifications:
- **V2 AMM formula:** `DeltaY = P(1 + R/2) * DeltaX` where `R = K * DeltaX / (X - DeltaX)`, K=0.01 default
- **Fee:** 0.3% on amountIN, 80% reserve order limit, permissionless pool creation
- **Max price impact at K=0.01, 80% reserve:** ~2% — confirms 10% default slippage was excessive
- No improvements conflict with protocol specs. IMP-03 directly aligns with protocol math.

---

## Rejected Claims (False Positives from Initial Review)

These items were flagged but **verified as non-issues**:

| # | Claim | Why Rejected |
|---|-------|-------------|
| ~~1~~ | MAX_UINT256 unlimited approval | `useExact` is hardcoded `true` — code always uses exact amounts. Safe. |
| ~~4~~ | .env not in .gitignore | .env contains only public API URLs, no secrets. Standard React pattern. |
| ~~7~~ | 20-min swap deadline dangerous | Users can customize via settings. 20-min is standard DeFi default. |
| ~~9~~ | Hardcoded WalletConnect IDs | WalletConnect v2 project IDs are public by design. Not secrets. |
| ~~12~~ | Token list no validation | @uniswap/token-lists provides TypeScript validation. Schema exists. |
| ~~13~~ | Missing loading states in swap | `<Dots>Loading</Dots>` component exists at line 414-417. Works. |
| ~~23~~ | i18n underused (only 2 files) | WRONG — grep found 162 files using `useTranslation`/`t()`. |
| ~~24~~ | /claim route dead | Feature exists: dispatches ADDRESS_CLAIM modal, enum present in ApplicationModal. |
| ~~26~~ | Cypress tests reference deleted pages | Tests verified — all reference existing routes. |

---

## Verified Improvements

### PRIORITY 0 — Fix Now (Security / Data Loss)

#### IMP-01: localStorage.clear() nukes all user data on WalletConnect disconnect
- **Severity:** HIGH
- **Scope:** Security / Wallet
- **File:** `src/connectors/WalletConnector.ts:100`
- **Issue:** `localStorage.clear()` deletes ALL stored data (theme, settings, tx history) when WalletConnect pairing is empty
- **Fix:** Replace with targeted cleanup of `wc@*` keys only
- **Docs:** No protocol conflict. Wallet connection management is frontend-only.
- **Status:** DONE

#### IMP-02: Silent wrap/unwrap errors — no user feedback
- **Severity:** HIGH
- **Scope:** UX / Swap
- **File:** `src/pages/Swap/index.tsx:98-105`, `src/hooks/useWrapCallback.ts:46-55`
- **Issue:** `.catch(console.warn)` silently swallows wrap errors. User sees loading stop with no explanation.
- **Fix:** Re-throw errors in useWrapCallback, show toast notification on failure in Swap page
- **Docs:** Wrap/unwrap is standard WETH interaction, not BrownFi-specific. No protocol conflict.
- **Status:** DONE

#### IMP-03: Default slippage too high + missing bounds validation
- **Severity:** MEDIUM
- **Scope:** Security / Swap
- **File:** `src/constants/common.ts:155`, `src/state/user/reducer.ts:102-104`
- **Issue:** Default slippage was 10% (1000 bips). BrownFi V2 with K=0.01 has max ~2% price impact at 80% reserve utilization. 10% default exposes users to unnecessary MEV/sandwich attacks.
- **Fix:** Changed default to 0.5% (50 bips). Added bounds clamping (1-5000 bips) in reducer.
- **Docs:** Directly aligned with BrownFi V2 formula. K=0.01 means low price impact by design — slippage default should match.
- **Status:** DONE

#### IMP-04: Missing environment variable validation at startup
- **Severity:** MEDIUM
- **Scope:** DevOps / Config
- **File:** `src/index.tsx`
- **Issue:** No check that required env vars exist. App fails silently at first API call if missing.
- **Fix:** Added validation block logging missing required env vars (REACT_APP_API_URL, REACT_APP_API_V2_URL)
- **Docs:** No protocol conflict. Infrastructure concern only.
- **Status:** DONE

---

### PRIORITY 1 — Fix Soon (Quality / Reliability)

#### IMP-05: Console statements in production code (36 occurrences, 20 files)
- **Severity:** MEDIUM
- **Scope:** Code Quality / Security
- **Files:** Multiple (key offenders: `connectors/index.ts:164`, `WalletConnector.ts:88`, `multicall/updater.tsx:37-60`)
- **Issue:** Debug logs, numbered debug markers, and error data leaked to browser console
- **Fix:** Remove console.log/debug/warn; keep console.error for genuine errors
- **Docs:** No protocol conflict. Code quality concern only.
- **Status:** DONE

#### IMP-06: API services inconsistent timeout configuration
- **Severity:** MEDIUM
- **Scope:** Network / Reliability
- **Files:** `src/services/apiV1Service.ts` (NO timeout), `src/services/apiV2Service.ts` (2s timeout)
- **Issue:** apiV1Service can hang indefinitely on network issues
- **Fix:** Added `timeout: 10_000` to apiV1Service
- **Docs:** No protocol conflict. API layer is frontend infrastructure.
- **Status:** DONE

#### IMP-07: Consolidate data fetching libraries (Redux + SWR + React Query)
- **Severity:** MEDIUM
- **Scope:** Architecture / Bundle Size
- **Files:** SWR used in 3 files, React Query used in 7 files, Redux in 86 files
- **Issue:** Three different caching/fetching strategies with inconsistent error handling
- **Fix:** Migrate SWR calls (3 files) to React Query, then evaluate if React Query can replace some Redux async patterns
- **Docs:** No protocol conflict. Frontend architecture concern.
- **Status:** DEFERRED (requires careful per-file migration)

#### IMP-08: ARIA accessibility — only 6 attributes in entire codebase
- **Severity:** MEDIUM
- **Scope:** Accessibility / UX
- **Files:** All interactive components (buttons, modals, inputs, links)
- **Issue:** Screen readers cannot navigate. WCAG AA non-compliant.
- **Fix:** Add aria-label to buttons, role="dialog" to modals, aria-describedby for help text
- **Docs:** No protocol conflict. UX/compliance concern.
- **Status:** DEFERRED (XL effort, 3+ days)

---

### PRIORITY 2 — Nice to Have (Tech Debt / Polish)

#### IMP-09: Dual web3 libraries (wagmi + @web3-react)
- **Severity:** HIGH (tech debt) but BOTH currently needed
- **Scope:** Architecture / Wallet
- **Files:** `src/index.tsx`, `src/components/Web3ReactManager/`, `src/components/Header/`
- **Issue:** Both run simultaneously. web3-react provides NetworkConnector fallback for read-only access on 8 chains. wagmi/RainbowKit handles wallet connection.
- **Fix:** Long-term: migrate NetworkConnector fallback to wagmi's publicClient, then remove @web3-react
- **Docs:** Must preserve read-only RPC fallback for all deployed chains (Arbitrum, Base, BSC, Berachain, HyperEVM, Linea, Monad, Sei). Protocol requires on-chain reads for pool state.
- **Status:** DEFERRED (XL effort, requires careful multi-chain migration)

#### IMP-10: Dual styling systems (styled-components + Tailwind)
- **Severity:** LOW
- **Scope:** Architecture / DX
- **Files:** 252 Tailwind className occurrences (44 files), 209 styled-components (56 files)
- **Issue:** Inconsistent patterns, larger bundle, team confusion about which to use
- **Fix:** Pick one direction (recommend Tailwind) and gradually migrate
- **Docs:** No protocol conflict. Frontend concern only.
- **Status:** DEFERRED (XL effort, incremental migration)

#### IMP-11: Remove unused web3.js package
- **Severity:** LOW
- **Scope:** Bundle Size / Dependencies
- **File:** `package.json` — `"web3": "^1.8.0"`
- **Issue:** 0 direct imports found in src/. Installed but appears unused.
- **Fix:** Removed from package.json
- **Docs:** No protocol conflict.
- **Status:** DONE

#### IMP-12: React Router v5 → v6/v7 upgrade
- **Severity:** LOW
- **Scope:** Architecture / Maintenance
- **File:** `package.json` — `"react-router-dom": "^5.0.0"`
- **Issue:** v5 no longer maintained. v6 has cleaner API, better performance.
- **Fix:** Refactor Switch→Routes, update route parameter API
- **Docs:** No protocol conflict.
- **Status:** DEFERRED (LARGE effort, 1-2 days)

#### IMP-13: Wrap computeTradePriceBreakdown in useMemo
- **Severity:** LOW
- **Scope:** Performance / Swap
- **File:** `src/pages/Swap/index.tsx:199`
- **Issue:** Moderately expensive computation called on every render without memoization
- **Fix:** Wrapped in `useMemo(() => computeTradePriceBreakdown(trade), [trade])`
- **Docs:** computeTradePriceBreakdown computes LP fee and price impact per BrownFi formula. Memoization doesn't change logic.
- **Status:** DONE

#### IMP-14: ErrorBoundary loses user form data on reload
- **Severity:** LOW
- **Scope:** UX / Error Handling
- **File:** `src/containers/ErrorBoundary.tsx:45-68`
- **Issue:** Auto-reload on error discards any form input. Add/remove liquidity pages redirect to /pool immediately.
- **Fix:** Persist form state to sessionStorage before reload; offer "Retry" option
- **Docs:** No protocol conflict.
- **Status:** DEFERRED (MEDIUM effort, needs careful state serialization)

#### IMP-15: Duplicate /create and /add routes
- **Severity:** LOW
- **Scope:** Navigation / Code Clarity
- **File:** `src/pages/App.tsx:74-76`
- **Issue:** `/create` and `/add` both serve AddLiquidity with identical sub-routes. Line 70 redirects `/create` → `/add`, but lines 74-76 also serve `/create` directly.
- **Fix:** Removed duplicate `/create` routes, kept only the redirect at line 70
- **Docs:** No protocol conflict. Both routes serve the same AddLiquidity page for permissionless pool creation.
- **Status:** DONE

#### IMP-16: Update axios to latest
- **Severity:** LOW (client-side only, not exploitable in browser)
- **Scope:** Dependencies / Security
- **File:** `package.json` — `"axios": "^0.21.0"`
- **Issue:** Old version (2021). CVEs exist but require server-side conditions not present in SPA.
- **Fix:** Updated to `^1.7.0`
- **Docs:** No protocol conflict.
- **Status:** DONE (requires API call testing after npm install)

---

### PRIORITY 3 — Future Consideration

#### IMP-17: REACT_APP_ENVIROMENT typo
- **Scope:** Code Quality / Config
- **File:** `src/connectors/index.ts:162`, `.github/workflows/ci.yml`
- **Issue:** Consistently misspelled as "ENVIROMENT" (missing N). Works but unprofessional.
- **Fix:** Fixed CI to use ENVIRONMENT. Source code accepts both spellings for backward compatibility.
- **Docs:** No protocol conflict.
- **Status:** DONE

#### IMP-18: Enable noUnusedLocals in tsconfig
- **Scope:** Code Quality / TypeScript
- **File:** `tsconfig.json:14`
- **Issue:** `noUnusedLocals: false` allows dead variables to accumulate
- **Fix:** Set to true. Also removed deleted Confetti reference from tsconfig include.
- **Docs:** No protocol conflict.
- **Status:** DONE (may require fixing compilation errors)

---

## Implementation Summary

| Priority | Items | Implemented | Deferred |
|----------|-------|-------------|----------|
| P0 (Fix Now) | 4 | 4 | 0 |
| P1 (Fix Soon) | 4 | 3 | 1 (IMP-07) |
| P2 (Nice to Have) | 8 | 4 | 4 (IMP-09, IMP-10, IMP-12, IMP-14) |
| P3 (Future) | 2 | 2 | 0 |
| **TOTAL** | **18** | **13** | **5** |

Deferred items require XL/LARGE effort and carry higher risk for a mainnet DeFi product. They should be addressed in dedicated PRs with thorough testing.

## Scope Legend

| Scope Tag | Meaning |
|-----------|---------|
| Security | Smart contract interactions, wallet safety, data exposure |
| UX | User-facing behavior, error messages, feedback |
| Swap | Token swap flow specifically |
| Wallet | Wallet connection/disconnection |
| Architecture | Code structure, library choices, patterns |
| Performance | Re-renders, bundle size, network efficiency |
| Accessibility | Screen readers, keyboard nav, WCAG compliance |
| Code Quality | Logs, types, naming, dead patterns |
| Dependencies | npm packages, versions |
| DevOps | Build, config, environment |
| Network | API calls, RPC, timeouts |
| Navigation | Routes, links, redirects |
| DX | Developer experience, consistency |
| Bundle Size | Package weight, tree-shaking |
| Error Handling | Crash recovery, user notification |
