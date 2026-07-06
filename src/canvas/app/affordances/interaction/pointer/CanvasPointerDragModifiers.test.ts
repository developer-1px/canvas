import { describe, expect, it } from 'vitest'

import { getCanvasAxisLockedDragDelta } from './CanvasPointerDragModifiers'

describe('CanvasPointerDragModifiers', () => {
  it('locks drag deltas to the dominant axis', () => {
    expect(getCanvasAxisLockedDragDelta({ dx: 40, dy: 12 })).toEqual({
      dx: 40,
      dy: 0,
    })
    expect(getCanvasAxisLockedDragDelta({ dx: -8, dy: 24 })).toEqual({
      dx: 0,
      dy: 24,
    })
  })
})
