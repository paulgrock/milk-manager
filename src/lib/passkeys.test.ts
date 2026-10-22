import { describe, expect, it } from 'vitest'
import { deviceName, passkeyErrorMessage } from './passkeys'

describe('deviceName', () => {
  it('names common devices', () => {
    expect(deviceName('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('iPhone')
    expect(deviceName('Mozilla/5.0 (Linux; Android 15; Pixel 7) Mobile Safari')).toBe('Android phone')
    expect(deviceName('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('Mac')
    expect(deviceName('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows PC')
    expect(deviceName('curl/8')).toBe('This device')
  })
})

describe('passkeyErrorMessage', () => {
  it('explains a cancelled or missing passkey', () => {
    expect(passkeyErrorMessage({ code: 'ERROR_CEREMONY_ABORTED' })).toMatch(/Cancelled/)
    expect(passkeyErrorMessage({ name: 'NotAllowedError' })).toMatch(/Cancelled/)
    expect(passkeyErrorMessage({ code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY', cause: { name: 'NotAllowedError' } })).toMatch(/Cancelled/)
  })

  it('explains a second passkey on the same device', () => {
    expect(passkeyErrorMessage({ code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED' })).toMatch(/already has a passkey/)
  })

  it('falls back to the message', () => {
    expect(passkeyErrorMessage(new Error('Boom'))).toBe('Boom')
  })
})
