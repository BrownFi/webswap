/* Regenerate src/clmm/clmm.generated.css — the CLMM (Algebra) UI's Tailwind-4
 * stylesheet, compiled and scoped under `.clmm-root` so it styles CLMM without
 * bleeding onto webswap's Tailwind-3 pages.
 *
 * webswap can't compile TW4 in-tree (its PostCSS runs TW3), so we compile in the
 * standalone algebra repo and scope the output here.
 *
 * Usage (postcss + postcss-prefix-selector must resolve — run from the algebra
 * repo, which has both, OR install them):
 *   1. cd <algebra-Interface> && yarn build          # emits dist/assets/*.css
 *   2. node <webswap>/scripts/scope-clmm-css.mjs \
 *        <algebra>/dist/assets/index-*.css \
 *        <webswap>/src/clmm/clmm.generated.css
 * The output is imported raw + injected as a <style> by src/clmm/ClmmApp.tsx.
 */
import fs from 'fs'
import postcss from 'postcss'
import prefixer from 'postcss-prefix-selector'

const [, , SRC, OUT] = process.argv
if (!SRC || !OUT) {
  console.error('usage: node scope-clmm-css.mjs <compiled.css> <out.css>')
  process.exit(1)
}

const css = fs.readFileSync(SRC, 'utf8')

// Flatten Tailwind 4's `@layer` wrappers. CSS cascade layers ALWAYS lose to
// un-layered rules regardless of specificity, so webswap's un-layered globals
// (e.g. `a { color: #2172E5 }`) would override CLMM's layered utilities. Hoisting
// the rules out of @layer lets our .clmm-root-scoped utilities win on specificity.
const flattenLayers = () => ({
  postcssPlugin: 'flatten-layers',
  Once(root) {
    root.walkAtRules('layer', (atRule) => {
      if (atRule.nodes && atRule.nodes.length) atRule.replaceWith(atRule.nodes)
      else atRule.remove() // bare `@layer a, b;` declaration
    })
  },
})
flattenLayers.postcss = true

const out = postcss([
  flattenLayers(),
  prefixer({
    prefix: '.clmm-root',
    transform(prefix, selector, prefixed) {
      // Root-ish selectors collapse onto the scope container itself so the
      // preflight reset + theme variables apply only inside CLMM.
      if (['html', 'body', ':root', ':host', ':where(html)', ':where(:root)'].includes(selector)) return prefix
      if (selector === '*') return `${prefix} *`
      if (/^::?[a-z-]+$/i.test(selector)) return `${prefix} ${selector}`
      return prefixed
    },
  }),
]).process(css, { from: SRC }).css

fs.writeFileSync(OUT, '/* CLMM compiled Tailwind, scoped under .clmm-root (generated — do not edit) */\n' + out)
console.log(`scoped ${css.length} -> ${out.length} bytes -> ${OUT}`)
