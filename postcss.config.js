import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import prefixSelector from 'postcss-prefix-selector'

const clmmScope = prefixSelector({
  prefix: '.clmm-root',
  transform(prefix, selector, prefixedSelector, filePath) {
    const file = (filePath || '').replace(/\\/g, '/')
    if (!file.includes('/src/clmm/')) return selector
    if (['html', 'body', ':root', ':host', ':where(html)', ':where(:root)'].includes(selector)) return prefix
    if (selector === '*') return `${prefix} *`
    if (/^::?[a-z-]+$/i.test(selector)) return `${prefix} ${selector}`
    return prefixedSelector
  },
})

export default {
  plugins: [tailwindcss(), autoprefixer(), clmmScope],
}
