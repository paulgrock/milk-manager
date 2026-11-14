// Retry rules for saves that must survive bad signal (milk, care logs).
/** fetch failed outright (no or bad signal), as opposed to the server saying no. */
export function isNetworkError(error) {
    return /failed to fetch|load failed|networkerror|network request failed|fetch failed/i.test(String(error?.message ?? error));
}
// Keep retrying while it's the network, up to 30s apart; give up quickly on
// real errors so they're shown.
export const retry = (failureCount, error) => isNetworkError(error) || failureCount < 2;
export const retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 30_000);
