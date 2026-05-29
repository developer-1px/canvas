import { describe, expect, it } from 'vitest'
import {
  CANVAS_APP_CUSTOM_FOCUS_EVENT,
  getCanvasAppCustomFocusForSelection,
  isCanvasAppCustomFocusEvent,
  reduceCanvasAppCustomFocus,
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

  it('recognizes valid custom focus clear events', () => {
    const event = new CustomEvent(CANVAS_APP_CUSTOM_FOCUS_EVENT, {
      detail: {
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:button:0/1',
        type: 'clear',
      },
    })

    expect(isCanvasAppCustomFocusEvent(event)).toBe(true)
  })

  it('clears only the matching custom focus target', () => {
    const focus = {
      itemId: 'html-specimen-1',
      ownerId: 'html-specimen',
      targetId: 'dom:button:0/1',
    }

    expect(reduceCanvasAppCustomFocus({
      current: focus,
      event: {
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:button:0/1',
        type: 'clear',
      },
    })).toBeNull()
    expect(reduceCanvasAppCustomFocus({
      current: focus,
      event: {
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:card:0/2',
        type: 'clear',
      },
    })).toBe(focus)
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
