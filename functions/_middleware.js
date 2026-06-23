// Edge access gate for the BETA deployment (dev-only) — Cloudflare Pages Function.
//
// Runs server-side at the edge on EVERY request, BEFORE any asset is served, so
// the key never reaches the browser bundle (unlike VITE_* vars, which are public).
// Unauthenticated visitors get a branded login PAGE; a correct key sets an
// httpOnly cookie and the normal app loads.
//
// KEY SOURCE (priority): context.env.BETA_ACCESS_KEY (Cloudflare dashboard env
// var on the browndex-webswap-beta project) -> else FALLBACK_KEY below (edit +
// commit + push to change; server-side only, never in the public bundle).
//
// Scoped to BETA: this file lives on the beta branch only — do NOT cherry-pick
// to bera. Also self-disables when no key resolves.
//
// LOCAL TEST: `yarn build && npx wrangler pages dev build/` (the gate does NOT
// run under `yarn dev` — vite doesn't execute edge functions).

// Active dev access key. To change it: edit this value, commit, push (redeploy).
const FALLBACK_KEY = 'brownfidev2026'

const COOKIE = 'bf_gate'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTk5IiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgMTk5IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cmVjdCB3aWR0aD0iMTk4LjUiIGhlaWdodD0iNDgiIGZpbGw9InVybCgjcGF0dGVybjBfMjAyXzE5MjYxKSIvPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuMF8yMDJfMTkyNjEiIHBhdHRlcm5Db250ZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48dXNlIHhsaW5rOmhyZWY9IiNpbWFnZTBfMjAyXzE5MjYxIiB0cmFuc2Zvcm09InNjYWxlKDAuMDAyNTE4ODkgMC4wMTA0MTY3KSIvPjwvcGF0dGVybj48aW1hZ2UgaWQ9ImltYWdlMF8yMDJfMTkyNjEiIHdpZHRoPSIzOTciIGhlaWdodD0iOTYiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBWTBBQUFCZ0NBWUFBQURoQ2k0NUFBQUFDWEJJV1hNQUFCWWxBQUFXSlFGSlVpVHdBQUFBQVhOU1IwSUFyczRjNlFBQUFBUm5RVTFCQUFDeGp3djhZUVVBQUEwdFNVUkJWSGdCN2QzcmRkeTJGZ1hncmF6Ny96b1ZoSzRnY2dXaEs3QlNnY2NWUktwQVVnV1dLdENvQWxzVkRGS0I1UXFHdDRMTXJRREJNVUZyUEo0SERnbVNBTG0vdGJBc1M1d25TUndDT0FDQlRGaHJTMWNlWFBuaS95MUFSRVRVY0lIaGxTdVhycXpzZmhJOFNoQVIwWHo1WUhIdHlqODJ6TnFWQllpSWFENThGOVRLdHJlMjdMb2lJcHF1clZiRjJzYjF5YkxyaW9ob0dtemRxdmhvdzd1ZzJscTdzckJzZlJBUjVjZFYzaGUyV3hkVVd4S2NIaGc4aUlnU1ovVUQyMzFiV1E2Y0V4R2x4WFlmMk83YjJyTHJpb2dvMkJraWN4WHdLL2ZQd3BWM3JwVEl4NVVybjgvT3ppb1FFVkcvWExBNHQ4TU1iTWNrNy9YTzFpMml3djl1WmRsMVJVVFVENXQrRjlRK0VpeHViTjBxYWo1SHNiUE4ydGJqTUFXSWlLZzltOTdBZHFpVnJjY3dYdTM1VE1XUnh6MVl6dmtnSXRLeEw0c0c1aGdzeWhPZnJRaDRIbGtzY1FFaUl0clBubDQwTUZYTmVNVjU0T2NNQ1JxTnRlV2NEeUtpRnpiZkxxaWZ4aXNDUDY4bWFHeDdzT3k2SXFLNXNua09iSXVWUFRCZUVmaTUyd2FOeHJyTDZ4TVJaY1AydDJqZ0VGWTJ3cFcrN1I0MEdtdkxyaXNpbWlxYjM5d0swWXhYRklqRXhnc2EyMWF1WElDSWFDTE9wR1pEUGphdTNMdHlkM1oydGtGRVBnQ3QwWThQN3YwdVFVU1V1ZjhnRDhhVlIxYThSRVRqU2oxb0dGZHVYYkF3SUNLaTBhVVlOS1RiNlJGMUYxUUZJaUpLUmtwQm83ZnhDaUlpaWlPRm9HRmN1WGVCNGpOb05MYWVPUjgwZXo2U3l2Lzd6SXNFbXBvUnpxY1FjcTQ5Ny83U3ZWZEpBQ29RcGhvemFCaHd2Q0lsa2hwOGpSRzRnMWFDaG5IbGlja09OQkdqblU5SDNMcnlqSTUrd2JDa2NwQTMvdHBWRG04Wk1NaVRXZlJ5a2oxWVA3TWVSSlNrb1ZvYUhLK2dVQVhxNFBHYk8xWnVRVVJKNlR0b0dPUXpYc0UxbzlJaWkwNkNnWU1vTFgxMlQ5MzZMcWlrQTRiMXQ2bDFQNjVBcVpIQVVZS0lrdEZuMEtpUU1PdFg4M1UvZm5IbEVteHBwQ3Exd1VTaVdjdGxHWkVvYkwxcytjS1ZkNjZVb0J4SWNIL0ZzVENpTk13aWFQaGc4UmZZb3NpVlpGWXRRVVNqbTNUUThQM2hFaXk0UEhuZVVwc2tSVFFsVndpL21ONU1NbWo0ZTFoSXNDaEJmWkZFaHh2TkF6b0U4UUpFMDZZK24yTFJKaXROSm1pd0N5cDlmaktuOFFrSXBlS2h2NkZuL3ZncFViZHFkbDl2NDk3NzFZbkhOc3RHL0k1NC91ZUs0U1RZL213dDl5SDc3VkM5OFJYMUVod0dsSC9ROEZldk1yQzlBSU5GTG1RVjQxS3gvZDc5cXJ4eDFwc0Q2KzZFdEVvcjFFMzQzY2NPY2FGeTdaZFprYXZCMisyVm4vM3JyNVd2dlhUUDhTRjBZL2NhRDZqUHJSQi9hcTVhNVE2YzBMMTNXV2JtUXJGV2tzd1J1OXg1emViaVFPcU1DODNydThkV3FQZkJFak9XYmREd3dVTFNNVXRRYnA2VjI4ZkluRHJmZmwwZkxHUitUb0VXL09PbFFoM2lRcVhKK3BOTXNxdW1ZcGFNTXZkLytVeWw0cm5rZlFjSERlVnp5N1pCUWNPZnY5cnZUdFdONHZ5eDlYb3hBbnlCZXJXQzk2Z0RaSXpqY2xEdXZkKzVmLzZMOXZJYTA5amE4UXZrMWMrZDNjSFZNKzMzRVN0b05LMFRxZXhMdE9RcmpTV0dWN2p5U2RibWNoWFdvLy9kRTVTdE5xbXdRN3BhZk5kTmdYQnk5WDRadUcyYjVCUURuWE8vdjJWL3hXd05scTZzM0hPL3pUQnd5RDRxMEY0MTlJS0ZyVWl3Y0VWYUZkSXN2VUVlQWFOWmJ5djVXZkVqMEo2OFg5RmQ0YTl1dGVNcFAvQ1YwQjNHZGVmZmgxaENyNHk4WGFQWWVsK24vQUVkMC9LbWJESjU5d2J4VzRRU1VHYzU4VFRwb0xFMWExdjZQbStReDVpRlFkMy9MU3Y1WG5Md2JDL3RmalRvVGlvcE9aWUtkQ01WeGRqSG9ieSt0SmJncjNRTmRFSXI3SGZRTzltQzhJSGxIRHFQYUtmUGZYVTV4MlZ1a2dzYXZsV3g4TUdpMDFYaGdMWmJGVks0bXU5eDd4WGJWb2dUTkRwWEhyNnlXeUFOcGUrdUZVKzZoLzd3MkwyMkJveTFRZ0pOQ1QyRE5MWHBac3RhTWtGanB3dXFVNS96Z0F6WXFsQngrN2daa3dyMW1GQUFMcEdXaGYrM1RmZm5xY3F1UkR2bnB3SVM5QzJZNTVaZFUwTm8weHJMMnVnRDRiNTVKMWVlcXZTM0VVa0ZKazNsenpNUEV1L2tuaGVLN1pzclY4MCtyc2FhOEhSQWFoWEV0emtoVXFINkxDcE5sNDkwVVMyUC9MM3RaMjNtckpnajI1VFEwYmFraGxUTWJXMjAwWUpHaGltemNsTEt3Y3V1cDFvekthb3ZsU3R2a1JidFJVMkZ1dHN5NUhocE1nTUxoTnZlVm81TnpmNDRsWHBib2oxNWJyUHZEd09sMmc1TlBnK0RSaDh5bkxYZERETGVzK3RwVU1hVkR3TjJTVlJiWlorbVFpaWc4MWJ6R2R6NUlaVmo2R1RGM2Zkam9Ndm1rZTdnOHdNVEhyV3B0cnVPcGQ2VzBLbjJ2Y2NXS3RUZjBWZi9zenpuWnZjQzBIMTJlZDhmTWJ4cjN6MGZ5K3UrenA5QmdvWWZRR3o2c25NSUZteFZqT05iUXNFQVhWSVY2djBybGZSelQvdTQwcDYwdnB0SkhsTkFTUzVxL014eHpmbFZZdjlFeXhMZGZFdTlQZkQ1MWFtMjZFYStremVoKzBLU1dOeDdsL2M0MVFIdWZZc1Rmb1RpdU9rMWFHVFdCY1ZXeGZqa3dMMzJKMjBmTFEycElLOG12SDlsck8wdnhmYlNJcmc3OFB1dUxuYWYyMTg4bHRCcG0ycmIyTFE0anFRMU1zbWdzVy9PbUcvaEJBZU5Qck9uNUkza2tESXJGY210TDNMMVdZSEdWcnF5anR4Y0YwOFR2eURROXYwZnluUXEwZDI3Q005YjhRSXVQWDBHalFMcGtsYUZuR0RTNS96R2Q0YzBFNmFrc25yd2F3dlJ1Rzc4Z25rVXdGZXdtcTYySnRQcHU0aVQxZllGcEtHN3BxZ0hXU3dqRWxIVHFwQkJvaitQWE1Vc1VLL3gwd1NRYzlCWUZuNXdrc0pvMDFOM0w0NUNKbDcramRQQjZhZUFoR21sMnM3V0hJTEdUNjBLeGNCbmdUcUFmUEVCWktGWVc0Zml1ZWIzSHN4QVo3Y2JxY1JwUzRTdFZQdzlJTFhNeURLZzVFejVkcSt4TTZBSytQViszQWxnOERMQmI2N1pWYy9RTDNFdWlxMFNTcTVhTHhHK2d1cWN5UVdTSmh2bWU2YVREOHhGd0dNTVhpWnJIclBkSFhWcTIxMVB6RnhNMDlTQ3hsQVpVS1V2SDMxdS9lTU1CK3lldXFUR3RzaUhmKzhlYzhPSzVMZ085OWk0QzN5TThRRm1pZFA3NzN4cnRyUTJJMHM3cUU4RG1VclFpTjJxQ0NWWFd3dlUvZTRWNmdQOVB1RjFjcExoOCtHbHl5SjA4VUw1cnFWeVc0Sk8wZDVqbzBtOURhbll2NlhBK3VCa0FsNW40UVBNcWUxMkdjeUwxQjB4eDNCNnF3ZHpEeG9HOWUwWERjWlh3SGVoK0NzOVdUN0NNSUFjSlNlS1pzVmJKaVNFV1VMWGlqdFhyR3BydG40T0NVNi9vMFhBbU9GNTh6V1gyOGptT0JBdUVWUXlvSDcxeTVBYnBFY3F0eVo5OXhPenJ3N1Nqb2tVb0pOYTNHT2pXZDduMURqSTdtcXpJVjFJMGpyVWRrMHhheXBoT1FVTmd6b0Q2bGRsQnRUWTVLUmgwSWhEczZydTNQMnQzUDRtWUpzZlptZjdBR0pPUEticFZ0VGdlRWJDVWc4YU9iUXFxTDNRREorMjI4L1pFdkdaUGI4TENVNmEvWmJ5dlRNSTZRWU5nenhiRmFTamJZSHhPQWprSzk0SzhSeGFiZFlnTG0wTGlRYVdVdEJncTJKK05JdnJDUVlOblpoakEyYmZMMXNzWFhMS0VwUzBGSUtHQVZzVnMrRnY2MXY2ZThCcld4ci9SejVlMmRPM1BmMkJZbkpkcUpoakE0OHQvNllSNjk0WjFLT3hnZ1piRmZtVHBUM1UzT1ArUWZ2Vmo4ZXVVTFNMQVQ2RUxuL2l0OU91NmxzZCsyUEVWc0NwMVdaakJTY0RTdDdRUWNPQXJRcHFiK3lnVVVGSHNvYldnY0ZVN3RpM2dFNUl5eXRHSzhBYysyUEU0QlNyeFVJOUdpSm9zRlZCc1JpTTZ5dlNFaEpFWTdRQ25pSnRjOHlHZFVNZStnd2FCbXhWVUR6TEJJNGhnN1NZZ0cwa3NIVDUzamI3N3ZhMnh4TGRjRzVHSnZvTUdyZThjcUNJYmpFeWZ6eW5NbEFiZEZjN0gyaTd0QUpDVTJDN0JpZk9Bcy9FM0c3Q3RKZXQ3MWFtdmFzWURlYzJvUWxmVjBpREpvZ2F0QmZVQXZEQnFVdEFOYUFzekRwb3VHQng0Vk0vYzdpWCtWemRkbG1DUFRaL2RYK1BjZDBxRjdmcjB2VmpGTnUyYlMwWWRsL25ZM1pCdzg4VHVIWkZVajgvZ2NFaVZSWHFNYkViSk1hOXAwdU1Gemp1dGQ5Sml3VU1HOXJWWnBkb2gxbFRHWmxOMFBBVHlpUklTTEM0QWRjeFNwRlVia3ZVd2VKMXltTmlQbkI4UU55bE9vNlI3K2FEZjkwMjJyUUNWSlY1bCtBRXlzYVViL2NLUHlOWGN1WGxuZzBsNkJqcHdxZ3d2STEvM1UyTGNZdHZGYWxpKzZpRDJMNkxhT21Pc3dYcTQwdnVIVkVnemdYSkJpOTNvcFRLKzdsakY4NFMrb0ZxQXowWjh6bFhiTjltdjh0cmhIN0hiYjR6N2Jtd2lmQWNZeVpZNkw1UDI1OFNJOW51Z3JKcFdJQ0lhQUltMWRLd2RhQ1NSZkF1UUVSRTBXVWZOQ3k3b0lpSUJwTnQwUERCUWxvVk1qRElRVzBpb2dGa0Z6UnNmYjl0V1EwMGx5NG9nM1JtRVJNUmRTSXB0MitSVjU2MHRDeHlDQmdHZGVyb1c5NGpnSWltNGhmSmhYZGw0WDUralRwNFZLQzJ1S0l2RVUzYTkrNHBueXU5a0o5OWlpZ0hsc05KUzBJQ2Jnb3JzUklSOVdidmpIQ1p0Q1JYeW5ocGZiQWkzTStnN29KNjQ4b2RBd1lSVGQzUlpVU2s5YkhWZFRYa2tna3BrOEFnNnc2OVlSY1VFZEVKdGw3RGFSa3dDN3BFRHdKZnV3OHl1L3pHMXFtK1JFU2s0U3JQd3BWTFY5WUhLdGtTUGJEREI0MlZIWEZKRkNLaXlYR1Y2c0pYcm5ZaVFVTmFGUStXd1lLSXFEKzJibjFJcGI3T05HaXdDNHFJYUF4OVZidzlCWTJWclZ0TERCWkVSRWYwdG94SUp1bW5Cdld0TXcySWlPaWtTZCtFNllBbVpaYnpLb2lJbE9ZVU5EaHJtNGlvb3prRURRTjJRUkVSUlRIVm9DRXRpYVpWd1JWbWlZZ2ltVnJRNEhnRkVSRzlPSkJ5S3ltekpZaUlxRmU1dHpTV3JqeHl2SUtJYUJobnlJeHJVZHloN29aaUZ4UVIwY0QrQmFRWit1Y3FIRjUrQUFBQUFFbEZUa1N1UW1DQyIvPjwvZGVmcz48L3N2Zz4='

// Cookie value = SHA-256 of the current key, so rotating the key invalidates
// every existing session (old cookies stop matching). httpOnly → not readable
// from JS; the plaintext key is never stored in the cookie.
async function tokenFor(key) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bf-gate-v1:' + key))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function parseCookies(header) {
  const out = {}
  header.split(';').forEach((part) => {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  })
  return out
}

function loginPage(error) {
  const err = error
    ? '<div class="error">Incorrect key — please try again.</div>'
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>BrownFi Beta · Dev Access</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;color:#CFC7C1;background:radial-gradient(1100px 560px at 50% -8%,#2A211A 0%,#171210 55%,#100D0B 100%)}
  .card{width:100%;max-width:384px;background:rgba(30,25,21,.82);border:1px solid #2F2823;border-radius:18px;padding:38px 32px;box-shadow:0 28px 70px rgba(0,0,0,.5);backdrop-filter:blur(6px);text-align:center}
  .logo{height:30px;margin-bottom:22px;opacity:.97}
  .badge{display:inline-block;font-size:10.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#E0AE80;background:rgba(152,92,42,.16);border:1px solid rgba(152,92,42,.42);padding:4px 11px;border-radius:999px;margin-bottom:18px}
  h1{font-size:18px;font-weight:600;color:#FBFBFD;margin-bottom:7px}
  p.sub{font-size:13px;color:#978A80;line-height:1.55;margin-bottom:24px}
  form{display:flex;flex-direction:column;gap:12px}
  .error{font-size:12.5px;color:#EE8A79;background:rgba(224,72,72,.1);border:1px solid rgba(224,72,72,.28);border-radius:9px;padding:9px 11px}
  input{width:100%;padding:13px 14px;font-size:14px;font-family:inherit;background:#161210;border:1px solid #3A302A;border-radius:11px;color:#FBFBFD;outline:none;transition:border-color .15s,box-shadow .15s}
  input::placeholder{color:#6B5F56}
  input:focus{border-color:#985C2A;box-shadow:0 0 0 3px rgba(152,92,42,.18)}
  button{width:100%;padding:13px;font-size:14px;font-weight:600;font-family:inherit;color:#fff;border:none;border-radius:11px;cursor:pointer;background:linear-gradient(180deg,#AC6A31 0%,#8A4F22 100%);transition:filter .15s}
  button:hover{filter:brightness(1.08)}
  .foot{margin-top:22px;font-size:11px;color:#6B5F56;letter-spacing:.02em}
</style>
</head>
<body>
  <div class="card">
    <img class="logo" src="${LOGO}" alt="BrownFi" />
    <div class="badge">Beta · Dev access</div>
    <h1>Restricted preview</h1>
    <p class="sub">This is the BrownFi development build. Enter your dev access key to continue.</p>
    <form method="POST" action="/__gate">
      ${err}
      <input type="password" name="key" placeholder="Access key" autocomplete="off" autofocus required />
      <button type="submit">Unlock</button>
    </form>
    <div class="foot">Authorized developers only</div>
  </div>
</body>
</html>`
}

function htmlResponse(html, status) {
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export async function onRequest(context) {
  const { request, env, next } = context
  const key = (env.BETA_ACCESS_KEY || FALLBACK_KEY || '').trim()

  // No key configured anywhere -> gate disabled, pass through.
  if (!key) return next()

  const url = new URL(request.url)
  const expected = await tokenFor(key)

  // Already authenticated (valid cookie) -> serve the app normally.
  const cookies = parseCookies(request.headers.get('Cookie') || '')
  if (cookies[COOKIE] === expected) return next()

  // Login submission.
  if (request.method === 'POST' && url.pathname === '/__gate') {
    const form = await request.formData()
    const submitted = (form.get('key') || '').toString().trim()
    if (submitted === key) {
      const secure = url.protocol === 'https:' ? '; Secure' : ''
      return new Response(null, {
        status: 303,
        headers: {
          'Set-Cookie': `${COOKIE}=${expected}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`,
          Location: '/',
          'cache-control': 'no-store',
        },
      })
    }
    return htmlResponse(loginPage(true), 401)
  }

  // Anything else while unauthenticated -> the login page.
  return htmlResponse(loginPage(false), 200)
}
