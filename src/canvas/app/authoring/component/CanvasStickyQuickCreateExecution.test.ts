import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasComponentItem,
  CanvasItem,
} from '../../../entities'
import type { CanvasCreationAdapter } from '../../../engine'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import {
  getCanvasStickyQuickCreateControlPoints,
  quickCreateCanvasSticky,
} from './CanvasStickyQuickCreateExecution'

describe('CanvasStickyQuickCreateExecution', () => {
  it('quick-creates a blank sticky next to the selected sticky', () => {
    const source = createComponentItem({
      h: 148,
      id: 'component-source',
      w: 188,
      x: 40,
      y: 60,
    })
    const next = createComponentItem({
      body: 'Template body',
      h: 148,
      id: 'component-next',
      w: 188,
      x: 252,
      y: 60,
    })
    const connector = createArrowItem()
    const componentLibrary = createComponentLibrary(next)
    const commitItemsChange = vi.fn(() => true)
    const creationAdapter = createCreationAdapter(connector)
    const setEditing = vi.fn()
    const setTool = vi.fn()

    const result = quickCreateCanvasSticky({
      commitItemsChange,
      componentLibrary,
      creationAdapter,
      createId: vi.fn((prefix) =>
        prefix === 'arrow' ? 'arrow-next' : 'component-next',
      ),
      itemReadModel: createItemReadModel([
        source,
        createComponentItem({
          component: 'card',
          id: 'component-card',
        }),
      ]),
      selection: ['component-source'],
      setEditing,
      setTool,
    })

    expect(result).toBe(true)
    expect(creationAdapter.createArrow).toHaveBeenCalledWith({
      end: { x: 252, y: 134 },
      endAttachedTo: 'component-next',
      id: 'arrow-next',
      routing: 'elbow',
      start: { x: 228, y: 134 },
      startAttachedTo: 'component-source',
    })
    expect(componentLibrary.createItem).toHaveBeenCalledWith({
      id: 'component-next',
      point: { x: 252, y: 60 },
      templateId: 'sticky',
    })
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          connector,
          {
            ...next,
            body: '',
          },
        ],
      },
      {
        before: ['component-source'],
        after: ['component-next'],
      },
    )
    expect(setEditing).toHaveBeenCalledWith({
      id: 'component-next',
      value: '',
    })
    expect(setTool).toHaveBeenCalledWith('select')
  })

  it.each([
    {
      direction: 'left' as const,
      point: { x: -172, y: 60 },
      connectorEnd: { x: 16, y: 134 },
      connectorStart: { x: 40, y: 134 },
    },
    {
      direction: 'top' as const,
      point: { x: 40, y: -112 },
      connectorEnd: { x: 134, y: 36 },
      connectorStart: { x: 134, y: 60 },
    },
    {
      direction: 'bottom' as const,
      point: { x: 40, y: 232 },
      connectorEnd: { x: 134, y: 232 },
      connectorStart: { x: 134, y: 208 },
    },
  ])('quick-creates a connected sticky to the $direction', ({
    connectorEnd,
    connectorStart,
    direction,
    point,
  }) => {
    const source = createComponentItem({
      h: 148,
      id: 'component-source',
      w: 188,
      x: 40,
      y: 60,
    })
    const next = createComponentItem({
      h: 148,
      id: 'component-next',
      w: 188,
      ...point,
    })
    const componentLibrary = createComponentLibrary(next)
    const creationAdapter = createCreationAdapter()

    expect(quickCreateCanvasSticky({
      commitItemsChange: vi.fn(() => true),
      componentLibrary,
      creationAdapter,
      createId: vi.fn((prefix) =>
        prefix === 'arrow' ? 'arrow-next' : 'component-next',
      ),
      direction,
      itemReadModel: createItemReadModel([source]),
      selection: ['component-source'],
      setEditing: vi.fn(),
      setTool: vi.fn(),
    })).toBe(true)

    expect(componentLibrary.createItem).toHaveBeenCalledWith({
      id: 'component-next',
      point,
      templateId: 'sticky',
    })
    expect(creationAdapter.createArrow).toHaveBeenCalledWith({
      end: connectorEnd,
      endAttachedTo: 'component-next',
      id: 'arrow-next',
      routing: 'elbow',
      start: connectorStart,
      startAttachedTo: 'component-source',
    })
  })

  it('ignores quick-create when selection is not one sticky', () => {
    const componentLibrary = createComponentLibrary()
    const commitItemsChange = vi.fn()

    expect(quickCreateCanvasSticky({
      commitItemsChange,
      componentLibrary,
      creationAdapter: createCreationAdapter(),
      createId: vi.fn((prefix) => `${prefix}-next`),
      itemReadModel: createItemReadModel([createComponentItem({
        component: 'card',
      })]),
      selection: ['component-card'],
      setEditing: vi.fn(),
      setTool: vi.fn(),
    })).toBe(false)

    expect(quickCreateCanvasSticky({
      commitItemsChange,
      componentLibrary,
      creationAdapter: createCreationAdapter(),
      createId: vi.fn((prefix) => `${prefix}-next`),
      itemReadModel: createItemReadModel([
        createComponentItem({ id: 'component-sticky' }),
        createComponentItem({
          component: 'card',
          id: 'component-card',
        }),
      ]),
      selection: ['component-sticky', 'component-card'],
      setEditing: vi.fn(),
      setTool: vi.fn(),
    })).toBe(false)

    expect(componentLibrary.createItem).not.toHaveBeenCalled()
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('positions the sticky quick-create controls around one selected sticky', () => {
    const sticky = createComponentItem({
      h: 148,
      id: 'component-sticky',
      w: 188,
      x: 40,
      y: 60,
    })
    const itemReadModel = createItemReadModel([sticky])

    expect(getCanvasStickyQuickCreateControlPoints({
      itemReadModel,
      selection: ['component-sticky'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual([
      { direction: 'right', x: 490, y: 288 },
      { direction: 'bottom', x: 278, y: 460 },
      { direction: 'left', x: 66, y: 288 },
      { direction: 'top', x: 278, y: 116 },
    ])

    expect(getCanvasStickyQuickCreateControlPoints({
      itemReadModel: createItemReadModel([createComponentItem({
        component: 'card',
        id: 'component-card',
      })]),
      selection: ['component-card'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual([])
  })
})

function createComponentLibrary(
  item: CanvasComponentItem = createComponentItem(),
): CanvasAppComponentLibrary {
  return {
    createItem: vi.fn(() => item),
    getTemplate: vi.fn(() => ({
      h: item.h,
      id: item.component,
      w: item.w,
    })),
  } as unknown as CanvasAppComponentLibrary
}

function createComponentItem(
  overrides: Partial<CanvasComponentItem> = {},
): CanvasComponentItem {
  return {
    accent: '#111111',
    component: 'sticky',
    fill: '#ffffff',
    h: 80,
    id: 'component-1',
    stroke: '#222222',
    title: 'Sticky',
    type: 'component',
    w: 120,
    x: 40,
    y: 50,
    ...overrides,
  }
}

function createArrowItem(
  overrides: Partial<Extract<CanvasItem, { type: 'arrow' }>> = {},
): Extract<CanvasItem, { type: 'arrow' }> {
  return {
    end: { x: 252, y: 134 },
    endAttachedTo: 'component-next',
    h: 24,
    id: 'arrow-next',
    routing: 'elbow',
    start: { x: 228, y: 134 },
    startAttachedTo: 'component-source',
    stroke: '#334155',
    strokeWidth: 3,
    type: 'arrow',
    w: 48,
    x: 216,
    y: 122,
    ...overrides,
  }
}

function createCreationAdapter(
  arrow: CanvasItem = createArrowItem(),
): CanvasCreationAdapter<CanvasItem> {
  return {
    createArrow: vi.fn(() => arrow),
  } as unknown as CanvasCreationAdapter<CanvasItem>
}

function createItemReadModel(items: CanvasItem[]): CanvasAppItemReadModel {
  return {
    getItemBounds: vi.fn((item: CanvasItem) => ({
      h: item.h,
      w: item.w,
      x: item.x,
      y: item.y,
    })),
    getSelectedItems: vi.fn((ids: string[]) =>
      ids
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is CanvasItem => item !== undefined),
    ),
  } as unknown as CanvasAppItemReadModel
}
