import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../engine'
import type {
  CanvasItem,
  EditingText,
} from '../../entities'
import {
  executeCanvasStandardCommand,
  type CanvasEditingUpdate,
} from './CanvasStandardCommandExecution'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2', { x: 120 })

describe('CanvasStandardCommandExecution', () => {
  it('commits align command results as changed items', () => {
    const alignedItems = [
      createRectItem('rect-1', { x: 0 }),
      createRectItem('rect-2', { x: 0 }),
    ]
    const context = createContext({
      commandAdapter: createCommandAdapter({
        alignSelection: vi.fn(() => alignedItems),
      }),
    })

    const executed = executeCanvasStandardCommand({
      command: { kind: 'align', mode: 'alignLeft' },
      context,
    })

    expect(executed).toBe(true)
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'replace-changed', items: alignedItems },
      {
        after: ['rect-1', 'rect-2'],
        before: ['rect-1', 'rect-2'],
      },
    )
  })

  it('falls back to selection commit and clears matching editing on delete', () => {
    let editing: EditingText | null = { id: 'rect-1', value: 'Label' }
    const context = createContext({
      commitItemsChange: vi.fn(() => false),
      setEditing: vi.fn((update: CanvasEditingUpdate) => {
        editing = typeof update === 'function' ? update(editing) : update
      }),
    })

    const executed = executeCanvasStandardCommand({
      command: { kind: 'delete' },
      context,
    })

    expect(executed).toBe(true)
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

  it('uses the same generated group id for engine result and document change', () => {
    const groupedItems: CanvasItem[] = [
      {
        children: [rect1, rect2],
        h: 60,
        id: 'group-1',
        type: 'group',
        w: 200,
        x: 0,
        y: 0,
      },
    ]
    const groupSelection = vi.fn(() => ({
      items: groupedItems,
      selection: ['group-1'],
    }))
    const context = createContext({
      commandAdapter: createCommandAdapter({ groupSelection }),
      createId: vi.fn(() => 'group-1'),
    })

    const executed = executeCanvasStandardCommand({
      command: { kind: 'group' },
      context,
    })

    expect(executed).toBe(true)
    expect(groupSelection).toHaveBeenCalledWith({
      groupId: 'group-1',
      items: [rect1, rect2],
      selection: ['rect-1', 'rect-2'],
    })
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      {
        groupId: 'group-1',
        selection: ['rect-1', 'rect-2'],
        type: 'group-selection',
      },
      {
        after: ['group-1'],
        before: ['rect-1', 'rect-2'],
      },
    )
  })

  it('restores history selection and clears editing for undo', () => {
    const context = createContext({
      undo: vi.fn(() => ['rect-2']),
    })

    const executed = executeCanvasStandardCommand({
      command: { kind: 'undo' },
      context,
    })

    expect(executed).toBe(true)
    expect(context.setEditing).toHaveBeenCalledWith(null)
    expect(context.setSelection).toHaveBeenCalledWith(['rect-2'])
  })

  it('does not execute disabled commands', () => {
    const context = createContext({
      config: createCanvasAffordanceConfig({
        commands: { delete: false },
      }),
    })

    const executed = executeCanvasStandardCommand({
      command: { kind: 'delete' },
      context,
    })

    expect(executed).toBe(false)
    expect(context.commitItemsChange).not.toHaveBeenCalled()
    expect(context.commitSelection).not.toHaveBeenCalled()
  })
})

function createContext(
  overrides: Partial<Parameters<typeof executeCanvasStandardCommand>[0]['context']> = {},
): Parameters<typeof executeCanvasStandardCommand>[0]['context'] {
  return {
    commandAdapter: createCommandAdapter(),
    commitItemsChange: vi.fn(() => true),
    commitSelection: vi.fn(() => true),
    config: createCanvasAffordanceConfig(),
    createId: vi.fn((prefix: string) => `${prefix}-1`),
    items: [rect1, rect2],
    redo: vi.fn(() => undefined),
    selection: ['rect-1', 'rect-2'],
    setEditing: vi.fn(),
    setSelection: vi.fn(),
    undo: vi.fn(() => undefined),
    ...overrides,
  }
}

function createCommandAdapter(
  overrides: Partial<CanvasCommandAdapter<CanvasItem>> = {},
): CanvasCommandAdapter<CanvasItem> {
  return {
    alignSelection: ({ items }) => items,
    cloneSelection: () => [],
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
    pasteItems: () => [],
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
