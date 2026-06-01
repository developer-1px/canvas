import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../../engine'
import type {
  CanvasItem,
  EditingText,
} from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type {
  CanvasClipboardEditingUpdate,
} from './CanvasClipboardCommandEffectContracts'
import { executeCanvasClipboardCommand } from './CanvasClipboardCommandExecution'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2', { x: 120 })

describe('CanvasClipboardCommandExecution', () => {
  it('duplicates selection through transform commits and returns clones', () => {
    const clone = createRectItem('rect-copy', { x: 28, y: 28 })
    const context = createContext({
      commandAdapter: createCommandAdapter({
        cloneSelection: vi.fn(() => [clone]),
      }),
    })

    const result = executeCanvasClipboardCommand({
      command: { kind: 'duplicate' },
      context,
    })

    expect(result).toEqual({
      clonedItems: [clone],
      executed: true,
    })
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      {
        afterItems: [rect1, rect2, clone],
        beforeItems: [rect1, rect2],
        type: 'transform',
      },
      {
        after: ['rect-copy'],
        before: ['rect-1', 'rect-2'],
      },
    )
  })

  it('resets paste index after a successful copy', () => {
    const copyItemsToClipboard = vi.fn(() => true)
    const context = createContext({ copyItemsToClipboard })

    const result = executeCanvasClipboardCommand({
      command: { kind: 'copy', pasteIndex: 3 },
      context,
    })

    expect(result).toEqual({
      clonedItems: [],
      executed: true,
      nextPasteIndex: 0,
    })
    expect(copyItemsToClipboard).toHaveBeenCalledWith(['rect-1', 'rect-2'])
  })

  it('pastes clipboard items at the first viewport-centered offset', () => {
    const pasted = createRectItem('rect-pasted', { x: 150, y: 100 })
    const pasteItems = vi.fn(() => [pasted])
    const context = createContext({
      commandAdapter: createCommandAdapter({ pasteItems }),
      getClipboardItems: vi.fn(() => [createRectItem('rect-copied')]),
      stageElement: createStageElement({ x: 200, y: 150 }),
    })

    const result = executeCanvasClipboardCommand({
      command: { kind: 'paste', pasteIndex: 0 },
      context,
    })

    expect(result).toEqual({
      clonedItems: [pasted],
      executed: true,
      nextPasteIndex: 1,
    })
    expect(pasteItems).toHaveBeenCalledWith({
      clipboard: [createRectItem('rect-copied')],
      createId: context.createId,
      offset: { x: 160, y: 120 },
    })
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [pasted] },
      {
        after: ['rect-pasted'],
        before: ['rect-1', 'rect-2'],
      },
    )
    expect(context.setClipboardItems).toHaveBeenCalledWith([pasted])
  })

  it('cuts by copying, deleting, falling back selection, and clearing editing', () => {
    let editing: EditingText | null = { id: 'rect-1', value: 'Label' }
    const context = createContext({
      commitItemsChange: vi.fn(() => false),
      copyItemsToClipboard: vi.fn(() => true),
      setEditing: vi.fn((update: CanvasClipboardEditingUpdate) => {
        editing = typeof update === 'function' ? update(editing) : update
      }),
    })

    const result = executeCanvasClipboardCommand({
      command: { kind: 'cut', pasteIndex: 2 },
      context,
    })

    expect(result).toEqual({
      clonedItems: [],
      executed: true,
      nextPasteIndex: 0,
    })
    expect(context.copyItemsToClipboard).toHaveBeenCalledWith([
      'rect-1',
      'rect-2',
    ])
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'remove-selection', selection: ['rect-1', 'rect-2'] },
      {
        after: [],
        before: ['rect-1', 'rect-2'],
      },
    )
    expect(context.commitSelection).toHaveBeenCalledWith([])
    expect(editing).toBeNull()
  })
})

function createContext(
  overrides: Partial<Parameters<typeof executeCanvasClipboardCommand>[0]['context']> = {},
): Parameters<typeof executeCanvasClipboardCommand>[0]['context'] {
  return {
    commandAdapter: createCommandAdapter(),
    commitItemsChange: vi.fn(() => true),
    commitSelection: vi.fn(() => true),
    config: createCanvasAffordanceConfig(),
    copyItemsToClipboard: vi.fn(() => true),
    createId: vi.fn((prefix: string) => `${prefix}-1`),
    getClipboardItems: vi.fn(() => []),
    items: [rect1, rect2],
    selection: ['rect-1', 'rect-2'],
    setClipboardItems: vi.fn(),
    setEditing: vi.fn(),
    stageElement: createStageElement(),
    viewport: { scale: 1, x: 0, y: 0 },
    ...overrides,
  }
}

function createCommandAdapter(
  overrides: Partial<CanvasCommandAdapter<CanvasItem>> = {},
): CanvasCommandAdapter<CanvasItem> {
  return {
    alignSelection: ({ items }) => items,
    cloneSelection: ({ ids, items, offset }) =>
      items
        .filter((item) => ids.includes(item.id))
        .map((item) => ({
          ...item,
          id: `${item.id}-copy`,
          x: item.x + offset.x,
          y: item.y + offset.y,
        })),
    deleteSelection: ({ items, selection }) =>
      items.filter((item) => !selection.includes(item.id)),
    distributeSelection: ({ items }) => items,
    groupSelection: ({ groupId, items }) => ({
      items: [
        {
          children: items,
          h: 60,
          id: groupId,
          type: 'group',
          w: 200,
          x: 0,
          y: 0,
        },
      ],
      selection: [groupId],
    }),
    lockSelection: ({ items, selection }) => ({
      items: items.map((item) =>
        selection.includes(item.id) ? { ...item, locked: true } : item,
      ),
      selection,
    }),
    nudgeSelection: ({ dx, dy, items, selection }) =>
      items.map((item) =>
        selection.includes(item.id)
          ? { ...item, x: item.x + dx, y: item.y + dy }
          : item,
      ),
    pasteItems: ({ clipboard, createId, offset }) =>
      clipboard.map((item) => ({
        ...item,
        id: createId(item.id),
        x: item.x + offset.x,
        y: item.y + offset.y,
      })),
    reorderSelection: ({ items }) => items,
    selectAll: ({ items }) => items.map((item) => item.id),
    ungroupSelection: ({ items }) => ({
      items,
      selection: items.map((item) => item.id),
    }),
    unlockAll: ({ items, selection }) => ({
      items: items.map((item) => ({ ...item, locked: false })),
      selection,
    }),
    ...overrides,
  }
}

function createStageElement(
  viewportCenter: { x: number; y: number } | null = { x: 0, y: 0 },
): CanvasAppStageElement {
  return {
    addWheelListener: () => () => undefined,
    capturePointer: () => undefined,
    getRect: () => null,
    getScreenPoint: () => ({ x: 0, y: 0 }),
    getViewportCenter: () => viewportCenter,
    releasePointer: () => undefined,
  }
}

function createRectItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 60,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
    ...overrides,
  }
}
