import { describe, expect, it } from 'vitest'
import { reachableUrl } from './localStack'

describe('reachableUrl', () => {
  it('points the local stack at the Mac when the app is opened from a phone', () => {
    expect(reachableUrl('http://127.0.0.1:54321', '192.168.68.67')).toBe('http://192.168.68.67:54321')
    expect(reachableUrl('http://localhost:54321', 'macbook.local')).toBe('http://macbook.local:54321')
  })

  it('leaves it alone on the Mac itself', () => {
    expect(reachableUrl('http://127.0.0.1:54321', 'localhost')).toBe('http://127.0.0.1:54321')
    expect(reachableUrl('http://127.0.0.1:54321', '127.0.0.1')).toBe('http://127.0.0.1:54321')
  })

  it('never touches a hosted project', () => {
    expect(reachableUrl('https://abcd.supabase.co', 'milk.netlify.app')).toBe('https://abcd.supabase.co')
  })
})
