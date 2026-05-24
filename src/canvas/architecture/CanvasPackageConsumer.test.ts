import { describe, expect, it } from 'vitest'
import * as CanvasPackage from 'canvas'
import * as CanvasAppAuthoring from 'canvas/app/authoring'
import * as CanvasAppFacade from 'canvas/app'
import {
  CanvasCore,
  CanvasEngine,
  CanvasHost,
  CanvasRenderer,
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
  type CanvasAppAssemblySource,
  type CanvasAppCommitItemsChange,
  type CanvasAppComponentLibrary,
  type CanvasAppComponentTemplate,
  type CanvasAppComponentRendererStrategy,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppCustomItemValidator,
  type CanvasAppItemLayerAdapter,
  type CanvasAppProps,
  type CanvasAppPointerInput,
  type CanvasAppStageAdapter,
  type CanvasAppStageMount,
  type CanvasAppItemsChange,
  type CanvasWorkspaceStorageProvider,
  type CanvasCustomItem,
  type CanvasEditableTextItem,
  type CanvasItem,
} from 'canvas'
import {
  CanvasApp,
  createCanvasAppComponentPresentationRenderers,
  createCanvasAppAssembly as createCanvasAppAssemblyFromApp,
  createCanvasAppCustomItemRenderers,
  type CanvasAppAssemblySource as CanvasAppAssemblySourceFromApp,
  type CanvasAppProps as CanvasAppPropsFromApp,
} from 'canvas/app'
import { isCanvasCustomToolId, normalizeBounds } from 'canvas/core'
import {
  assertCanvasAffordanceConfig as assertCanvasAffordanceConfigFromEngine,
  createCanvasAffordanceConfig,
} from 'canvas/engine'
import type { CanvasItem as CanvasEntityItem } from 'canvas/entities'
import { createCanvasComponentLibrary } from 'canvas/host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  CanvasSvgStage,
  createCanvasSvgFreehandPathData,
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
    const editableItem: CanvasEditableTextItem = rect
    const appItemsChange: CanvasAppItemsChange = {
      items: [rect],
      type: 'add',
    }
    const commitAppItemsChange: CanvasAppCommitItemsChange = () => true
    const validateCustomItem: CanvasAppCustomItemValidator = (item) =>
      item.data.severity === 'high'
    const module: CanvasAppCustomItemModule =
      defineCanvasAppCustomItemModule({
        id: 'smoke',
        presentation: 'smoke-node',
        renderItem: ({ item }) => item.title,
        validateItem: validateCustomItem,
      })
    const renderComponent: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title
    const componentTemplate: CanvasAppComponentTemplate = {
      accent: '#111111',
      fill: '#ffffff',
      h: 120,
      id: 'smoke-card',
      label: 'S',
      presentation: 'smoke-card',
      stroke: '#cccccc',
      title: 'Smoke card',
      w: 160,
    }
    const componentLibrary: CanvasAppComponentLibrary =
      createCanvasComponentLibrary({
        templates: [componentTemplate],
      })
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
    const workspaceStorageProvider: CanvasWorkspaceStorageProvider = () => null
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
      componentLibrary,
      componentPresentationRenderers: createCanvasAppComponentPresentationRenderers({
        'smoke-card': renderComponent,
      }),
      customItemModules: [module],
      initialItems: [rect],
      initialSelection: [rect.id],
      itemLayerAdapter,
      stageAdapter,
      workspaceStorageProvider,
    })
    const shellInputProps = {
      assemblyInput: {
        affordanceConfig: {
          overlays: {
            toolbar: false,
          },
        },
        customItemModules: [module],
      },
    } satisfies CanvasAppProps
    const shellInputSource =
      shellInputProps satisfies CanvasAppAssemblySource
    const shellSubpathProps = {
      assemblyInput: shellInputProps.assemblyInput,
    } satisfies CanvasAppPropsFromApp
    const shellSubpathSource =
      shellSubpathProps satisfies CanvasAppAssemblySourceFromApp
    const shellAssemblyProps = {
      assembly,
    } satisfies CanvasAppProps

    expect(assembly.initialItems).toEqual([rect])
    expect(commitAppItemsChange(appItemsChange)).toBe(true)
    expect(assembly.initialSelection).toEqual([rect.id])
    expect(
      shellInputSource.assemblyInput.affordanceConfig?.overlays?.toolbar,
    ).toBe(false)
    expect(shellSubpathSource.assemblyInput).toBe(
      shellInputProps.assemblyInput,
    )
    expect(shellAssemblyProps.assembly).toBe(assembly)
    const entityItem: CanvasEntityItem = rect

    expect(entityItem.id).toBe('rect-1')
    expect(assembly.itemLayerAdapter.renderItems({
      componentPresentationRenderers: {},
      customItemRenderers: {},
      getComponentPresentation: () => 'note-card',
      onArrowEndpointPointerDown: () => undefined,
      items: assembly.initialItems,
      onItemPointerDown: () => undefined,
      onTextDoubleClick: () => undefined,
      outlineIds: new Set(),
      selected: new Set(),
    })).toBe(1)
    expect(editableItem.id).toBe(rect.id)
    expect(assembly.stageAdapter.renderStage).toBe(stageAdapter.renderStage)
    expect(assembly.workspaceStorageProvider).toBe(workspaceStorageProvider)
    expect(stageMount.ref).toBeTypeOf('function')
    expect(pointerInput.pointerId).toBe(1)
    expect(createCanvasAppComponentPresentationRenderers({
      'smoke-card': renderComponent,
    })['smoke-card']).toBe(renderComponent)
    expect(createCanvasAppCustomItemRenderers({
      'smoke-node': renderCustomItem,
    })['smoke-node']).toBe(renderCustomItem)
    expect(CanvasAppAuthoring.createCanvasAppAssembly({
      customItemModules: [module],
    }).customItemValidators.smoke(customItem)).toBe(true)
    expect(assembly.customItemValidators.smoke(customItem)).toBe(true)
    expect(createCanvasAppAssemblyFromApp().initialItems.length).toBeGreaterThan(
      0,
    )
  })

  it('keeps package subpaths usable as public facades', () => {
    expect(CanvasApp).toBeTypeOf('function')
    expect('useCanvasAppModel' in CanvasPackage).toBe(false)
    expect('DEFAULT_CANVAS_APP_ASSEMBLY' in CanvasPackage).toBe(false)
    expect('assertCanvasAppAssembly' in CanvasPackage).toBe(false)
    expect('assertCanvasAppExtensionRecordKeys' in CanvasPackage).toBe(false)
    expect('createCanvasAppCustomItemModuleAssembly' in CanvasPackage).toBe(
      false,
    )
    expect('CanvasAppCustomCommandState' in CanvasPackage).toBe(false)
    expect('CanvasAppCustomCreationTool' in CanvasPackage).toBe(false)
    expect('CanvasAppCustomCreationToolState' in CanvasPackage).toBe(false)
    expect('assertCanvasAffordanceConfig' in CanvasPackage).toBe(false)
    expect('createCanvasComponentLibrary' in CanvasPackage).toBe(false)
    expect('CanvasSvgStage' in CanvasPackage).toBe(false)
    expect('isCanvasCustomToolId' in CanvasPackage).toBe(false)
    expect(CanvasAppFacade.useCanvasAppModel).toBeTypeOf('function')
    expect(CanvasAppFacade.DEFAULT_CANVAS_APP_ASSEMBLY).toBeTypeOf('object')
    expect(CanvasAppFacade.assertCanvasAppAssembly).toBeTypeOf('function')
    expect(CanvasAppFacade.assertCanvasAppExtensionRecordKeys).toBeTypeOf(
      'function',
    )
    expect(CanvasAppFacade.createCanvasAppCustomItemModuleAssembly)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppAssembly).toBeTypeOf('function')
    expect(CanvasAppAuthoring.defineCanvasAppCustomItemModule).toBeTypeOf(
      'function',
    )
    expect(CanvasAppAuthoring.createCanvasAppComponentPresentationRenderers)
      .toBeTypeOf('function')
    expect('useCanvasAppModel' in CanvasAppAuthoring).toBe(false)
    expect('DEFAULT_CANVAS_APP_ASSEMBLY' in CanvasAppAuthoring).toBe(false)
    expect('assertCanvasAppAssembly' in CanvasAppAuthoring).toBe(false)
    expect(
      'createCanvasAppCustomItemModuleAssembly' in CanvasAppAuthoring,
    ).toBe(false)
    expect('CanvasAppCustomCommandState' in CanvasAppAuthoring).toBe(false)
    expect('CanvasAppCustomCreationTool' in CanvasAppAuthoring).toBe(false)
    expect('CanvasAppCustomCreationToolState' in CanvasAppAuthoring).toBe(false)
    expect(CanvasSvgStage).toBe(CanvasRenderer.CanvasSvgStage)
    expect(normalizeBounds({ x: 10, y: 20 }, { x: 2, y: 4 })).toEqual({
      h: 16,
      w: 8,
      x: 2,
      y: 4,
    })
    expect(CanvasCore.normalizeBounds({ x: 10, y: 20 }, { x: 2, y: 4 }))
      .toEqual(normalizeBounds({ x: 10, y: 20 }, { x: 2, y: 4 }))
    const affordanceConfig = createCanvasAffordanceConfig()
    expect(affordanceConfig.tools.select).toBe(true)
    expect(assertCanvasAffordanceConfigFromEngine(affordanceConfig)).toBe(
      affordanceConfig,
    )
    expect(CanvasEngine.createCanvasAffordanceConfig().tools.select).toBe(true)
    expect(CanvasEngine.assertCanvasAffordanceConfig(affordanceConfig)).toBe(
      affordanceConfig,
    )
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
    expect(createCanvasSvgFreehandPathData([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 2 },
    ])).toBe('M 1 2 Q 3 4 4 3 L 5 2')
    expect(CanvasRenderer.CANVAS_SVG_ARROW_MARKER_IRI)
      .toBe(CANVAS_SVG_ARROW_MARKER_IRI)
    expect(CanvasRenderer.createCanvasSvgFreehandPathData([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 2 },
    ])).toBe(createCanvasSvgFreehandPathData([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 2 },
    ]))
  })
})
