// CLMM (ported Algebra UI) lives under src/clmm and is transpiled by Vite/esbuild
// WITHOUT going through webswap's strict `tsc --noEmit` (it never passed algebra's
// own build through tsc either). Treat all @clmm/* imports from webswap code as
// opaque so the production typecheck doesn't traverse into unchecked CLMM source.
// Runtime resolution is handled by the `@clmm` alias in vite.config.ts.
declare module '@clmm/*'
