import { describe, expect, it } from 'vitest'

import {
  resolveDomEditSpacingDragValue,
} from './DomEditOverlayGesture'

describe('DomEditOverlayGesture', () => {
  it('snaps spacing drag values to the default four pixel integer grid', () => {
    expect(resolveDomEditSpacingDragValue(
      10.4,
      { shiftKey: false } as PointerEvent,
    )).toBe(12)
    expect(resolveDomEditSpacingDragValue(
      9.6,
      { shiftKey: false } as PointerEvent,
    )).toBe(8)
  })

  it('uses a configured spacing grid size', () => {
    expect(resolveDomEditSpacingDragValue(
      14.1,
      { shiftKey: false } as PointerEvent,
      { gridSize: 6 },
    )).toBe(12)
    expect(resolveDomEditSpacingDragValue(
      14.1,
      { shiftKey: true } as PointerEvent,
      { gridSize: 6 },
    )).toBe(12)
  })
})
