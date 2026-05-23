import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import {
  createCanvasStandardCommandEffectPlan,
  type CanvasStandardCommandEffectPlanContext,
} from './CanvasStandardCommandEffectPlan'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2', { x: 120 })

describe('CanvasStandardCommandEffectPlan', () => {
  it('maps engine item results to document item change effects', () => {
    const alignedItems = [
      createRectItem('rect-1', { x: 0 }),
      createRectItem('rect-2', { x: 0 }),
    ]
    const context = createContext({
      commandAdapter: createCommandAdapter({
        alignSelection: vi.fn(() => alignedItems),
      }),
    })

    expect(
      createCanvasStandardCommandEffectPlan({
        command: { kind: 'align', mode: 'alignLeft' },
        context,
      }),
    ).toEqual({
      afterSelection: ['rect-1', 'rect-2'],
      change: { type: 'replace-changed', items: alignedItems },
      kind: 'items-change',
    })
  })

  it('uses one generated group id for engine grouping and document effect', () => {
    const groupSelection = vi.fn(() => ({
      items: [{
        children: [rect1, rect2],
        h: 60,
        id: 'group-1',
        type: 'group' as const,
        w: 200,
        x: 0,
        y: 0,
      }],
      selection: ['group-1'],
    }))
    const context = createContext({
      commandAdapter: createCommandAdapter({ groupSelection }),
      createId: vi.fn(() => 'group-1'),
    })

    expect(
      createCanvasStandardCommandEffectPlan({
        command: { kind: 'group' },
        context,
      }),
    ).toMatchObject({
      afterSelection: ['group-1'],
      change: {
        groupId: 'group-1',
        selection: ['rect-1', 'rect-2'],
        type: 'group-selection',
      },
      fallbackSelection: ['group-1'],
      kind: 'items-change',
    })
    expect(groupSelection).toHaveBeenCalledWith({
      groupId: 'group-1',
      items: [rect1, rect2],
      selection: ['rect-1', 'rect-2'],
    })
  })

  it('does not plan disabled commands', () => {
    const context = createContext({
      config: createCanvasAffordanceConfig({
        commands: { delete: false },
      }),
    })

    expect(
      createCanvasStandardCommandEffectPlan({
        command: { kind: 'delete' },
        context,
      }),
    ).toBeNull()
  })
})

function createContext(
  overrides: Partial<CanvasStandardCommandEffectPlanContext> = {},
): CanvasStandardCommandEffectPlanContext {
  return {
    commandAdapter: createCommandAdapter(),
    config: createCanvasAffordanceConfig(),
    createId: vi.fn((prefix: string) => `${prefix}-1`),
    items: [rect1, rect2],
    selection: ['rect-1', 'rect-2'],
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
