import { describe, expect, it } from 'vitest'
import {
  CanvasCore,
  CanvasEngine,
  CanvasHost,
  CanvasRenderer,
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
  type CanvasAppComponentRendererStrategy,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppItemLayerAdapter,
  type CanvasAppPointerInput,
  type CanvasAppStageAdapter,
  type CanvasAppStageMount,
  type CanvasCustomItem,
  type CanvasItem,
} from 'canvas'
import {
  CanvasApp,
  createCanvasAppComponentPresentationRenderers,
  createCanvasAppAssembly as createCanvasAppAssemblyFromApp,
  createCanvasAppCustomItemRenderers,
} from 'canvas/app'
import { isCanvasCustomToolId, normalizeBounds } from 'canvas/core'
import { createCanvasAffordanceConfig } from 'canvas/engine'
import type { CanvasItem as CanvasEntityItem } from 'canvas/entities'
import { createCanvasComponentLibrary } from 'canvas/host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  CanvasSvgStage,
  createCanvasSvgPathData,
} from 'canvas/renderer'

describe('Canvas package consumer imports', () => {
  it('supports assembling a canvas app from package exports', () => {
    const rect: CanvasItem = {
      fill: '#fff',
      h: 80,
      id: 'rect-1',
      stroke: '#111',
      type: 'rect',
      w: 120,
      x: 10,
      y: 20,
    }
    const customItem: CanvasCustomItem = {
      data: { severity: 'high' },
      h: 80,
      id: 'smoke-1',
      kind: 'smoke',
      presentation: 'smoke-node',
      title: 'Smoke',
      type: 'custom',
      w: 120,
      x: 10,
      y: 20,
    }
    const module: CanvasAppCustomItemModule =
      defineCanvasAppCustomItemModule({
        id: 'smoke',
        presentation: 'smoke-node',
        renderItem: ({ item }) => item.title,
        validateItem: (item) => item.data.severity === 'high',
      })
    const renderComponent: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title
    const renderCustomItem: CanvasAppCustomItemRendererStrategy = ({ item }) =>
      item.title
    const itemLayerAdapter: CanvasAppItemLayerAdapter = {
      renderItems: ({ items }) => items.length,
    }
    const stageAdapter: CanvasAppStageAdapter = {
      renderStage: () => 'stage',
    }
    const stageMount: CanvasAppStageMount = {
      ref: () => undefined,
    }
    const pointerInput: CanvasAppPointerInput = {
      altKey: false,
      button: 0,
      clientX: 10,
      clientY: 20,
      ctrlKey: false,
      metaKey: false,
      pointerId: 1,
      preventDefault: () => undefined,
      shiftKey: false,
      stopPropagation: () => undefined,
    }

    const assembly = createCanvasAppAssembly({
      customItemModules: [module],
      initialItems: [rect],
      itemLayerAdapter,
      stageAdapter,
    })

    expect(assembly.initialItems).toEqual([rect])
    const entityItem: CanvasEntityItem = rect

    expect(entityItem.id).toBe('rect-1')
    expect(assembly.itemLayerAdapter.renderItems({
      componentPresentationRenderers: {},
      customItemRenderers: {},
      getComponentPresentation: () => 'note-card',
      items: assembly.initialItems,
      onItemPointerDown: () => undefined,
      onTextDoubleClick: () => undefined,
      outlineIds: new Set(),
      selected: new Set(),
    })).toBe(1)
    expect(assembly.stageAdapter.renderStage).toBe(stageAdapter.renderStage)
    expect(stageMount.ref).toBeTypeOf('function')
    expect(pointerInput.pointerId).toBe(1)
    expect(createCanvasAppComponentPresentationRenderers({
      'smoke-card': renderComponent,
    })['smoke-card']).toBe(renderComponent)
    expect(createCanvasAppCustomItemRenderers({
      'smoke-node': renderCustomItem,
    })['smoke-node']).toBe(renderCustomItem)
    expect(assembly.customItemValidators.smoke(customItem)).toBe(true)
    expect(createCanvasAppAssemblyFromApp().initialItems.length).toBeGreaterThan(
      0,
    )
  })

  it('keeps package subpaths usable as public facades', () => {
    expect(CanvasApp).toBeTypeOf('function')
    expect(CanvasSvgStage).toBe(CanvasRenderer.CanvasSvgStage)
    expect(normalizeBounds({ x: 10, y: 20 }, { x: 2, y: 4 })).toEqual({
      h: 16,
      w: 8,
      x: 2,
      y: 4,
    })
    expect(CanvasCore.normalizeBounds({ x: 10, y: 20 }, { x: 2, y: 4 }))
      .toEqual(normalizeBounds({ x: 10, y: 20 }, { x: 2, y: 4 }))
    expect(createCanvasAffordanceConfig().tools.select).toBe(true)
    expect(CanvasEngine.createCanvasAffordanceConfig().tools.select).toBe(true)
    expect(
      createCanvasAppComponentPresentationRenderers(),
    ).toBeTypeOf('object')
    expect(isCanvasCustomToolId('custom:smoke')).toBe(true)
    expect(CanvasCore.isCanvasCustomToolId('custom:smoke')).toBe(true)
    expect(createCanvasComponentLibrary({
      templates: CanvasHost.DEFAULT_CANVAS_COMPONENT_TEMPLATES,
    }).templates.length).toBe(CanvasHost.DEFAULT_CANVAS_COMPONENT_TEMPLATES.length)
    expect(CANVAS_SVG_ARROW_MARKER_IRI).toBe('url(#canvas-arrow-head)')
    expect(createCanvasSvgPathData([{ x: 1, y: 2 }, { x: 3, y: 4 }]))
      .toBe('M 1 2 L 3 4')
    expect(CanvasRenderer.CANVAS_SVG_ARROW_MARKER_IRI)
      .toBe(CANVAS_SVG_ARROW_MARKER_IRI)
  })
})
