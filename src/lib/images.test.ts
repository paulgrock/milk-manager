import { describe, expect, it } from 'vitest'
import { visibleBox } from './images'

// A width x height picture, see-through except the given pixels.
function picture(width: number, height: number, solid: [number, number][]) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (const [x, y] of solid) data[(y * width + x) * 4 + 3] = 255
  return { data, width, height }
}

describe('visibleBox', () => {
  it('finds the drawing inside see-through margins', () => {
    expect(visibleBox(picture(10, 8, [[2, 3], [6, 5]]))).toEqual({ x: 2, y: 3, w: 5, h: 3 })
  })
  it('ignores nearly see-through edge pixels', () => {
    const p = picture(4, 4, [[1, 1]])
    p.data[(0 * 4 + 3) * 4 + 3] = 5
    expect(visibleBox(p)).toEqual({ x: 1, y: 1, w: 1, h: 1 })
  })
  it('returns null for an empty picture', () => {
    expect(visibleBox(picture(3, 3, []))).toBeNull()
  })
})
