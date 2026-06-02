import { describe, expect, it } from 'vitest'
import {
  canAlignCanvasCommandSelection,
  canDistributeCanvasCommandSelection,
  canGroupCanvasCommandSelection,
  getCanvasCommandSelectionState,
  hasCanvasCommandSelection,
} from './CanvasCommandSelectionRules'

describe('CanvasCommandSelectionRules', () => {
  it('owns built-in command selection thresholds', () => {
    expect(getCanvasCommandSelectionState({ selection: [] })).toEqual({
      canAlign: false,
      canDistribute: false,
      canGroup: false,
      hasSelection: false,
    })
    expect(getCanvasCommandSelectionState({ selection: ['a'] })).toEqual({
      canAlign: false,
      canDistribute: false,
      canGroup: false,
      hasSelection: true,
    })
    expect(
      getCanvasCommandSelectionState({ selection: ['a', 'b'] }),
    ).toEqual({
      canAlign: true,
      canDistribute: false,
      canGroup: true,
      hasSelection: true,
    })
    expect(
      getCanvasCommandSelectionState({ selection: ['a', 'b', 'c'] }),
    ).toEqual({
      canAlign: true,
      canDistribute: true,
      canGroup: true,
      hasSelection: true,
    })
  })

  it('exposes focused predicates for command execution guards', () => {
    expect(hasCanvasCommandSelection([])).toBe(false)
    expect(hasCanvasCommandSelection(['a'])).toBe(true)
    expect(canAlignCanvasCommandSelection(['a'])).toBe(false)
    expect(canAlignCanvasCommandSelection(['a', 'b'])).toBe(true)
    expect(canDistributeCanvasCommandSelection(['a', 'b'])).toBe(false)
    expect(canDistributeCanvasCommandSelection(['a', 'b', 'c'])).toBe(
      true,
    )
    expect(canGroupCanvasCommandSelection(['a'])).toBe(false)
    expect(canGroupCanvasCommandSelection(['a', 'b'])).toBe(true)
  })
})
