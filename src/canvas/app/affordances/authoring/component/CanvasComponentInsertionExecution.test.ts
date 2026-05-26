import { describe, expect, it, vi } from 'vitest'
import type { CanvasComponentItem } from '../../../../entities'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppComponentLibrary } from '../../../workflow/CanvasAppComponentAssemblyContracts'
import { insertCanvasComponent } from './CanvasComponentInsertionExecution'

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

})

function createComponentLibrary(
  item: CanvasComponentItem = createComponentItem(),
): CanvasAppComponentLibrary {
  return {
    createItem: vi.fn(() => item),
    getPresentation: vi.fn(() => 'note-card'),
    getTemplate: vi.fn(() => ({
      accent: item.accent,
      fill: item.fill,
      h: item.h,
      id: item.component,
      label: 'N',
      presentation: 'note-card',
      stroke: item.stroke,
      title: item.title,
      w: item.w,
    })),
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
