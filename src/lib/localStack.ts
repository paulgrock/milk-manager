// The local Supabase stack is configured as 127.0.0.1, which on a phone
// opening the dev server at the Mac's address (http://192.168.x.x:5173)
// means the phone itself. Pointing it at the host the page came from makes
// the same stack reachable from any device on the network.

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]'])

export const isLoopback = (hostname: string) => LOOPBACK.has(hostname)

/** `configured`, with a loopback host swapped for the page's host when the page isn't on loopback. */
export function reachableUrl(configured: string, pageHostname: string | undefined): string {
  const url = new URL(configured)
  if (!isLoopback(url.hostname) || !pageHostname || isLoopback(pageHostname)) return configured
  url.hostname = pageHostname
  return url.toString().replace(/\/$/, '')
}
