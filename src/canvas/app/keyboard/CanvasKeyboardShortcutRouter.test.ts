import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine'
import {
  handleCanvasKeyboardShortcut,
  type CanvasKeyboardShortcutHandlers,
} from './CanvasKeyboardShortcutRouter'

describe('CanvasKeyboardShortcutRouter', () => {
  it('routes custom creation tool shortcuts through the external tool seam', () => {
    const setTool = vi.fn()
    const handlers = createHandlers({ setTool })
    const event = createKeyboardEvent({ key: 'K', shiftKey: true })

    handleCanvasKeyboardShortcut(event, handlers)

    expect(setTool).toHaveBeenCalledWith('custom:risk')
  })

  it('keeps shift-insensitive built-in tool shortcuts ahead of custom tools', () => {
    const setTool = vi.fn()
    const handlers = createHandlers({
      customCreationTools: [
        {
          ariaLabel: 'Risk tool',
          id: 'custom:risk',
          label: '!',
          shortcut: { key: 'v', shiftKey: true },
          statusLabel: 'Risk',
          title: 'Risk',
        },
      ],
      setTool,
    })
    const event = createKeyboardEvent({ key: 'V', shiftKey: true })

    handleCanvasKeyboardShortcut(event, handlers)

    expect(setTool).toHaveBeenCalledWith('select')
  })

  it('keeps temporary pan ahead of custom space shortcuts', () => {
    const setSpaceDown = vi.fn()
    const setTool = vi.fn()
    const handlers = createHandlers({
      customCreationTools: [
        {
          ariaLabel: 'Risk tool',
          id: 'custom:risk',
          label: '!',
          shortcut: { key: 'Space' },
          statusLabel: 'Risk',
          title: 'Risk',
        },
      ],
      setSpaceDown,
      setTool,
    })
    const event = createKeyboardEvent({ code: 'Space', key: ' ' })

    handleCanvasKeyboardShortcut(event, handlers)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(setSpaceDown).toHaveBeenCalledWith(true)
    expect(setTool).not.toHaveBeenCalled()
  })

  it('keeps shifted nudge ahead of custom arrow shortcuts', () => {
    const moveSelection = vi.fn()
    const setTool = vi.fn()
    const handlers = createHandlers({
      customCreationTools: [
        {
          ariaLabel: 'Risk tool',
          id: 'custom:risk',
          label: '!',
          shortcut: { key: 'ArrowLeft', shiftKey: true },
          statusLabel: 'Risk',
          title: 'Risk',
        },
      ],
      moveSelection,
      setTool,
    })
    const event = createKeyboardEvent({ key: 'ArrowLeft', shiftKey: true })

    handleCanvasKeyboardShortcut(event, handlers)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(moveSelection).toHaveBeenCalledWith(-10, 0)
    expect(setTool).not.toHaveBeenCalled()
  })
})

function createHandlers(
  overrides: Partial<CanvasKeyboardShortcutHandlers> = {},
): CanvasKeyboardShortcutHandlers {
  return {
    commitSelection: vi.fn(),
    config: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    copySelection: vi.fn(),
    customCreationTools: [
      {
        ariaLabel: 'Risk tool',
        id: 'custom:risk',
        label: '!',
        shortcut: { key: 'k', shiftKey: true },
        statusLabel: 'Risk',
        title: 'Risk',
      },
    ],
    cutSelection: vi.fn(),
    deleteSelection: vi.fn(),
    duplicateSelection: vi.fn(),
    fitToItems: vi.fn(),
    groupSelection: vi.fn(),
    interactionRef: { current: { kind: 'none' } },
    lockSelection: vi.fn(),
    moveSelection: vi.fn(),
    openFindReplace: vi.fn(),
    pasteSelection: vi.fn(),
    quickCreateSticky: vi.fn(),
    redoHistory: vi.fn(),
    reorderSelection: vi.fn(),
    resetViewport: vi.fn(),
    selectAll: vi.fn(),
    selection: ['item-1'],
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
    code: 'KeyK',
    ctrlKey: false,
    key: 'k',
    metaKey: false,
    preventDefault: vi.fn(),
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> }
}
