import { describe, expect, it } from 'vitest'

import { getCanvasFindInputKeyboardIntent } from './CanvasFindReplaceKeyboard'

describe('CanvasFindReplaceKeyboard', () => {
  it('maps Enter to next find match intent', () => {
    expect(getCanvasFindInputKeyboardIntent({ key: 'Enter' })).toEqual({
      direction: 1,
      kind: 'find-match',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('maps Shift Enter to previous find match intent', () => {
    expect(getCanvasFindInputKeyboardIntent({
      key: 'Enter',
      shiftKey: true,
    })).toEqual({
      direction: -1,
      kind: 'find-match',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('maps Escape to close find intent', () => {
    expect(getCanvasFindInputKeyboardIntent({ key: 'Escape' })).toEqual({
      kind: 'close-find',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('ignores unrelated keys', () => {
    expect(getCanvasFindInputKeyboardIntent({ key: 'Tab' })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })
})
