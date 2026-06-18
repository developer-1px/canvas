import { describe, expect, it } from 'vitest'
import {
  getCanvasContextMenuKeyboardIntent,
  getCanvasContextMenuPosition,
} from './CanvasContextMenuPosition'

describe('getCanvasContextMenuPosition', () => {
  it('keeps an in-bounds context menu point unchanged', () => {
    expect(getCanvasContextMenuPosition({
      menuSize: { height: 120, width: 220 },
      point: { x: 240, y: 180 },
      viewportSize: { height: 600, width: 800 },
    })).toEqual({ x: 240, y: 180 })
  })

  it('clamps x and y so the menu stays inside the viewport margin', () => {
    expect(getCanvasContextMenuPosition({
      margin: 10,
      menuSize: { height: 160, width: 240 },
      point: { x: 780, y: 590 },
      viewportSize: { height: 600, width: 800 },
    })).toEqual({ x: 550, y: 430 })
  })

  it('uses the anchor, menu size, and margin as a viewport fallback', () => {
    expect(getCanvasContextMenuPosition({
      margin: 8,
      menuSize: { height: 320, width: 220 },
      point: { x: 120, y: 96 },
      viewportSize: null,
    })).toEqual({ x: 120, y: 96 })
  })

  it('falls back to the margin when the menu is larger than the viewport', () => {
    expect(getCanvasContextMenuPosition({
      margin: 12,
      menuSize: { height: 500, width: 900 },
      point: { x: 80, y: 70 },
      viewportSize: { height: 320, width: 480 },
    })).toEqual({ x: 12, y: 12 })
  })
})

describe('getCanvasContextMenuKeyboardIntent', () => {
  it('maps ContextMenu and Shift F10 to an open context menu intent', () => {
    expect(getCanvasContextMenuKeyboardIntent({
      event: { shiftKey: false },
      key: 'ContextMenu',
    })).toEqual({
      kind: 'open-context-menu',
      preventDefault: true,
    })

    expect(getCanvasContextMenuKeyboardIntent({
      event: { shiftKey: true },
      key: 'F10',
    })).toEqual({
      kind: 'open-context-menu',
      preventDefault: true,
    })
  })

  it('ignores F10 without Shift and unrelated keys', () => {
    expect(getCanvasContextMenuKeyboardIntent({
      event: { shiftKey: false },
      key: 'F10',
    })).toBeNull()
    expect(getCanvasContextMenuKeyboardIntent({
      event: { shiftKey: true },
      key: 'Escape',
    })).toBeNull()
  })
})
