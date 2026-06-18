import { describe, expect, it } from 'vitest'
import { getCanvasPresentationKeyboardIntent } from './CanvasPresentationKeyboard'

describe('CanvasPresentationKeyboard', () => {
  it('maps Escape to exit presentation intent', () => {
    expect(getCanvasPresentationKeyboardIntent({ key: 'Escape' })).toEqual({
      kind: 'exit',
      preventDefault: true,
    })
  })

  it('maps forward presentation navigation keys', () => {
    for (const key of ['ArrowRight', 'PageDown', ' ']) {
      expect(getCanvasPresentationKeyboardIntent({ key })).toEqual({
        direction: 1,
        kind: 'navigate',
        preventDefault: true,
      })
    }
  })

  it('maps backward presentation navigation keys', () => {
    for (const key of ['ArrowLeft', 'PageUp']) {
      expect(getCanvasPresentationKeyboardIntent({ key })).toEqual({
        direction: -1,
        kind: 'navigate',
        preventDefault: true,
      })
    }
  })

  it('ignores unrelated presentation keys', () => {
    expect(getCanvasPresentationKeyboardIntent({ key: 'Enter' })).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })
})
