import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../../engine'
import type { CanvasItem } from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import {
  createCanvasClipboardCommandEffectPlan,
  type CanvasClipboardCommandEffectPlanContext,
} from './CanvasClipboardCommandEffectPlan'
import type {
  CanvasClipboardCommandEffect,
} from './CanvasClipboardCommandEffectContracts'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2', { x: 120 })

describe('CanvasClipboardCommandEffectPlan', () => {
  it('maps duplicate results to transform item effects', () => {
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
      afterItems: [rect1, rect2, clone],
      afterSelection: ['rect-copy'],
      beforeItems: [rect1, rect2],
      clonedItems: [clone],
      kind: 'transform-items',
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

  it('preserves host item types in planned effects', () => {
    const hostItem = createHostClipboardItem('slide-node-1')
    const hostClone = createHostClipboardItem('slide-node-copy', {
      x: 28,
      y: 28,
    })
    const context: CanvasClipboardCommandEffectPlanContext<HostClipboardItem> =
      createHostContext({
        commandAdapter: createHostCommandAdapter({
          cloneSelection: vi.fn(() => [hostClone]),
        }),
        items: [hostItem],
        selection: [hostItem.id],
      })
    const effect: CanvasClipboardCommandEffect<HostClipboardItem> | null =
      createCanvasClipboardCommandEffectPlan({
        command: { kind: 'duplicate' },
        context,
      })

    if (effect?.kind !== 'transform-items') {
      throw new Error('Expected host transform-items effect')
    }

    const clonedHostItem: HostClipboardItem = effect.clonedItems[0]!

    expect(clonedHostItem.slideId).toBe('slide-1')
    expect(effect.afterItems).toEqual([hostItem, hostClone])
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

type HostClipboardItem = {
  id: string
  kind: 'ppt-shape'
  slideId: string
  x: number
  y: number
}

function createHostContext(
  overrides: Partial<CanvasClipboardCommandEffectPlanContext<HostClipboardItem>> = {},
): CanvasClipboardCommandEffectPlanContext<HostClipboardItem> {
  return {
    commandAdapter: createHostCommandAdapter(),
    config: createCanvasAffordanceConfig(),
    createId: vi.fn((prefix: string) => `${prefix}-1`),
    getClipboardItems: vi.fn(() => []),
    items: [createHostClipboardItem('slide-node-1')],
    selection: ['slide-node-1'],
    stageElement: createStageElement(),
    viewport: { scale: 1, x: 0, y: 0 },
    ...overrides,
  }
}

function createHostCommandAdapter(
  overrides: Partial<CanvasCommandAdapter<HostClipboardItem>> = {},
): CanvasCommandAdapter<HostClipboardItem> {
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
    groupSelection: ({ items, selection }) => ({ items, selection }),
    lockSelection: ({ items, selection }) => ({ items, selection }),
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
    ungroupSelection: ({ items, selection }) => ({ items, selection }),
    unlockAll: ({ items, selection }) => ({ items, selection }),
    ...overrides,
  }
}

function createHostClipboardItem(
  id: string,
  overrides: Partial<HostClipboardItem> = {},
): HostClipboardItem {
  return {
    id,
    kind: 'ppt-shape',
    slideId: 'slide-1',
    x: 0,
    y: 0,
    ...overrides,
  }
}
