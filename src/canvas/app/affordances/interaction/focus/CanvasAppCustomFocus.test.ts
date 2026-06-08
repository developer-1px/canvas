import { describe, expect, it } from 'vitest'
import {
  CANVAS_APP_CUSTOM_FOCUS_EVENT,
  getCanvasAppCustomFocusForSelection,
  isCanvasAppCustomFocusEvent,
  reduceCanvasAppCustomFocus,
} from './CanvasAppCustomFocus'

const CUSTOM_WIDGET_ITEM_ID = 'custom-widget-1'
const CUSTOM_WIDGET_OWNER_ID = 'custom-widget'
const CUSTOM_WIDGET_TARGET_ID = 'widget:control:0/1'

describe('CanvasAppCustomFocus', () => {
  it('recognizes valid custom focus events', () => {
    const event = new CustomEvent(CANVAS_APP_CUSTOM_FOCUS_EVENT, {
      detail: {
        itemId: CUSTOM_WIDGET_ITEM_ID,
        ownerId: CUSTOM_WIDGET_OWNER_ID,
        targetId: CUSTOM_WIDGET_TARGET_ID,
      },
    })

    expect(isCanvasAppCustomFocusEvent(event)).toBe(true)
    expect(isCanvasAppCustomFocusEvent(new Event('click'))).toBe(false)
  })

  it('recognizes valid custom focus clear events', () => {
    const event = new CustomEvent(CANVAS_APP_CUSTOM_FOCUS_EVENT, {
      detail: {
        itemId: CUSTOM_WIDGET_ITEM_ID,
        ownerId: CUSTOM_WIDGET_OWNER_ID,
        targetId: CUSTOM_WIDGET_TARGET_ID,
        type: 'clear',
      },
    })

    expect(isCanvasAppCustomFocusEvent(event)).toBe(true)
  })

  it('clears only the matching custom focus target', () => {
    const focus = {
      itemId: CUSTOM_WIDGET_ITEM_ID,
      ownerId: CUSTOM_WIDGET_OWNER_ID,
      targetId: CUSTOM_WIDGET_TARGET_ID,
    }

    expect(reduceCanvasAppCustomFocus({
      current: focus,
      event: {
        itemId: CUSTOM_WIDGET_ITEM_ID,
        ownerId: CUSTOM_WIDGET_OWNER_ID,
        targetId: CUSTOM_WIDGET_TARGET_ID,
        type: 'clear',
      },
    })).toBeNull()
    expect(reduceCanvasAppCustomFocus({
      current: focus,
      event: {
        itemId: CUSTOM_WIDGET_ITEM_ID,
        ownerId: CUSTOM_WIDGET_OWNER_ID,
        targetId: 'widget:field:0/2',
        type: 'clear',
      },
    })).toBe(focus)
  })

  it('clears custom focus when its item leaves selection', () => {
    const focus = {
      itemId: CUSTOM_WIDGET_ITEM_ID,
      ownerId: CUSTOM_WIDGET_OWNER_ID,
      targetId: CUSTOM_WIDGET_TARGET_ID,
    }

    expect(getCanvasAppCustomFocusForSelection({
      focus,
      selection: [CUSTOM_WIDGET_ITEM_ID],
    })).toBe(focus)
    expect(getCanvasAppCustomFocusForSelection({
      focus,
      selection: ['rect-1'],
    })).toBeNull()
  })
})
