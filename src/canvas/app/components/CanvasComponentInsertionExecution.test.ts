import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasComponentItem,
  CanvasItem,
} from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import {
  getCanvasStickyQuickCreateControlPoint,
  insertCanvasComponent,
  quickCreateCanvasSticky,
} from './CanvasComponentInsertionExecution'

describe('CanvasComponentInsertionExecution', () => {
  it('creates the component at the stage viewport center and selects it', () => {
    const componentLibrary = createComponentLibrary()
    const commitItemsChange = vi.fn()
    const setEditing = vi.fn()
    const setTool = vi.fn()

    insertCanvasComponent({
      commitItemsChange,
      component: 'sticky',
      componentLibrary,
      createId: vi.fn(() => 'component-1'),
      selection: ['previous'],
      setEditing,
      setTool,
      stageElement: createStageElement({ x: 40, y: 50 }),
      viewport: { scale: 2, x: 10, y: 20 },
    })

    expect(componentLibrary.createItem).toHaveBeenCalledWith({
      id: 'component-1',
      point: { x: 40, y: 50 },
      templateId: 'sticky',
    })
    expect(commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [createComponentItem()] },
      { before: ['previous'], after: ['component-1'] },
    )
    expect(setEditing).toHaveBeenCalledWith(null)
    expect(setTool).toHaveBeenCalledWith('select')
  })

  it('uses the stable fallback point when the stage is not mounted', () => {
    const componentLibrary = createComponentLibrary()

    insertCanvasComponent({
      commitItemsChange: vi.fn(),
      component: 'card',
      componentLibrary,
      createId: vi.fn(() => 'component-1'),
      selection: [],
      setEditing: vi.fn(),
      setTool: vi.fn(),
      stageElement: createStageElement(null),
      viewport: { scale: 1, x: 0, y: 0 },
    })

    expect(componentLibrary.createItem).toHaveBeenCalledWith({
      id: 'component-1',
      point: { x: 120, y: 120 },
      templateId: 'card',
    })
  })

  it('quick-creates a blank sticky next to the selected sticky', () => {
    const source = createComponentItem({
      id: 'component-source',
      w: 188,
      x: 40,
      y: 60,
    })
    const next = createComponentItem({
      body: 'Template body',
      id: 'component-next',
      x: 252,
      y: 60,
    })
    const componentLibrary = createComponentLibrary(next)
    const commitItemsChange = vi.fn(() => true)
    const setEditing = vi.fn()
    const setTool = vi.fn()

    const result = quickCreateCanvasSticky({
      commitItemsChange,
      componentLibrary,
      createId: vi.fn(() => 'component-next'),
      itemReadModel: createItemReadModel([
        source,
        createComponentItem({
          component: 'card',
          id: 'component-card',
        }),
      ]),
      selection: ['component-source', 'component-card'],
      setEditing,
      setTool,
    })

    expect(result).toBe(true)
    expect(componentLibrary.createItem).toHaveBeenCalledWith({
      id: 'component-next',
      point: { x: 252, y: 60 },
      templateId: 'sticky',
    })
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [{
          ...next,
          body: '',
        }],
      },
      {
        before: ['component-source', 'component-card'],
        after: ['component-next'],
      },
    )
    expect(setEditing).toHaveBeenCalledWith({
      id: 'component-next',
      value: '',
    })
    expect(setTool).toHaveBeenCalledWith('select')
  })

  it('ignores quick-create when selection is not one sticky', () => {
    const componentLibrary = createComponentLibrary()
    const commitItemsChange = vi.fn()

    expect(quickCreateCanvasSticky({
      commitItemsChange,
      componentLibrary,
      createId: vi.fn(() => 'component-next'),
      itemReadModel: createItemReadModel([createComponentItem({
        component: 'card',
      })]),
      selection: ['component-card'],
      setEditing: vi.fn(),
      setTool: vi.fn(),
    })).toBe(false)

    expect(componentLibrary.createItem).not.toHaveBeenCalled()
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('positions the sticky quick-create control next to one selected sticky', () => {
    const sticky = createComponentItem({
      h: 148,
      id: 'component-sticky',
      w: 188,
      x: 40,
      y: 60,
    })
    const itemReadModel = createItemReadModel([sticky])

    expect(getCanvasStickyQuickCreateControlPoint({
      itemReadModel,
      selection: ['component-sticky'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 490, y: 288 })

    expect(getCanvasStickyQuickCreateControlPoint({
      itemReadModel: createItemReadModel([createComponentItem({
        component: 'card',
        id: 'component-card',
      })]),
      selection: ['component-card'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toBeNull()
  })
})

function createComponentLibrary(
  item: CanvasComponentItem = createComponentItem(),
): CanvasAppComponentLibrary {
  return {
    createItem: vi.fn(() => item),
    getPresentation: vi.fn(() => 'note-card'),
    getTemplate: vi.fn(),
    templates: [],
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

function createItemReadModel(items: CanvasItem[]): CanvasAppItemReadModel {
  return {
    findEditableTextItem: vi.fn(() => null),
    findItem: vi.fn((id: string) => items.find((item) => item.id === id)),
    getAllIds: vi.fn(() => items.map((item) => item.id)),
    getAllItems: vi.fn(() => items),
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
    getSelection: vi.fn((ids: string[]) => ids),
    getSelectionBounds: vi.fn(() => null),
  }
}

function createStageElement(
  viewportCenter: ReturnType<CanvasAppStageElement['getViewportCenter']>,
): CanvasAppStageElement {
  return {
    addWheelListener: vi.fn(() => () => undefined),
    capturePointer: vi.fn(),
    getRect: vi.fn(() => null),
    getScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
    getViewportCenter: vi.fn(() => viewportCenter),
    releasePointer: vi.fn(),
  }
}
