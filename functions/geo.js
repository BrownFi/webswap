// Cloudflare Pages Function: expose the request country to the client.
// Cloudflare derives this value from the connecting IP at the edge.
export function onRequestGet(context) {
  return new Response(JSON.stringify({ country: context.request.cf?.country ?? null }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
