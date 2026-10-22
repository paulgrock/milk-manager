// Plain-language wording for passkey errors and device names.

/** A name for the passkey from the browser it was made in, e.g. "iPhone" or "Mac". */
export function deviceName(userAgent: string): string {
  if (/iPhone/.test(userAgent)) return 'iPhone'
  if (/iPad/.test(userAgent)) return 'iPad'
  if (/Android/.test(userAgent)) return /Mobile/.test(userAgent) ? 'Android phone' : 'Android tablet'
  if (/Macintosh|Mac OS X/.test(userAgent)) return 'Mac'
  if (/Windows/.test(userAgent)) return 'Windows PC'
  if (/CrOS/.test(userAgent)) return 'Chromebook'
  if (/Linux/.test(userAgent)) return 'Linux computer'
  return 'This device'
}

/** What to tell someone when a passkey prompt fails. */
export function passkeyErrorMessage(error: unknown): string {
  const e = error as { code?: string; name?: string; message?: string; cause?: { name?: string } }
  if (e?.code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED') return 'This device already has a passkey for your account.'
  if (e?.code === 'ERROR_CEREMONY_ABORTED' || e?.name === 'NotAllowedError' || e?.cause?.name === 'NotAllowedError') {
    return 'Cancelled, or there is no passkey for Milk Manager on this device. Use an email code instead.'
  }
  if (e?.code === 'ERROR_INVALID_DOMAIN' || e?.code === 'ERROR_INVALID_RP_ID') return 'Passkeys are not set up for this web address.'
  return e?.message || 'Something went wrong with the passkey.'
}
