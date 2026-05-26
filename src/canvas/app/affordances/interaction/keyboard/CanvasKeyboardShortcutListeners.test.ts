import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../../../engine'
import {
  bindCanvasKeyboardShortcutListeners,
  type CanvasKeyboardShortcutEventTarget,
  type CanvasKeyboardShortcutHandlerRef,
} from './CanvasKeyboardShortcutListeners'
import type { CanvasKeyboardShortcutHandlers } from './CanvasKeyboardShortcutRouter'

describe('CanvasKeyboardShortcutListeners', () => {
  it('binds keyboard events to the latest handler bundle', () => {
    const target = createKeyboardTarget()
    const firstSetTool = vi.fn()
    const latestSetTool = vi.fn()
    const handlersRef: CanvasKeyboardShortcutHandlerRef = {
      current: createHandlers({ setTool: firstSetTool }),
    }

    bindCanvasKeyboardShortcutListeners({ handlersRef, target })
    handlersRef.current = createHandlers({ setTool: latestSetTool })
    target.dispatch('keydown', createKeyboardEvent({ key: 'v' }))

    expect(firstSetTool).not.toHaveBeenCalled()
    expect(latestSetTool).toHaveBeenCalledWith('select')
  })

  it('routes temporary pan release and window blur through system dispatch', () => {
    const target = createKeyboardTarget()
    const setSpaceDown = vi.fn()
    const handlersRef: CanvasKeyboardShortcutHandlerRef = {
      current: createHandlers({ setSpaceDown }),
    }

    bindCanvasKeyboardShortcutListeners({ handlersRef, target })
    target.dispatch('keyup', createKeyboardEvent({ code: 'Space', key: ' ' }))
    target.dispatch('blur', new Event('blur'))

    expect(setSpaceDown).toHaveBeenNthCalledWith(1, false)
    expect(setSpaceDown).toHaveBeenNthCalledWith(2, false)
  })

  it('removes the bound listeners during cleanup', () => {
    const target = createKeyboardTarget()
    const setTool = vi.fn()
    const handlersRef: CanvasKeyboardShortcutHandlerRef = {
      current: createHandlers({ setTool }),
    }

    const cleanup = bindCanvasKeyboardShortcutListeners({
      handlersRef,
      target,
    })
    cleanup()
    target.dispatch('keydown', createKeyboardEvent({ key: 'v' }))

    expect(setTool).not.toHaveBeenCalled()
    expect(target.listenerCount()).toBe(0)
  })
})

function createKeyboardTarget() {
  const listeners = new Map<string, Set<EventListener>>()
  const target: CanvasKeyboardShortcutEventTarget & {
    dispatch: (type: string, event: Event) => void
    listenerCount: () => number
  } = {
    addEventListener(type, listener) {
      const currentListeners = listeners.get(type) ?? new Set<EventListener>()
      currentListeners.add(listener)
      listeners.set(type, currentListeners)
    },
    dispatch(type, event) {
      for (const listener of listeners.get(type) ?? []) {
        listener(event)
      }
    },
    listenerCount() {
      return [...listeners.values()].reduce(
        (count, currentListeners) => count + currentListeners.size,
        0,
      )
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener)
    },
  }

  return target
}

function createHandlers(
  overrides: Partial<CanvasKeyboardShortcutHandlers> = {},
): CanvasKeyboardShortcutHandlers {
  return {
    commitSelection: vi.fn(),
    config: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    copySelection: vi.fn(),
    customCreationTools: [],
    cutSelection: vi.fn(),
    deleteSelection: vi.fn(),
    duplicateSelection: vi.fn(),
    fitToItems: vi.fn(),
    groupSelection: vi.fn(),
    interactionRef: { current: { kind: 'none' } },
    lockSelection: vi.fn(),
    moveSelection: vi.fn(),
    closeCursorChat: vi.fn(),
    openCursorChat: vi.fn(),
    openFindReplace: vi.fn(),
    pasteSelection: vi.fn(),
    quickCreateSticky: vi.fn(),
    redoHistory: vi.fn(),
    reorderSelection: vi.fn(),
    resetViewport: vi.fn(),
    selectAll: vi.fn(),
    selection: [],
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
    ...overrides,
  }
}

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> } {
  return {
    altKey: false,
    code: 'KeyV',
    ctrlKey: false,
    key: 'v',
    metaKey: false,
    preventDefault: vi.fn(),
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> }
}
