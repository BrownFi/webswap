# Merge CLMM (Algebra UI) into webswap — implementation plan

Branch: `merge-clmm` (off `beta`). Goal: mount the Hemi CLMM DEX (currently
`brownfi/algebra-Interface`, live at algebra-brownfi.vercel.app) inside webswap
as a **CLMM** nav item, sharing webswap's wallet/shell so the wallet stays
connected and there's no page reload — a consistent UX.

## Decisions locked
- Name is **CLMM** (never "Algebra") in UI, routes (`/clmm`), nav.
- CLMM nav item is **always visible**, but **greyed/disabled off-Hemi** with
  tooltip "Available on Hemi — switch network". Active only on Hemi (43111).
- Shared **RainbowKit** wallet (webswap's), one wagmi config, one router.
- Tradeoff accepted: CLMM ships on webswap's `beta`/`bera` branches.

## Hard constraints discovered (drive the whole design)
1. **Folder-name collision.** webswap uses `tsconfig baseUrl: "src"` with bare
   imports (`components/…`, `state/…`, `hooks/…`, `pages/…`). algebra uses the
   same folder names via `@/`. Copying algebra's `src/*` into webswap's `src/*`
   would collide. → **Isolate all CLMM code under `src/clmm/` with its own alias
   `@clmm` → `src/clmm`.** Rewrite algebra's `@/` → `@clmm/` and `config` →
   `@clmm/config`.
2. **Two Tailwind majors.** webswap = TW3.4 + styled-components (+ postcss).
   algebra = TW4.1 via `@tailwindcss/vite`. One Vite app can't run both plugins.
   → Build CLMM's Tailwind **separately** into a scoped stylesheet (see Phase 3).
3. **Wallet lib.** webswap = RainbowKit; algebra = Reown AppKit. Only ~14 files
   touch AppKit (mostly `open()`); 89 files use plain wagmi hooks (unaffected).
   → Drop AppKit, use webswap's RainbowKit + shared WagmiProvider.
4. **Vendored SDK patch.** algebra's `postinstall` (`scripts/patch-sdk.cjs`)
   mutates `@cryptoalgebra/*` in node_modules to add Hemi (43111) + pool deployer
   + init hash. → Port into webswap's install lifecycle.

---

## Phase 0 — Scaffold (isolation)
- Create `src/clmm/`. Add Vite alias `@clmm` → `src/clmm` (vite.config.ts
  `resolve.alias`) and tsconfig path `"@clmm/*": ["./clmm/*"]`.
- Copy algebra `src/**` → `src/clmm/**` and algebra `config/**` →
  `src/clmm/config/**`.
- Codemod imports: `@/` → `@clmm/`, `"config"` → `"@clmm/config"`.

## Phase 1 — Dependencies & build tooling
- Merge algebra deps into webswap `package.json`: `@cryptoalgebra/integral-sdk`,
  `@apollo/client`, `graphql`, `zustand`, `swr`, `recharts`, `@wagmi/cli` +
  graphql-codegen dev deps. Resolve version skew by keeping **webswap's** higher
  `wagmi`/`viem` (2.19 / 2.47).
- Copy `scripts/patch-sdk.cjs`; add/extend webswap `postinstall` to run it.
- Copy `wagmi.config.ts` + `codegen.ts` scoped to `src/clmm`; regenerate
  `src/clmm/generated.ts` + `src/clmm/graphql/generated`. (These are gitignored
  in algebra and rebuilt at build.)
- Update webswap `build`: `patch-sdk` (postinstall) → `wagmi generate` +
  `graphql-codegen` → `tsc --noEmit` → `vite build`.
- Port the `enabledModules` empty-module replacement (algebra vite plugin) for
  CLMM's disabled feature modules, or hardcode (most are already off on Hemi).

## Phase 2 — Wallet unification (AppKit → RainbowKit)
- Delete `src/clmm/providers/WagmiProvider.tsx` + AppKit setup; CLMM renders
  inside webswap's existing `WagmiProvider`/`RainbowKitProvider`.
- **Add Hemi to `src/connectors/index.ts`** (chain id 43111, ETH,
  `rpc.hemi.network/rpc`, `explorer.hemi.xyz`, hemi icon) — one entry alongside
  berachain/arbitrum/etc.
- Replace the ~14 AppKit call sites:
  - `open()` (connect) → `useConnectModal().openConnectModal`
  - account/network modal → RainbowKit account modal / `useSwitchChain`
  - `useBlockExplorer` → derive from wagmi `useChainId` + chain metadata.
- Drop `VITE_REOWN_PROJECT_ID` (RainbowKit uses webswap's WC project id).

## Phase 3 — Styling (Tailwind reconciliation) — biggest item
Chosen approach: **scope, don't migrate** (keeps prod TW3 untouched).
- Build CLMM's Tailwind 4 CSS as a **standalone step** (Tailwind CLI over
  `src/clmm/**`) into `src/clmm/clmm.generated.css`, wrapped/scoped so all
  utilities live under a `.clmm-root` container (Tailwind `important`/prefix or a
  postcss `:where(.clmm-root)` wrap).
- Import that stylesheet **only** from the CLMM route entry; render CLMM pages
  inside `<div className="clmm-root">`.
- Verify no bleed into webswap (TW3) and vice-versa. If scoping proves too
  leaky, fall back to migrating CLMM classes to TW3 (measure delta first).

## Phase 4 — Routing, shell & the gated nav
- Add lazy route in `src/pages/App.tsx`:
  `<Route path="/clmm/*" element={<ClmmApp/>} />` where `ClmmApp` holds algebra's
  own nested `<Routes>` (swap/pools/pool/create), rebased to `/clmm`.
- Render CLMM inside webswap's shell (`StaticScreen`/`BodyWrapper`); strip
  algebra's own Header/Footer (use webswap's).
- **Nav item** in `src/components/Header/index.tsx` next to swap/pool/portfolio:
  ```tsx
  const onHemi = useChainId() === 43111
  <StyledNavLink id="clmm-nav-link" to="/clmm"
     className={onHemi ? '' : 'disabled'}
     title={onHemi ? undefined : 'Available on Hemi — switch network'}>
     CLMM
  </StyledNavLink>
  ```
  Off-Hemi: greyed + tooltip; optionally the tooltip's action calls
  `switchChain({ chainId: 43111 })`.
- Route guard: `/clmm/*` checks `useChainId() === 43111`; if not, render a
  "Switch to Hemi" gate instead of the CLMM UI (handles deep links).

## Phase 5 — Providers/state (scoped)
- zustand stores: work as-is, no provider.
- Apollo (subgraph reads): wrap **only** CLMM routes in an `ApolloProvider`
  (webswap doesn't use Apollo). react-query is already shared.
- Redux (webswap) and zustand (CLMM) coexist untouched.

## Phase 6 — Env & config
- Add to webswap Vercel env: `VITE_HEMI_INFO_SUBGRAPH` (+ blocks/farming/limit),
  `VITE_GRAPH_API_KEY`. Backend indexer is handled server-side.
- CLMM chain identity (Hemi 43111, deployer, init hash, tokens) comes from
  `src/clmm/config/*` (already Hemi-only) + the SDK patch.

## Phase 7 — Verification (the spike, then full)
Spike first (½–1 day, prove the 2 unknowns):
- Mount **only** CLMM Swap at `/clmm` with RainbowKit + scoped CSS + the greyed
  nav item. Confirm: (a) wallet stays connected switching Swap↔CLMM, (b) no CSS
  bleed either way.
Then full port + verify: build green; connect/persist across nav; CLMM swap &
pools work on Hemi; nav greyed off-Hemi with switch; no regressions on webswap
swap/pool/portfolio.

## Risk register
- **Bundle size**: CLMM adds a large graph (algebra's wallet chunk alone ~3 MB).
  Mitigate with lazy `/clmm` + keep vite `manualChunks` conservative — algebra
  hit TDZ/undefined-fn errors when splitting `@cryptoalgebra`/apollo/recharts, so
  keep only the wallet split (see algebra vite.config comment).
- **Tailwind bleed** (Phase 3) — the main technical unknown; the spike de-risks.
- **Single viem/wagmi version** across both apps — pin to webswap's.
- **patch-sdk** runs on every install/CI (Vercel fresh install → fine); a plain
  local `yarn install` won't re-patch already-patched bundles (use
  `rm -rf node_modules/@cryptoalgebra && yarn install --check-files`).
- **Coupled deploys**: CLMM now rides beta/bera cadence.

## Rough sequencing / effort
0–1 Scaffold + deps: ~0.5d · 2 Wallet: ~0.5–1d · 3 Tailwind: ~1–2d (dominant) ·
4 Routing/nav: ~0.5d · 5–6 Providers/env: ~0.5d · 7 Spike+verify: ~1d.
