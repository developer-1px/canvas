import { describe, expect, it, vi } from 'vitest'
import {
  isCanvasKeyboardCommandIntent,
  runCanvasKeyboardCommandIntent,
  type CanvasKeyboardCommandHandlers,
  type CanvasKeyboardCommandIntent,
} from './CanvasKeyboardCommandDispatch'

describe('CanvasKeyboardCommandDispatch', () => {
  it('recognizes document command intents and ignores non-command intents', () => {
    expect(isCanvasKeyboardCommandIntent({
      kind: 'delete-selection',
      preventDefault: true,
    })).toBe(true)
    expect(isCanvasKeyboardCommandIntent({
      kind: 'zoom-by',
      multiplier: 1.25,
      preventDefault: true,
    })).toBe(false)
  })

  it('routes keyboard command intents to the matching command handler', () => {
    const handlers = createHandlers()

    for (const intent of [
      { kind: 'copy-selection', preventDefault: true },
      { kind: 'cut-selection', preventDefault: true },
      { kind: 'delete-selection', preventDefault: true },
      { kind: 'duplicate-selection', preventDefault: true },
      { kind: 'edit-selection', preventDefault: true },
      { kind: 'group-selection', preventDefault: true },
      { kind: 'lock-selection', preventDefault: true },
      { kind: 'paste-selection', preventDefault: true },
      { kind: 'quick-create-sticky', preventDefault: true },
      { kind: 'redo-history', preventDefault: true },
      { kind: 'select-all', preventDefault: true },
      { kind: 'undo-history', preventDefault: true },
      { kind: 'ungroup-selection', preventDefault: true },
      { kind: 'unlock-all', preventDefault: true },
    ] satisfies CanvasKeyboardCommandIntent[]) {
      runCanvasKeyboardCommandIntent({ handlers, intent })
    }

    expect(handlers.copySelection).toHaveBeenCalledTimes(1)
    expect(handlers.cutSelection).toHaveBeenCalledTimes(1)
    expect(handlers.deleteSelection).toHaveBeenCalledTimes(1)
    expect(handlers.duplicateSelection).toHaveBeenCalledTimes(1)
    expect(handlers.editSelection).toHaveBeenCalledTimes(1)
    expect(handlers.groupSelection).toHaveBeenCalledTimes(1)
    expect(handlers.lockSelection).toHaveBeenCalledTimes(1)
    expect(handlers.pasteSelection).toHaveBeenCalledTimes(1)
    expect(handlers.quickCreateSticky).toHaveBeenCalledTimes(1)
    expect(handlers.redoHistory).toHaveBeenCalledTimes(1)
    expect(handlers.selectAll).toHaveBeenCalledTimes(1)
    expect(handlers.undoHistory).toHaveBeenCalledTimes(1)
    expect(handlers.ungroupSelection).toHaveBeenCalledTimes(1)
    expect(handlers.unlockAll).toHaveBeenCalledTimes(1)
  })

  it('routes keyboard command payload intents to the matching handler', () => {
    const handlers = createHandlers()

    runCanvasKeyboardCommandIntent({
      handlers,
      intent: {
        kind: 'reorder-selection',
        mode: 'bringForward',
        preventDefault: true,
      },
    })
    runCanvasKeyboardCommandIntent({
      handlers,
      intent: {
        dx: 10,
        dy: -10,
        kind: 'nudge-selection',
        preventDefault: true,
      },
    })

    expect(handlers.reorderSelection).toHaveBeenCalledWith('bringForward')
    expect(handlers.moveSelection).toHaveBeenCalledWith(10, -10)
  })
})

function createHandlers(): CanvasKeyboardCommandHandlers {
  return {
    copySelection: vi.fn(),
    cutSelection: vi.fn(),
    deleteSelection: vi.fn(),
    duplicateSelection: vi.fn(),
    editSelection: vi.fn(),
    groupSelection: vi.fn(),
    lockSelection: vi.fn(),
    moveSelection: vi.fn(),
    pasteSelection: vi.fn(),
    quickCreateSticky: vi.fn(),
    redoHistory: vi.fn(),
    reorderSelection: vi.fn(),
    selectAll: vi.fn(),
    undoHistory: vi.fn(),
    ungroupSelection: vi.fn(),
    unlockAll: vi.fn(),
  }
}
