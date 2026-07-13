import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import prefixSelector from 'postcss-prefix-selector'

// Scope every rule emitted from CLMM CSS (src/clmm/**) under `.clmm-root` so the
// CLMM sub-app's Tailwind preflight + utilities don't bleed onto webswap's pages
// (and webswap's globals stay off CLMM). prefixSelector passes the source file
// path to transform(); we no-op for any file outside src/clmm, leaving webswap's
// own CSS untouched.
const clmmScope = prefixSelector({
  prefix: '.clmm-root',
  transform(prefix, selector, prefixedSelector, filePath) {
    const f = (filePath || '').replace(/\\/g, '/')
    if (!f.includes('/src/clmm/')) return selector
    // Root-ish selectors collapse onto the scope container itself so CLMM's
    // preflight reset + CSS variables apply only inside the CLMM sub-app.
    if (['html', 'body', ':root', ':host', ':where(html)', ':where(:root)'].includes(selector)) return prefix
    if (selector === '*') return `${prefix} *`
    if (/^::?[a-z-]+$/i.test(selector)) return `${prefix} ${selector}`
    return prefixedSelector
  },
})

export default {
  plugins: [tailwindcss(), autoprefixer(), clmmScope],
}
