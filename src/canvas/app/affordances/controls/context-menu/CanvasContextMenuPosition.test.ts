import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  getCanvasContextMenuDismissKeyboardIntent,
  getCanvasContextMenuKeyboardIntent,
  getCanvasContextMenuPointerIntent,
  getCanvasContextMenuPosition,
  getCanvasContextMenuPositionForClientPoint,
} from './CanvasContextMenuPosition'

const CANVAS_APP_CSS = fileURLToPath(
  new URL('../../../shell/CanvasApp.css', import.meta.url),
)

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

  it('converts client coordinates into the container before clamping', () => {
    expect(getCanvasContextMenuPositionForClientPoint({
      clientPoint: { x: 390, y: 230 },
      containerRect: {
        height: 200,
        left: 100,
        top: 50,
        width: 300,
      },
      margin: 10,
      menuSize: { height: 80, width: 120 },
    })).toEqual({ x: 170, y: 110 })
  })

  it('uses the client point directly when the container rect is unavailable', () => {
    expect(getCanvasContextMenuPositionForClientPoint({
      clientPoint: { x: 96, y: 72 },
      menuSize: { height: 80, width: 120 },
    })).toEqual({ x: 96, y: 72 })
  })
})

describe('Canvas context menu surface styles', () => {
  it('keeps the rendered menu constrained when measured height is unavailable', () => {
    const source = readFileSync(CANVAS_APP_CSS, 'utf8')

    expect(source).toContain('--canvas-context-menu-width')
    expect(source).toContain('--canvas-context-menu-height')
    expect(source).toContain('--canvas-context-menu-margin')
    expect(source).toContain('max-height: calc(')
    expect(source).toContain('overflow: auto')
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
      stopPropagation: true,
    })

    expect(getCanvasContextMenuKeyboardIntent({
      event: { shiftKey: true },
      key: 'F10',
    })).toEqual({
      kind: 'open-context-menu',
      preventDefault: true,
      stopPropagation: true,
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

describe('getCanvasContextMenuPointerIntent', () => {
  it('maps contextmenu pointer events to a consumed open context menu intent', () => {
    expect(getCanvasContextMenuPointerIntent()).toEqual({
      kind: 'open-context-menu',
      preventDefault: true,
      stopPropagation: true,
    })
  })
})

describe('getCanvasContextMenuDismissKeyboardIntent', () => {
  it('maps Escape to a consumed close context menu intent', () => {
    expect(getCanvasContextMenuDismissKeyboardIntent({ key: 'Escape' }))
      .toEqual({
        kind: 'close-context-menu',
        preventDefault: true,
        stopPropagation: true,
      })
  })

  it('ignores unrelated keys', () => {
    expect(getCanvasContextMenuDismissKeyboardIntent({ key: 'Enter' }))
      .toBeNull()
  })
})
