import { describe, expect, it } from 'vitest'
import * as CanvasPackage from '@interactive-os/canvas'
import * as CanvasAppAuthoring from '@interactive-os/canvas/app/authoring'
import * as CanvasAppFacade from '@interactive-os/canvas/app'
import * as CanvasEditor from '@interactive-os/canvas/editor'
import * as CanvasPackAiLabs from '@interactive-os/canvas-pack-ai-labs'
import * as CanvasPackDevtools from '@interactive-os/canvas-pack-devtools'
import {
  createCanvasAppAiLabsFeaturePackManifest,
} from '@interactive-os/canvas-pack-ai-labs'
import {
  createCanvasDevtoolsFeaturePackManifest,
} from '@interactive-os/canvas-pack-devtools'
import {
  CanvasCore,
  CanvasEngine,
  CanvasFoundation as CanvasFoundationFromPackage,
  CanvasHost,
  CanvasRenderer,
  type CanvasAppAssemblySource,
  type CanvasAppProps,
  type CanvasCustomItem,
  type CanvasEditableTextItem,
  type CanvasItem,
} from '@interactive-os/canvas'
import {
  CANVAS_CONTROL_TARGET_SELECTOR,
  CANVAS_WHEEL_PASSTHROUGH_SELECTOR,
  bindCanvasEventListener,
  bindCanvasEventListeners,
  cancelCanvasAnimationFrameTask,
  cancelCanvasDeferredFocus,
  captureCanvasPointer,
  focusCanvasElement,
  focusCanvasElementBySelectorOnNextFrame,
  focusCanvasElementOnNextFrame,
  isCanvasKeyboardTypingTarget,
  resolveCanvasElementBySelector,
  getCanvasDataTransferText,
  downloadCanvasBlobFile,
  downloadCanvasTextFile,
  getCanvasEditableFieldKeyboardIntent,
  getCanvasPresentationKeyboardIntent,
  setCanvasDataTransferText,
  scheduleCanvasAnimationFrameTask,
  writeCanvasClipboardText,
  getCanvasFindInputKeyboardIntent,
  getCanvasInlineEditKeyboardIntent,
  getCanvasAxisLockedDragDelta,
  getCanvasKeyboardSelectionCycleIntent,
  getCanvasModalBackdropPointerIntent,
  getCanvasModalKeyboardIntent,
  getCanvasPrintableTextEditStartIntent,
  measureCanvasTextBlocks,
  getCanvasPointerTransformModifierState,
  getCanvasResizeHandleDoubleClickIntent,
  getCanvasMenuRovingActiveIndex,
  getCanvasMenuTriggerKeyboardIntent,
  getCanvasSelectionListModifierState,
  getCanvasWorldClientPoint,
  isCanvasControlTarget,
  isCanvasTargetWithinSelector,
  isCanvasWheelPassthroughTarget,
  type CanvasAxisLockedDragDeltaInput,
  type CanvasControlTargetInput,
  type CanvasEditableFieldKeyboardIntentInput,
  type CanvasInteractionTargetSelectorInput,
  type CanvasInlineEditKeyboardIntentInput,
  type CanvasKeyboardSelectionCycleInput,
  type CanvasMenuRovingActiveIndexInput,
  type CanvasMenuTriggerKeyboardIntentInput,
  type CanvasModalBackdropPointerIntentInput,
  type CanvasModalKeyboardIntentInput,
  type CanvasPresentationKeyboardIntentInput,
  type CanvasPointerClickMemory,
  type CanvasPrintableTextEditStartInput,
  type CanvasPointerTransformModifierInput,
  type CanvasPointerTransformModifierState,
  type CanvasResizeHandleDoubleClickIntentInput,
  type CanvasSelectionListModifierInput,
  type CanvasSelectionListModifierState,
  type CanvasSelectionListSelectionMode,
  type CanvasWorldClientPointInput,
  type CanvasWorldClientPointStageElement,
} from '@interactive-os/canvas/app'
import {
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  createCanvasAppAssembly,
  createCanvasAppDomEditStyleFeaturePackManifest,
  createCanvasAppExtensionBundle,
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackExtensionBundle,
  createCanvasAppFeaturePackManifest,
  createCanvasAppFeaturePackViewRenderers,
  createCanvasAppViewFeaturePack,
  defineCanvasAppCustomItemModule,
  defineCanvasAppFeaturePack,
  getCanvasAppFeaturePackCatalog,
  getCanvasAppFoundationExtensionCommands,
  getCanvasAppFoundationExtensionRendererSlots,
  getCanvasAppFoundationExtensionTools,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppInstalledFeaturePackManifests,
  getCanvasAppInstalledFeaturePacks,
  getCanvasAppInstalledViewFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
  resolveCanvasAppFeaturePacks,
  type CanvasAppCommitItemsChange,
  type CanvasAppComponentLibrary,
  type CanvasAppComponentRendererStrategy,
  type CanvasAppComponentTemplate,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemRenderKeyStrategy,
  type CanvasAppCustomItemRendererDescriptor,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppCustomItemTextTarget,
  type CanvasAppCustomItemValidator,
  type CanvasAppFeaturePack,
  type CanvasAppFeaturePackAssemblyInput,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasAppFoundationExtension,
  type CanvasAppFoundationExtensionCommand,
  type CanvasAppFoundationExtensionRendererSlot,
  type CanvasAppFoundationExtensionTool,
  type CanvasAppItemLayerAdapter,
  type CanvasAppItemsChange,
  type CanvasAppPointerInput,
  type CanvasAppStageAdapter,
  type CanvasAppStageExternalOverlaySlot,
  type CanvasAppStageMount,
  type CanvasAppViewFeaturePack,
  type CanvasFindInputKeyboardIntentInput,
  type CanvasWorkspaceStorageProvider,
} from '@interactive-os/canvas/app/authoring'
import * as CanvasFoundation from '@interactive-os/canvas/foundation'
import {
  CanvasApp,
  createCanvasAppComponentPresentationRenderers,
  createCanvasAppAssembly as createCanvasAppAssemblyFromApp,
  createCanvasAppCustomItemRenderers,
  isCanvasKeyboardToolIntent,
  runCanvasKeyboardToolIntent,
  type CanvasAppAssemblySource as CanvasAppAssemblySourceFromApp,
  type CanvasAppProps as CanvasAppPropsFromApp,
  type CanvasCommandPaletteKeyboardIntentInput,
  type CanvasKeyboardToolHandlers,
} from '@interactive-os/canvas/app'
import {
  clampCanvasBoundsToFrame,
  clampCanvasPointToBounds,
  getCanvasBoundsAnchorPoint,
  getCanvasBoundsAnchorPoints,
  getCanvasBoundsCenter,
  getCanvasPointBounds,
  isCanvasCustomToolId,
  normalizeBounds,
  normalizeCanvasPointsToLocalBounds,
} from '@interactive-os/canvas/core'
import {
  assertCanvasAffordanceConfig as assertCanvasAffordanceConfigFromEngine,
  createCanvasAffordanceConfig,
  getCanvasAngleConstrainedPoint,
  getCanvasAspectRatioLockedPoint,
} from '@interactive-os/canvas/engine'
import type { CanvasItem as CanvasEntityItem } from '@interactive-os/canvas/entities'
import { createCanvasComponentLibrary } from '@interactive-os/canvas/host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  CanvasSvgStage,
  createCanvasCssBoundsTransform,
  createCanvasSvgBoundsTransform,
  createCanvasSvgFreehandPathData,
  createCanvasSvgPathData,
  escapeCanvasXmlAttribute,
  formatCanvasSvgNumber,
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
    const customItemTextTarget: CanvasAppCustomItemTextTarget = {
      canEdit: () => true,
      commitsOnEnter: () => true,
      getCommittedValue: ({ value }) => value,
      getEditorBounds: (item) => ({ h: item.h, w: item.w, x: item.x, y: item.y }),
      getValue: (item) =>
        typeof item.data.severity === 'string' ? item.data.severity : '',
      planCommitUpdates: (_item, text) => [
        { field: 'data/severity', operation: 'replace', value: text },
      ],
    }
    const module: CanvasAppCustomItemModule =
      defineCanvasAppCustomItemModule({
        customCommands: [{
          id: 'smoke-note',
          label: 'Note',
          run: () => undefined,
          shortcut: { key: 'j' },
          title: 'Smoke note',
        }],
        customCreationTools: [{
          createItem: ({ currentWorld }) => ({
            data: { severity: 'high' },
            h: 80,
            title: 'Smoke',
            w: 120,
            x: currentWorld.x,
            y: currentWorld.y,
          }),
          enterTextEdit: true,
          id: 'smoke-note-tool',
          label: 'N',
          shortcut: { key: 'q' },
          title: 'Smoke note tool',
        }],
        id: 'smoke',
        presentation: 'smoke-node',
        renderItem: ({ item }) => item.title,
        textTarget: customItemTextTarget,
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
    const devtoolsManifest = createCanvasDevtoolsFeaturePackManifest({
      initialMode: 'measure',
    })
    const domEditStyleManifest =
      createCanvasAppDomEditStyleFeaturePackManifest({
        id: 'smoke-dom-card-style',
        itemKind: 'smoke',
        targetId: 'card',
      })
    const consumerFeaturePackManifest = defineCanvasAppFeaturePack({
      id: 'consumer-pack',
      label: 'Consumer pack',
      extensions: {
        customCommands: [{
          id: 'consumer-command',
          label: 'Consumer',
          run: () => undefined,
          title: 'Consumer command',
        }],
      },
    })
    const featurePackCatalog = getCanvasAppFeaturePackCatalog()
    const resolvedFeaturePackManifests =
      resolveCanvasAppFeaturePacks(['minimap'])
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
      canEditText: () => false,
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
    expect(featurePackCatalog.some((manifest) => manifest.id === 'minimap'))
      .toBe(true)
    expect(resolvedFeaturePackManifests.map((manifest) => manifest.id))
      .toEqual(['minimap'])
    expect(consumerFeaturePackManifest.id).toBe('consumer-pack')
    expect(getCanvasAppInstalledFeaturePackManifestIds([
      aiLabsManifest,
      devtoolsManifest,
      domEditStyleManifest,
      consumerFeaturePackManifest,
      CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
    ])).toEqual([
      'ai-labs',
      'devtools',
      'smoke-dom-card-style',
      'consumer-pack',
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
    expect(assembly.customItemTextTargets.smoke?.getValue(customItem)).toBe(
      'high',
    )
    expect(
      assembly.customItemTextTargets.smoke?.planCommitUpdates(
        customItem,
        'low',
      ),
    ).toEqual([
      { field: 'data/severity', operation: 'replace', value: 'low' },
    ])
    expect(
      assembly.customCommands.find((command) => command.id === 'smoke-note')
        ?.shortcut,
    ).toEqual({ key: 'j' })
    expect(
      assembly.customCreationTools.find(
        (tool) => tool.id === 'smoke-note-tool',
      )?.enterTextEdit,
    ).toBe(true)
    expect(createCanvasAppAssemblyFromApp().initialItems.length).toBeGreaterThan(
      0,
    )
  })

  it('keeps package subpaths usable as public facades', async () => {
    const nullControlTargetInput: CanvasControlTargetInput = { target: null }
    const nullSelectorTargetInput: CanvasInteractionTargetSelectorInput = {
      selectors: 'button',
      target: null,
    }
    const worldClientStageElement: CanvasWorldClientPointStageElement = {
      getRect: () => ({
        height: 400,
        left: 100,
        top: 200,
        width: 600,
      }),
    }
    const worldClientPointInput: CanvasWorldClientPointInput = {
      point: { x: 4, y: 5 },
      stageElement: worldClientStageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    }
    const pointerTransformModifierInput: CanvasPointerTransformModifierInput = {
      altKey: true,
      shiftKey: true,
    }
    const pointerTransformModifierState: CanvasPointerTransformModifierState =
      getCanvasPointerTransformModifierState(pointerTransformModifierInput)
    const axisLockedDragDeltaInput: CanvasAxisLockedDragDeltaInput = {
      dx: 8,
      dy: 30,
    }
    const resizeHandleLastClick: CanvasPointerClickMemory = {
      id: 'selection:se',
      point: { x: 20, y: 30 },
      time: 1000,
    }
    const resizeHandleDoubleClickInput:
      CanvasResizeHandleDoubleClickIntentInput = {
        handle: 'se',
        handleId: 'selection:se',
        lastClick: resizeHandleLastClick,
        point: { x: 22, y: 32 },
        time: 1200,
      }
    const selectionListModifierInput: CanvasSelectionListModifierInput = {
      ctrlKey: false,
      hasRangeAnchor: true,
      metaKey: true,
      shiftKey: true,
    }
    const selectionListModifierState: CanvasSelectionListModifierState =
      getCanvasSelectionListModifierState(selectionListModifierInput)
    const selectionListModifierMode: CanvasSelectionListSelectionMode =
      selectionListModifierState.mode
    const menuRovingActiveIndexInput: CanvasMenuRovingActiveIndexInput = {
      count: 4,
      focusedIndex: -1,
      preferredIndex: 9,
    }
    const menuTriggerKeyboardInput: CanvasMenuTriggerKeyboardIntentInput = {
      key: 'Enter',
    }
    const findInputKeyboardInput: CanvasFindInputKeyboardIntentInput = {
      key: 'Enter',
      shiftKey: true,
    }
    const editableFieldKeyboardInput: CanvasEditableFieldKeyboardIntentInput = {
      key: 'Escape',
    }
    const presentationKeyboardInput: CanvasPresentationKeyboardIntentInput = {
      key: 'PageDown',
    }
    const modalBackdropPointerTarget = {} as EventTarget
    const modalBackdropPointerInput: CanvasModalBackdropPointerIntentInput = {
      currentTarget: modalBackdropPointerTarget,
      target: modalBackdropPointerTarget,
    }
    const modalKeyboardInput: CanvasModalKeyboardIntentInput = {
      key: 'Tab',
    }
    const inlineEditKeyboardInput: CanvasInlineEditKeyboardIntentInput = {
      altKey: false,
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      shiftKey: false,
    }
    const selectionCycleInput: CanvasKeyboardSelectionCycleInput = {
      event: {
        altKey: false,
        ctrlKey: false,
        key: 'Tab',
        metaKey: false,
        shiftKey: false,
        target: null,
      },
      selectableIds: ['rect-1'],
      selection: [],
    }
    const printableTextEditStartInput: CanvasPrintableTextEditStartInput = {
      editingItem: {
        h: 40,
        id: 'text-1',
        text: 'Title',
        type: 'text',
        w: 120,
        x: 0,
        y: 0,
      },
      event: {
        altKey: false,
        ctrlKey: false,
        key: 'N',
        metaKey: false,
        target: null,
      },
      selection: ['text-1'],
    }
    const commandPaletteKeyboardInput: CanvasCommandPaletteKeyboardIntentInput =
      {
        activeIndex: 0,
        itemCount: 2,
        key: 'ArrowDown',
      }

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
    expect('createCanvasAppAssembly' in CanvasPackage).toBe(false)
    expect('defineCanvasAppCustomItemModule' in CanvasPackage).toBe(false)
    expect('defineCanvasAppFeaturePack' in CanvasPackage).toBe(false)
    expect('getCanvasAppFeaturePackCatalog' in CanvasPackage).toBe(false)
    expect('resolveCanvasAppFeaturePacks' in CanvasPackage).toBe(false)
    expect('CANVAS_APP_MINIMAP_FEATURE_PACK_MANIFEST' in CanvasPackage)
      .toBe(false)
    expect('DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS' in CanvasPackage)
      .toBe(false)
    expect(CanvasAppFacade.useCanvasAppModel).toBeTypeOf('function')
    expect(CanvasAppFacade.useCanvasAppPreviewModel).toBeTypeOf('function')
    expect(CanvasAppFacade.DEFAULT_CANVAS_APP_ASSEMBLY).toBeTypeOf('object')
    expect(CanvasAppFacade.assertCanvasAppAssembly).toBeTypeOf('function')
    expect(CanvasAppFacade.assertCanvasAppExtensionRecordKeys).toBeTypeOf(
      'function',
    )
    expect(CanvasAppFacade.createCanvasAppCustomItemModuleAssembly)
      .toBeTypeOf('function')
    expect(CANVAS_CONTROL_TARGET_SELECTOR).toContain('button')
    expect(CanvasAppFacade.CANVAS_CONTROL_TARGET_SELECTOR).toContain('button')
    expect(CANVAS_WHEEL_PASSTHROUGH_SELECTOR).toContain(
      'data-canvas-wheel-passthrough',
    )
    expect(CanvasAppFacade.CANVAS_WHEEL_PASSTHROUGH_SELECTOR).toContain(
      'data-canvas-wheel-passthrough',
    )
    expect(isCanvasControlTarget(nullControlTargetInput)).toBe(false)
    expect(CanvasAppFacade.isCanvasControlTarget(nullControlTargetInput))
      .toBe(false)
    expect(isCanvasTargetWithinSelector(nullSelectorTargetInput)).toBe(false)
    expect(CanvasAppFacade.isCanvasTargetWithinSelector(
      nullSelectorTargetInput,
    )).toBe(false)
    expect(isCanvasWheelPassthroughTarget(null)).toBe(false)
    expect(CanvasAppFacade.isCanvasWheelPassthroughTarget(null)).toBe(false)
    expect(getCanvasWorldClientPoint(worldClientPointInput)).toEqual({
      x: 118,
      y: 230,
    })
    expect(CanvasAppFacade.getCanvasWorldClientPoint(
      worldClientPointInput,
    )).toEqual({
      x: 118,
      y: 230,
    })
    expect(pointerTransformModifierState).toEqual({
      constrainAngle: true,
      preserveAspectRatio: true,
      resizeFromCenter: true,
    })
    expect(CanvasAppFacade.getCanvasPointerTransformModifierState(
      pointerTransformModifierInput,
    )).toEqual(pointerTransformModifierState)
    expect(getCanvasAxisLockedDragDelta(axisLockedDragDeltaInput)).toEqual({
      dx: 0,
      dy: 30,
    })
    expect(CanvasAppFacade.getCanvasAxisLockedDragDelta(
      axisLockedDragDeltaInput,
    )).toEqual({ dx: 0, dy: 30 })
    expect(getCanvasResizeHandleDoubleClickIntent(
      resizeHandleDoubleClickInput,
    ).intent).toEqual({
      handle: 'se',
      kind: 'auto-size-selection',
    })
    expect(CanvasAppFacade.getCanvasResizeHandleDoubleClickIntent(
      resizeHandleDoubleClickInput,
    ).intent).toEqual({
      handle: 'se',
      kind: 'auto-size-selection',
    })
    expect(isCanvasKeyboardToolIntent({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'rect',
    })).toBe(true)
    expect(CanvasAppFacade.isCanvasKeyboardToolIntent({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'rect',
    })).toBe(true)
    const toolHandlers: CanvasKeyboardToolHandlers = {
      setTool: (tool) => tool,
    }
    expect(runCanvasKeyboardToolIntent({
      handlers: toolHandlers,
      intent: {
        kind: 'set-tool',
        preventDefault: false,
        tool: 'rect',
      },
    })).toBeUndefined()
    expect(CanvasAppFacade.runCanvasKeyboardToolIntent({
      handlers: toolHandlers,
      intent: {
        kind: 'set-tool',
        preventDefault: false,
        tool: 'rect',
      },
    })).toBeUndefined()
    expect(selectionListModifierState).toEqual({
      additive: false,
      mode: 'range',
      range: true,
    })
    expect(selectionListModifierMode).toBe('range')
    expect(CanvasAppFacade.getCanvasSelectionListModifierState(
      selectionListModifierInput,
    )).toEqual(selectionListModifierState)
    expect(getCanvasMenuRovingActiveIndex(menuRovingActiveIndexInput)).toBe(3)
    expect(CanvasAppFacade.getCanvasMenuRovingActiveIndex(
      menuRovingActiveIndexInput,
    )).toBe(3)
    expect(getCanvasMenuTriggerKeyboardIntent(menuTriggerKeyboardInput))
      .toEqual({
        kind: 'open-menu',
        preventDefault: true,
      })
    expect(CanvasAppFacade.getCanvasMenuTriggerKeyboardIntent(
      menuTriggerKeyboardInput,
    )).toEqual({
      kind: 'open-menu',
      preventDefault: true,
    })
    expect(getCanvasFindInputKeyboardIntent(findInputKeyboardInput)).toEqual({
      direction: -1,
      kind: 'find-match',
      preventDefault: true,
    })
    expect(CanvasAppFacade.getCanvasFindInputKeyboardIntent(
      findInputKeyboardInput,
    )).toEqual({
      direction: -1,
      kind: 'find-match',
      preventDefault: true,
    })
    expect(getCanvasEditableFieldKeyboardIntent(editableFieldKeyboardInput))
      .toEqual({
        kind: 'cancel',
        preventDefault: true,
      })
    expect(CanvasAppFacade.getCanvasEditableFieldKeyboardIntent(
      editableFieldKeyboardInput,
    )).toEqual({
      kind: 'cancel',
      preventDefault: true,
    })
    expect(getCanvasPresentationKeyboardIntent(presentationKeyboardInput))
      .toEqual({
        direction: 1,
        kind: 'navigate',
        preventDefault: true,
      })
    expect(CanvasAppFacade.getCanvasPresentationKeyboardIntent(
      presentationKeyboardInput,
    )).toEqual({
      direction: 1,
      kind: 'navigate',
      preventDefault: true,
    })
    expect(getCanvasModalBackdropPointerIntent(modalBackdropPointerInput))
      .toEqual({ kind: 'dismiss' })
    expect(CanvasAppFacade.getCanvasModalBackdropPointerIntent(
      modalBackdropPointerInput,
    )).toEqual({ kind: 'dismiss' })
    expect(getCanvasModalKeyboardIntent(modalKeyboardInput)).toEqual({
      kind: 'trap-focus',
      preventDefault: true,
      stopPropagation: true,
    })
    expect(CanvasAppFacade.getCanvasModalKeyboardIntent(
      modalKeyboardInput,
    )).toEqual({
      kind: 'trap-focus',
      preventDefault: true,
      stopPropagation: true,
    })
    expect(getCanvasInlineEditKeyboardIntent(inlineEditKeyboardInput))
      .toEqual({
        inputType: 'insertParagraph',
        kind: 'line-break',
        preventDefault: false,
      })
    expect(CanvasAppFacade.getCanvasInlineEditKeyboardIntent(
      inlineEditKeyboardInput,
    )).toEqual({
      inputType: 'insertParagraph',
      kind: 'line-break',
      preventDefault: false,
    })
    expect(getCanvasKeyboardSelectionCycleIntent(selectionCycleInput)).toEqual({
      direction: 'next',
      kind: 'cycle-selection',
      preventDefault: true,
      selection: ['rect-1'],
    })
    expect(CanvasAppFacade.getCanvasKeyboardSelectionCycleIntent(
      selectionCycleInput,
    )).toEqual({
      direction: 'next',
      kind: 'cycle-selection',
      preventDefault: true,
      selection: ['rect-1'],
    })
    expect(getCanvasPrintableTextEditStartIntent(
      printableTextEditStartInput,
    )).toEqual({
      editing: { id: 'text-1', value: 'N' },
      initialText: 'N',
      kind: 'start-editing',
      preventDefault: true,
    })
    expect(CanvasAppFacade.getCanvasPrintableTextEditStartIntent(
      printableTextEditStartInput,
    )).toEqual({
      editing: { id: 'text-1', value: 'N' },
      initialText: 'N',
      kind: 'start-editing',
      preventDefault: true,
    })
    expect(CanvasAppFacade.getCanvasCommandPaletteKeyboardIntent(
      commandPaletteKeyboardInput,
    )).toEqual({
      activeIndex: 1,
      kind: 'move-active',
      preventDefault: true,
    })
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
    expect(CanvasPackAiLabs.createCanvasAppAiLabsFeaturePackManifest)
      .toBeTypeOf('function')
    expect('createCanvasAppAiLabsFeaturePackManifest' in CanvasAppAuthoring)
      .toBe(false)
    expect(CanvasPackDevtools.createCanvasDevtoolsMeasureSnapshot)
      .toBeTypeOf('function')
    expect(CanvasPackDevtools.createCanvasDevtoolsInspectSnapshot)
      .toBeTypeOf('function')
    expect(CanvasPackDevtools.CanvasDevtoolsOverlay).toBeTypeOf('function')
    expect(CanvasPackDevtools.createCanvasDevtoolsFeaturePackManifest)
      .toBeTypeOf('function')
    expect('createCanvasDevtoolsFeaturePackManifest' in CanvasAppAuthoring)
      .toBe(false)
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
    expect(CanvasAppAuthoring.defineCanvasAppFeaturePack).toBeTypeOf(
      'function',
    )
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackCatalog).toBeTypeOf(
      'function',
    )
    expect(CanvasAppAuthoring.resolveCanvasAppFeaturePacks).toBeTypeOf(
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
    expect(getCanvasBoundsAnchorPoint({ h: 8, w: 6, x: 2, y: 4 }, 'top'))
      .toEqual({ x: 5, y: 4 })
    expect(CanvasFoundation.getCanvasBoundsAnchorPoints({ h: 8, w: 6, x: 2, y: 4 }).bottom)
      .toEqual(getCanvasBoundsAnchorPoints({ h: 8, w: 6, x: 2, y: 4 }).bottom)
    expect(clampCanvasBoundsToFrame({
      bounds: { h: 2, w: 2, x: -10, y: -10 },
      frame: { h: 8, w: 6, x: 2, y: 4 },
    })).toEqual({ h: 2, w: 2, x: 2, y: 4 })
    expect(CanvasFoundation.clampCanvasBoundsToFrame({
      bounds: { h: 20, w: 20, x: 100, y: 100 },
      frame: { h: 8, w: 6, x: 2, y: 4 },
    })).toEqual({ h: 8, w: 6, x: 2, y: 4 })
    expect(clampCanvasPointToBounds({ x: -4, y: 20 }, { h: 8, w: 6, x: 2, y: 4 }))
      .toEqual({ x: 2, y: 12 })
    expect(CanvasFoundation.clampCanvasPointToBounds(
      { x: 20, y: -4 },
      { h: 8, w: 6, x: 2, y: 4 },
    )).toEqual({ x: 8, y: 4 })
    expect(getCanvasPointBounds([
      { x: 2, y: 4 },
      { x: 8, y: 12 },
    ])).toEqual({ h: 8, w: 6, x: 2, y: 4 })
    expect(CanvasFoundation.getCanvasPointBounds([
      { x: 2, y: 4 },
      { x: 8, y: 12 },
    ])).toEqual(getCanvasPointBounds([
      { x: 2, y: 4 },
      { x: 8, y: 12 },
    ]))
    expect(normalizeCanvasPointsToLocalBounds({
      frame: { h: 8, w: 6, x: 2, y: 4 },
      points: [{ x: -4, y: 20 }],
    })).toEqual({
      bounds: { h: 1, w: 1, x: 2, y: 11 },
      points: [{ x: 0, y: 1 }],
    })
    expect(CanvasFoundation.normalizeCanvasPointsToLocalBounds({
      fallbackPoint: { x: 5, y: 8 },
      frame: { h: 8, w: 6, x: 2, y: 4 },
      minHeight: 2,
      minWidth: 2,
      points: [],
    }).bounds).toEqual({ h: 2, w: 2, x: 4, y: 7 })
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
    expect(getCanvasAspectRatioLockedPoint({
      currentWorld: { x: 20, y: 70 },
      startWorld: { x: 0, y: 0 },
    })).toEqual({ x: 70, y: 70 })
    expect(CanvasEngine.getCanvasAspectRatioLockedPoint({
      currentWorld: { x: 20, y: 70 },
      startWorld: { x: 0, y: 0 },
    })).toEqual({ x: 70, y: 70 })
    expect(getCanvasAngleConstrainedPoint({
      currentWorld: { x: 70, y: 18 },
      startWorld: { x: 0, y: 0 },
    })).toEqual({ x: 70, y: 0 })
    expect(CanvasEngine.getCanvasAngleConstrainedPoint({
      currentWorld: { x: 70, y: 18 },
      startWorld: { x: 0, y: 0 },
    })).toEqual({ x: 70, y: 0 })
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
    expect(downloadCanvasBlobFile({
      blob: new Blob(['smoke']),
      document: null,
      filename: 'smoke.txt',
      url: null,
    })).toBe(false)
    expect(downloadCanvasTextFile({
      content: 'smoke',
      document: null,
      filename: 'smoke.txt',
      type: 'text/plain',
      url: null,
    })).toBe(false)
    expect(CanvasAppFacade.downloadCanvasTextFile({
      content: 'smoke',
      document: null,
      filename: 'smoke.txt',
      type: 'text/plain',
      url: null,
    })).toBe(false)
    await expect(writeCanvasClipboardText({
      clipboard: null,
      text: 'smoke',
    })).resolves.toBe('unavailable')
    await expect(CanvasAppFacade.writeCanvasClipboardText({
      clipboard: null,
      text: 'smoke',
    })).resolves.toBe('unavailable')
    expect(setCanvasDataTransferText({
      dataTransfer: null,
      text: 'smoke',
    })).toBe(false)
    expect(getCanvasDataTransferText({
      dataTransfer: null,
    })).toBe('')
    expect(CanvasAppFacade.getCanvasDataTransferText({
      dataTransfer: null,
    })).toBe('')
    expect(measureCanvasTextBlocks({
      blocks: [{ text: 'smoke' }],
      document: null,
    })).toBeNull()
    expect(CanvasAppFacade.measureCanvasTextBlocks({
      blocks: [{ text: 'smoke' }],
      document: null,
    })).toBeNull()
    expect(focusCanvasElement({
      element: null,
    })).toBe(false)
    expect(focusCanvasElementOnNextFrame({
      requestAnimationFrame: null,
      resolveElement: () => null,
    })).toBeNull()
    expect(focusCanvasElementBySelectorOnNextFrame({
      requestAnimationFrame: null,
      root: null,
      selector: '[data-canvas-focus-target]',
    })).toBeNull()
    expect(resolveCanvasElementBySelector({
      root: null,
      selector: '[data-canvas-focus-target]',
    })).toBeNull()
    expect(cancelCanvasDeferredFocus({
      cancelAnimationFrame: null,
      frame: 1,
    })).toBe(false)
    expect(scheduleCanvasAnimationFrameTask({
      requestAnimationFrame: null,
      task: () => undefined,
    })).toBeNull()
    expect(cancelCanvasAnimationFrameTask({
      cancelAnimationFrame: null,
      frame: 1,
    })).toBe(false)
    expect(CanvasAppFacade.focusCanvasElement({
      element: null,
    })).toBe(false)
    expect(CanvasAppFacade.resolveCanvasElementBySelector({
      root: null,
      selector: '[data-canvas-focus-target]',
    })).toBeNull()
    expect(isCanvasKeyboardTypingTarget(null)).toBe(false)
    expect(CanvasAppFacade.isCanvasKeyboardTypingTarget(null)).toBe(false)
    expect(CanvasAppFacade.cancelCanvasDeferredFocus({
      cancelAnimationFrame: null,
      frame: 1,
    })).toBe(false)
    expect(CanvasAppFacade.scheduleCanvasAnimationFrameTask({
      requestAnimationFrame: null,
      task: () => undefined,
    })).toBeNull()
    expect(bindCanvasEventListener({
      listener: () => undefined,
      target: null,
      type: 'resize',
    })()).toBe(false)
    expect(bindCanvasEventListeners({
      listeners: [],
    })()).toBe(false)
    expect(CanvasAppFacade.bindCanvasEventListener({
      listener: () => undefined,
      target: null,
      type: 'resize',
    })()).toBe(false)
    expect(captureCanvasPointer({
      pointerId: 1,
      target: null,
    })).toBe(false)
    expect(CanvasAppFacade.captureCanvasPointer({
      pointerId: 1,
      target: null,
    })).toBe(false)
    expect(CANVAS_SVG_ARROW_MARKER_IRI).toBe('url(#canvas-arrow-head)')
    expect(createCanvasSvgPathData([{ x: 1, y: 2 }, { x: 3, y: 4 }]))
      .toBe('M 1 2 L 3 4')
    expect(formatCanvasSvgNumber(1.2345)).toBe('1.234')
    expect(escapeCanvasXmlAttribute('A&B "C"')).toBe('A&amp;B &quot;C&quot;')
    expect(createCanvasCssBoundsTransform({
      flipX: true,
      rotation: 15,
    })).toBe('rotate(15deg) scaleX(-1)')
    expect(createCanvasSvgBoundsTransform({
      bounds: { h: 20, w: 40, x: 10, y: 20 },
      flipY: true,
    })).toBe('translate(30 30) scale(1 -1) translate(-30 -30)')
    expect(createCanvasSvgFreehandPathData([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 2 },
    ])).toBe('M 1 2 Q 3 4 4 3 L 5 2')
    expect(CanvasRenderer.CANVAS_SVG_ARROW_MARKER_IRI)
      .toBe(CANVAS_SVG_ARROW_MARKER_IRI)
    expect(CanvasRenderer.createCanvasCssBoundsTransform({
      flipX: true,
    })).toBe('scaleX(-1)')
    expect(CanvasRenderer.createCanvasSvgFreehandPathData([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 2 },
    ])).toBe(createCanvasSvgFreehandPathData([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 2 },
    ]))
    expect(typeof CanvasEditor.createEditorEngine).toBe('function')
  })
})
