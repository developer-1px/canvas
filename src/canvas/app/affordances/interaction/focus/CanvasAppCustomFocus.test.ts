import { describe, expect, it } from 'vitest'
import {
  CANVAS_APP_CUSTOM_FOCUS_EVENT,
  getCanvasAppCustomFocusForSelection,
  isCanvasAppCustomFocusEvent,
} from './CanvasAppCustomFocus'

describe('CanvasAppCustomFocus', () => {
  it('recognizes valid custom focus events', () => {
    const event = new CustomEvent(CANVAS_APP_CUSTOM_FOCUS_EVENT, {
      detail: {
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:button:0/1',
      },
    })

    expect(isCanvasAppCustomFocusEvent(event)).toBe(true)
    expect(isCanvasAppCustomFocusEvent(new Event('click'))).toBe(false)
  })

  it('clears custom focus when its item leaves selection', () => {
    const focus = {
      itemId: 'html-specimen-1',
      ownerId: 'html-specimen',
      targetId: 'dom:button:0/1',
    }

    expect(getCanvasAppCustomFocusForSelection({
      focus,
      selection: ['html-specimen-1'],
    })).toBe(focus)
    expect(getCanvasAppCustomFocusForSelection({
      focus,
      selection: ['rect-1'],
    })).toBeNull()
  })
})
