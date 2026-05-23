import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  createCanvasClipboardCommandEffectPlan,
  type CanvasClipboardCommandEffectPlanContext,
} from './CanvasClipboardCommandEffectPlan'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2', { x: 120 })

describe('CanvasClipboardCommandEffectPlan', () => {
  it('maps duplicate results to add item effects', () => {
    const clone = createRectItem('rect-copy', { x: 28, y: 28 })
    const context = createContext({
      commandAdapter: createCommandAdapter({
        cloneSelection: vi.fn(() => [clone]),
      }),
    })

    expect(
      createCanvasClipboardCommandEffectPlan({
        command: { kind: 'duplicate' },
        context,
      }),
    ).toEqual({
      afterSelection: ['rect-copy'],
      items: [clone],
      kind: 'add-items',
    })
  })

  it('maps paste to viewport-centered add item effects', () => {
    const pasted = createRectItem('rect-pasted', { x: 150, y: 100 })
    const pasteItems = vi.fn(() => [pasted])
    const context = createContext({
      commandAdapter: createCommandAdapter({ pasteItems }),
      getClipboardItems: vi.fn(() => [createRectItem('rect-copied')]),
      stageElement: createStageElement({ x: 200, y: 150 }),
    })

    expect(
      createCanvasClipboardCommandEffectPlan({
        command: { kind: 'paste', pasteIndex: 0 },
        context,
      }),
    ).toEqual({
      afterSelection: ['rect-pasted'],
      items: [pasted],
      kind: 'add-items',
      nextPasteIndex: 1,
      updateClipboardItems: [pasted],
    })
    expect(pasteItems).toHaveBeenCalledWith({
      clipboard: [createRectItem('rect-copied')],
      createId: context.createId,
      offset: { x: 160, y: 120 },
    })
  })

  it('does not plan disabled clipboard commands', () => {
    const context = createContext({
      config: createCanvasAffordanceConfig({
        commands: { paste: false },
      }),
    })

    expect(
      createCanvasClipboardCommandEffectPlan({
        command: { kind: 'paste', pasteIndex: 0 },
        context,
      }),
    ).toBeNull()
  })
})

function createContext(
  overrides: Partial<CanvasClipboardCommandEffectPlanContext> = {},
): CanvasClipboardCommandEffectPlanContext {
  return {
    commandAdapter: createCommandAdapter(),
    config: createCanvasAffordanceConfig(),
    createId: vi.fn((prefix: string) => `${prefix}-1`),
    getClipboardItems: vi.fn(() => []),
    items: [rect1, rect2],
    selection: ['rect-1', 'rect-2'],
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
      items: [{
        children: items,
        h: 60,
        id: groupId,
        type: 'group',
        w: 200,
        x: 0,
        y: 0,
      }],
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
