import { describe, expect, it } from 'vitest'
import { getCanvasEditableFieldKeyboardIntent } from './CanvasEditableFieldKeyboard'

describe('CanvasEditableFieldKeyboard', () => {
  it('maps Enter to commit', () => {
    expect(getCanvasEditableFieldKeyboardIntent({ key: 'Enter' })).toEqual({
      kind: 'commit',
      preventDefault: true,
    })
  })

  it('maps Escape to cancel', () => {
    expect(getCanvasEditableFieldKeyboardIntent({ key: 'Escape' })).toEqual({
      kind: 'cancel',
      preventDefault: true,
    })
  })

  it('ignores other keys', () => {
    expect(getCanvasEditableFieldKeyboardIntent({ key: 'Tab' })).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })
})
