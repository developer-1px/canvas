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
  CANVAS_CONTROL_TARGET_SELECTOR,
  CANVAS_WHEEL_PASSTHROUGH_SELECTOR,
  applyCanvasAppFeaturePackRuntimeStatePatch,
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
  createCanvasAppAssembly,
  createCanvasAppExtensionBundle,
  createCanvasAppAiLabsFeaturePackManifest,
  createCanvasAppDomEditStyleFeaturePackManifest,
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackExtensionBundle,
  createCanvasAppFeaturePackManifest,
  createCanvasAppFeaturePackMarketplaceListing,
  getCanvasAppFeaturePackMarketplaceActionAssemblyInput,
  createCanvasAppFeaturePackViewRenderers,
  createCanvasAppViewFeaturePack,
  createCanvasStoryPreviewItemsFeaturePackManifest,
  getCanvasDataTransferText,
  downloadCanvasBlobFile,
  downloadCanvasTextFile,
  getCanvasEditableFieldKeyboardIntent,
  getCanvasPresentationKeyboardIntent,
  setCanvasDataTransferText,
  scheduleCanvasAnimationFrameTask,
  writeCanvasClipboardText,
  defineCanvasAppCustomItemModule,
  CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE,
  CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST,
  CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
  CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY,
  CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST,
  CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST,
  CanvasComponentPalette,
  CANVAS_COMPONENT_INSPECTOR_PANEL,
  CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER,
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
  CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_STORY_CANVAS_SUITE_ID,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE,
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS,
  createCanvasAppFeaturePackProfile,
  createCanvasAppFeaturePackSuiteManifest,
  createCanvasStoryImportComponentDefinitions,
  createCanvasStoryImportItems,
  getCanvasAppEnabledFeaturePackIds,
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppEnabledFeaturePackManifests,
  getCanvasAppInstalledFeaturePacks,
  getCanvasAppInstalledFeaturePackIds,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppInstalledFeaturePackManifests,
  getCanvasAppInstalledViewFeaturePacks,
  getCanvasAppFeaturePackProfileById,
  getCanvasAppFeaturePackProfileRuntimeStates,
  getCanvasAppFeaturePackMarketplaceActionModel,
  getCanvasAppFeaturePackMarketplaceModel,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
  getCanvasAppFeaturePackMarketplaceSectionFacetItems,
  getCanvasAppFeaturePackProfileMarketplaceActionModel,
  getCanvasAppFeaturePackSuiteMarketplaceActionModel,
  getCanvasAppFeaturePackCatalog,
  getCanvasAppFeaturePackInstallPlan,
  getCanvasAppFeaturePackMarketplaceListingMap,
  getCanvasAppFeaturePackPartialUpdatePlan,
  getCanvasAppFeaturePackStateTransitionPlan,
  getCanvasAppFeaturePackSuiteFeaturePackIds,
  getCanvasAppManifestViewFeaturePacks,
  getCanvasAppResolvedFeaturePackStates,
  getCanvasComponentInspectorPanelModel,
  syncCanvasComponentItemsChange,
  transformCanvasAppItemsChange,
  getCanvasFindInputKeyboardIntent,
  getCanvasInlineEditKeyboardIntent,
  getCanvasContextMenuKeyboardIntent,
  getCanvasContextMenuPosition,
  getCanvasModalBackdropPointerIntent,
  getCanvasModalKeyboardIntent,
  measureCanvasTextBlocks,
  getCanvasPointerTransformModifierState,
  getCanvasResizeHandleDoubleClickIntent,
  getCanvasMenuRovingActiveIndex,
  getCanvasMenuTriggerKeyboardIntent,
  getCanvasSelectionListModifierState,
  getCanvasWorldClientPoint,
  isCanvasControlTarget,
  getCanvasAppFoundationExtensionCommands,
  getCanvasAppFoundationExtensionRendererSlots,
  getCanvasAppFoundationExtensionTools,
  isCanvasTargetWithinSelector,
  isCanvasWheelPassthroughTarget,
  type CanvasAppAssemblySource,
  type CanvasAppCommitItemsChange,
  type CanvasAppComponentLibrary,
  type CanvasAppComponentDefinition,
  type CanvasAppComponentTemplate,
  type CanvasAppComponentRendererStrategy,
  type CanvasComponentPaletteItem,
  type CanvasComponentPaletteProps,
  type CanvasComponentInspectorPanelModel,
  type CanvasAppFeaturePack,
  type CanvasAppFeaturePackMarketplaceActionModel,
  type CanvasAppFeaturePackMarketplaceActionAssemblyInput,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackMarketplacePackSectionFacetKind,
  type CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput,
  type CanvasAppFeaturePackMarketplacePackSectionSummary,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingEntitlement,
  type CanvasAppFeaturePackProfileMarketplaceActionModel,
  type CanvasAppFeaturePackSuiteMarketplaceActionModel,
  type CanvasAppFeaturePackCatalog,
  type CanvasAppFeaturePackCatalogItem,
  type CanvasAppFeaturePackInstallPlan,
  type CanvasAppFeaturePackInstallPlanInput,
  type CanvasAppFeaturePackPartialUpdatePlan,
  type CanvasAppFeaturePackPartialUpdatePlanInput,
  type CanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionPlanInput,
  type CanvasAppFeaturePackAssemblyInput,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestCategory,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileRuntimeStatesInput,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
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
  type CanvasControlTargetInput,
  type CanvasAppItemsChange,
  type CanvasAppItemsChangeTransformContext,
  type CanvasAppItemsChangeTransformer,
  type CanvasAppViewFeaturePack,
  type CanvasComponentPartSourceInput,
  type CanvasEditableFieldKeyboardIntentInput,
  type CanvasPresentationKeyboardIntentInput,
  type CanvasInteractionTargetSelectorInput,
  type CanvasInlineEditKeyboardIntentInput,
  type CanvasContextMenuKeyboardIntentInput,
  type CanvasContextMenuPositionInput,
  type CanvasFindInputKeyboardIntentInput,
  type CanvasMenuRovingActiveIndexInput,
  type CanvasMenuTriggerKeyboardIntentInput,
  type CanvasModalBackdropPointerIntentInput,
  type CanvasModalKeyboardIntentInput,
  type CanvasPointerClickMemory,
  type CanvasResizeHandleDoubleClickIntentInput,
  type CanvasPointerTransformModifierInput,
  type CanvasPointerTransformModifierState,
  type CanvasSelectionListModifierInput,
  type CanvasSelectionListModifierState,
  type CanvasSelectionListSelectionMode,
  type CanvasWorkspaceStorageProvider,
  type CanvasWorldClientPointInput,
  type CanvasWorldClientPointStageElement,
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
} from '@interactive-os/canvas/engine'
import type { CanvasItem as CanvasEntityItem } from '@interactive-os/canvas/entities'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
  createCanvasComponentDefinitionRegistry,
  createCanvasComponentLibrary,
  type CanvasComponentDefinition,
  type CanvasComponentDefinitionRegistry,
} from '@interactive-os/canvas/host'
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
    const componentSyncTransformer: CanvasAppItemsChangeTransformer =
      CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER
    const componentSyncContext: CanvasAppItemsChangeTransformContext = {
      change: appItemsChange,
      componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
      currentItems: [rect],
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
    const componentPaletteItem: CanvasComponentPaletteItem = {
      accent: componentTemplate.accent,
      fill: componentTemplate.fill,
      id: componentTemplate.id,
      label: componentTemplate.label,
      stroke: componentTemplate.stroke,
      title: componentTemplate.title,
    }
    const componentLibrary: CanvasAppComponentLibrary =
      createCanvasComponentLibrary({
        templates: [componentTemplate],
      })
    const appComponentDefinition: CanvasAppComponentDefinition = {
      id: 'consumer-card',
      instances: [
        {
          label: 'One',
          slots: {
            root: 'consumer-card-one',
            title: 'consumer-card-one-title',
          },
        },
        {
          label: 'Two',
          slots: {
            root: 'consumer-card-two',
            title: 'consumer-card-two-title',
          },
        },
      ],
      label: 'Consumer card',
    }
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
    const partialUpdateManifest: CanvasAppFeaturePackManifest =
      createCanvasAppFeaturePackManifest({
        id: 'smoke-partial-pack',
        label: 'Partial pack',
        lifecycle: {
          partialUpdate: ['overlay'],
          runtimeToggleable: true,
        },
      })
    const partialUpdateSuiteManifest: CanvasAppFeaturePackSuiteManifest =
      createCanvasAppFeaturePackSuiteManifest({
        featurePackIds: ['smoke-partial-pack'],
        id: 'smoke-partial-suite',
        label: 'Smoke partial suite',
      })
    const partialUpdateProfile: CanvasAppFeaturePackProfile =
      createCanvasAppFeaturePackProfile({
        id: 'smoke-partial-profile',
        installedFeaturePackIds: ['smoke-partial-pack'],
        label: 'Smoke partial profile',
      })
    const partialUpdateListing: CanvasAppFeaturePackMarketplaceListing =
      createCanvasAppFeaturePackMarketplaceListing({
        access: 'paid',
        distribution: 'available',
        featurePackId: 'smoke-partial-pack',
        priceLabel: '$9/mo',
        vendor: 'Interactive OS',
      })
    const partialUpdateListingEntitlement:
      CanvasAppFeaturePackMarketplaceListingEntitlement =
        partialUpdateListing.entitlement
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
    const featurePackCatalog: CanvasAppFeaturePackCatalog =
      getCanvasAppFeaturePackCatalog([viewManifest], {
        featurePackStates: [{
          id: 'smoke-view-pack',
          status: 'disabled',
        }],
      })
    const featurePackCatalogItem: CanvasAppFeaturePackCatalogItem | undefined =
      featurePackCatalog.items[0]
    const featurePackInstallPlanInput: CanvasAppFeaturePackInstallPlanInput = {
      manifests: [viewManifest],
      options: {
        featurePackStates: [{
          id: 'smoke-view-pack',
          status: 'disabled',
        }],
      },
      targetFeaturePackIds: ['smoke-view-pack'],
    }
    const featurePackInstallPlan: CanvasAppFeaturePackInstallPlan =
      getCanvasAppFeaturePackInstallPlan(featurePackInstallPlanInput)
    const featurePackPartialUpdatePlanInput:
      CanvasAppFeaturePackPartialUpdatePlanInput = {
        manifests: [partialUpdateManifest],
        targetFeaturePackIds: ['smoke-partial-pack'],
      }
    const featurePackMarketplaceActionModel:
      CanvasAppFeaturePackMarketplaceActionModel =
        getCanvasAppFeaturePackMarketplaceActionModel({
          manifests: [partialUpdateManifest],
        })
    const featurePackMarketplaceModel: CanvasAppFeaturePackMarketplaceModel =
      getCanvasAppFeaturePackMarketplaceModel({
        listings: [partialUpdateListing],
        manifests: [partialUpdateManifest],
        profiles: [partialUpdateProfile],
        suiteManifests: [partialUpdateSuiteManifest],
      })
    const featurePackMarketplacePackSection =
      featurePackMarketplaceModel.sections[2]
    if (featurePackMarketplacePackSection?.kind !== 'packs') {
      throw new Error('Expected feature pack marketplace packs section')
    }
    const featurePackMarketplacePackSectionSummary:
      CanvasAppFeaturePackMarketplacePackSectionSummary =
        featurePackMarketplacePackSection.summary
    const featurePackMarketplacePackSectionFacetKinds:
      readonly CanvasAppFeaturePackMarketplacePackSectionFacetKind[] =
        featurePackMarketplacePackSection.facets.map((facet) => facet.kind)
    const featurePackMarketplaceReadyPackFacetInput:
      CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput = {
        facetKind: 'ready',
        section: featurePackMarketplacePackSection,
      }
    const featurePackMarketplaceReadyPackFacetItems =
      getCanvasAppFeaturePackMarketplaceSectionFacetItems(
        featurePackMarketplaceReadyPackFacetInput,
      )
    const featurePackMarketplacePrimaryAction:
      CanvasAppFeaturePackMarketplacePrimaryAction =
        getCanvasAppFeaturePackMarketplacePrimaryAction(
          featurePackMarketplaceModel.packs.items[0]!,
        )
    const featurePackMarketplaceActionAssemblyInput:
      CanvasAppFeaturePackMarketplaceActionAssemblyInput = {
        action: featurePackMarketplacePrimaryAction,
        assemblyInput: {
          featurePackManifests: [partialUpdateManifest],
        },
      }
    const featurePackMarketplaceAppliedAssemblyInput =
      getCanvasAppFeaturePackMarketplaceActionAssemblyInput(
        featurePackMarketplaceActionAssemblyInput,
      )
    const featurePackMarketplaceListingMap =
      getCanvasAppFeaturePackMarketplaceListingMap({
        listings: [partialUpdateListing],
        manifests: [partialUpdateManifest],
      })
    const featurePackProfileMarketplaceActionModel:
      CanvasAppFeaturePackProfileMarketplaceActionModel =
        getCanvasAppFeaturePackProfileMarketplaceActionModel({
          manifests: [partialUpdateManifest],
          profiles: [partialUpdateProfile],
        })
    const featurePackSuiteMarketplaceActionModel:
      CanvasAppFeaturePackSuiteMarketplaceActionModel =
        getCanvasAppFeaturePackSuiteMarketplaceActionModel({
          manifests: [partialUpdateManifest],
          suiteManifests: [partialUpdateSuiteManifest],
        })
    const featurePackPartialUpdatePlan:
      CanvasAppFeaturePackPartialUpdatePlan =
        getCanvasAppFeaturePackPartialUpdatePlan(
          featurePackPartialUpdatePlanInput,
        )
    const featurePackStateTransitionPlanInput:
      CanvasAppFeaturePackStateTransitionPlanInput = {
        manifests: [partialUpdateManifest],
        operation: 'disable',
        targetFeaturePackIds: ['smoke-partial-pack'],
      }
    const featurePackStateTransitionPlan:
      CanvasAppFeaturePackStateTransitionPlan =
        getCanvasAppFeaturePackStateTransitionPlan(
          featurePackStateTransitionPlanInput,
        )
    const disabledFeaturePackStates:
      readonly CanvasAppFeaturePackRuntimeState[] =
        getCanvasAppResolvedFeaturePackStates(['smoke-pack'], {
          featurePackStates: [{
            id: 'smoke-pack',
            status: 'disabled',
          }],
        })
    const runtimeStatePatch: CanvasAppFeaturePackRuntimeStatePatch =
      applyCanvasAppFeaturePackRuntimeStatePatch({
        featurePackIds: ['smoke-pack'],
        featurePackStates: [{
          id: 'smoke-pack',
          status: 'enabled',
        }],
        options: {
          disabledFeaturePackIds: ['smoke-pack'],
        },
      })
    const smokeProfile: CanvasAppFeaturePackProfile =
      createCanvasAppFeaturePackProfile({
        enabledFeaturePackIds: [],
        id: 'smoke-profile',
        installedFeaturePackIds: ['smoke-pack'],
        label: 'Smoke profile',
      })
    const smokeSuiteId: CanvasAppFeaturePackSuiteId = 'smoke-suite'
    const smokeSuite: CanvasAppFeaturePackSuiteManifest =
      createCanvasAppFeaturePackSuiteManifest({
        featurePackIds: ['smoke-pack'],
        id: smokeSuiteId,
        label: 'Smoke suite',
      })
    const smokeSuiteProfile: CanvasAppFeaturePackProfile =
      createCanvasAppFeaturePackProfile({
        id: 'smoke-suite-profile',
        installedSuiteIds: [smokeSuiteId],
        label: 'Smoke suite profile',
        suiteManifests: [smokeSuite],
      })
    const smokeProfileStatesInput:
      CanvasAppFeaturePackProfileRuntimeStatesInput = {
        featurePackIds: ['smoke-pack'],
        profile: smokeSuiteProfile,
      }
    const storyPreviewManifest = createCanvasStoryPreviewItemsFeaturePackManifest({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })
    const viewManifestCategory: CanvasAppFeaturePackManifestCategory =
      viewManifest.category

    const assembly = createCanvasAppAssembly({
      componentDefinitions: [appComponentDefinition],
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
    const componentPaletteProps: CanvasComponentPaletteProps = {
      componentSets: assembly.componentDefinitionRegistry.listSets(),
      components: [componentPaletteItem],
      onFocusItems: () => undefined,
      onInsert: () => undefined,
    }
    const componentPartSourceInput: CanvasComponentPartSourceInput = {
      componentId: 'smoke-card',
      componentLabel: 'Smoke card',
      id: 'smoke-card:title',
      itemIds: ['rect-1'],
      label: 'Title',
      slotId: 'title',
    }
    const shellInputProps = {
      assemblyInput: {
        affordanceConfig: {
          overlays: {
            toolbar: false,
          },
        },
        customItemModules: [module],
        disabledFeaturePackIds: ['toolbar'],
        featurePackProfileId: 'minimal-viewer',
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
    expect(CanvasComponentPalette).toBeTypeOf('function')
    expect(CanvasPackage.CanvasComponentPalette).toBe(CanvasComponentPalette)
    expect(CanvasAppFacade.CanvasComponentPalette).toBe(CanvasComponentPalette)
    expect(CanvasAppAuthoring.CanvasComponentPalette).toBe(
      CanvasComponentPalette,
    )
    expect(componentPaletteProps.componentSets?.[0]?.parts.map(
      (part) => part.slotId,
    )).toEqual(['root', 'title'])
    expect(componentPartSourceInput.itemIds).toEqual(['rect-1'])
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
    expect(disabledFeaturePackStates).toEqual([{
      enabled: false,
      id: 'smoke-pack',
      installed: true,
      status: 'disabled',
    }])
    expect(runtimeStatePatch.changedFeaturePackIds).toEqual(['smoke-pack'])
    expect(runtimeStatePatch.options).toEqual({
      featurePackStates: [{
        id: 'smoke-pack',
        status: 'enabled',
      }],
    })
    expect(getCanvasAppInstalledFeaturePackIds(['smoke-pack'], {
      featurePackStates: [{
        id: 'smoke-pack',
        status: 'disabled',
      }],
    })).toEqual(['smoke-pack'])
    expect(getCanvasAppEnabledFeaturePackIds(['smoke-pack'], {
      featurePackStates: [{
        id: 'smoke-pack',
        status: 'disabled',
      }],
    })).toEqual([])
    expect(smokeProfile.enabledFeaturePackIds).toEqual([])
    expect(smokeSuiteProfile.installedFeaturePackIds).toEqual(['smoke-pack'])
    expect(getCanvasAppFeaturePackSuiteFeaturePackIds(
      [smokeSuite],
      [smokeSuiteId],
    )).toEqual(['smoke-pack'])
    expect(getCanvasAppFeaturePackProfileRuntimeStates(
      smokeProfileStatesInput,
    )).toEqual([{
      id: 'smoke-pack',
      status: 'enabled',
    }])
    expect(getCanvasAppFeaturePackProfileById(
      [smokeSuiteProfile],
      'smoke-suite-profile',
    )).toBe(smokeSuiteProfile)
    expect(CANVAS_COMPONENT_SYSTEM_SUITE_ID).toBe('component-system')
    expect(CanvasPackage.CANVAS_COMPONENT_SYSTEM_SUITE_ID).toBe(
      CANVAS_COMPONENT_SYSTEM_SUITE_ID,
    )
    expect(CanvasAppFacade.CANVAS_COMPONENT_SYSTEM_SUITE_ID).toBe(
      CANVAS_COMPONENT_SYSTEM_SUITE_ID,
    )
    expect(CanvasAppAuthoring.CANVAS_COMPONENT_SYSTEM_SUITE_ID).toBe(
      CANVAS_COMPONENT_SYSTEM_SUITE_ID,
    )
    expect(
      CanvasAppAuthoring.CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
      .toBe('component-runtime')
    expect(CanvasPackage.CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
      .toBe(CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
    expect(CanvasAppFacade.CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
      .toBe(CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
    expect(CanvasAppAuthoring.CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
      .toBe(CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
    expect(CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.provides)
      .toContain(CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY)
    expect(CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id)
      .toBe('component-source-outline')
    expect(
      CanvasPackage.CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id)
    expect(
      CanvasAppFacade.CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST
        .id,
    ).toBe(CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id)
    expect(
      CanvasAppAuthoring
        .CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id)
      .toBe('component-inspector')
    expect(
      CanvasPackage.CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id)
    expect(
      CanvasAppFacade.CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id)
    expect(
      CanvasAppAuthoring.CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_COMPONENT_INSPECTOR_PANEL.id).toBe('component-binding')
    expect(CanvasAppFacade.CANVAS_COMPONENT_INSPECTOR_PANEL.id)
      .toBe(CANVAS_COMPONENT_INSPECTOR_PANEL.id)
    expect(CanvasAppAuthoring.getCanvasComponentInspectorPanelModel)
      .toBe(getCanvasComponentInspectorPanelModel)
    expect(CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
      .toBe('component-sync')
    expect(CanvasPackage.CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
      .toBe(CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
    expect(CanvasAppFacade.CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
      .toBe(CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
    expect(
      CanvasAppAuthoring.CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id,
    ).toBe(CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
    expect(componentSyncTransformer.id).toBe('component-sync-items-change')
    expect(CanvasPackage.CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER.id)
      .toBe(componentSyncTransformer.id)
    expect(CanvasAppFacade.CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER.id)
      .toBe(componentSyncTransformer.id)
    expect(CanvasAppAuthoring.CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER.id)
      .toBe(componentSyncTransformer.id)
    expect(syncCanvasComponentItemsChange(componentSyncContext))
      .toBe(appItemsChange)
    expect(CanvasPackage.syncCanvasComponentItemsChange(componentSyncContext))
      .toBe(appItemsChange)
    expect(transformCanvasAppItemsChange({
      ...componentSyncContext,
      transformers: [componentSyncTransformer],
    })).toBe(appItemsChange)
    expect(CanvasAppFacade.transformCanvasAppItemsChange({
      ...componentSyncContext,
      transformers: [componentSyncTransformer],
    })).toBe(appItemsChange)
    expect(CanvasAppAuthoring.transformCanvasAppItemsChange({
      ...componentSyncContext,
      transformers: [componentSyncTransformer],
    })).toBe(appItemsChange)
    const emptyComponentInspectorModel: CanvasComponentInspectorPanelModel | null =
      getCanvasComponentInspectorPanelModel({
        bounds: null,
        commitItemsChange: commitAppItemsChange,
        componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
        customFocus: null,
        disabled: false,
        items: [],
        label: null,
        selectedItems: [],
        selection: [],
      })

    expect(emptyComponentInspectorModel).toBeNull()
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS).toContain(
      CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST,
    )
    expect(CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST.featurePackIds)
      .toContain(CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST.featurePackIds)
      .toContain(CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST.featurePackIds)
      .toContain(CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST.featurePackIds)
      .toContain(CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_STORY_CANVAS_SUITE_ID).toBe('story-canvas')
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS).toContain(
      CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST,
    )
    expect(CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE.installedSuiteIds)
      .toEqual([CANVAS_STORY_CANVAS_SUITE_ID])
    expect(CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE.installedFeaturePackIds)
      .toContain(CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id)
    expect(createCanvasStoryImportItems({
      groups: [{
        h: 80,
        id: 'consumer-story',
        label: null,
        stories: [{
          h: 80,
          id: 'consumer-story-default',
          title: 'Consumer story',
          w: 120,
          x: 0,
          y: 0,
        }],
        w: 120,
        x: 0,
        y: 0,
      }],
    }).map((item) => item.id)).toEqual(['story-consumer-story-default'])
    expect(createCanvasStoryImportComponentDefinitions({
      groups: [{
        h: 80,
        id: 'consumer-widget',
        label: 'ConsumerWidget',
        stories: [{
          h: 80,
          id: 'consumer-widget-default',
          title: 'Default',
          w: 120,
          x: 0,
          y: 0,
        }],
        w: 120,
        x: 0,
        y: 0,
      }],
    })[0]?.instances[0]?.slots.root).toBe('story-consumer-widget-default')
    expect(storyPreviewManifest.extensionFeaturePack?.id)
      .toBe('story-preview-items')
    expect(CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE.installedFeaturePackIds)
      .toEqual([])
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledFeaturePackIds)
      .toContain('toolbar')
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.installedSuiteIds)
      .toContain(CANVAS_COMPONENT_SYSTEM_SUITE_ID)
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledFeaturePackIds)
      .toContain(CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id)
    expect(viewManifestCategory).toBe('view')
    expect(assembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(featurePackAssemblyInput.disabledFeaturePackIds).toEqual([
      'toolbar',
    ])
    expect(viewRenderers.status).toBe(renderStatus)
    expect(defaultFeaturePackManifestIds).toContain('table-import')
    expect(defaultFeaturePackManifestIds).toContain(
      CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
    )
    expect(defaultFeaturePackManifestIds).toContain(
      CANVAS_APP_COMPONENT_SOURCE_OUTLINE_FEATURE_PACK_MANIFEST.id,
    )
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
    expect(getCanvasAppEnabledFeaturePackManifestIds([viewManifest], {
      featurePackStates: [{
        id: 'smoke-view-pack',
        status: 'disabled',
      }],
    })).toEqual([])
    expect(getCanvasAppEnabledFeaturePackManifests([viewManifest], {
      featurePackStates: [{
        id: 'smoke-view-pack',
        status: 'disabled',
      }],
    })).toEqual([])
    expect(featurePackCatalogItem?.status).toBe('disabled')
    expect(featurePackCatalogItem?.enabled).toBe(false)
    expect(featurePackCatalogItem?.blockedReasons).toEqual([])
    expect(featurePackInstallPlan.enableFeaturePackIds).toEqual([
      'smoke-view-pack',
    ])
    expect(featurePackInstallPlan.installFeaturePackIds).toEqual([])
    expect(featurePackInstallPlan.status).toBe('ready')
    expect(featurePackMarketplaceActionModel.items[0]?.primaryActionKind)
      .toBe('disable')
    expect(featurePackMarketplaceActionModel.items[0]?.actions.map(
      (action) => action.kind,
    )).toEqual([
      'install',
      'enable',
      'disable',
      'uninstall',
    ])
    expect(featurePackMarketplaceActionModel.items[0]?.actions.find(
      (action) => action.kind === 'disable',
    )?.installOptions).toEqual({
      featurePackStates: [{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }],
    })
    expect(featurePackMarketplaceModel.sections.map((section) => section.kind))
      .toEqual([
        'profiles',
        'suites',
        'packs',
      ])
    expect(featurePackMarketplaceListingMap.get('smoke-partial-pack'))
      .toEqual(partialUpdateListing)
    expect(partialUpdateListingEntitlement).toBe('required')
    expect(featurePackMarketplaceModel.packs.items[0]?.featurePackId)
      .toBe('smoke-partial-pack')
    expect(featurePackMarketplaceModel.packs.items[0]?.listing).toEqual({
      access: 'paid',
      distribution: 'available',
      entitlement: 'required',
      featurePackId: 'smoke-partial-pack',
      priceLabel: '$9/mo',
      vendor: 'Interactive OS',
    })
    expect(featurePackMarketplacePackSectionSummary).toEqual({
      activationFailedItemCount: 0,
      blockedActionCount: 0,
      enabledItemCount: 1,
      installedItemCount: 1,
      itemCount: 1,
      paidItemCount: 1,
      partiallyUpdatedItemCount: 0,
      privateItemCount: 0,
      readyActionCount: 2,
      rollbackAvailableItemCount: 0,
      updatingItemCount: 0,
    })
    expect(featurePackMarketplacePackSectionFacetKinds).toEqual([
      'all',
      'installed',
      'enabled',
      'paid',
      'private',
      'updating',
      'partially-updated',
      'activation-failed',
      'rollback-available',
      'ready',
      'blocked',
    ])
    expect(featurePackMarketplacePackSection.facets).toEqual([
      { count: 1, kind: 'all', label: 'All' },
      { count: 1, kind: 'installed', label: 'Installed' },
      { count: 1, kind: 'enabled', label: 'Enabled' },
      { count: 1, kind: 'paid', label: 'Paid' },
      { count: 0, kind: 'private', label: 'Private' },
      { count: 0, kind: 'updating', label: 'Updating' },
      { count: 0, kind: 'partially-updated', label: 'Partially updated' },
      { count: 0, kind: 'activation-failed', label: 'Activation failed' },
      { count: 0, kind: 'rollback-available', label: 'Rollback available' },
      { count: 1, kind: 'ready', label: 'Ready' },
      { count: 0, kind: 'blocked', label: 'Blocked' },
    ])
    expect(featurePackMarketplaceReadyPackFacetItems.map(
      (item) => item.featurePackId,
    )).toEqual(['smoke-partial-pack'])
    expect(featurePackMarketplacePrimaryAction.kind).toBe('disable')
    expect(featurePackMarketplacePrimaryAction.installOptions).toEqual({
      featurePackStates: [{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }],
    })
    expect(featurePackMarketplaceAppliedAssemblyInput.featurePackStates)
      .toEqual([{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }])
    expect(featurePackProfileMarketplaceActionModel.items[0]?.profileId)
      .toBe('smoke-partial-profile')
    expect(featurePackProfileMarketplaceActionModel.items[0]?.primaryActionKind)
      .toBe('apply')
    expect(featurePackProfileMarketplaceActionModel.items[0]?.actions[0]?.kind)
      .toBe('apply')
    expect(featurePackProfileMarketplaceActionModel.items[0]?.actions[0]
      ?.installOptions).toEqual({
      featurePackStates: [{
        id: 'smoke-partial-pack',
        status: 'enabled',
      }],
    })
    expect(featurePackSuiteMarketplaceActionModel.items[0]?.suiteId)
      .toBe('smoke-partial-suite')
    expect(featurePackSuiteMarketplaceActionModel.items[0]?.primaryActionKind)
      .toBe('disable')
    expect(featurePackSuiteMarketplaceActionModel.items[0]?.actions.map(
      (action) => action.kind,
    )).toEqual([
      'install',
      'enable',
      'disable',
      'uninstall',
    ])
    expect(featurePackSuiteMarketplaceActionModel.items[0]?.actions.find(
      (action) => action.kind === 'disable',
    )?.installOptions).toEqual({
      featurePackStates: [{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }],
    })
    expect(featurePackPartialUpdatePlan.surfaceIds).toEqual(['overlay'])
    expect(featurePackPartialUpdatePlan.entries[0]?.runtimeToggleable)
      .toBe(true)
    expect(featurePackPartialUpdatePlan.status).toBe('ready')
    expect(featurePackStateTransitionPlan.featurePackStates).toEqual([{
      id: 'smoke-partial-pack',
      status: 'disabled',
    }])
    expect(featurePackStateTransitionPlan.partialUpdateSurfaceIds)
      .toEqual(['overlay'])
    expect(featurePackStateTransitionPlan.status).toBe('ready')
    expect(defaultViewFeaturePackIds).toContain('toolbar')
    expect(defaultViewFeaturePackManifestIds).toContain('toolbar')
    expect(manifestViewFeaturePacks).toEqual([viewFeaturePack])
    expect(defaultViewFeaturePackIds).toContain('component-authoring')
    expect(createCanvasAppComponentPresentationRenderers({
      'smoke-card': renderComponent,
    })['smoke-card']).toBe(renderComponent)
    expect(assembly.componentDefinitionRegistry.getBinding(
      'consumer-card-one-title',
    )?.slotItemIds).toEqual([
      'consumer-card-one-title',
      'consumer-card-two-title',
    ])
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
    const contextMenuKeyboardInput: CanvasContextMenuKeyboardIntentInput = {
      event: { shiftKey: true },
      key: 'F10',
    }
    const contextMenuPositionInput: CanvasContextMenuPositionInput = {
      menuSize: { height: 100, width: 160 },
      point: { x: 790, y: 590 },
      viewportSize: { height: 600, width: 800 },
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
    expect(CanvasAppFacade.useCanvasAppModel).toBeTypeOf('function')
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
    expect(getCanvasContextMenuKeyboardIntent(contextMenuKeyboardInput))
      .toEqual({
        kind: 'open-context-menu',
        preventDefault: true,
      })
    expect(CanvasAppFacade.getCanvasContextMenuKeyboardIntent(
      contextMenuKeyboardInput,
    )).toEqual({
      kind: 'open-context-menu',
      preventDefault: true,
    })
    expect(getCanvasContextMenuPosition(contextMenuPositionInput)).toEqual({
      x: 632,
      y: 492,
    })
    expect(CanvasAppFacade.getCanvasContextMenuPosition(
      contextMenuPositionInput,
    )).toEqual({
      x: 632,
      y: 492,
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
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackCatalog)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackCatalog)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackCatalog)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceModel)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceModel)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceModel)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceActionAssemblyInput)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceActionAssemblyInput)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceActionAssemblyInput)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplacePrimaryAction)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplacePrimaryAction)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplacePrimaryAction)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSectionFacetItems)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSectionFacetItems)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSectionFacetItems)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.createCanvasAppFeaturePackMarketplaceListing)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.createCanvasAppFeaturePackMarketplaceListing)
      .toBeTypeOf('function')
    expect(CanvasPackage.createCanvasAppFeaturePackMarketplaceListing)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceListingMap)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceListingMap)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceListingMap)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackProfileMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackProfileMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackProfileMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackSuiteMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackSuiteMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackSuiteMarketplaceActionModel)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackInstallPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackInstallPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackInstallPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackPartialUpdatePlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackPartialUpdatePlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackPartialUpdatePlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackStateTransitionPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackStateTransitionPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackStateTransitionPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.applyCanvasAppFeaturePackRuntimeStatePatch)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.applyCanvasAppFeaturePackRuntimeStatePatch)
      .toBeTypeOf('function')
    expect(CanvasPackage.applyCanvasAppFeaturePackRuntimeStatePatch)
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
    const componentDefinition: CanvasComponentDefinition = {
      id: 'consumer-card',
      instances: [
        {
          label: 'One',
          slots: {
            root: 'consumer-card-one',
            title: 'consumer-card-one-title',
          },
        },
        {
          label: 'Two',
          slots: {
            root: 'consumer-card-two',
            title: 'consumer-card-two-title',
          },
        },
      ],
      label: 'Consumer card',
    }
    const componentRegistry: CanvasComponentDefinitionRegistry =
      createCanvasComponentDefinitionRegistry({
        definitions: [componentDefinition],
      })

    expect(CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID).toBe('root')
    expect(CANVAS_COMPONENT_DEFINITION_REGISTRY.listSets()).toEqual([])
    expect(componentRegistry.getBinding('consumer-card-one-title')?.slotItemIds)
      .toEqual(['consumer-card-one-title', 'consumer-card-two-title'])
    expect(componentRegistry.syncItems({
      itemId: 'consumer-card-one-title',
      state: {} as Record<string, number>,
      update: (current, itemId) => ({
        ...current,
        [itemId]: 1,
      }),
    })).toEqual({
      'consumer-card-one-title': 1,
      'consumer-card-two-title': 1,
    })
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
  })
})
