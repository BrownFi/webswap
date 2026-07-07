// Vite hashes built chunks. After a deploy the old hashed file no longer
// exists on the CDN, so any tab still running the previous build will throw
// when it tries to fetch a lazy-loaded chunk. Detect that specific error and
// reload once to pick up the new index.html (and the new chunk URLs).
//
// We use sessionStorage to avoid an infinite reload loop in the rare case the
// problem is something else (e.g. CDN outage).

const RELOAD_FLAG = '__bf_chunk_reload_attempted'

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Loading chunk \S+ failed/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
]

export const isChunkLoadError = (message: string): boolean =>
  !!message && CHUNK_ERROR_PATTERNS.some((re) => re.test(message))

// Reload once per session to pick up the new build. Returns true if it triggered
// a reload, false if suppressed (already tried this session) — callers can then
// fall back to a normal error UI instead of hanging on a "reloading" screen.
export const tryReload = (): boolean => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false // already tried this session
    sessionStorage.setItem(RELOAD_FLAG, '1')
  } catch {
    // private mode / storage disabled — proceed anyway, reload at most once
  }
  window.location.reload()
  return true
}

export function installChunkReloadHandler() {
  window.addEventListener('error', (event) => {
    const message = String(event.message ?? event.error?.message ?? '')
    if (isChunkLoadError(message)) tryReload()
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason: any = event.reason
    const message = String(reason?.message ?? reason ?? '')
    if (isChunkLoadError(message)) tryReload()
  })

  // Clear the flag a few seconds after a successful load — that way the next
  // deploy can trigger another reload without being suppressed.
  if (document.readyState === 'complete') {
    setTimeout(() => {
      try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* storage disabled — ignore */ }
    }, 5000)
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* storage disabled — ignore */ }
      }, 5000)
    })
  }
}
