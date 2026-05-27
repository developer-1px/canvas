import { describe, expect, it, vi } from 'vitest'
import type { CanvasKeyboardShortcutDispatchHandlers } from './CanvasKeyboardShortcutDispatch'
import { runCanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutDispatch'

describe('CanvasKeyboardShortcutDispatch', () => {
  it('routes shortcut intents through the aggregate dispatch seam', () => {
    const handlers = createHandlers()

    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'none', preventDefault: false },
      }),
    ).toBe(false)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'delete-selection', preventDefault: true },
      }),
    ).toBe(true)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'quick-create-sticky', preventDefault: true },
      }),
    ).toBe(true)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: {
          kind: 'zoom-by',
          multiplier: 1.25,
          preventDefault: true,
        },
      }),
    ).toBe(true)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'set-tool', preventDefault: false, tool: 'text' },
      }),
    ).toBe(true)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'open-command-palette', preventDefault: true },
      }),
    ).toBe(true)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'open-cursor-chat', preventDefault: true },
      }),
    ).toBe(true)
    expect(
      runCanvasKeyboardShortcutIntent({
        handlers,
        intent: { kind: 'temporary-pan', preventDefault: true },
      }),
    ).toBe(true)

    expect(handlers.deleteSelection).toHaveBeenCalledTimes(1)
    expect(handlers.quickCreateSticky).toHaveBeenCalledTimes(1)
    expect(handlers.zoomBy).toHaveBeenCalledWith(1.25)
    expect(handlers.openCommandPalette).toHaveBeenCalledTimes(1)
    expect(handlers.openCursorChat).toHaveBeenCalledTimes(1)
    expect(handlers.setTool).toHaveBeenCalledWith('text')
    expect(handlers.setSpaceDown).toHaveBeenCalledWith(true)
  })
})

function createHandlers(): CanvasKeyboardShortcutDispatchHandlers {
  return {
    closeCursorChat: vi.fn(),
    commitSelection: vi.fn(),
    copySelection: vi.fn(),
    cutSelection: vi.fn(),
    deleteSelection: vi.fn(),
    duplicateSelection: vi.fn(),
    fitToItems: vi.fn(),
    groupSelection: vi.fn(),
    interactionRef: { current: { kind: 'none' } },
    lockSelection: vi.fn(),
    moveSelection: vi.fn(),
    openCommandPalette: vi.fn(),
    openCursorChat: vi.fn(),
    openFindReplace: vi.fn(),
    pasteSelection: vi.fn(),
    quickCreateSticky: vi.fn(),
    redoHistory: vi.fn(),
    reorderSelection: vi.fn(),
    resetViewport: vi.fn(),
    selectAll: vi.fn(),
    setDraftArrow: vi.fn(),
    setDraftRect: vi.fn(),
    setDraftStroke: vi.fn(),
    setLaserTrail: vi.fn(),
    setEditing: vi.fn(),
    setGesture: vi.fn(),
    setMarquee: vi.fn(),
    setSpaceDown: vi.fn(),
    setTool: vi.fn(),
    undoHistory: vi.fn(),
    ungroupSelection: vi.fn(),
    unlockAll: vi.fn(),
    zoomBy: vi.fn(),
  }
}
