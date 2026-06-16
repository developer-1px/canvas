import { describe, expect, it } from 'vitest'
import * as CanvasPackage from '@interactive-os/canvas'
import * as CanvasAppAuthoring from '@interactive-os/canvas/app/authoring'
import * as CanvasAppFacade from '@interactive-os/canvas/app'
import {
  CanvasCore,
  CanvasEngine,
  CanvasFoundation as CanvasFoundationFromPackage,
  CanvasHost,
  CanvasRenderer,
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
  createCanvasAppAssembly,
  createCanvasAppExtensionBundle,
  createCanvasAppAiLabsFeaturePackManifest,
  createCanvasAppDomEditStyleFeaturePackManifest,
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackExtensionBundle,
  createCanvasAppFeaturePackManifest,
  createCanvasAppFeaturePackViewRenderers,
  createCanvasAppViewFeaturePack,
  defineCanvasAppCustomItemModule,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS,
  getCanvasAppInstalledFeaturePacks,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppInstalledFeaturePackManifests,
  getCanvasAppInstalledViewFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
  getCanvasAppFoundationExtensionCommands,
  getCanvasAppFoundationExtensionRendererSlots,
  getCanvasAppFoundationExtensionTools,
  type CanvasAppAssemblySource,
  type CanvasAppCommitItemsChange,
  type CanvasAppComponentLibrary,
  type CanvasAppComponentTemplate,
  type CanvasAppComponentRendererStrategy,
  type CanvasAppFeaturePack,
  type CanvasAppFeaturePackAssemblyInput,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemRenderKeyStrategy,
  type CanvasAppCustomItemRendererDescriptor,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppCustomItemValidator,
  type CanvasAppFoundationExtension,
  type CanvasAppFoundationExtensionCommand,
  type CanvasAppFoundationExtensionRendererSlot,
  type CanvasAppFoundationExtensionTool,
  type CanvasAppItemLayerAdapter,
  type CanvasAppProps,
  type CanvasAppPointerInput,
  type CanvasAppStageExternalOverlaySlot,
  type CanvasAppStageAdapter,
  type CanvasAppStageMount,
  type CanvasAppItemsChange,
  type CanvasAppViewFeaturePack,
  type CanvasWorkspaceStorageProvider,
  type CanvasCustomItem,
  type CanvasEditableTextItem,
  type CanvasItem,
} from '@interactive-os/canvas'
import * as CanvasFoundation from '@interactive-os/canvas/foundation'
import {
  CanvasApp,
  createCanvasAppComponentPresentationRenderers,
  createCanvasAppAssembly as createCanvasAppAssemblyFromApp,
  createCanvasAppCustomItemRenderers,
  type CanvasAppAssemblySource as CanvasAppAssemblySourceFromApp,
  type CanvasAppProps as CanvasAppPropsFromApp,
} from '@interactive-os/canvas/app'
import {
  getCanvasBoundsCenter,
  isCanvasCustomToolId,
  normalizeBounds,
} from '@interactive-os/canvas/core'
import {
  assertCanvasAffordanceConfig as assertCanvasAffordanceConfigFromEngine,
  createCanvasAffordanceConfig,
} from '@interactive-os/canvas/engine'
import type { CanvasItem as CanvasEntityItem } from '@interactive-os/canvas/entities'
import { createCanvasComponentLibrary } from '@interactive-os/canvas/host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  CanvasSvgStage,
  createCanvasSvgFreehandPathData,
  createCanvasSvgPathData,
} from '@interactive-os/canvas/renderer'

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
    const getCustomItemRenderKey: CanvasAppCustomItemRenderKeyStrategy = ({
      item,
    }) => item.id
    const customItemRendererDescriptor:
      CanvasAppCustomItemRendererDescriptor = {
        getRenderKey: getCustomItemRenderKey,
        renderItem: renderCustomItem,
      }
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
    const foundationExtension: CanvasAppFoundationExtension =
      CanvasFoundation.defineCanvasExtension({
        commands: [{
          id: 'canvas.smoke.command',
          plan: () => [],
          requiredAdapters: ['command'],
        }],
        id: 'canvas.smoke',
        rendererSlots: [{
          id: 'canvas.smoke.renderer',
          surface: 'item-layer',
        }],
        requiredAdapters: ['document'],
      })
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
    const externalOverlaySlot: CanvasAppStageExternalOverlaySlot = {
      render: (overlays) => overlays,
    }
    const featurePack: CanvasAppFeaturePack = createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        customCommands: [{
          id: 'smoke-command',
          label: 'Smoke',
          run: () => undefined,
          title: 'Smoke',
        }],
      }),
      id: 'smoke-pack',
      label: 'Smoke pack',
    })
    const installedFeaturePacks = getCanvasAppInstalledFeaturePacks([
      featurePack,
    ])
    const featurePackBundle = createCanvasAppFeaturePackExtensionBundle(
      installedFeaturePacks,
    )
    const renderStatus = () => null
    const viewFeaturePack: CanvasAppViewFeaturePack =
      createCanvasAppViewFeaturePack({
        id: 'smoke-view-pack',
        label: 'Smoke view pack',
        viewRenderers: {
          status: renderStatus,
        },
      })
    const installedViewFeaturePacks = getCanvasAppInstalledViewFeaturePacks([
      viewFeaturePack,
    ])
    const viewRenderers: CanvasAppFeaturePackViewRenderers =
      createCanvasAppFeaturePackViewRenderers(installedViewFeaturePacks)
    const defaultViewFeaturePackIds =
      DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS.map((pack) => pack.id)
    const defaultFeaturePackManifestIds =
      getCanvasAppInstalledFeaturePackManifestIds(
        DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
      )
    const defaultViewFeaturePackManifestIds =
      DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS.map(
        (manifest) => manifest.id,
      )
    const viewManifest: CanvasAppFeaturePackManifest =
      createCanvasAppFeaturePackManifest({
        id: 'smoke-view-pack',
        label: 'Status pack',
        viewFeaturePack,
      })
    const aiLabsManifest = createCanvasAppAiLabsFeaturePackManifest({
      provider: {
        complete: () => ({ text: 'Summary' }),
        id: 'consumer-ai',
      },
      requestReview: () => ({ kind: 'cancel' }),
    })
    const domEditStyleManifest =
      createCanvasAppDomEditStyleFeaturePackManifest({
        id: 'smoke-dom-card-style',
        itemKind: 'smoke',
        targetId: 'card',
      })
    const manifestViewFeaturePacks =
      getCanvasAppManifestViewFeaturePacks([viewManifest])

    const assembly = createCanvasAppAssembly({
      componentLibrary,
      componentPresentationRenderers: createCanvasAppComponentPresentationRenderers({
        'smoke-card': renderComponent,
      }),
      customItemModules: [module],
      disabledViewFeaturePackIds: ['toolbar'],
      foundationExtensions: [foundationExtension],
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
        disabledFeaturePackIds: ['toolbar'],
      },
    } satisfies CanvasAppProps
    const featurePackAssemblyInput =
      shellInputProps.assemblyInput satisfies CanvasAppFeaturePackAssemblyInput
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
    expect(assembly.foundationExtensions.map((extension) => extension.id))
      .toContain('canvas.smoke')
    const foundationTools: readonly CanvasAppFoundationExtensionTool[] =
      getCanvasAppFoundationExtensionTools(assembly.foundationExtensions)

    expect(foundationTools.map((tool) => tool.extensionId)).toContain(
      'canvas.sticky-note',
    )
    expect(CanvasAppAuthoring.getCanvasAppFoundationExtensionTools(
      assembly.foundationExtensions,
    )).toEqual(foundationTools)
    const foundationCommands: readonly CanvasAppFoundationExtensionCommand[] =
      getCanvasAppFoundationExtensionCommands(assembly.foundationExtensions)

    expect(foundationCommands.map((command) => command.id)).toContain(
      'canvas.smoke.command',
    )
    expect(CanvasAppAuthoring.getCanvasAppFoundationExtensionCommands(
      assembly.foundationExtensions,
    )).toEqual(foundationCommands)
    const foundationRendererSlots =
      getCanvasAppFoundationExtensionRendererSlots(
        assembly.foundationExtensions,
      ) satisfies readonly CanvasAppFoundationExtensionRendererSlot[]

    expect(foundationRendererSlots.map((slot) => slot.id)).toContain(
      'canvas.smoke.renderer',
    )
    expect(CanvasAppAuthoring.getCanvasAppFoundationExtensionRendererSlots(
      assembly.foundationExtensions,
    )).toEqual(foundationRendererSlots)
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
    expect(externalOverlaySlot.render('external-overlay')).toBe(
      'external-overlay',
    )
    expect(installedFeaturePacks.map((pack) => pack.id)).toEqual([
      'smoke-pack',
    ])
    expect(featurePackBundle.customCommands.map((command) => command.id))
      .toEqual(['smoke-command'])
    expect(assembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(featurePackAssemblyInput.disabledFeaturePackIds).toEqual([
      'toolbar',
    ])
    expect(viewRenderers.status).toBe(renderStatus)
    expect(defaultFeaturePackManifestIds).toContain('table-import')
    expect(getCanvasAppInstalledFeaturePackManifestIds([
      aiLabsManifest,
      domEditStyleManifest,
      CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
    ])).toEqual([
      'ai-labs',
      'smoke-dom-card-style',
      'board-io',
    ])
    expect(getCanvasAppInstalledFeaturePackManifests([
      viewManifest,
    ])).toEqual([viewManifest])
    expect(defaultViewFeaturePackIds).toContain('toolbar')
    expect(defaultViewFeaturePackManifestIds).toContain('toolbar')
    expect(manifestViewFeaturePacks).toEqual([viewFeaturePack])
    expect(defaultViewFeaturePackIds).toContain('component-authoring')
    expect(createCanvasAppComponentPresentationRenderers({
      'smoke-card': renderComponent,
    })['smoke-card']).toBe(renderComponent)
    expect(createCanvasAppCustomItemRenderers({
      'smoke-node': renderCustomItem,
    })['smoke-node']).toBe(renderCustomItem)
    expect(customItemRendererDescriptor.renderItem).toBe(renderCustomItem)
    expect(customItemRendererDescriptor.getRenderKey({ item: customItem })).toBe(
      customItem.id,
    )
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
    expect(CanvasAppAuthoring.getCanvasAppFoundationExtensionCommands)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFoundationExtensionRendererSlots)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFoundationExtensionTools)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppExtensionBundle)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppFeaturePack).toBeTypeOf(
      'function',
    )
    expect(CanvasAppAuthoring.createCanvasAppFeaturePackExtensionBundle)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppFeaturePackManifest)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppAiLabsFeaturePackManifest)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppDomEditStyleFeaturePackManifest)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST)
      .toBeTypeOf('object')
    expect(CanvasAppAuthoring.createCanvasAppFeaturePackViewRenderers)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppViewFeaturePack)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.assertCanvasAppFeaturePackViewRenderers)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppInstalledFeaturePacks)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppInstalledFeaturePackManifestIds)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppInstalledViewFeaturePacks)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppManifestViewFeaturePacks)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.DEFAULT_CANVAS_APP_FEATURE_PACKS)
      .toBeTypeOf('object')
    expect(CanvasAppAuthoring.DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS)
      .toBeTypeOf('object')
    expect(CanvasAppAuthoring.DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS)
      .toBeTypeOf('object')
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
    expect(getCanvasBoundsCenter({ h: 8, w: 6, x: 2, y: 4 })).toEqual({
      x: 5,
      y: 8,
    })
    expect(CanvasFoundation.getCanvasBoundsCenter({ h: 8, w: 6, x: 2, y: 4 }))
      .toEqual(getCanvasBoundsCenter({ h: 8, w: 6, x: 2, y: 4 }))
    const affordanceConfig = createCanvasAffordanceConfig()
    expect(affordanceConfig.tools.select).toBe(true)
    expect(assertCanvasAffordanceConfigFromEngine(affordanceConfig)).toBe(
      affordanceConfig,
    )
    expect(CanvasEngine.createCanvasAffordanceConfig().tools.select).toBe(true)
    expect(CanvasEngine.assertCanvasAffordanceConfig(affordanceConfig)).toBe(
      affordanceConfig,
    )
    expect(CanvasFoundation.getCanvasCommandAvailability({
      canRedo: false,
      canUndo: true,
      config: affordanceConfig,
      hasSelectedGroup: false,
      selection: ['rect-1', 'rect-2'],
    }).alignLeft).toBe(true)
    expect(CanvasEngine.getCanvasCommandAvailability({
      canRedo: false,
      canUndo: true,
      config: affordanceConfig,
      hasSelectedGroup: false,
      selection: ['rect-1', 'rect-2'],
    }).alignLeft).toBe(true)
    const scene = CanvasFoundation.createCanvasSceneAdapter([{
      bounds: { h: 20, w: 20, x: 0, y: 0 },
      id: 'rect-1',
      isGroup: false,
      parentId: null,
      path: [0],
    }])
    expect(CanvasFoundation.getCanvasMarqueeSelection({
      additive: false,
      baseSelection: [],
      bounds: { h: 10, w: 10, x: 5, y: 5 },
      scene,
    })).toEqual(['rect-1'])
    expect(CanvasFoundationFromPackage.createCanvasSceneAdapter).toBe(
      CanvasFoundation.createCanvasSceneAdapter,
    )
    expect(CanvasFoundation.snapCanvasPointToGrid({
      config: affordanceConfig,
      point: { x: 41, y: 78 },
    })).toEqual({ x: 40, y: 80 })
    expect(CanvasEngine.getCanvasMoveSnap({
      bounds: { h: 20, w: 20, x: 0, y: 0 },
      config: affordanceConfig,
      dx: 37,
      dy: 0,
      scene,
      selection: ['rect-1'],
      viewport: { scale: 1, x: 0, y: 0 },
    }).dx).toBe(40)
    expect(CanvasFoundation.defineCanvasExtension({
      id: 'whiteboard-comment',
      requiredAdapters: ['document', 'scene'],
    }).id).toBe('whiteboard-comment')
    expect(CanvasFoundation.CANVAS_STICKY_NOTE_EXTENSION.tools?.[0].id)
      .toBe('sticky')
    expect(CanvasFoundationFromPackage.CANVAS_STICKY_NOTE_EXTENSION).toBe(
      CanvasFoundation.CANVAS_STICKY_NOTE_EXTENSION,
    )
    const pointerGestureInput = {
      altKey: false,
      button: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    }
    expect(CanvasFoundation.getCanvasPointerGesture({
      config: affordanceConfig,
      input: pointerGestureInput,
      spaceDown: false,
      tool: 'sticky',
    })).toBe('create-sticky')
    expect(CanvasEngine.getCanvasPointerGesture({
      config: affordanceConfig,
      input: pointerGestureInput,
      spaceDown: false,
      tool: 'sticky',
    })).toBe('create-sticky')
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
