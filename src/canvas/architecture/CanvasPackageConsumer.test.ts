import { describe, expect, it } from 'vitest'
import {
  CanvasCore,
  CanvasEngine,
  CanvasEntities,
  CanvasHost,
  CanvasRenderer,
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomItemModule,
  type CanvasCustomItem,
  type CanvasItem,
} from 'canvas'
import {
  CanvasApp,
  createCanvasAppComponentPresentationRenderers,
  createCanvasAppAssembly as createCanvasAppAssemblyFromApp,
} from 'canvas/app'
import { normalizeBounds } from 'canvas/core'
import { createCanvasAffordanceConfig } from 'canvas/engine'
import { isCanvasCustomToolId } from 'canvas/entities'
import { createCanvasComponentLibrary } from 'canvas/host'
import { CanvasSvgStage } from 'canvas/renderer'

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

    const assembly = createCanvasAppAssembly({
      customItemModules: [module],
      initialItems: [rect],
    })

    expect(assembly.initialItems).toEqual([rect])
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
    expect(CanvasEntities.isCanvasCustomToolId('custom:smoke')).toBe(true)
    expect(createCanvasComponentLibrary({
      templates: CanvasHost.DEFAULT_CANVAS_COMPONENT_TEMPLATES,
    }).templates.length).toBe(CanvasHost.DEFAULT_CANVAS_COMPONENT_TEMPLATES.length)
  })
})
