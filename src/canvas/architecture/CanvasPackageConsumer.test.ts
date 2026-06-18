import { describe, expect, it } from 'vitest'
import * as CanvasPackage from '@interactive-os/canvas'
import * as CanvasAppAuthoring from '@interactive-os/canvas/app/authoring'
import * as CanvasAppFacade from '@interactive-os/canvas/app'
import type {
  CanvasDataTransferImportActionPlanRunInput,
  CanvasDataTransferImportActionPlanRunResult,
  CanvasDataTransferJSONCandidateReadResult,
  CanvasStoryImportAction,
  CanvasWheelViewportEvent,
  CanvasWheelViewportSetter,
  RunCanvasWheelViewportArgs,
} from '@interactive-os/canvas/app'
import {
  CanvasCore,
  CanvasEngine,
  CanvasFoundation as CanvasFoundationFromPackage,
  CanvasHost,
  CanvasRenderer,
  CANVAS_LASER_TRAIL_OVERLAY_MODEL,
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
  CANVAS_CONTROL_TARGET_SELECTOR,
  CANVAS_WHEEL_VIEWPORT_HORIZONTAL_PAN_MODIFIER,
  CANVAS_WHEEL_VIEWPORT_MODEL,
  CANVAS_WHEEL_VIEWPORT_PAN_MODE,
  CANVAS_WHEEL_VIEWPORT_ZOOM_MODIFIER,
  CANVAS_WHEEL_PASSTHROUGH_SELECTOR,
  CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE,
  applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate,
  applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
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
  createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  createCanvasStoryCanvasFeaturePackAssemblyInput,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyResult,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyItemAction,
  getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetAction,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetItem,
  getCanvasAppFeaturePackMarketplaceActionAssemblyPlan,
  getCanvasAppFeaturePackMarketplaceActionAssemblyInput,
  getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel,
  centerCanvasViewportAtWorldPoint,
  createCanvasAppStageElement,
  createCanvasClipboardCommandEffectPlan,
  createCanvasStandardCommandEffectPlan,
  cloneCanvasClipboardItems,
  copyCanvasClipboardSelection,
  cutCanvasClipboardSelection,
  duplicateCanvasClipboardSelection,
  pasteCanvasClipboardSelection,
  createCanvasDraftStroke,
  createCanvasLaserTrailOverlay,
  createCanvasExternalClipboardImagePasteActionResolver,
  createCanvasExternalClipboardPasteActionPlan,
  createCanvasRichClipboardHTML,
  createCanvasPlainTextPasteSource,
  routeCanvasImagePasteReplace,
  readCanvasTableFileSources,
  routeCanvasMediaSourceObjectHyperlink,
  routeCanvasTableImportTargetReplace,
  routeCanvasTextPasteReplace,
  createCanvasAppFeaturePackViewRenderers,
  createCanvasAppViewFeaturePack,
  createCanvasStoryCanvasFeaturePackManifests,
  createCanvasStoryPreviewItemsFeaturePackManifest,
  getCanvasDataTransferText,
  readCanvasDataTransferJSONCandidate,
  getCanvasEraserHitStrokeIds,
  getCanvasExternalClipboardPasteCommandRoute,
  getCanvasRichClipboardJSONFromHTML,
  getNextCanvasDrawingPoints,
  getNextCanvasEraserPoints,
  getNextCanvasLaserTrailPoints,
  setCanvasDataTransferDropEffect,
  downloadCanvasBlobFile,
  downloadCanvasTextFile,
  fitCanvasViewportToBounds,
  getCanvasEditableFieldKeyboardIntent,
  getCanvasPresentationKeyboardIntent,
  setCanvasDataTransferText,
  stringifyCanvasRichClipboardPayload,
  readCanvasRichClipboardFromDataTransfer,
  scheduleCanvasAnimationFrameTask,
  writeCanvasClipboardText,
  writeCanvasRichClipboardPayload,
  applyCanvasClipboardCommandEffect,
  applyCanvasStandardDocumentEffect,
  executeCanvasClipboardCommand,
  executeCanvasStandardCommand,
  previewCanvasPointerLaserInteraction,
  previewCanvasPointerPanInteraction,
  resetCanvasViewport,
  runCanvasWheelViewport,
  startCanvasPointerLaserInteraction,
  startCanvasPointerPanInteraction,
  useCanvasAppStageElement,
  zoomCanvasViewport,
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
  CANVAS_STORY_IMPORT_JSON_KIND,
  CANVAS_STORY_IMPORT_JSON_MIME_TYPE,
  CANVAS_STORY_IMPORT_JSON_VERSION,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
  CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_STORY_CANVAS_SUITE_ID,
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE,
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS,
  EMPTY_CANVAS_STORY_IMPORT_HOST_STATE,
  commitCanvasStoryImportActionHostState,
  commitCanvasStoryImportActionHostUpdate,
  createCanvasAppFeaturePackProfile,
  createCanvasAppFeaturePackSuiteManifest,
  createCanvasStoryImportActionFromDataTransfer,
  createCanvasStoryImportComponentDefinitions,
  createCanvasStoryImportDataTransferActionResolver,
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
  getCanvasAppFeaturePackMarketplaceItemTarget,
  getCanvasAppFeaturePackMarketplaceItemTargetControl,
  getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
  getCanvasAppFeaturePackMarketplaceSelectionControlModel,
  getCanvasAppFeaturePackMarketplaceSelectionExecutionModel,
  getCanvasAppFeaturePackMarketplaceSelectionTargetControl,
  getCanvasAppFeaturePackMarketplaceSectionControlModel,
  getCanvasAppFeaturePackMarketplaceSectionControlModels,
  getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls,
  getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel,
  getCanvasAppFeaturePackMarketplaceSectionFacetItems,
  getCanvasAppFeaturePackMarketplaceSectionTargetControls,
  getCanvasAppFeaturePackMarketplaceTargetControl,
  getCanvasAppFeaturePackMarketplaceTargetItem,
  getCanvasAppFeaturePackMarketplaceTargetPrimaryAction,
  getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic,
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
  getCanvasStoryImportDataTransferActions,
  getCanvasStoryImportActionHostUpdate,
  getCanvasStoryImportActionItemsChange,
  getCanvasStoryImportHostAssemblyInput,
  hasCanvasStoryImportDataTransferAction,
  mergeCanvasStoryImportComponentDefinitions,
  parseCanvasStoryImportJSONPayload,
  readCanvasStoryImportDataTransfer,
  runCanvasStoryImportDataTransferHostStateImport,
  syncCanvasComponentItemsChange,
  transformCanvasAppItemsChange,
  commitCanvasAppHostItemsChange,
  createCanvasAppHostItemsChangeCommitter,
  getCanvasFindInputKeyboardIntent,
  getCanvasFloatingAnchorForBounds,
  getCanvasInlineEditKeyboardIntent,
  getCanvasContextMenuKeyboardIntent,
  getCanvasContextMenuPosition,
  getCanvasModalBackdropPointerIntent,
  getCanvasModalKeyboardIntent,
  measureCanvasTextBlocks,
  getCanvasPointerLocalGeometry,
  getCanvasPointerLocalPoint,
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
  type CanvasAppAssemblyInputSource,
  type CanvasAppAssemblyRequiredInputSource,
  type CanvasAppAssemblySource,
  type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateInput,
  type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionInput,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionSummary,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionInput,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionMissingResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult,
  type CanvasAppAssemblySourceValue,
  type CanvasAppPrebuiltAssemblySource,
  type CanvasAppCommitItemsChange,
  type CanvasAppHostItemsChangeCommitInput,
  type CanvasAppHostItemsChangeCommitResult,
  type CanvasAppHostItemsChangeCommitter,
  type CommitCanvasAppHostItemsChangeArgs,
  type CreateCanvasAppHostItemsChangeCommitterInput,
  type CanvasAppComponentLibrary,
  type CanvasAppComponentDefinition,
  type CanvasAppComponentTemplate,
  type CanvasAppComponentRendererStrategy,
  type CanvasComponentPaletteItem,
  type CanvasComponentPaletteProps,
  type CanvasComponentInspectorPanelModel,
  type CanvasFloatingAnchor,
  type CanvasFloatingAnchorForBoundsInput,
  type CanvasFloatingAnchorPlacement,
  type CanvasFloatingAnchorSize,
  type CanvasAppFeaturePack,
  type CanvasAppFeaturePackMarketplaceActionModel,
  type CanvasAppFeaturePackMarketplaceActionAssemblyInput,
  type CanvasAppFeaturePackMarketplaceActionAssemblyPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyActionInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanStatus,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanStatus,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyCommitPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
  type CanvasAppFeaturePackMarketplaceAssemblyItemInput,
  type CanvasAppFeaturePackMarketplaceAssemblyItemApplyTransactionInput,
  type CanvasAppFeaturePackMarketplaceAssemblyModel,
  type CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput,
  type CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
  type CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffect,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectInput,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionInput,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackMarketplacePackSectionFacetKind,
  type CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput,
  type CanvasAppFeaturePackMarketplacePackSectionSummary,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
  type CanvasAppFeaturePackMarketplaceSelectionControlModel,
  type CanvasAppFeaturePackMarketplaceSelectionControlModelInput,
  type CanvasAppFeaturePackMarketplaceSelectionExecutionModel,
  type CanvasAppFeaturePackMarketplaceSelectionFallbackReason,
  type CanvasAppFeaturePackMarketplaceSelectionTargetControlInput,
  type CanvasAppFeaturePackMarketplaceSectionControlModel,
  type CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel,
  type CanvasAppFeaturePackMarketplaceSectionSummary,
  type CanvasAppFeaturePackMarketplaceTargetControl,
  type CanvasAppFeaturePackMarketplaceTargetControlInput,
  type CanvasAppFeaturePackMarketplaceTargetControlStatus,
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
  type CanvasAppFeaturePackManifestOrphanedDataScopeId,
  type CanvasAppFeaturePackManifestOrphanedDataPolicy,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileRuntimeStatesInput,
  type CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
  type CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasStoryCanvasFeaturePackManifestsInput,
  type CanvasImagePasteReplaceRoute,
  type CanvasMediaObjectHyperlinkRoute,
  type CanvasTableImportTargetReplaceRoute,
  type CanvasRichTextPasteFormat,
  type CanvasRichTextPasteHeadingLevel,
  type CanvasRichTextPasteListType,
  type CanvasRichTextPasteParagraph,
  type CanvasRichTextPasteRun,
  type CanvasRichTextPasteSource,
  type CanvasTextPasteReplaceRoute,
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
  type CanvasAppStageElement,
  type CanvasAppStageElementController,
  type CanvasAppStageExternalOverlaySlot,
  type CanvasAppStageRect,
  type CanvasAppStageAdapter,
  type CanvasAppStageMount,
  type CanvasControlTargetInput,
  type CanvasClipboardCommand,
  type CanvasClipboardCommandEffect,
  type CanvasClipboardCommandEffectContext,
  type CanvasClipboardCommandEffectPlanContext,
  type CanvasClipboardCommandExecutionContext,
  type CanvasClipboardCommandExecutionResult,
  type CanvasClipboardEditingUpdate,
  type CanvasClipboardItemsChange,
  type CanvasStandardCommand,
  type CanvasStandardCommandDocumentEffect,
  type CanvasStandardCommandDocumentEffectContext,
  type CanvasStandardCommandEffectPlanContext,
  type CanvasStandardCommandExecutionContext,
  type CanvasStandardCommandItemsChange,
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
  type CanvasEraserStrokeHitTestStroke,
  type CanvasNextDrawingPointsInput,
  type CanvasMenuRovingActiveIndexInput,
  type CanvasMenuTriggerKeyboardIntentInput,
  type CanvasModalBackdropPointerIntentInput,
  type CanvasModalKeyboardIntentInput,
  type CanvasPointerClickMemory,
  type CanvasNextLaserTrailPointsInput,
  type CanvasPointerLocalGeometry,
  type CanvasPointerLocalGeometryInput,
  type CanvasPointerPanInteraction,
  type CanvasPointerLaserInteraction,
  type CanvasPointerLaserPreviewResult,
  type CanvasPointerLaserStartResult,
  type CanvasPointerPanPreviewResult,
  type CanvasPointerPanStartResult,
  type CanvasRichClipboardDataTransfer,
  type CanvasRichClipboardExtraItems,
  type CanvasRichClipboardHTMLInput,
  type CanvasRichClipboardReadResult,
  type CanvasResizeHandleDoubleClickIntentInput,
  type CanvasPointerTransformModifierInput,
  type CanvasPointerTransformModifierState,
  type CanvasSelectionListModifierInput,
  type CanvasSelectionListModifierState,
  type CanvasSelectionListSelectionMode,
  type CanvasViewportSetter,
  type CanvasWorkspaceStorageProvider,
  type CanvasWorldClientPointInput,
  type CanvasWorldClientPointStageElement,
  type CanvasCustomItem,
  type CreateCanvasAppStageElementInput,
  type CanvasEditableTextItem,
  type CanvasItem,
  type RunCanvasClipboardCommand,
} from '@interactive-os/canvas'
import * as CanvasFoundation from '@interactive-os/canvas/foundation'
import {
  CanvasApp,
  createCanvasAppComponentPresentationRenderers,
  createCanvasAppAssembly as createCanvasAppAssemblyFromApp,
  createCanvasAppCustomItemRenderers,
  previewCanvasPointerPanInteraction as previewCanvasPointerPanInteractionFromApp,
  startCanvasPointerPanInteraction as startCanvasPointerPanInteractionFromApp,
  isCanvasKeyboardToolIntent,
  runCanvasKeyboardToolIntent,
  type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult
    as CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResultFromApp,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult
    as CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResultFromApp,
  type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult
    as CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResultFromApp,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult
    as CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResultFromApp,
  type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult
    as CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResultFromApp,
  type CanvasAppFeaturePackMarketplaceSelectionControlModel
    as CanvasAppFeaturePackMarketplaceSelectionControlModelFromApp,
  type CanvasAppFeaturePackMarketplaceSelectionExecutionModel
    as CanvasAppFeaturePackMarketplaceSelectionExecutionModelFromApp,
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
  type CanvasCommandAdapter,
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
  escapeCanvasXmlText,
  formatCanvasSvgNumber,
} from '@interactive-os/canvas/renderer'
import {
  createCanvasSvgFreehandPathData as createCanvasSvgFreehandPathDataFromPrimitives,
  createCanvasSvgPathData as createCanvasSvgPathDataFromPrimitives,
} from '@interactive-os/canvas/renderer/svg-drawing-primitives'

describe('Canvas package consumer imports', () => {
  it('supports assembling a canvas app from package exports', async () => {
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
    type HostTransformItem = {
      id: string
      kind: 'ppt-shape'
      slideId: string
      x: number
    }
    const hostTransformItem: HostTransformItem = {
      id: 'ppt-transform-1',
      kind: 'ppt-shape',
      slideId: 'slide-1',
      x: 10,
    }
    const hostItemsChange: CanvasAppItemsChange<HostTransformItem> = {
      items: [hostTransformItem],
      type: 'replace-changed',
    }
    const hostItemsChangeTransformer:
      CanvasAppItemsChangeTransformer<HostTransformItem> = {
        id: 'host-transform',
        transform: ({ change }) =>
          change.type === 'replace-changed'
            ? {
                ...change,
                items: change.items.map((item) => ({
                  ...item,
                  x: item.x + 3,
                })),
              }
            : change,
      }
    const hostTransformContext:
      CanvasAppItemsChangeTransformContext<HostTransformItem> = {
        change: hostItemsChange,
        componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
        currentItems: [hostTransformItem],
      }
    const hostTransformedItemsChange =
      transformCanvasAppItemsChange<HostTransformItem>({
        ...hostTransformContext,
        transformers: [hostItemsChangeTransformer],
      })
    const hostFacadeTransformedItemsChange =
      CanvasAppFacade.transformCanvasAppItemsChange<HostTransformItem>({
        ...hostTransformContext,
        transformers: [hostItemsChangeTransformer],
      })
    const hostCommitCalls: CanvasAppItemsChange<HostTransformItem>[] = []
    let hostCommitCurrentItems = [hostTransformItem]
    const hostCommitterInput:
      CreateCanvasAppHostItemsChangeCommitterInput<HostTransformItem> = {
        commitItemsChange: (change) => {
          hostCommitCalls.push(change)

          return true
        },
        getCurrentItems: () => hostCommitCurrentItems,
        itemsChangeTransformers: [hostItemsChangeTransformer],
      }
    const hostItemsChangeCommitter:
      CanvasAppHostItemsChangeCommitter<HostTransformItem> =
        createCanvasAppHostItemsChangeCommitter(hostCommitterInput)
    const hostCommitInput:
      CanvasAppHostItemsChangeCommitInput<HostTransformItem> = {
        change: hostItemsChange,
      }
    const hostCommitResult:
      CanvasAppHostItemsChangeCommitResult<HostTransformItem> =
        hostItemsChangeCommitter.commit(hostCommitInput)
    const hostDirectCommitCalls: CanvasAppItemsChange<HostTransformItem>[] = []
    const hostDirectCommitArgs:
      CommitCanvasAppHostItemsChangeArgs<HostTransformItem> = {
        change: hostItemsChange,
        commitItemsChange: (change) => {
          hostDirectCommitCalls.push(change)

          return true
        },
        currentItems: hostCommitCurrentItems,
        itemsChangeTransformers: [hostItemsChangeTransformer],
      }
    const hostDirectCommitResult =
      commitCanvasAppHostItemsChange(hostDirectCommitArgs)
    const hostStandardCommitItemsChange:
      CanvasStandardCommandExecutionContext<HostTransformItem>['commitItemsChange'] =
        hostItemsChangeCommitter
    const hostClipboardCommitItemsChange:
      CanvasClipboardCommandExecutionContext<HostTransformItem>['commitItemsChange'] =
        hostItemsChangeCommitter
    hostCommitCurrentItems = [{
      ...hostTransformItem,
      id: 'ppt-transform-current',
      x: 20,
    }]
    const hostStandardCommitResult =
      hostStandardCommitItemsChange(hostItemsChange)
    const hostClipboardCommitResult =
      hostClipboardCommitItemsChange({
        afterItems: [{
          ...hostTransformItem,
          x: 30,
        }],
        beforeItems: [hostTransformItem],
        type: 'transform',
      })
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
    const panStartResult: CanvasPointerPanStartResult =
      startCanvasPointerPanInteraction({
        input: pointerInput,
        startScreen: { x: 10, y: 20 },
        viewport: { scale: 1, x: 100, y: 200 },
      })
    const panInteraction: CanvasPointerPanInteraction =
      panStartResult.interaction
    const panPreviewResult: CanvasPointerPanPreviewResult =
      previewCanvasPointerPanInteraction({
        config: createCanvasAffordanceConfig(),
        currentScreen: { x: 25, y: 15 },
        interaction: panInteraction,
      })
    const drawingPointsInput: CanvasNextDrawingPointsInput = {
      currentWorld: { x: 30, y: 40 },
      points: [{ x: 10, y: 20 }],
      shiftKey: false,
      startWorld: { x: 10, y: 20 },
    }
    const drawingPoints = getNextCanvasDrawingPoints(drawingPointsInput)
    const draftStroke = createCanvasDraftStroke('path', drawingPoints)
    const laserStartResult: CanvasPointerLaserStartResult =
      startCanvasPointerLaserInteraction({
        config: createCanvasAffordanceConfig(),
        input: pointerInput,
        pointerGesture: 'laser',
        startScreen: { x: 10, y: 20 },
        startWorld: { x: 30, y: 40 },
      })

    if (!laserStartResult || laserStartResult.kind !== 'interaction') {
      throw new Error('Expected package laser start to create an interaction')
    }

    const laserInteraction: CanvasPointerLaserInteraction =
      laserStartResult.interaction
    const laserPreviewResult: CanvasPointerLaserPreviewResult | null =
      previewCanvasPointerLaserInteraction({
        config: createCanvasAffordanceConfig(),
        currentScreen: { x: 20, y: 40 },
        currentWorld: { x: 50, y: 70 },
        interaction: laserInteraction,
      })
    const laserTrailPointsInput: CanvasNextLaserTrailPointsInput = {
      currentWorld: { x: 9, y: 0 },
      maxPoints: 2,
      pointDistance: 3,
      points: [{ x: 0, y: 0 }, { x: 3, y: 0 }],
    }

    expect(panStartResult.capturePointer).toBe(true)
    expect(startCanvasPointerPanInteractionFromApp({
      input: pointerInput,
      startScreen: { x: 10, y: 20 },
      viewport: { scale: 1, x: 100, y: 200 },
    })).toEqual(panStartResult)
    expect(panPreviewResult).toMatchObject({
      kind: 'preview',
      viewport: { scale: 1, x: 115, y: 195 },
    })
    expect(previewCanvasPointerPanInteractionFromApp({
      config: createCanvasAffordanceConfig({ gestures: { pan: false } }),
      currentScreen: { x: 25, y: 15 },
      interaction: panInteraction,
    })).toEqual({ kind: 'none' })
    expect(CanvasPackage.startCanvasPointerPanInteraction)
      .toBe(startCanvasPointerPanInteraction)
    expect(CanvasAppFacade.previewCanvasPointerPanInteraction)
      .toBe(previewCanvasPointerPanInteraction)
    expect(CANVAS_LASER_TRAIL_OVERLAY_MODEL)
      .toBe('canvas-laser-trail-overlay')
    expect(drawingPoints).toEqual([{ x: 10, y: 20 }, { x: 30, y: 40 }])
    expect(draftStroke).toEqual({
      kind: 'path',
      opacity: 1,
      points: drawingPoints,
      stroke: '#334155',
      strokeWidth: 3,
    })
    expect(laserStartResult.laserTrail).toEqual({
      points: [{ x: 30, y: 40 }],
    })
    expect(laserPreviewResult).toMatchObject({
      kind: 'preview',
      laserTrail: {
        points: [{ x: 30, y: 40 }, { x: 50, y: 70 }],
      },
    })
    expect(createCanvasLaserTrailOverlay([{ x: 1, y: 2 }])).toEqual({
      points: [{ x: 1, y: 2 }],
    })
    expect(getNextCanvasLaserTrailPoints(laserTrailPointsInput)).toEqual([
      { x: 3, y: 0 },
      { x: 9, y: 0 },
    ])
    expect(CanvasPackage.startCanvasPointerLaserInteraction)
      .toBe(startCanvasPointerLaserInteraction)
    expect(CanvasAppFacade.previewCanvasPointerLaserInteraction)
      .toBe(previewCanvasPointerLaserInteraction)
    expect(CanvasAppFacade.getNextCanvasDrawingPoints)
      .toBe(getNextCanvasDrawingPoints)
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
          orphanedDataScopeIds: ['smoke-partial-data'],
          orphanedDataPolicy: 'host-managed',
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
    const featurePackMarketplacePackSectionPrimaryActionDiagnosticModel:
      CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel =
        getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel(
          featurePackMarketplacePackSection,
        )
    const featurePackMarketplacePrimaryAction:
      CanvasAppFeaturePackMarketplacePrimaryAction =
        getCanvasAppFeaturePackMarketplacePrimaryAction(
          featurePackMarketplaceModel.packs.items[0]!,
        )
    const featurePackMarketplacePrimaryActionDiagnostic:
      CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic =
        getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(
          featurePackMarketplaceModel.packs.items[0]!,
        )
    const featurePackMarketplaceTargetControlInput:
      CanvasAppFeaturePackMarketplaceTargetControlInput = {
        model: featurePackMarketplaceModel,
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
      }
    const featurePackMarketplaceTargetControl:
      CanvasAppFeaturePackMarketplaceTargetControl =
        getCanvasAppFeaturePackMarketplaceTargetControl(
          featurePackMarketplaceTargetControlInput,
        )
    const featurePackMarketplaceItemTargetControl:
      CanvasAppFeaturePackMarketplaceTargetControl =
        getCanvasAppFeaturePackMarketplaceItemTargetControl(
          featurePackMarketplaceModel.packs.items[0]!,
        )
    const featurePackMarketplaceSectionTargetControls:
      readonly CanvasAppFeaturePackMarketplaceTargetControl[] =
        getCanvasAppFeaturePackMarketplaceSectionTargetControls(
          featurePackMarketplacePackSection,
        )
    const featurePackMarketplaceSectionControlModel:
      CanvasAppFeaturePackMarketplaceSectionControlModel =
        getCanvasAppFeaturePackMarketplaceSectionControlModel(
          featurePackMarketplacePackSection,
        )
    const featurePackMarketplaceSectionControlModels:
      readonly CanvasAppFeaturePackMarketplaceSectionControlModel[] =
        getCanvasAppFeaturePackMarketplaceSectionControlModels(
          featurePackMarketplaceModel,
        )
    const featurePackMarketplaceSectionSummary:
      CanvasAppFeaturePackMarketplaceSectionSummary =
        featurePackMarketplaceSectionControlModel.summary
    const featurePackMarketplaceReadyPackFacetControls:
      readonly CanvasAppFeaturePackMarketplaceTargetControl[] =
        getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls(
          featurePackMarketplaceReadyPackFacetInput,
        )
    const featurePackMarketplaceSelectionControlModelInput:
      CanvasAppFeaturePackMarketplaceSelectionControlModelInput = {
        facetKind: 'ready',
        model: featurePackMarketplaceModel,
        sectionKind: 'packs',
      }
    const featurePackMarketplaceSelectionControlModel:
      CanvasAppFeaturePackMarketplaceSelectionControlModel =
        getCanvasAppFeaturePackMarketplaceSelectionControlModel(
          featurePackMarketplaceSelectionControlModelInput,
        )
    const featurePackMarketplaceSelectionControlModelFromApp:
      CanvasAppFeaturePackMarketplaceSelectionControlModelFromApp =
        CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSelectionControlModel(
          featurePackMarketplaceSelectionControlModelInput,
        )
    const featurePackMarketplaceSelectionExecutionModel:
      CanvasAppFeaturePackMarketplaceSelectionExecutionModel =
        getCanvasAppFeaturePackMarketplaceSelectionExecutionModel(
          featurePackMarketplaceSelectionControlModel,
        )
    const featurePackMarketplaceSelectionExecutionModelFromApp:
      CanvasAppFeaturePackMarketplaceSelectionExecutionModelFromApp =
        CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSelectionExecutionModel(
          featurePackMarketplaceSelectionControlModelFromApp,
        )
    const featurePackMarketplaceSelectionFallbackReasons:
      readonly CanvasAppFeaturePackMarketplaceSelectionFallbackReason[] =
        getCanvasAppFeaturePackMarketplaceSelectionControlModel({
          facetKind: 'private',
          model: featurePackMarketplaceModel,
          sectionKind: 'profiles',
        }).fallbackReasons
    const featurePackMarketplaceSelectionTargetControlInput:
      CanvasAppFeaturePackMarketplaceSelectionTargetControlInput = {
        selection: featurePackMarketplaceSelectionControlModel,
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
      }
    const featurePackMarketplaceSelectionTargetControl:
      CanvasAppFeaturePackMarketplaceTargetControl | null =
        getCanvasAppFeaturePackMarketplaceSelectionTargetControl(
          featurePackMarketplaceSelectionTargetControlInput,
        )
    expect(featurePackMarketplaceSelectionExecutionModel.status)
      .toBe('ready')
    expect(featurePackMarketplaceSelectionExecutionModel.summary.readyControlCount)
      .toBeGreaterThan(0)
    expect(featurePackMarketplaceSelectionExecutionModel.readyTargets)
      .toContainEqual({
        featurePackId: 'smoke-partial-pack',
        kind: 'pack',
      })
    expect(featurePackMarketplaceSelectionExecutionModelFromApp.status)
      .toBe(featurePackMarketplaceSelectionExecutionModel.status)
    const featurePackMarketplaceMissingTargetControlStatus:
      CanvasAppFeaturePackMarketplaceTargetControlStatus =
        getCanvasAppFeaturePackMarketplaceTargetControl({
          model: featurePackMarketplaceModel,
          target: {
            featurePackId: 'missing-pack',
            kind: 'pack',
          },
        }).status
    const featurePackMarketplaceActionAssemblyInput:
      CanvasAppFeaturePackMarketplaceActionAssemblyInput = {
        action: featurePackMarketplacePrimaryAction,
        assemblyInput: {
          featurePackManifests: [partialUpdateManifest],
        },
      }
    const featurePackMarketplaceActionAssemblyPlan:
      CanvasAppFeaturePackMarketplaceActionAssemblyPlan =
        getCanvasAppFeaturePackMarketplaceActionAssemblyPlan(
          featurePackMarketplaceActionAssemblyInput,
        )
    const featurePackMarketplaceAppliedAssemblyInput =
      getCanvasAppFeaturePackMarketplaceActionAssemblyInput(
        featurePackMarketplaceActionAssemblyInput,
      )
    const featurePackMarketplaceAssemblyModel:
      CanvasAppFeaturePackMarketplaceAssemblyModel =
        getCanvasAppFeaturePackMarketplaceAssemblyModel({
          assemblyInput: {
            featurePackManifests: [partialUpdateManifest],
          },
          listings: [partialUpdateListing],
          profiles: [partialUpdateProfile],
          suiteManifests: [partialUpdateSuiteManifest],
        })
    const featurePackMarketplaceAssemblyActionInput:
      CanvasAppFeaturePackMarketplaceAssemblyActionInput = {
        action: featurePackMarketplacePrimaryAction,
        model: featurePackMarketplaceAssemblyModel,
      }
    const featurePackMarketplaceAssemblyItemInput:
      CanvasAppFeaturePackMarketplaceAssemblyItemInput = {
        item: featurePackMarketplaceAssemblyModel.marketplaceModel.packs
          .items[0]!,
        model: featurePackMarketplaceAssemblyModel,
      }
    const featurePackMarketplaceAssemblyTargetInput:
      CanvasAppFeaturePackMarketplaceAssemblyTargetInput = {
        model: featurePackMarketplaceAssemblyModel,
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
      }
    const featurePackMarketplaceAssemblyActionPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyActionPlan(
        featurePackMarketplaceAssemblyActionInput,
      )
    const featurePackMarketplaceAssemblyItemAction =
      getCanvasAppFeaturePackMarketplaceAssemblyItemAction(
        featurePackMarketplaceAssemblyItemInput,
      )
    const featurePackMarketplaceAssemblyTargetItem =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetItem(
        featurePackMarketplaceAssemblyTargetInput,
      )
    const featurePackMarketplaceAssemblyTargetAction =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(
        featurePackMarketplaceAssemblyTargetInput,
      )
    const featurePackMarketplaceAssemblyItemActionPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan(
        featurePackMarketplaceAssemblyItemInput,
      )
    const featurePackMarketplaceAssemblyTargetActionPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan(
        featurePackMarketplaceAssemblyTargetInput,
      )
    const featurePackMarketplaceAssemblyApplyPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyPlan =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(
          featurePackMarketplaceAssemblyActionInput,
        )
    const featurePackMarketplaceAssemblyItemApplyPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan(
        featurePackMarketplaceAssemblyItemInput,
      )
    const featurePackMarketplaceAssemblyTargetApplyPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan(
        featurePackMarketplaceAssemblyTargetInput,
      )
    const featurePackMarketplaceAssemblyApplyResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyResult =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyResult(
          featurePackMarketplaceAssemblyActionInput,
        )
    const featurePackMarketplaceAssemblyItemApplyResult =
      getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult(
        featurePackMarketplaceAssemblyItemInput,
      )
    const featurePackMarketplaceAssemblyTargetApplyResult =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult(
        featurePackMarketplaceAssemblyTargetInput,
      )
    const featurePackMarketplaceAssemblyApplyUpdateMode:
      CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode =
        featurePackMarketplaceAssemblyApplyPlan.updateMode
    const featurePackMarketplaceAssemblyUninstallDataPlan:
      CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan =
        featurePackMarketplaceAssemblyApplyPlan.uninstallDataPlan
    const featurePackMarketplaceAssemblyAppliedInput =
      getCanvasAppFeaturePackMarketplaceAssemblyActionInput(
        featurePackMarketplaceAssemblyActionInput,
      )
    const featurePackMarketplaceAssemblyItemAppliedInput =
      getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput(
        featurePackMarketplaceAssemblyItemInput,
      )
    const featurePackMarketplaceAssemblyTargetAppliedInput =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput(
        featurePackMarketplaceAssemblyTargetInput,
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
    const storyCanvasFeaturePackManifestsInput:
      CanvasStoryCanvasFeaturePackManifestsInput = {
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    }
    const storyPreviewManifest =
      createCanvasStoryPreviewItemsFeaturePackManifest(
        storyCanvasFeaturePackManifestsInput,
      )
    const storyCanvasFeaturePackManifests =
      createCanvasStoryCanvasFeaturePackManifests(
        storyCanvasFeaturePackManifestsInput,
      )
    const storyCanvasAssemblyInput =
      createCanvasStoryCanvasFeaturePackAssemblyInput({
        assemblyInput: {
          additionalFeaturePackManifests: storyCanvasFeaturePackManifests,
          featurePackStates: [
            {
              id: CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
              status: 'uninstalled',
            },
            {
              id: CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
              status: 'uninstalled',
            },
          ],
        },
        ...storyCanvasFeaturePackManifestsInput,
      })
    const storyCanvasMarketplaceAssemblyModel =
      getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel({
        assemblyInput: storyCanvasAssemblyInput,
        ...storyCanvasFeaturePackManifestsInput,
      })
    const storyCanvasMarketplaceAssemblySuiteItem =
      storyCanvasMarketplaceAssemblyModel.marketplaceModel.suites.items.find(
        (item) => item.suiteId === CANVAS_STORY_CANVAS_SUITE_ID,
      )
    const storyCanvasMarketplaceAssemblyPrimaryAction =
      storyCanvasMarketplaceAssemblySuiteItem
        ? getCanvasAppFeaturePackMarketplacePrimaryAction(
          storyCanvasMarketplaceAssemblySuiteItem,
        )
        : null
    const storyCanvasMarketplaceAssemblyTargetItem =
      getCanvasAppFeaturePackMarketplaceTargetItem({
        model: storyCanvasMarketplaceAssemblyModel.marketplaceModel,
        target: {
          kind: 'suite',
          suiteId: CANVAS_STORY_CANVAS_SUITE_ID,
        },
      })
    const storyCanvasMarketplaceAssemblyTargetPrimaryAction =
      getCanvasAppFeaturePackMarketplaceTargetPrimaryAction({
        model: storyCanvasMarketplaceAssemblyModel.marketplaceModel,
        target: {
          kind: 'suite',
          suiteId: CANVAS_STORY_CANVAS_SUITE_ID,
        },
      })
    const storyCanvasMarketplaceAssemblyTargetDiagnostic =
      getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic({
        model: storyCanvasMarketplaceAssemblyModel.marketplaceModel,
        target: {
          kind: 'suite',
          suiteId: CANVAS_STORY_CANVAS_SUITE_ID,
        },
      })
    const storyCanvasMarketplaceAssemblySuiteTargetInput:
      CanvasAppFeaturePackMarketplaceAssemblyTargetInput = {
        model: storyCanvasMarketplaceAssemblyModel,
        target: {
          kind: 'suite',
          suiteId: CANVAS_STORY_CANVAS_SUITE_ID,
        },
      }
    const storyCanvasMarketplaceAssemblySuiteTargetItem =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetItem(
        storyCanvasMarketplaceAssemblySuiteTargetInput,
      )
    const storyCanvasMarketplaceAssemblySuiteTargetAction =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(
        storyCanvasMarketplaceAssemblySuiteTargetInput,
      )
    const storyCanvasMarketplaceAssemblySuiteTargetApplyPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan(
        storyCanvasMarketplaceAssemblySuiteTargetInput,
      )
    const storyCanvasMarketplaceAssemblySuiteTargetApplyResult =
      getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult(
        storyCanvasMarketplaceAssemblySuiteTargetInput,
      )
    const viewManifestCategory: CanvasAppFeaturePackManifestCategory =
      viewManifest.category
    const featurePackManifestOrphanedDataPolicy:
      CanvasAppFeaturePackManifestOrphanedDataPolicy =
        partialUpdateManifest.lifecycle.orphanedDataPolicy
    const featurePackManifestOrphanedDataScopeId:
      CanvasAppFeaturePackManifestOrphanedDataScopeId =
        partialUpdateManifest.lifecycle.orphanedDataScopeIds[0]!
    const featurePackStateTransitionUninstallPolicyEntry:
      CanvasAppFeaturePackStateTransitionUninstallPolicyEntry = {
        featurePackId: 'smoke-partial-pack',
        orphanedDataScopeIds: [featurePackManifestOrphanedDataScopeId],
        orphanedDataPolicy: featurePackManifestOrphanedDataPolicy,
      }
    const featurePackProfileMarketplaceUninstallPolicyEntry:
      CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry = {
        featurePackId: 'smoke-partial-pack',
        orphanedDataScopeIds: [featurePackManifestOrphanedDataScopeId],
        orphanedDataPolicy: featurePackManifestOrphanedDataPolicy,
      }
    type SmokeUninstallCleanupEffect = Readonly<{
      featurePackIds: readonly string[]
      kind: 'cleanup-scope'
      scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
    }>
    type SmokeUninstallCleanupExecutionValue = Readonly<{
      cleaned: true
      scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
    }>
    const featurePackMarketplaceRemoveUninstallDataPlan:
      CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan = {
        entries: [{
          featurePackId: 'smoke-partial-pack',
          orphanedDataScopeIds: [featurePackManifestOrphanedDataScopeId],
          orphanedDataPolicy: 'remove',
        }],
        hostManagedFeaturePackIds: [],
        hostManagedScopeIds: [],
        preserveFeaturePackIds: [],
        preserveScopeIds: [],
        removeFeaturePackIds: ['smoke-partial-pack'],
        removeScopeIds: [featurePackManifestOrphanedDataScopeId],
        unscopedFeaturePackIds: [],
      }
    const featurePackMarketplaceUninstallCleanupScopeHandler:
      CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
        SmokeUninstallCleanupEffect
      > = {
        createEffect: ({ featurePackIds, scopeId }) => ({
          featurePackIds: [...featurePackIds],
          kind: 'cleanup-scope',
          scopeId,
        }),
        scopeId: featurePackManifestOrphanedDataScopeId,
      }
    const featurePackMarketplaceUninstallCleanupEffectPlanInput:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput<
        SmokeUninstallCleanupEffect
      > = {
        handlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        uninstallDataPlan: featurePackMarketplaceRemoveUninstallDataPlan,
      }
    const featurePackMarketplaceUninstallCleanupEffectPlan:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<
        SmokeUninstallCleanupEffect
      > =
        createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan(
          featurePackMarketplaceUninstallCleanupEffectPlanInput,
        )
    const featurePackMarketplaceUninstallCleanupEffect:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<
        SmokeUninstallCleanupEffect
      > = featurePackMarketplaceUninstallCleanupEffectPlan.effects[0]!
    const featurePackMarketplaceUninstallCleanupEffectInput:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectInput = {
        featurePackIds: ['smoke-partial-pack'],
        scopeId: featurePackManifestOrphanedDataScopeId,
        uninstallDataPlan: featurePackMarketplaceRemoveUninstallDataPlan,
      }
    const featurePackMarketplaceUninstallCleanupEffectPlanStatus:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus =
        featurePackMarketplaceUninstallCleanupEffectPlan.status
    const featurePackMarketplaceUninstallCleanupEffectExecutor:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = ({ scopeId }) => ({
        cleaned: true,
        scopeId,
      })
    const featurePackMarketplaceUninstallCleanupEffectPlanExecutionInput:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupEffectPlan: featurePackMarketplaceUninstallCleanupEffectPlan,
        executeEffect: featurePackMarketplaceUninstallCleanupEffectExecutor,
      }
    const featurePackMarketplaceUninstallCleanupEffectPlanExecutionResult:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan(
          featurePackMarketplaceUninstallCleanupEffectPlanExecutionInput,
        )
    const featurePackMarketplaceUninstallCleanupEffectPlanExecutionStatus:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus =
        featurePackMarketplaceUninstallCleanupEffectPlanExecutionResult.status
    const featurePackMarketplaceUninstallCleanupExecutionResult:
      CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        featurePackMarketplaceUninstallCleanupEffectPlanExecutionResult
          .results[0]!
    const featurePackMarketplaceUninstallCleanupEffectExecutionResult:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        featurePackMarketplaceUninstallCleanupEffectPlanExecutionResult
          .effectResults[0]!
    const featurePackMarketplaceUninstallCleanupEffectSucceededExecutionResult:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceUninstallCleanupEffectExecutionResult.status ===
            'succeeded'
          ? featurePackMarketplaceUninstallCleanupEffectExecutionResult
          : null
    const featurePackMarketplaceUninstallCleanupEffectFailedExecutionResult:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult<
        SmokeUninstallCleanupEffect
      > | null =
        featurePackMarketplaceUninstallCleanupEffectExecutionResult.status ===
            'failed'
          ? featurePackMarketplaceUninstallCleanupEffectExecutionResult
          : null
    const featurePackMarketplaceUninstallCleanupEffectSkippedExecutionResult:
      CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult
        | null =
          featurePackMarketplaceUninstallCleanupEffectPlanExecutionResult
            .skippedResults[0] ?? null
    const featurePackMarketplaceAssemblyApplyExecutionPlanInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput<
        SmokeUninstallCleanupEffect
      > = {
        applyResult: featurePackMarketplaceAssemblyApplyResult,
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
      }
    const featurePackMarketplaceAssemblyApplyExecutionPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<
        SmokeUninstallCleanupEffect
      > =
        createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan(
          featurePackMarketplaceAssemblyApplyExecutionPlanInput,
        )
    const featurePackMarketplaceAssemblyApplyExecutionPlanStatus:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanStatus =
        featurePackMarketplaceAssemblyApplyExecutionPlan.status
    const featurePackMarketplaceAssemblyApplyExecutionResultInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        executionPlan: featurePackMarketplaceAssemblyApplyExecutionPlan,
      }
    const featurePackMarketplaceAssemblyApplyExecutionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan(
          featurePackMarketplaceAssemblyApplyExecutionResultInput,
        )
    const featurePackMarketplaceAssemblyApplyExecutionResultStatus:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus =
        featurePackMarketplaceAssemblyApplyExecutionResult.status
    const featurePackMarketplaceAssemblyApplyExecutionSummaryInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        executionResult: featurePackMarketplaceAssemblyApplyExecutionResult,
      }
    const featurePackMarketplaceAssemblyApplyExecutionSummary:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary(
          featurePackMarketplaceAssemblyApplyExecutionSummaryInput,
        )
    const featurePackMarketplaceAssemblyApplyExecutionCleanupSummary:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary =
        featurePackMarketplaceAssemblyApplyExecutionSummary.cleanup
    const featurePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus =
        featurePackMarketplaceAssemblyApplyExecutionCleanupSummary.status
    const featurePackMarketplaceAssemblyApplyCommitPlanInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        executionResult: featurePackMarketplaceAssemblyApplyExecutionResult,
      }
    const featurePackMarketplaceAssemblyApplyCommitPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan(
          featurePackMarketplaceAssemblyApplyCommitPlanInput,
        )
    const featurePackMarketplaceAssemblyApplyCommitPlanStatus:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanStatus =
        featurePackMarketplaceAssemblyApplyCommitPlan.status
    const featurePackMarketplaceAssemblyApplyReadyCommitPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyReadyCommitPlan<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyCommitPlan.canCommit
          ? featurePackMarketplaceAssemblyApplyCommitPlan
          : null
    const featurePackMarketplaceAssemblyApplyCommitHoldPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyCommitPlan.canCommit
          ? null
          : featurePackMarketplaceAssemblyApplyCommitPlan
    const featurePackMarketplaceAssemblyApplyCommitResultInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        commitPlan: featurePackMarketplaceAssemblyApplyCommitPlan,
      }
    const featurePackMarketplaceAssemblyApplyCommitResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult(
          featurePackMarketplaceAssemblyApplyCommitResultInput,
        )
    const featurePackMarketplaceAssemblyApplyCommitResultStatus:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus =
        featurePackMarketplaceAssemblyApplyCommitResult.status
    const featurePackMarketplaceAssemblyApplyCommittedResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyCommitResult.committed
          ? featurePackMarketplaceAssemblyApplyCommitResult
          : null
    const featurePackMarketplaceAssemblyApplyHeldCommitResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyCommitResult.committed
          ? null
          : featurePackMarketplaceAssemblyApplyCommitResult
    const featurePackMarketplaceAssemblyApplyRuntimeStatePatchInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        commitResult: featurePackMarketplaceAssemblyApplyCommitResult,
      }
    const featurePackMarketplaceAssemblyApplyRuntimeStatePatch:
      CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch(
          featurePackMarketplaceAssemblyApplyRuntimeStatePatchInput,
        )
    const featurePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyRuntimeStatePatch.patched
          ? featurePackMarketplaceAssemblyApplyRuntimeStatePatch
          : null
    const featurePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyRuntimeStatePatch.patched
          ? null
          : featurePackMarketplaceAssemblyApplyRuntimeStatePatch
    const featurePackMarketplaceAssemblyApplyTransactionInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        action: featurePackMarketplacePrimaryAction,
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        model: featurePackMarketplaceAssemblyModel,
      }
    const featurePackMarketplaceAssemblyApplyTransactionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction(
          featurePackMarketplaceAssemblyApplyTransactionInput,
        )
    const featurePackMarketplaceAssemblyItemApplyTransactionInput:
      CanvasAppFeaturePackMarketplaceAssemblyItemApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        item: featurePackMarketplaceAssemblyItemInput.item,
        model: featurePackMarketplaceAssemblyModel,
      }
    const featurePackMarketplaceAssemblyItemApplyTransactionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction(
          featurePackMarketplaceAssemblyItemApplyTransactionInput,
        )
    const featurePackMarketplaceAssemblyTargetApplyTransactionInput:
      CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        model: featurePackMarketplaceAssemblyModel,
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
      }
    const featurePackMarketplaceAssemblyTargetApplyTransactionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction(
          featurePackMarketplaceAssemblyTargetApplyTransactionInput,
        )
    const featurePackMarketplaceAssemblyApplyTransactionBaseResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = featurePackMarketplaceAssemblyApplyTransactionResult
    const featurePackMarketplaceAssemblyApplyTransactionHostUpdate:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = featurePackMarketplaceAssemblyApplyTransactionResult.hostUpdate
    const featurePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyTransactionHostUpdate.ready
          ? featurePackMarketplaceAssemblyApplyTransactionHostUpdate
          : null
    const featurePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyTransactionHostUpdate.ready
          ? null
          : featurePackMarketplaceAssemblyApplyTransactionHostUpdate
    const featurePackMarketplaceAssemblyApplyHostUpdateInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        transactionResult: featurePackMarketplaceAssemblyApplyTransactionResult,
      }
    const featurePackMarketplaceAssemblyApplyHostUpdate:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate(
          featurePackMarketplaceAssemblyApplyHostUpdateInput,
        )
    const featurePackMarketplaceAssemblyApplyHostUpdateReadyResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyHostUpdate.ready
          ? featurePackMarketplaceAssemblyApplyHostUpdate
          : null
    const featurePackMarketplaceAssemblyApplyHostUpdateHeldResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyHostUpdate.ready
          ? null
          : featurePackMarketplaceAssemblyApplyHostUpdate
    const featurePackMarketplaceAssemblyApplyHostAssemblyInputUpdate:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate
        | null =
          featurePackMarketplaceAssemblyApplyHostUpdate.ready
            ? featurePackMarketplaceAssemblyApplyHostUpdate.update
            : null
    const featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplicationInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        hostUpdate: featurePackMarketplaceAssemblyApplyTransactionResult
          .hostUpdate,
      }
    const featurePackMarketplaceAssemblyApplyStandaloneHostUpdateApplicationInput:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        hostUpdate: featurePackMarketplaceAssemblyApplyHostUpdate,
      }
    const featurePackMarketplaceAssemblyApplyHostUpdateApplicationSource:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = featurePackMarketplaceAssemblyApplyTransactionResult.hostUpdate
    const featurePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyHostUpdateApplicationSource.ready
          ? featurePackMarketplaceAssemblyApplyHostUpdateApplicationSource
          : null
    const featurePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyHostUpdateApplicationSource.ready
          ? null
          : featurePackMarketplaceAssemblyApplyHostUpdateApplicationSource
    const featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate(
        featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplicationInput,
      )
    const featurePackMarketplaceAssemblyApplyStandaloneHostUpdateApplication:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        CanvasAppFacade
          .applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate(
            featurePackMarketplaceAssemblyApplyStandaloneHostUpdateApplicationInput,
          )
    const featurePackMarketplaceAssemblyApplyHostUpdateAppliedResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication.applied
          ? featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
          : null
    const featurePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication.applied
          ? null
          : featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
    const featurePackMarketplaceAssemblyApplyReadyExecutionPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan<
        SmokeUninstallCleanupEffect
      > | null =
        featurePackMarketplaceAssemblyApplyExecutionPlan.status === 'ready'
          ? featurePackMarketplaceAssemblyApplyExecutionPlan
          : null
    const featurePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan<
        SmokeUninstallCleanupEffect
      > | null =
        featurePackMarketplaceAssemblyApplyExecutionPlan.status ===
            'needs-cleanup-handler'
          ? featurePackMarketplaceAssemblyApplyExecutionPlan
          : null
    const featurePackMarketplaceAssemblyApplyBlockedExecutionPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan | null =
        featurePackMarketplaceAssemblyApplyExecutionPlan.status === 'blocked'
          ? featurePackMarketplaceAssemblyApplyExecutionPlan
          : null
    const featurePackMarketplaceAssemblyApplyCompletedExecutionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyExecutionResult.status ===
            'completed'
          ? featurePackMarketplaceAssemblyApplyExecutionResult
          : null
    const featurePackMarketplaceAssemblyApplyCleanupFailedExecutionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyExecutionResult.status ===
            'cleanup-failed'
          ? featurePackMarketplaceAssemblyApplyExecutionResult
          : null
    const featurePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        featurePackMarketplaceAssemblyApplyExecutionResult.status ===
            'needs-cleanup-handler'
          ? featurePackMarketplaceAssemblyApplyExecutionResult
          : null
    const featurePackMarketplaceAssemblyApplyBlockedExecutionResult:
      CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult
        | null =
          featurePackMarketplaceAssemblyApplyExecutionResult.status ===
              'blocked'
            ? featurePackMarketplaceAssemblyApplyExecutionResult
            : null

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
    const shellPrebuiltSource =
      shellAssemblyProps satisfies CanvasAppPrebuiltAssemblySource
    const shellInputSourceValue =
      shellInputProps satisfies CanvasAppAssemblySourceValue
    const shellMarketplaceHostUpdateSourceInput:
      CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        hostUpdate: featurePackMarketplaceAssemblyApplyTransactionResult
          .hostUpdate,
        source: shellPrebuiltSource,
      }
    const shellMarketplaceHostUpdateSourceResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate(
          shellMarketplaceHostUpdateSourceInput,
        )
    const shellSubpathMarketplaceHostUpdateSourceResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResultFromApp<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        CanvasAppFacade
          .applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate(
            shellMarketplaceHostUpdateSourceInput,
          )
    const shellMarketplaceTargetSourceTransactionInput:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        model: featurePackMarketplaceAssemblyModel,
        source: shellPrebuiltSource,
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
      }
    const shellMarketplaceTargetSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction(
          shellMarketplaceTargetSourceTransactionInput,
        )
    const shellSubpathMarketplaceTargetSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResultFromApp<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await CanvasAppFacade
          .executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction(
            shellMarketplaceTargetSourceTransactionInput,
          )
    const shellMarketplaceTargetControlSourceTransactionInput:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        control: featurePackMarketplaceTargetControl,
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        model: featurePackMarketplaceAssemblyModel,
        source: shellPrebuiltSource,
      }
    const shellMarketplaceTargetControlSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction(
          shellMarketplaceTargetControlSourceTransactionInput,
        )
    const shellSubpathMarketplaceTargetControlSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResultFromApp<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await CanvasAppFacade
          .executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction(
            shellMarketplaceTargetControlSourceTransactionInput,
          )
    const shellMarketplaceSelectionTargetControlSourceTransactionInput:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        model: featurePackMarketplaceAssemblyModel,
        selection: featurePackMarketplaceSelectionControlModel,
        source: shellPrebuiltSource,
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
      }
    const shellMarketplaceSelectionTargetControlSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction(
          shellMarketplaceSelectionTargetControlSourceTransactionInput,
        )
    const shellSubpathMarketplaceSelectionTargetControlSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResultFromApp<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await CanvasAppFacade
          .executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction(
            shellMarketplaceSelectionTargetControlSourceTransactionInput,
          )
    const shellMarketplaceSelectionExecutionSourceTransactionInput:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionInput<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > = {
        cleanupHandlers: [featurePackMarketplaceUninstallCleanupScopeHandler],
        executeCleanupEffect:
          featurePackMarketplaceUninstallCleanupEffectExecutor,
        execution: featurePackMarketplaceSelectionExecutionModel,
        model: featurePackMarketplaceAssemblyModel,
        source: shellPrebuiltSource,
      }
    const shellMarketplaceSelectionExecutionSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction(
          shellMarketplaceSelectionExecutionSourceTransactionInput,
        )
    const shellSubpathMarketplaceSelectionExecutionSourceTransactionResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResultFromApp<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > =
        await CanvasAppFacade
          .executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction(
            shellMarketplaceSelectionExecutionSourceTransactionInput,
          )
    const shellMarketplaceSelectionExecutionSourceTransactionStatus:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus =
        shellMarketplaceSelectionExecutionSourceTransactionResult.status
    const shellMarketplaceSelectionExecutionSourceTransactionSummary:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionSummary =
        shellMarketplaceSelectionExecutionSourceTransactionResult.summary
    const shellMarketplaceSelectionExecutionSourceTransactionStaleResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult | null =
        shellMarketplaceSelectionExecutionSourceTransactionResult
          .staleResults[0] ?? null
    const shellMarketplaceMissingSelectionTargetControlSourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction(
        {
          executeCleanupEffect:
            featurePackMarketplaceUninstallCleanupEffectExecutor,
          model: featurePackMarketplaceAssemblyModel,
          selection: getCanvasAppFeaturePackMarketplaceSelectionControlModel({
            facetKind: 'private',
            model: featurePackMarketplaceModel,
            sectionKind: 'packs',
          }),
          source: shellPrebuiltSource,
          target: {
            featurePackId: 'smoke-partial-pack',
            kind: 'pack',
          },
        },
      )

    if (
      shellMarketplaceMissingSelectionTargetControlSourceTransactionResult
        .status !== 'missing-selection-target'
    ) {
      throw new Error('Expected missing selection target source transaction')
    }

    const shellMarketplaceMissingSelectionTargetControlSourceTransactionMissingResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionMissingResult =
        shellMarketplaceMissingSelectionTargetControlSourceTransactionResult
    const shellMarketplaceMissingTargetControl =
      getCanvasAppFeaturePackMarketplaceTargetControl({
        model: featurePackMarketplaceModel,
        target: {
          featurePackId: 'missing-pack',
          kind: 'pack',
        },
      })
    const shellMarketplaceMissingTargetControlSourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction(
        {
          control: shellMarketplaceMissingTargetControl,
          executeCleanupEffect:
            featurePackMarketplaceUninstallCleanupEffectExecutor,
          model: featurePackMarketplaceAssemblyModel,
          source: shellPrebuiltSource,
        },
      )

    if (
      shellMarketplaceMissingTargetControlSourceTransactionResult.status !==
        'missing'
    ) {
      throw new Error('Expected missing target control source transaction')
    }

    const shellMarketplaceMissingTargetControlSourceTransactionMissingResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult =
        shellMarketplaceMissingTargetControlSourceTransactionResult
    const shellMarketplaceHostUpdateSourceAppliedResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        shellMarketplaceHostUpdateSourceResult.applied
          ? shellMarketplaceHostUpdateSourceResult
          : null
    const shellMarketplaceHostUpdateSourceHeldResult:
      CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
        SmokeUninstallCleanupEffect,
        SmokeUninstallCleanupExecutionValue
      > | null =
        shellMarketplaceHostUpdateSourceResult.applied
          ? null
          : shellMarketplaceHostUpdateSourceResult
    const shellMarketplaceHostUpdateInputSource:
      CanvasAppAssemblyRequiredInputSource | null =
        shellMarketplaceHostUpdateSourceResult.applied
          ? shellMarketplaceHostUpdateSourceResult.source
          : null
    const shellOptionalInputSource:
      CanvasAppAssemblyInputSource = shellInputSourceValue

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
    expect(shellOptionalInputSource.assemblyInput).toBe(
      shellInputProps.assemblyInput,
    )
    expect(shellMarketplaceHostUpdateSourceResult.status).toBe('applied')
    expect(shellMarketplaceHostUpdateSourceResult.applied).toBe(true)
    expect(shellMarketplaceHostUpdateSourceAppliedResult)
      .toBe(shellMarketplaceHostUpdateSourceResult)
    expect(shellMarketplaceHostUpdateSourceHeldResult).toBeNull()
    expect(shellMarketplaceHostUpdateSourceResult.application.hostUpdate)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult.hostUpdate)
    expect(shellMarketplaceHostUpdateInputSource?.assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(shellMarketplaceHostUpdateSourceResult.source)
      .toEqual({
        assemblyInput: featurePackMarketplaceAssemblyAppliedInput,
      })
    expect(shellSubpathMarketplaceHostUpdateSourceResult.source)
      .toEqual(shellMarketplaceHostUpdateSourceResult.source)
    expect(CanvasPackage.applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate)
      .toBe(applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate)
    expect(CanvasAppFacade.applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate)
      .toBe(applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate)
    expect(shellMarketplaceTargetSourceTransactionResult.status)
      .toBe('applied')
    expect(shellMarketplaceTargetSourceTransactionResult.applied).toBe(true)
    expect(shellMarketplaceTargetSourceTransactionResult.transactionResult.action)
      .toBe(featurePackMarketplaceAssemblyTargetAction)
    expect(shellMarketplaceTargetSourceTransactionResult.source)
      .toEqual(shellMarketplaceHostUpdateSourceResult.source)
    expect(shellMarketplaceTargetSourceTransactionResult.sourceResult.source)
      .toEqual(shellMarketplaceHostUpdateSourceResult.source)
    expect(shellMarketplaceTargetSourceTransactionResult.hostUpdate.update)
      .toEqual(featurePackMarketplaceAssemblyApplyTransactionResult
        .hostUpdate.update)
    expect(shellSubpathMarketplaceTargetSourceTransactionResult.source)
      .toEqual(shellMarketplaceTargetSourceTransactionResult.source)
    expect(shellMarketplaceTargetControlSourceTransactionResult.status)
      .toBe('applied')
    expect(shellMarketplaceTargetControlSourceTransactionResult.applied)
      .toBe(true)
    expect(shellMarketplaceTargetControlSourceTransactionResult.actionKind)
      .toBe('disable')
    expect(shellMarketplaceTargetControlSourceTransactionResult.transactionResult)
      .toMatchObject({
        status: 'committed',
      })
    expect(shellMarketplaceTargetControlSourceTransactionResult.source)
      .toEqual(shellMarketplaceTargetSourceTransactionResult.source)
    expect(shellSubpathMarketplaceTargetControlSourceTransactionResult.source)
      .toEqual(shellMarketplaceTargetControlSourceTransactionResult.source)
    expect(shellMarketplaceSelectionTargetControlSourceTransactionResult.status)
      .toBe('applied')
    expect(shellMarketplaceSelectionTargetControlSourceTransactionResult.applied)
      .toBe(true)
    expect(shellMarketplaceSelectionTargetControlSourceTransactionResult.actionKind)
      .toBe('disable')
    expect(shellMarketplaceSelectionTargetControlSourceTransactionResult.source)
      .toEqual(shellMarketplaceTargetControlSourceTransactionResult.source)
    expect(shellSubpathMarketplaceSelectionTargetControlSourceTransactionResult.source)
      .toEqual(shellMarketplaceSelectionTargetControlSourceTransactionResult.source)
    expect(shellMarketplaceSelectionExecutionSourceTransactionStatus)
      .toBe('applied')
    expect(shellMarketplaceSelectionExecutionSourceTransactionSummary)
      .toMatchObject({
        appliedResultCount: 1,
        attemptedControlCount: 1,
        readyControlCount: 1,
        unappliedResultCount: 0,
      })
    expect(shellMarketplaceSelectionExecutionSourceTransactionStaleResult)
      .toBeNull()
    expect(shellMarketplaceSelectionExecutionSourceTransactionResult.source)
      .toEqual(shellMarketplaceSelectionTargetControlSourceTransactionResult
        .source)
    expect(shellSubpathMarketplaceSelectionExecutionSourceTransactionResult
      .source)
      .toEqual(shellMarketplaceSelectionExecutionSourceTransactionResult
        .source)
    expect(CanvasPackage.executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction)
    expect(CanvasAppAuthoring.executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction)
    expect(shellMarketplaceMissingSelectionTargetControlSourceTransactionMissingResult)
      .toMatchObject({
        actionKind: null,
        applied: false,
        control: null,
        holdReason: 'missing-selection-target',
        hostUpdate: null,
        source: shellPrebuiltSource,
        sourceResult: null,
        status: 'missing-selection-target',
        target: {
          featurePackId: 'smoke-partial-pack',
          kind: 'pack',
        },
        transactionResult: null,
        update: null,
        updateMode: 'blocked',
      })
    expect(shellMarketplaceMissingTargetControlSourceTransactionMissingResult)
      .toMatchObject({
        actionKind: null,
        applied: false,
        control: shellMarketplaceMissingTargetControl,
        holdReason: 'missing-target',
        hostUpdate: null,
        source: shellPrebuiltSource,
        sourceResult: null,
        status: 'missing',
        target: {
          featurePackId: 'missing-pack',
          kind: 'pack',
        },
        transactionResult: null,
        update: null,
        updateMode: 'blocked',
      })
    expect(CanvasPackage.executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction)
    expect(CanvasPackage.executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction)
    expect(CanvasPackage.executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction)
      .toBe(executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction)
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

    if (hostTransformedItemsChange.type !== 'replace-changed') {
      throw new Error('Expected root host transformer replace-changed result')
    }

    if (hostFacadeTransformedItemsChange.type !== 'replace-changed') {
      throw new Error('Expected app host transformer replace-changed result')
    }

    if (hostCommitResult.transformedChange.type !== 'replace-changed') {
      throw new Error('Expected host committer replace-changed result')
    }

    if (hostDirectCommitResult.transformedChange.type !== 'replace-changed') {
      throw new Error('Expected direct host commit replace-changed result')
    }

    expect(hostTransformedItemsChange.items[0]?.slideId).toBe('slide-1')
    expect(hostTransformedItemsChange.items[0]?.x).toBe(13)
    expect(hostFacadeTransformedItemsChange.items[0]?.kind)
      .toBe('ppt-shape')
    expect(hostCommitResult.committed).toBe(true)
    expect(hostCommitResult.currentItems).toEqual([hostTransformItem])
    expect(hostCommitResult.transformedChange.items[0]?.x).toBe(13)
    expect(hostDirectCommitResult.committed).toBe(true)
    expect(hostDirectCommitCalls).toEqual([{
      items: [{
        ...hostTransformItem,
        x: 13,
      }],
      type: 'replace-changed',
    }])
    expect(hostStandardCommitResult).toBe(true)
    expect(hostClipboardCommitResult).toBe(true)
    expect(hostCommitCalls).toEqual([
      {
        items: [{
          ...hostTransformItem,
          x: 13,
        }],
        type: 'replace-changed',
      },
      {
        items: [{
          ...hostTransformItem,
          x: 13,
        }],
        type: 'replace-changed',
      },
      {
        afterItems: [{
          ...hostTransformItem,
          x: 30,
        }],
        beforeItems: [hostTransformItem],
        type: 'transform',
      },
    ])
    expect(CanvasPackage.commitCanvasAppHostItemsChange)
      .toBe(commitCanvasAppHostItemsChange)
    expect(CanvasPackage.createCanvasAppHostItemsChangeCommitter)
      .toBe(createCanvasAppHostItemsChangeCommitter)
    expect(CanvasAppFacade.commitCanvasAppHostItemsChange)
      .toBe(commitCanvasAppHostItemsChange)
    expect(CanvasAppFacade.createCanvasAppHostItemsChangeCommitter)
      .toBe(createCanvasAppHostItemsChangeCommitter)
    expect(CanvasAppAuthoring.commitCanvasAppHostItemsChange)
      .toBe(commitCanvasAppHostItemsChange)
    expect(CanvasAppAuthoring.createCanvasAppHostItemsChangeCommitter)
      .toBe(createCanvasAppHostItemsChangeCommitter)
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
    const packageStoryImportInput = {
      groups: [{
        h: 96,
        id: 'consumer-action-widget',
        label: 'ConsumerActionWidget',
        source: {
          exportName: 'ConsumerActionWidget',
          importPath: 'src/widgets/consumer-action-widget',
          layer: 'widgets',
        },
        stories: [{
          h: 80,
          id: 'consumer-action-widget-default',
          title: 'Default',
          w: 144,
          x: 12,
          y: 16,
        }],
        w: 180,
        x: 8,
        y: 10,
      }],
    }
    const packageStoryDataTransfer = {
      getData: (format: string) => {
        if (format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE) {
          return '{'
        }

        if (format === 'application/json') {
          return JSON.stringify({
            input: packageStoryImportInput,
            kind: CANVAS_STORY_IMPORT_JSON_KIND,
            version: CANVAS_STORY_IMPORT_JSON_VERSION,
          })
        }

        return ''
      },
    }
    const packageStoryAction: CanvasStoryImportAction | null =
      createCanvasStoryImportActionFromDataTransfer({
        dataTransfer: packageStoryDataTransfer,
      })
    const packageStoryReadResult = readCanvasStoryImportDataTransfer({
      dataTransfer: packageStoryDataTransfer,
    })

    expect(
      parseCanvasStoryImportJSONPayload(packageStoryImportInput).groups[0]?.id,
    ).toBe('consumer-action-widget')
    expect(packageStoryReadResult?.value.groups[0]?.id)
      .toBe('consumer-action-widget')
    expect(packageStoryAction).toMatchObject({
      kind: 'story-import',
      readResult: {
        candidateIndex: 1,
        mimeType: 'application/json',
        source: 'application-json',
      },
    })
    expect(packageStoryAction?.items.map((item) => item.id)).toEqual([
      'group-consumer-action-widget',
      'story-consumer-action-widget-default',
    ])
    expect(packageStoryAction?.componentDefinitions[0]?.source).toEqual({
      exportName: 'ConsumerActionWidget',
      importPath: 'src/widgets/consumer-action-widget',
      layer: 'widgets',
    })
    if (!packageStoryAction) {
      throw new Error('Expected package story import action')
    }

    const packageStoryUpdate = getCanvasStoryImportActionHostUpdate({
      action: packageStoryAction,
      currentComponentDefinitions: [{
        id: 'story-import-consumer-action-widget',
        instances: [{
          label: 'Previous',
          slots: {
            root: 'story-previous',
          },
        }],
        label: 'PreviousWidget',
      }],
    })
    const packageStoryMerge = mergeCanvasStoryImportComponentDefinitions({
      currentComponentDefinitions: [],
      importedComponentDefinitions: packageStoryAction.componentDefinitions,
    })
    const packageStoryCommittedUpdates:
      ReturnType<typeof getCanvasStoryImportActionHostUpdate>[] = []
    const packageStoryCommitResult = commitCanvasStoryImportActionHostUpdate({
      action: packageStoryAction,
      commitHostUpdate: (update) => {
        packageStoryCommittedUpdates.push(update)

        return true
      },
    })
    const packageStoryRunResult =
      CanvasAppFacade.runCanvasDataTransferImportActionPlan({
        actions: [packageStoryAction],
        runAction: (action) =>
          commitCanvasStoryImportActionHostUpdate({
            action,
            commitHostUpdate: () => true,
          }).committed,
      })
    let packageStoryImportState = EMPTY_CANVAS_STORY_IMPORT_HOST_STATE
    const packageStoryHostStateResult =
      runCanvasStoryImportDataTransferHostStateImport({
        baseComponentDefinitions: [],
        commitImportState: (state) => {
          packageStoryImportState = state
        },
        currentImportState: packageStoryImportState,
        currentItems: [],
        dataTransfer: packageStoryDataTransfer,
        scope: 'clipboard-paste',
      })
    const packageStoryAssemblyInput = getCanvasStoryImportHostAssemblyInput({
      baseComponentDefinitions: [],
      baseItems: [],
      importState: packageStoryImportState,
    })
    const packageStoryHostStateDuplicateResult =
      commitCanvasStoryImportActionHostState({
        action: packageStoryAction,
        commitImportState: (state) => {
          packageStoryImportState = state
        },
        currentImportState: packageStoryImportState,
        currentItems: packageStoryAssemblyInput.items,
      })

    expect(getCanvasStoryImportActionItemsChange({
      action: packageStoryAction,
    }).type).toBe('add')
    expect(packageStoryUpdate.itemsChange.items.map((item) => item.id))
      .toEqual([
        'group-consumer-action-widget',
        'story-consumer-action-widget-default',
      ])
    expect(packageStoryUpdate.selection.after).toEqual([
      'group-consumer-action-widget',
      'story-consumer-action-widget-default',
    ])
    expect(packageStoryUpdate.replacedComponentDefinitionIds).toEqual([
      'story-import-consumer-action-widget',
    ])
    expect(packageStoryMerge.addedComponentDefinitionIds).toEqual([
      'story-import-consumer-action-widget',
    ])
    expect(packageStoryCommitResult).toMatchObject({
      action: packageStoryAction,
      committed: true,
      status: 'committed',
    })
    expect(packageStoryCommittedUpdates[0]?.itemsChange.items.map((item) =>
      item.id
    )).toEqual([
      'group-consumer-action-widget',
      'story-consumer-action-widget-default',
    ])
    expect(packageStoryRunResult).toMatchObject({
      consumed: true,
      consumedAction: packageStoryAction,
      consumedActionIndex: 0,
    })
    expect(packageStoryHostStateResult).toMatchObject({
      attemptedActionCount: 1,
      consumed: true,
      consumedActionIndex: 0,
    })
    expect(packageStoryAssemblyInput.items.map((item) => item.id)).toEqual([
      'group-consumer-action-widget',
      'story-consumer-action-widget-default',
    ])
    expect(packageStoryAssemblyInput.componentDefinitions.map((definition) =>
      definition.id
    )).toEqual(['story-import-consumer-action-widget'])
    expect(packageStoryHostStateDuplicateResult).toMatchObject({
      committed: false,
      holdReason: 'host-update-not-committed',
      status: 'held',
    })
    expect(hasCanvasStoryImportDataTransferAction({
      dataTransfer: packageStoryDataTransfer,
      scope: 'clipboard-paste',
    })).toBe(true)
    expect(getCanvasStoryImportDataTransferActions({
      dataTransfer: packageStoryDataTransfer,
      scope: 'clipboard-paste',
    })).toHaveLength(1)
    expect(createCanvasStoryImportDataTransferActionResolver({
      scope: 'clipboard-paste',
    }).supportedFormats).toContain(CANVAS_STORY_IMPORT_JSON_MIME_TYPE)
    expect(CanvasPackage.createCanvasStoryImportActionFromDataTransfer)
      .toBe(createCanvasStoryImportActionFromDataTransfer)
    expect(CanvasAppFacade.createCanvasStoryImportActionFromDataTransfer)
      .toBe(createCanvasStoryImportActionFromDataTransfer)
    expect(CanvasAppAuthoring.createCanvasStoryImportActionFromDataTransfer)
      .toBe(createCanvasStoryImportActionFromDataTransfer)
    expect(CanvasPackage.createCanvasStoryImportDataTransferActionResolver)
      .toBe(createCanvasStoryImportDataTransferActionResolver)
    expect(CanvasAppFacade.createCanvasStoryImportDataTransferActionResolver)
      .toBe(createCanvasStoryImportDataTransferActionResolver)
    expect(CanvasAppAuthoring.createCanvasStoryImportDataTransferActionResolver)
      .toBe(createCanvasStoryImportDataTransferActionResolver)
    expect(CanvasPackage.EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
      .toBe(EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
    expect(CanvasAppFacade.EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
      .toBe(EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
    expect(CanvasAppAuthoring.EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
      .toBe(EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
    expect(CanvasPackage.commitCanvasStoryImportActionHostState)
      .toBe(commitCanvasStoryImportActionHostState)
    expect(CanvasAppFacade.commitCanvasStoryImportActionHostState)
      .toBe(commitCanvasStoryImportActionHostState)
    expect(CanvasAppAuthoring.commitCanvasStoryImportActionHostState)
      .toBe(commitCanvasStoryImportActionHostState)
    expect(CanvasPackage.commitCanvasStoryImportActionHostUpdate)
      .toBe(commitCanvasStoryImportActionHostUpdate)
    expect(CanvasAppFacade.commitCanvasStoryImportActionHostUpdate)
      .toBe(commitCanvasStoryImportActionHostUpdate)
    expect(CanvasAppAuthoring.commitCanvasStoryImportActionHostUpdate)
      .toBe(commitCanvasStoryImportActionHostUpdate)
    expect(CanvasPackage.getCanvasStoryImportActionHostUpdate)
      .toBe(getCanvasStoryImportActionHostUpdate)
    expect(CanvasAppFacade.getCanvasStoryImportActionHostUpdate)
      .toBe(getCanvasStoryImportActionHostUpdate)
    expect(CanvasAppAuthoring.getCanvasStoryImportActionHostUpdate)
      .toBe(getCanvasStoryImportActionHostUpdate)
    expect(CanvasPackage.getCanvasStoryImportDataTransferActions)
      .toBe(getCanvasStoryImportDataTransferActions)
    expect(CanvasAppFacade.getCanvasStoryImportDataTransferActions)
      .toBe(getCanvasStoryImportDataTransferActions)
    expect(CanvasAppAuthoring.getCanvasStoryImportDataTransferActions)
      .toBe(getCanvasStoryImportDataTransferActions)
    expect(CanvasPackage.getCanvasStoryImportHostAssemblyInput)
      .toBe(getCanvasStoryImportHostAssemblyInput)
    expect(CanvasAppFacade.getCanvasStoryImportHostAssemblyInput)
      .toBe(getCanvasStoryImportHostAssemblyInput)
    expect(CanvasAppAuthoring.getCanvasStoryImportHostAssemblyInput)
      .toBe(getCanvasStoryImportHostAssemblyInput)
    expect(CanvasPackage.hasCanvasStoryImportDataTransferAction)
      .toBe(hasCanvasStoryImportDataTransferAction)
    expect(CanvasAppFacade.hasCanvasStoryImportDataTransferAction)
      .toBe(hasCanvasStoryImportDataTransferAction)
    expect(CanvasAppAuthoring.hasCanvasStoryImportDataTransferAction)
      .toBe(hasCanvasStoryImportDataTransferAction)
    expect(CanvasPackage.runCanvasStoryImportDataTransferHostStateImport)
      .toBe(runCanvasStoryImportDataTransferHostStateImport)
    expect(CanvasAppFacade.runCanvasStoryImportDataTransferHostStateImport)
      .toBe(runCanvasStoryImportDataTransferHostStateImport)
    expect(CanvasAppAuthoring.runCanvasStoryImportDataTransferHostStateImport)
      .toBe(runCanvasStoryImportDataTransferHostStateImport)
    expect(CanvasPackage.getCanvasStoryImportActionItemsChange)
      .toBe(getCanvasStoryImportActionItemsChange)
    expect(CanvasAppFacade.getCanvasStoryImportActionItemsChange)
      .toBe(getCanvasStoryImportActionItemsChange)
    expect(CanvasAppAuthoring.getCanvasStoryImportActionItemsChange)
      .toBe(getCanvasStoryImportActionItemsChange)
    expect(CanvasPackage.mergeCanvasStoryImportComponentDefinitions)
      .toBe(mergeCanvasStoryImportComponentDefinitions)
    expect(CanvasAppFacade.mergeCanvasStoryImportComponentDefinitions)
      .toBe(mergeCanvasStoryImportComponentDefinitions)
    expect(CanvasAppAuthoring.mergeCanvasStoryImportComponentDefinitions)
      .toBe(mergeCanvasStoryImportComponentDefinitions)
    expect(CanvasPackage.parseCanvasStoryImportJSONPayload)
      .toBe(parseCanvasStoryImportJSONPayload)
    expect(CanvasAppFacade.parseCanvasStoryImportJSONPayload)
      .toBe(parseCanvasStoryImportJSONPayload)
    expect(CanvasAppAuthoring.parseCanvasStoryImportJSONPayload)
      .toBe(parseCanvasStoryImportJSONPayload)
    expect(CanvasPackage.readCanvasStoryImportDataTransfer)
      .toBe(readCanvasStoryImportDataTransfer)
    expect(CanvasAppFacade.readCanvasStoryImportDataTransfer)
      .toBe(readCanvasStoryImportDataTransfer)
    expect(CanvasAppAuthoring.readCanvasStoryImportDataTransfer)
      .toBe(readCanvasStoryImportDataTransfer)
    expect(storyPreviewManifest.extensionFeaturePack?.id)
      .toBe('story-preview-items')
    expect(storyCanvasFeaturePackManifests.map((manifest) => manifest.id))
      .toEqual([
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ])
    expect(storyCanvasAssemblyInput.additionalFeaturePackManifests?.map(
      (manifest) => manifest.id,
    )).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
    expect(storyCanvasMarketplaceAssemblySuiteItem).toMatchObject({
      missingFeaturePackIds: [],
      primaryActionKind: 'install',
      status: 'uninstalled',
    })
    expect(storyCanvasMarketplaceAssemblyPrimaryAction).toMatchObject({
      changedFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ],
      kind: 'install',
      ready: true,
      status: 'ready',
    })
    expect(storyCanvasMarketplaceAssemblyTargetItem)
      .toBe(storyCanvasMarketplaceAssemblySuiteItem)
    expect(storyCanvasMarketplaceAssemblyTargetPrimaryAction)
      .toBe(storyCanvasMarketplaceAssemblyPrimaryAction)
    expect(storyCanvasMarketplaceAssemblyTargetDiagnostic).toMatchObject({
      action: storyCanvasMarketplaceAssemblyPrimaryAction,
      actionKind: 'install',
      ready: true,
      status: 'ready',
    })
    expect(storyCanvasMarketplaceAssemblySuiteTargetItem)
      .toBe(storyCanvasMarketplaceAssemblySuiteItem)
    expect(storyCanvasMarketplaceAssemblySuiteTargetAction)
      .toBe(storyCanvasMarketplaceAssemblyPrimaryAction)
    expect(storyCanvasMarketplaceAssemblySuiteTargetApplyPlan).toMatchObject({
      actionKind: 'install',
      changedFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ],
      status: 'ready',
      updateMode: 'full-rebuild',
    })
    expect(storyCanvasMarketplaceAssemblySuiteTargetApplyResult)
      .toMatchObject({
        action: storyCanvasMarketplaceAssemblyPrimaryAction,
        currentModel: storyCanvasMarketplaceAssemblyModel,
        status: 'ready',
        updateMode: 'full-rebuild',
      })
    expect(CanvasPackage.createCanvasStoryCanvasFeaturePackAssemblyInput)
      .toBe(createCanvasStoryCanvasFeaturePackAssemblyInput)
    expect(CanvasAppFacade.createCanvasStoryCanvasFeaturePackAssemblyInput)
      .toBe(createCanvasStoryCanvasFeaturePackAssemblyInput)
    expect(CanvasAppAuthoring.createCanvasStoryCanvasFeaturePackAssemblyInput)
      .toBe(createCanvasStoryCanvasFeaturePackAssemblyInput)
    expect(CanvasPackage.getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel)
      .toBe(getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel)
    expect(CanvasAppFacade.getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel)
      .toBe(getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel)
    expect(CanvasAppAuthoring.getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel)
      .toBe(getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel)
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
      primaryBlockedItemCount: 0,
      primaryReadyItemCount: 1,
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
    expect(featurePackMarketplacePackSectionPrimaryActionDiagnosticModel.all
      .map((diagnostic) => diagnostic.actionKind)).toEqual(['disable'])
    expect(featurePackMarketplacePackSectionPrimaryActionDiagnosticModel.ready
      .map((diagnostic) => diagnostic.changedFeaturePackIds)).toEqual([
        ['smoke-partial-pack'],
      ])
    expect(featurePackMarketplacePackSectionPrimaryActionDiagnosticModel.blocked)
      .toEqual([])
    expect(featurePackMarketplacePrimaryAction.kind).toBe('disable')
    expect(featurePackMarketplacePrimaryAction.installOptions).toEqual({
      featurePackStates: [{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }],
    })
    expect(featurePackMarketplacePrimaryActionDiagnostic.action)
      .toBe(featurePackMarketplacePrimaryAction)
    expect(featurePackMarketplacePrimaryActionDiagnostic).toMatchObject({
      actionKind: 'disable',
      applicable: true,
      blockedReasonCount: 0,
      changedFeaturePackIds: ['smoke-partial-pack'],
      marketplaceBlockedReasonCount: 0,
      partialUpdateSurfaceIds: ['overlay'],
      ready: true,
      status: 'ready',
      totalBlockedReasonCount: 0,
      uninstallPolicyEntries: [],
    })
    expect(getCanvasAppFeaturePackMarketplaceItemTarget(
      featurePackMarketplaceModel.packs.items[0]!,
    )).toEqual({
      featurePackId: 'smoke-partial-pack',
      kind: 'pack',
    })
    expect(featurePackMarketplaceTargetControl).toMatchObject({
      action: featurePackMarketplacePrimaryAction,
      actionKind: 'disable',
      active: true,
      disabled: false,
      installed: true,
      label: 'Partial pack',
      ready: true,
      status: 'ready',
      target: {
        featurePackId: 'smoke-partial-pack',
        kind: 'pack',
      },
      totalBlockedReasonCount: 0,
    })
    expect(featurePackMarketplaceItemTargetControl)
      .toEqual(featurePackMarketplaceTargetControl)
    expect(featurePackMarketplaceSectionTargetControls.map((control) =>
      control.target
    )).toEqual([{
      featurePackId: 'smoke-partial-pack',
      kind: 'pack',
    }])
    expect(featurePackMarketplaceSectionControlModel).toMatchObject({
      controls: featurePackMarketplaceSectionTargetControls,
      kind: 'packs',
      label: 'Feature packs',
      summary: featurePackMarketplaceSectionSummary,
    })
    expect(featurePackMarketplaceSectionControlModel.diagnostics.ready
      .map((diagnostic) => diagnostic.actionKind)).toEqual(['disable'])
    expect(featurePackMarketplaceSectionControlModels.map((section) =>
      section.kind
    )).toEqual(['profiles', 'suites', 'packs'])
    expect(featurePackMarketplaceReadyPackFacetControls.map((control) =>
      control.target
    )).toEqual([{
      featurePackId: 'smoke-partial-pack',
      kind: 'pack',
    }])
    expect(featurePackMarketplaceSelectionControlModel).toMatchObject({
      fallbackReasons: [],
      requestedFacetKind: 'ready',
      requestedSectionKind: 'packs',
      selectedFacetKind: 'ready',
      selectedSectionKind: 'packs',
      status: 'selected',
    })
    expect(featurePackMarketplaceSelectionControlModel.sectionControls
      .map((control) => ({
        kind: control.kind,
        selected: control.selected,
      }))).toEqual([
        { kind: 'profiles', selected: false },
        { kind: 'suites', selected: false },
        { kind: 'packs', selected: true },
      ])
    expect(featurePackMarketplaceSelectionControlModel.facetControls
      .find((control) => control.kind === 'ready')).toMatchObject({
        count: 1,
        selected: true,
      })
    expect(featurePackMarketplaceSelectionControlModel.controls.map(
      (control) => control.target,
    )).toEqual([{
      featurePackId: 'smoke-partial-pack',
      kind: 'pack',
    }])
    expect(featurePackMarketplaceSelectionControlModelFromApp.controls)
      .toEqual(featurePackMarketplaceSelectionControlModel.controls)
    expect(featurePackMarketplaceSelectionFallbackReasons)
      .toEqual(['missing-facet'])
    expect(featurePackMarketplaceSelectionTargetControl)
      .toEqual(featurePackMarketplaceTargetControl)
    expect(featurePackMarketplaceMissingTargetControlStatus).toBe('missing')
    expect(featurePackMarketplaceActionAssemblyPlan.status).toBe('ready')
    if (featurePackMarketplaceActionAssemblyPlan.status !== 'ready') {
      throw new Error('Expected ready feature pack marketplace assembly plan')
    }

    expect(featurePackMarketplaceActionAssemblyPlan.actionKind).toBe('disable')
    expect(featurePackMarketplaceActionAssemblyPlan.changedFeaturePackIds)
      .toEqual(['smoke-partial-pack'])
    expect(featurePackMarketplaceActionAssemblyPlan.partialUpdateSurfaceIds)
      .toEqual(['overlay'])
    expect(featurePackMarketplaceActionAssemblyPlan.uninstallPolicyEntries)
      .toEqual([])
    expect(featurePackMarketplaceActionAssemblyPlan.uninstallDataPlan)
      .toEqual(featurePackMarketplaceAssemblyUninstallDataPlan)
    expect(featurePackMarketplaceActionAssemblyPlan.assemblyInput)
      .toEqual(featurePackMarketplaceAppliedAssemblyInput)
    expect(featurePackMarketplaceAppliedAssemblyInput.featurePackStates)
      .toEqual([{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }])
    expect(featurePackMarketplaceAssemblyModel.installOptions.featurePackStates)
      .toEqual([{
        id: 'smoke-partial-pack',
        status: 'enabled',
      }])
    expect(featurePackMarketplaceAssemblyActionPlan.status).toBe('ready')
    if (featurePackMarketplaceAssemblyActionPlan.status !== 'ready') {
      throw new Error('Expected ready feature pack marketplace runtime plan')
    }

    expect(featurePackMarketplaceAssemblyActionPlan.assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyItemAction)
      .toBe(getCanvasAppFeaturePackMarketplacePrimaryAction(
        featurePackMarketplaceAssemblyItemInput.item,
      ))
    expect(featurePackMarketplaceAssemblyTargetItem)
      .toBe(featurePackMarketplaceAssemblyItemInput.item)
    expect(featurePackMarketplaceAssemblyTargetAction)
      .toBe(featurePackMarketplaceAssemblyItemAction)
    expect(featurePackMarketplaceAssemblyItemAction.kind).toBe('disable')
    expect(featurePackMarketplaceAssemblyItemActionPlan.status).toBe('ready')
    if (featurePackMarketplaceAssemblyItemActionPlan.status !== 'ready') {
      throw new Error(
        'Expected ready feature pack marketplace item runtime plan',
      )
    }

    expect(featurePackMarketplaceAssemblyItemActionPlan.action)
      .toBe(featurePackMarketplaceAssemblyItemAction)
    expect(featurePackMarketplaceAssemblyTargetActionPlan)
      .toEqual(featurePackMarketplaceAssemblyItemActionPlan)
    expect(featurePackMarketplaceAssemblyItemActionPlan.assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyItemAppliedInput)
    expect(featurePackMarketplaceAssemblyItemAppliedInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyTargetAppliedInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyApplyPlan.status).toBe('ready')
    if (featurePackMarketplaceAssemblyApplyPlan.status !== 'ready') {
      throw new Error('Expected ready feature pack marketplace apply plan')
    }

    expect(featurePackMarketplaceAssemblyApplyUpdateMode)
      .toBe('partial-update')
    expect(featurePackMarketplaceAssemblyApplyPlan.assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyItemApplyPlan).toMatchObject({
      actionKind: 'disable',
      status: 'ready',
      updateMode: 'partial-update',
    })
    expect(featurePackMarketplaceAssemblyTargetApplyPlan)
      .toEqual(featurePackMarketplaceAssemblyItemApplyPlan)
    expect(featurePackMarketplaceAssemblyItemApplyResult.status).toBe('ready')
    if (featurePackMarketplaceAssemblyItemApplyResult.status !== 'ready') {
      throw new Error(
        'Expected ready feature pack marketplace item apply result',
      )
    }

    expect(featurePackMarketplaceAssemblyItemApplyResult.currentModel)
      .toBe(featurePackMarketplaceAssemblyModel)
    expect(featurePackMarketplaceAssemblyItemApplyResult.nextModel.assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyTargetApplyResult)
      .toEqual(featurePackMarketplaceAssemblyItemApplyResult)
    expect(featurePackMarketplaceAssemblyApplyPlan.uninstallPolicyEntries)
      .toEqual([])
    expect(featurePackMarketplaceAssemblyUninstallDataPlan).toEqual({
      entries: [],
      hostManagedFeaturePackIds: [],
      hostManagedScopeIds: [],
      preserveFeaturePackIds: [],
      preserveScopeIds: [],
      removeFeaturePackIds: [],
      removeScopeIds: [],
      unscopedFeaturePackIds: [],
    })
    expect(CanvasPackage
      .createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
      .toBe(createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
    expect(CanvasAppFacade
      .createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
      .toBe(createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
    expect(CanvasAppAuthoring
      .createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
      .toBe(createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
    expect(CanvasPackage
      .executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
      .toBe(executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
    expect(CanvasAppFacade
      .executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
      .toBe(executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
    expect(CanvasAppAuthoring
      .executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
      .toBe(executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan)
    expect(CanvasPackage
      .createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
      .toBe(createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
    expect(CanvasAppFacade
      .createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
      .toBe(createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
    expect(CanvasAppAuthoring
      .createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
      .toBe(createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
    expect(CanvasPackage
      .executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
    expect(CanvasAppFacade
      .executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
    expect(CanvasAppAuthoring
      .executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan)
    expect(CanvasPackage
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary)
    expect(CanvasAppFacade
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary)
    expect(CanvasAppAuthoring
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary)
    expect(CanvasPackage
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan)
    expect(CanvasAppFacade
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan)
    expect(CanvasAppAuthoring
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan)
    expect(CanvasPackage
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult)
    expect(CanvasAppFacade
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult)
    expect(CanvasAppAuthoring
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult)
    expect(CanvasPackage
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch)
    expect(CanvasAppFacade
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch)
    expect(CanvasAppAuthoring
      .getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch)
    expect(featurePackMarketplaceUninstallCleanupEffectPlanStatus)
      .toBe('ready')
    expect(featurePackMarketplaceUninstallCleanupEffectPlanExecutionStatus)
      .toBe('succeeded')
    expect(featurePackMarketplaceUninstallCleanupExecutionResult.status)
      .toBe('succeeded')
    expect(featurePackMarketplaceUninstallCleanupEffectSucceededExecutionResult)
      .toMatchObject({
        scopeId: featurePackManifestOrphanedDataScopeId,
        status: 'succeeded',
        value: {
          cleaned: true,
          scopeId: featurePackManifestOrphanedDataScopeId,
        },
      })
    expect(featurePackMarketplaceUninstallCleanupEffectFailedExecutionResult)
      .toBeNull()
    expect(featurePackMarketplaceUninstallCleanupEffectSkippedExecutionResult)
      .toBeNull()
    expect(featurePackMarketplaceUninstallCleanupEffectPlanExecutionResult)
      .toMatchObject({
        failedScopeIds: [],
        skippedScopeIds: [],
        status: 'succeeded',
        succeededScopeIds: [featurePackManifestOrphanedDataScopeId],
      })
    expect(featurePackMarketplaceAssemblyApplyExecutionPlanStatus)
      .toBe('ready')
    expect(featurePackMarketplaceAssemblyApplyExecutionResultStatus)
      .toBe('completed')
    expect(featurePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus)
      .toBe('empty')
    expect(featurePackMarketplaceAssemblyApplyExecutionSummary)
      .toMatchObject({
        actionKind: 'disable',
        blockedReasonCount: 0,
        changedFeaturePackIds: ['smoke-partial-pack'],
        cleanup: {
          effectCount: 0,
          failedScopeCount: 0,
          handledScopeCount: 0,
          missingHandlerScopeCount: 0,
          skippedScopeCount: 0,
          status: 'empty',
          succeededScopeCount: 0,
        },
        marketplaceBlockedReasonCount: 0,
        partialUpdateSurfaceIds: ['overlay'],
        status: 'completed',
        totalBlockedReasonCount: 0,
        updateMode: 'partial-update',
      })
    expect(featurePackMarketplaceAssemblyApplyCommitPlanStatus)
      .toBe('ready-to-commit')
    expect(featurePackMarketplaceAssemblyApplyReadyCommitPlan)
      .toMatchObject({
        canCommit: true,
        nextAssemblyInput: featurePackMarketplaceAssemblyAppliedInput,
        status: 'ready-to-commit',
        summary: {
          status: 'completed',
        },
        updateMode: 'partial-update',
      })
    expect(featurePackMarketplaceAssemblyApplyCommitHoldPlan).toBeNull()
    expect(featurePackMarketplaceAssemblyApplyCommitResultStatus)
      .toBe('committed')
    expect(featurePackMarketplaceAssemblyApplyCommittedResult)
      .toMatchObject({
        committed: true,
        nextAssemblyInput: featurePackMarketplaceAssemblyAppliedInput,
        previousAssemblyInput:
          featurePackMarketplaceAssemblyModel.assemblyInput,
        status: 'committed',
        summary: {
          status: 'completed',
        },
        updateMode: 'partial-update',
      })
    expect(featurePackMarketplaceAssemblyApplyCommittedResult?.commitPlan)
      .toBe(featurePackMarketplaceAssemblyApplyCommitPlan)
    expect(featurePackMarketplaceAssemblyApplyCommittedResult?.previousModel)
      .toBe(featurePackMarketplaceAssemblyModel)
    expect(featurePackMarketplaceAssemblyApplyCommittedResult?.nextModel)
      .toBe(featurePackMarketplaceAssemblyApplyResult.nextModel)
    expect(featurePackMarketplaceAssemblyApplyHeldCommitResult).toBeNull()
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch.status)
      .toBe('patched')
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch.patched)
      .toBe(true)
    if (!featurePackMarketplaceAssemblyApplyRuntimeStatePatch.patched) {
      throw new Error('Expected patched feature pack marketplace state patch')
    }

    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult)
      .toBe(featurePackMarketplaceAssemblyApplyRuntimeStatePatch)
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult)
      .toBeNull()
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch.commitResult)
      .toBe(featurePackMarketplaceAssemblyApplyCommitResult)
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch
      .currentFeaturePackStates).toEqual([{
      id: 'smoke-partial-pack',
      status: 'enabled',
    }])
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch
      .nextFeaturePackStates).toEqual([{
      id: 'smoke-partial-pack',
      status: 'disabled',
    }])
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch.patch
      .changedFeaturePackIds).toEqual(['smoke-partial-pack'])
    expect(featurePackMarketplaceAssemblyApplyRuntimeStatePatch.patch.options)
      .toEqual({
        featurePackStates: [{
          id: 'smoke-partial-pack',
          status: 'disabled',
        }],
      })
    expect(featurePackMarketplaceAssemblyApplyTransactionResult.status)
      .toBe('committed')
    expect(featurePackMarketplaceAssemblyApplyTransactionResult.commitResult
      .committed).toBe(true)
    expect(featurePackMarketplaceAssemblyApplyTransactionResult
      .runtimeStatePatch.status).toBe('patched')
    expect(featurePackMarketplaceAssemblyApplyTransactionResult
      .runtimeStatePatch.patched).toBe(true)
    expect(featurePackMarketplaceAssemblyApplyTransactionResult
      .runtimeStatePatch.commitResult)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult.commitResult)
    if (
      !featurePackMarketplaceAssemblyApplyTransactionResult
        .runtimeStatePatch.patched
    ) {
      throw new Error('Expected transaction runtime state patch')
    }

    expect(featurePackMarketplaceAssemblyApplyTransactionResult
      .runtimeStatePatch.patch.changedFeaturePackIds)
      .toEqual(['smoke-partial-pack'])
    expect(featurePackMarketplaceAssemblyApplyTransactionBaseResult)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult)
    expect(featurePackMarketplaceAssemblyApplyTransactionHostUpdate.status)
      .toBe('ready')
    expect(featurePackMarketplaceAssemblyApplyTransactionHostUpdate.ready)
      .toBe(true)
    expect(featurePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionHostUpdate)
    expect(featurePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult)
      .toBeNull()
    expect(
      'transactionResult' in
        featurePackMarketplaceAssemblyApplyTransactionHostUpdate,
    ).toBe(false)
    expect(featurePackMarketplaceAssemblyApplyTransactionHostUpdate
      .runtimeStatePatch)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult
        .runtimeStatePatch)
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.status)
      .toBe('ready')
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.ready).toBe(true)
    if (!featurePackMarketplaceAssemblyApplyHostUpdate.ready) {
      throw new Error('Expected ready feature pack marketplace host update')
    }

    expect(featurePackMarketplaceAssemblyApplyHostUpdateReadyResult)
      .toBe(featurePackMarketplaceAssemblyApplyHostUpdate)
    expect(featurePackMarketplaceAssemblyApplyHostUpdateHeldResult).toBeNull()
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.transactionResult)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult)
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.runtimeStatePatch)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult
        .runtimeStatePatch)
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.currentAssemblyInput)
      .toBe(featurePackMarketplaceAssemblyModel.assemblyInput)
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.nextAssemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyApplyHostAssemblyInputUpdate)
      .toBe(featurePackMarketplaceAssemblyApplyHostUpdate.update)
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.update).toMatchObject({
      assemblyInput: featurePackMarketplaceAssemblyAppliedInput,
      featurePackStates: [{
        id: 'smoke-partial-pack',
        status: 'disabled',
      }],
      kind: 'replace-assembly-input',
      updateMode: 'partial-update',
    })
    expect(featurePackMarketplaceAssemblyApplyTransactionHostUpdate.update)
      .toEqual(featurePackMarketplaceAssemblyApplyHostUpdate.update)
    expect(featurePackMarketplaceAssemblyApplyHostUpdate.update
      .runtimeStatePatch)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult
        .runtimeStatePatch.patch)
    expect(featurePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult.hostUpdate)
    expect(featurePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource)
      .toBeNull()
    expect(featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
      .status)
      .toBe('applied')
    expect(featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
      .applied)
      .toBe(true)
    expect(featurePackMarketplaceAssemblyApplyHostUpdateAppliedResult)
      .toBe(featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication)
    expect(featurePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult)
      .toBeNull()
    expect(featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
      .assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
      .update)
      .toEqual(featurePackMarketplaceAssemblyApplyHostUpdate.update)
    expect(featurePackMarketplaceAssemblyApplyEmbeddedHostUpdateApplication
      .hostUpdate)
      .toBe(featurePackMarketplaceAssemblyApplyTransactionResult.hostUpdate)
    expect(featurePackMarketplaceAssemblyApplyStandaloneHostUpdateApplication
      .assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyApplyStandaloneHostUpdateApplication
      .hostUpdate)
      .toBe(featurePackMarketplaceAssemblyApplyHostUpdate)
    expect(featurePackMarketplaceAssemblyApplyTransactionResult.summary.status)
      .toBe('completed')
    expect(featurePackMarketplaceAssemblyItemApplyTransactionResult.action)
      .toBe(featurePackMarketplaceAssemblyItemAction)
    expect(featurePackMarketplaceAssemblyItemApplyTransactionResult.status)
      .toBe('committed')
    expect(featurePackMarketplaceAssemblyItemApplyTransactionResult
      .hostUpdate.ready).toBe(true)
    expect(featurePackMarketplaceAssemblyItemApplyTransactionResult
      .hostUpdate.update)
      .toEqual(featurePackMarketplaceAssemblyApplyTransactionResult
        .hostUpdate.update)
    expect(featurePackMarketplaceAssemblyTargetApplyTransactionResult.action)
      .toBe(featurePackMarketplaceAssemblyItemAction)
    expect(featurePackMarketplaceAssemblyTargetApplyTransactionResult.status)
      .toBe('committed')
    expect(featurePackMarketplaceAssemblyTargetApplyTransactionResult
      .hostUpdate.ready).toBe(true)
    expect(featurePackMarketplaceAssemblyTargetApplyTransactionResult
      .hostUpdate.update)
      .toEqual(featurePackMarketplaceAssemblyApplyTransactionResult
        .hostUpdate.update)
    expect(CanvasPackage.executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction)
    expect(CanvasAppAuthoring.executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction)
    expect(CanvasPackage.executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction)
    expect(CanvasAppAuthoring.executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction)
    expect(CanvasPackage.executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction)
    expect(CanvasAppFacade.executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction)
    expect(CanvasAppAuthoring.executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction)
      .toBe(executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
    expect(CanvasPackage.applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
      .toBe(applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
    expect(CanvasAppFacade.applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
      .toBe(applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
    expect(CanvasAppAuthoring.applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
      .toBe(applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate)
    expect(featurePackMarketplaceAssemblyApplyReadyExecutionPlan)
      .toMatchObject({
        actionKind: 'disable',
        cleanupEffectPlan: {
          status: 'empty',
        },
        nextAssemblyInput: featurePackMarketplaceAssemblyAppliedInput,
        status: 'ready',
        updateMode: 'partial-update',
      })
    expect(featurePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan)
      .toBeNull()
    expect(featurePackMarketplaceAssemblyApplyBlockedExecutionPlan).toBeNull()
    expect(featurePackMarketplaceAssemblyApplyCompletedExecutionResult)
      .toMatchObject({
        actionKind: 'disable',
        cleanupExecutionResult: {
          status: 'empty',
        },
        nextAssemblyInput: featurePackMarketplaceAssemblyAppliedInput,
        status: 'completed',
        updateMode: 'partial-update',
      })
    expect(featurePackMarketplaceAssemblyApplyCleanupFailedExecutionResult)
      .toBeNull()
    expect(featurePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult)
      .toBeNull()
    expect(featurePackMarketplaceAssemblyApplyBlockedExecutionResult).toBeNull()
    expect(featurePackMarketplaceUninstallCleanupEffectPlan).toMatchObject({
      handledScopeIds: [featurePackManifestOrphanedDataScopeId],
      missingHandlerScopeIds: [],
      removeFeaturePackIds: ['smoke-partial-pack'],
      removeScopeIds: [featurePackManifestOrphanedDataScopeId],
      status: 'ready',
    })
    expect(featurePackMarketplaceUninstallCleanupEffect).toMatchObject({
      effect: {
        featurePackIds: ['smoke-partial-pack'],
        kind: 'cleanup-scope',
        scopeId: featurePackManifestOrphanedDataScopeId,
      },
      featurePackIds: ['smoke-partial-pack'],
      scopeId: featurePackManifestOrphanedDataScopeId,
    })
    expect(featurePackMarketplaceUninstallCleanupEffectInput.scopeId)
      .toBe(featurePackManifestOrphanedDataScopeId)
    expect(featurePackMarketplaceAssemblyApplyResult.status).toBe('ready')
    if (featurePackMarketplaceAssemblyApplyResult.status !== 'ready') {
      throw new Error('Expected ready feature pack marketplace apply result')
    }

    expect(featurePackMarketplaceAssemblyApplyResult.updateMode)
      .toBe('partial-update')
    expect(featurePackMarketplaceAssemblyApplyResult.nextModel.assemblyInput)
      .toEqual(featurePackMarketplaceAssemblyAppliedInput)
    expect(featurePackMarketplaceAssemblyApplyResult.uninstallPolicyEntries)
      .toEqual([])
    expect(featurePackMarketplaceAssemblyApplyResult.uninstallDataPlan)
      .toEqual(featurePackMarketplaceAssemblyUninstallDataPlan)
    expect(featurePackMarketplaceAssemblyApplyResult.nextModel.marketplaceModel
      .packs.items[0]?.status).toBe('disabled')
    expect(featurePackMarketplaceAssemblyAppliedInput.featurePackStates)
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
    expect(featurePackSuiteMarketplaceActionModel.items[0]?.actions.find(
      (action) => action.kind === 'uninstall',
    )?.uninstallPolicyEntries).toEqual([
      featurePackStateTransitionUninstallPolicyEntry,
    ])
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
    expect(featurePackStateTransitionPlan.uninstallPolicyEntries).toEqual([])
    expect(featurePackStateTransitionPlan.status).toBe('ready')
    expect(featurePackManifestOrphanedDataPolicy).toBe('host-managed')
    expect(featurePackManifestOrphanedDataScopeId).toBe('smoke-partial-data')
    expect(featurePackProfileMarketplaceUninstallPolicyEntry).toEqual({
      featurePackId: 'smoke-partial-pack',
      orphanedDataScopeIds: ['smoke-partial-data'],
      orphanedDataPolicy: 'host-managed',
    })
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

  it('keeps Host document persistence outside public pointer affordance primitives', () => {
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
    const draftStroke = createCanvasDraftStroke('marker', [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ])
    const laserStartResult = startCanvasPointerLaserInteraction({
      config: createCanvasAffordanceConfig(),
      input: pointerInput,
      pointerGesture: 'laser',
      startScreen: { x: 10, y: 20 },
      startWorld: { x: 30, y: 40 },
    })

    if (!laserStartResult || laserStartResult.kind !== 'interaction') {
      throw new Error('Expected laser start to return transient interaction')
    }

    const laserPreviewResult = previewCanvasPointerLaserInteraction({
      config: createCanvasAffordanceConfig(),
      currentScreen: { x: 20, y: 40 },
      currentWorld: { x: 50, y: 70 },
      interaction: laserStartResult.interaction,
    })

    if (!laserPreviewResult || laserPreviewResult.kind !== 'preview') {
      throw new Error('Expected laser preview to return transient overlay')
    }

    expect(Object.keys(draftStroke).sort()).toEqual([
      'kind',
      'opacity',
      'points',
      'stroke',
      'strokeWidth',
    ])
    expect(Object.keys(laserStartResult).sort()).toEqual([
      'capturePointer',
      'gesture',
      'interaction',
      'kind',
      'laserTrail',
    ])
    expect(Object.keys(laserPreviewResult).sort()).toEqual([
      'interaction',
      'kind',
      'laserTrail',
      'snapGuides',
    ])
    expect(getCanvasEraserHitStrokeIds({
      points: [{ x: 50, y: 4 }],
      strokes: [{
        id: 'host-stroke',
        points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        strokeWidth: 4,
      }],
    })).toEqual(['host-stroke'])
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
    const pointerLocalGeometryInput: CanvasPointerLocalGeometryInput = {
      event: { clientX: 150, clientY: 260 },
      target: {
        getBoundingClientRect: () => ({
          height: 300,
          left: 100,
          top: 200,
          width: 400,
        }),
      },
    }
    const pointerLocalGeometry: CanvasPointerLocalGeometry | null =
      getCanvasPointerLocalGeometry(pointerLocalGeometryInput)
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
    const appFacadeHtmlImageDataTransfer = {
      getData: (type: string) =>
        type === 'text/html'
          ? '<figure><img alt="One" src="data:image/webp;base64,aW1hZ2U="></figure>'
          : '',
    } as unknown as DataTransfer
    const appFacadeStageElement = {
      getScreenPoint: () => ({ x: 410, y: 260 }),
      getViewportCenter: () => ({ x: 100, y: 120 }),
    }
    const appFacadeViewport = { scale: 2, x: 10, y: 20 }
    const packageStageRect: CanvasAppStageRect = {
      height: 120,
      left: 20,
      top: 30,
      width: 240,
    }
    const packageStageCapturedPointers = new Set<number>()
    const packageStageWheelListeners =
      new Set<(event: globalThis.WheelEvent) => void>()
    const packageStageParentElement = {
      addEventListener: (
        _type: 'wheel',
        listener: (event: globalThis.WheelEvent) => void,
      ) => {
        packageStageWheelListeners.add(listener)
      },
      removeEventListener: (
        _type: 'wheel',
        listener: (event: globalThis.WheelEvent) => void,
      ) => {
        packageStageWheelListeners.delete(listener)
      },
    } as Element
    const packageStageDomElement = {
      addEventListener: () => undefined,
      contains: () => true,
      getBoundingClientRect: () => packageStageRect,
      hasPointerCapture: (pointerId: number) =>
        packageStageCapturedPointers.has(pointerId),
      parentElement: packageStageParentElement,
      releasePointerCapture: (pointerId: number) => {
        packageStageCapturedPointers.delete(pointerId)
      },
      removeEventListener: () => undefined,
      setPointerCapture: (pointerId: number) => {
        packageStageCapturedPointers.add(pointerId)
      },
    } as NonNullable<ReturnType<CreateCanvasAppStageElementInput['getElement']>>
    const packageStageElementInput: CreateCanvasAppStageElementInput = {
      getElement: () => packageStageDomElement,
      setElement: () => undefined,
    }
    const packageStageElementController: CanvasAppStageElementController =
      createCanvasAppStageElement(packageStageElementInput)
    const packageStageElement: CanvasAppStageElement =
      packageStageElementController
    const packageFloatingAnchorSize: CanvasFloatingAnchorSize = {
      height: 40,
      width: 160,
    }
    const packageFloatingAnchorInput: CanvasFloatingAnchorForBoundsInput = {
      bounds: { h: 30, w: 80, x: 100, y: 20 },
      floatingSize: packageFloatingAnchorSize,
      stageRect: { height: 400, width: 600 },
      viewport: { scale: 1, x: 0, y: 0 },
    }
    const packageFloatingAnchorPlacement: CanvasFloatingAnchorPlacement =
      'below'
    const packageFloatingAnchor: CanvasFloatingAnchor =
      getCanvasFloatingAnchorForBounds(packageFloatingAnchorInput) ?? {
        placement: 'above',
        x: 0,
        y: 0,
      }
    const packageEraserStrokes: CanvasEraserStrokeHitTestStroke[] = [{
      id: 'freeform-1',
      points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      strokeWidth: 4,
    }]
    const packageEraserPoints = getNextCanvasEraserPoints({
      currentWorld: { x: 0, y: 10 },
      pointDistance: 5,
      points: [{ x: 0, y: 0 }],
    })
    const packageRichClipboardJSON = stringifyCanvasRichClipboardPayload({
      kind: 'card',
    })
    const packageRichClipboardHTMLInput: CanvasRichClipboardHTMLInput = {
      json: packageRichClipboardJSON,
    }
    const packageRichClipboardHTML = createCanvasRichClipboardHTML(
      packageRichClipboardHTMLInput,
    )
    const packageRichClipboardExtraItems: CanvasRichClipboardExtraItems = {
      'text/csv': 'label,value\nCard,1',
    }
    const packageRichClipboardDataTransfer: CanvasRichClipboardDataTransfer = {
      getData: (type) => {
        if (type === 'text/html') {
          return packageRichClipboardHTML
        }

        return ''
      },
    }
    const packageRichClipboardResult:
      CanvasRichClipboardReadResult<{ kind: 'card' }> | null =
        readCanvasRichClipboardFromDataTransfer({
          dataTransfer: packageRichClipboardDataTransfer,
          jsonMimeType: 'application/vnd.example.card+json',
          parsePayload: (value) =>
            typeof value === 'object' &&
              value !== null &&
              'kind' in value &&
              value.kind === 'card'
              ? { kind: 'card' as const }
              : null,
        })
    const viewportControlStageElement = {
      getRect: () => ({
        height: 100,
        left: 0,
        top: 0,
        width: 200,
      }),
    } as Parameters<typeof centerCanvasViewportAtWorldPoint>[0]['stageElement']
    const viewportUpdates: Array<{ scale: number; x: number; y: number }> = []
    let viewportState = { scale: 1, x: 0, y: 0 }
    const setViewport: CanvasViewportSetter = (next) => {
      viewportState = typeof next === 'function' ? next(viewportState) : next
      viewportUpdates.push(viewportState)
    }
    let wheelViewportPreventDefaultCount = 0
    let wheelViewportState = { scale: 1, x: 0, y: 0 }
    const wheelViewportUpdates: Array<{ scale: number; x: number; y: number }> =
      []
    const setWheelViewport: CanvasWheelViewportSetter = (next) => {
      wheelViewportState =
        typeof next === 'function' ? next(wheelViewportState) : next
      wheelViewportUpdates.push(wheelViewportState)
    }
    const wheelViewportEvent: CanvasWheelViewportEvent = {
      clientX: 120,
      clientY: 90,
      ctrlKey: false,
      deltaMode: 0,
      deltaX: 10,
      deltaY: 20,
      metaKey: false,
      preventDefault: () => {
        wheelViewportPreventDefaultCount += 1
      },
      shiftKey: false,
    }
    const wheelViewportRunInput: RunCanvasWheelViewportArgs = {
      config: createCanvasAffordanceConfig(),
      event: wheelViewportEvent,
      rect: {
        height: 100,
        left: 20,
        top: 30,
        width: 200,
      },
      setViewport: setWheelViewport,
    }
    CanvasAppFacade.runCanvasWheelViewport(wheelViewportRunInput)

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
    expect(useCanvasAppStageElement).toBeTypeOf('function')
    expect(CanvasAppFacade.useCanvasAppStageElement)
      .toBe(useCanvasAppStageElement)
    expect(CanvasAppFacade.createCanvasAppStageElement)
      .toBe(createCanvasAppStageElement)
    expect(CanvasAppFacade.getCanvasFloatingAnchorForBounds)
      .toBe(getCanvasFloatingAnchorForBounds)
    expect(packageFloatingAnchor).toEqual({
      placement: packageFloatingAnchorPlacement,
      x: 140,
      y: 60,
    })
    expect(getCanvasEraserHitStrokeIds({
      points: [{ x: 50, y: 6 }],
      radius: 6,
      strokes: packageEraserStrokes,
    })).toEqual(['freeform-1'])
    expect(packageEraserPoints).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 5 },
      { x: 0, y: 10 },
    ])
    expect(CanvasAppFacade.getCanvasEraserHitStrokeIds)
      .toBe(getCanvasEraserHitStrokeIds)
    expect(CANVAS_RICH_CLIPBOARD_JSON_SCRIPT_ATTRIBUTE)
      .toBe('data-canvas-rich-clipboard-json')
    expect(CanvasAppFacade.writeCanvasRichClipboardPayload)
      .toBe(writeCanvasRichClipboardPayload)
    expect(CanvasAppFacade.readCanvasRichClipboardFromDataTransfer)
      .toBe(readCanvasRichClipboardFromDataTransfer)
    expect(getCanvasRichClipboardJSONFromHTML(packageRichClipboardHTML))
      .toBe(packageRichClipboardJSON)
    expect(packageRichClipboardResult).toEqual({
      format: 'text-html',
      payload: { kind: 'card' },
    })
    expect(packageRichClipboardExtraItems['text/csv'])
      .toBe('label,value\nCard,1')
    expect(packageStageElementController.mount.ref).toBeTypeOf('function')
    expect(packageStageElement.getRect()).toEqual(packageStageRect)
    expect(packageStageElement.getScreenPoint({ clientX: 70, clientY: 90 }))
      .toEqual({ x: 50, y: 60 })
    expect(packageStageElement.getViewportCenter({ scale: 2, x: 10, y: 20 }))
      .toEqual({ x: 55, y: 20 })
    packageStageElement.capturePointer(9)
    expect([...packageStageCapturedPointers]).toEqual([9])
    packageStageElement.releasePointer(9)
    expect([...packageStageCapturedPointers]).toEqual([])
    const cleanupPackageStageWheelListener =
      packageStageElement.addWheelListener(() => undefined)
    expect(packageStageWheelListeners.size).toBe(1)
    cleanupPackageStageWheelListener()
    expect(packageStageWheelListeners.size).toBe(0)
    expect(CANVAS_CONTROL_TARGET_SELECTOR).toContain('button')
    expect(CanvasAppFacade.CANVAS_CONTROL_TARGET_SELECTOR).toContain('button')
    expect(CANVAS_WHEEL_PASSTHROUGH_SELECTOR).toContain(
      'data-canvas-wheel-passthrough',
    )
    expect(CanvasAppFacade.CANVAS_WHEEL_PASSTHROUGH_SELECTOR).toContain(
      'data-canvas-wheel-passthrough',
    )
    expect(CANVAS_WHEEL_VIEWPORT_MODEL).toBe('canvas-wheel-viewport')
    expect(CanvasAppFacade.CANVAS_WHEEL_VIEWPORT_MODEL)
      .toBe(CANVAS_WHEEL_VIEWPORT_MODEL)
    expect(CanvasAppFacade.CANVAS_WHEEL_VIEWPORT_PAN_MODE)
      .toBe(CANVAS_WHEEL_VIEWPORT_PAN_MODE)
    expect(CanvasAppFacade.CANVAS_WHEEL_VIEWPORT_HORIZONTAL_PAN_MODIFIER)
      .toBe(CANVAS_WHEEL_VIEWPORT_HORIZONTAL_PAN_MODIFIER)
    expect(CanvasAppFacade.CANVAS_WHEEL_VIEWPORT_ZOOM_MODIFIER)
      .toBe(CANVAS_WHEEL_VIEWPORT_ZOOM_MODIFIER)
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
    expect(pointerLocalGeometry).toEqual({
      point: { x: 50, y: 60 },
      rect: {
        height: 300,
        left: 100,
        top: 200,
        width: 400,
      },
    })
    expect(CanvasAppFacade.getCanvasPointerLocalGeometry(
      pointerLocalGeometryInput,
    )).toEqual(pointerLocalGeometry)
    expect(getCanvasPointerLocalPoint(pointerLocalGeometryInput))
      .toEqual({ x: 50, y: 60 })
    expect(CanvasAppFacade.getCanvasPointerLocalPoint(
      pointerLocalGeometryInput,
    )).toEqual({ x: 50, y: 60 })
    resetCanvasViewport({ setViewport })
    expect(viewportState).toEqual({ scale: 1, x: 0, y: 0 })
    centerCanvasViewportAtWorldPoint({
      point: { x: 10, y: 20 },
      setViewport,
      stageElement: viewportControlStageElement,
    })
    expect(viewportState).toEqual({ scale: 1, x: 90, y: 30 })
    CanvasAppFacade.zoomCanvasViewport({
      direction: 'in',
      setViewport,
      stageElement: viewportControlStageElement,
    })
    fitCanvasViewportToBounds({
      bounds: { h: 50, w: 50, x: 0, y: 0 },
      setViewport,
      stageElement: viewportControlStageElement,
    })
    expect(viewportUpdates.length).toBe(4)
    expect(CanvasAppFacade.resetCanvasViewport).toBe(resetCanvasViewport)
    expect(CanvasAppFacade.centerCanvasViewportAtWorldPoint)
      .toBe(centerCanvasViewportAtWorldPoint)
    expect(CanvasAppFacade.fitCanvasViewportToBounds)
      .toBe(fitCanvasViewportToBounds)
    expect(CanvasAppFacade.zoomCanvasViewport).toBe(zoomCanvasViewport)
    expect(CanvasPackage.runCanvasWheelViewport).toBe(runCanvasWheelViewport)
    expect(CanvasAppFacade.runCanvasWheelViewport).toBe(runCanvasWheelViewport)
    expect(wheelViewportPreventDefaultCount).toBe(1)
    expect(wheelViewportState).toEqual({ scale: 1, x: -10, y: -20 })
    expect(wheelViewportUpdates).toEqual([
      { scale: 1, x: -10, y: -20 },
    ])
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
    expect(CanvasAppAuthoring.createCanvasStoryCanvasFeaturePackManifests)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.createCanvasStoryCanvasFeaturePackManifests)
      .toBeTypeOf('function')
    expect(CanvasPackage.createCanvasStoryCanvasFeaturePackManifests)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.routeCanvasImagePasteReplace)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.routeCanvasImagePasteReplace)
      .toBeTypeOf('function')
    expect(CanvasPackage.routeCanvasImagePasteReplace)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.routeCanvasMediaSourceObjectHyperlink)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.routeCanvasMediaSourceObjectHyperlink)
      .toBeTypeOf('function')
    expect(CanvasPackage.routeCanvasMediaSourceObjectHyperlink)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.routeCanvasTableImportTargetReplace)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.routeCanvasTableImportTargetReplace)
      .toBeTypeOf('function')
    expect(CanvasPackage.routeCanvasTableImportTargetReplace)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.routeCanvasTextPasteReplace)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.routeCanvasTextPasteReplace)
      .toBeTypeOf('function')
    expect(CanvasPackage.routeCanvasTextPasteReplace)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.CANVAS_IMAGE_IMPORT_MODEL).toBe(
      'canvas-image-import',
    )
    expect(CanvasAppFacade.getCanvasImageFilesFromDataTransfer(null)).toEqual(
      [],
    )
    expect(
      CanvasAppFacade.getCanvasHTMLDataImageSourcesFromDataTransfer(
        appFacadeHtmlImageDataTransfer,
      ),
    ).toEqual([{
      dataUrl: 'data:image/webp;base64,aW1hZ2U=',
      format: 'data-url-html-img',
      mimeType: 'image/webp',
      name: 'One.webp',
    }])
    expect(CanvasAppFacade.getCanvasImageInsertCenter({
      event: { clientX: 410, clientY: 260 },
      stageElement: appFacadeStageElement as never,
      viewport: appFacadeViewport,
    })).toEqual({ x: 200, y: 120 })
    expect(CanvasAppFacade.CANVAS_TABLE_IMPORT_MODEL).toBe(
      'canvas-table-import',
    )
    expect(CanvasAppFacade.getCanvasTableFilesFromDataTransfer(null)).toEqual(
      [],
    )
    expect(CanvasAppAuthoring.readCanvasTableFileSources)
      .toBe(readCanvasTableFileSources)
    expect(CanvasAppFacade.readCanvasTableFileSources)
      .toBe(readCanvasTableFileSources)
    expect(CanvasPackage.readCanvasTableFileSources)
      .toBe(readCanvasTableFileSources)
    await expect(readCanvasTableFileSources([
      Object.assign(new Blob(['Name,Owner\nImport,Mina'], {
        type: 'text/csv',
      }), {
        name: 'consumer.csv',
      }),
      Object.assign(new Blob(['ignored'], {
        type: 'text/plain',
      }), {
        name: 'notes.txt',
      }),
    ])).resolves.toEqual([{
      format: 'text-csv',
      name: 'consumer.csv',
      rows: [
        ['Name', 'Owner'],
        ['Import', 'Mina'],
      ],
    }])
    expect(CanvasAppFacade.getCanvasTableSourceFromText(
      'Name,Owner\nImport,Mina',
      { format: 'text-csv' },
    )).toEqual({
      format: 'text-csv',
      rows: [
        ['Name', 'Owner'],
        ['Import', 'Mina'],
      ],
    })
    expect(CanvasAppFacade.getCanvasTableInsertCenter({
      event: { clientX: 410, clientY: 260 },
      stageElement: appFacadeStageElement as never,
      viewport: appFacadeViewport,
    })).toEqual({ x: 200, y: 120 })
    expect(CanvasAppFacade.CANVAS_TEXT_PASTE_IMPORT_MODEL).toBe(
      'canvas-text-paste-import',
    )
    expect(CanvasAppFacade.getCanvasRichTextPasteSourceFromHTML(
      '<p style="text-align: center; line-height: 1.5; margin-top: 8px; margin-bottom: 12px"><span style="font-size: 16px"><strong>Hello</strong></span></p>',
    )).toMatchObject({
      format: 'text-html-rich',
      paragraphs: [{
        align: 'center',
        lineHeight: 1.5,
        runs: [{
          bold: true,
          fontSize: 16,
          text: 'Hello',
        }],
        spacingAfter: 12,
        spacingBefore: 8,
      }],
      text: 'Hello',
    })
    expect(CanvasAppFacade.getCanvasTextPasteSourcesFromDataTransfer(null))
      .toEqual([])
    expect(CanvasAppFacade.getCanvasTextPasteInsertPosition({
      event: { clientX: 410, clientY: 260 },
      stageElement: appFacadeStageElement as never,
      viewport: appFacadeViewport,
    })).toEqual({ x: 200, y: 120 })
    expect(() => CanvasAppFacade.assertCanvasTextPasteImporter({
      createItems: () => [],
      id: 'consumer-text',
    })).not.toThrow()
    expect(CanvasAppFacade.CANVAS_MEDIA_IMPORT_MODEL).toBe(
      'canvas-media-import',
    )
    expect(CanvasAppFacade.getCanvasMediaSourceFromText(
      '<iframe src="https://www.youtube.com/embed/demo"></iframe>',
    )).toEqual({
      url: 'https://www.youtube.com/embed/demo',
    })
    expect(CanvasAppFacade.getCanvasMediaInsertPosition({
      event: { clientX: 410, clientY: 260 },
      stageElement: appFacadeStageElement as never,
      viewport: appFacadeViewport,
    })).toEqual({ x: 200, y: 120 })
    expect(() => CanvasAppFacade.assertCanvasMediaImporter({
      createItems: () => [],
      id: 'consumer-media',
    })).not.toThrow()
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
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceTargetItem)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetItem)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceTargetItem)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetItem)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceTargetItem)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetItem)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceTargetPrimaryAction)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetPrimaryAction)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceTargetPrimaryAction)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetPrimaryAction)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceTargetPrimaryAction)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetPrimaryAction)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceItemTarget)
      .toBe(getCanvasAppFeaturePackMarketplaceItemTarget)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceItemTarget)
      .toBe(getCanvasAppFeaturePackMarketplaceItemTarget)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceItemTarget)
      .toBe(getCanvasAppFeaturePackMarketplaceItemTarget)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceItemTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceItemTargetControl)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceItemTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceItemTargetControl)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceItemTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceItemTargetControl)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetControl)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetControl)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceTargetControl)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSectionTargetControls)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionTargetControls)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSectionTargetControls)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionTargetControls)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSectionTargetControls)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionTargetControls)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSectionControlModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionControlModel)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSectionControlModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionControlModel)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSectionControlModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionControlModel)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSectionControlModels)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionControlModels)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSectionControlModels)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionControlModels)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSectionControlModels)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionControlModels)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls)
      .toBe(getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSelectionControlModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionControlModel)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSelectionControlModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionControlModel)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSelectionControlModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionControlModel)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSelectionExecutionModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionExecutionModel)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSelectionExecutionModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionExecutionModel)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSelectionExecutionModel)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionExecutionModel)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSelectionTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionTargetControl)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSelectionTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionTargetControl)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSelectionTargetControl)
      .toBe(getCanvasAppFeaturePackMarketplaceSelectionTargetControl)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceActionAssemblyInput)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceActionAssemblyInput)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceActionAssemblyInput)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceActionAssemblyPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceActionAssemblyPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceActionAssemblyPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyModel)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyModel)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyModel)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyApplyResult)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyApplyResult)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyApplyResult)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyActionInput)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyActionInput)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyActionInput)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyActionPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyActionPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyActionPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyItemAction)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyItemAction)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyItemAction)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyTargetItem)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetItem)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyTargetItem)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetItem)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyTargetItem)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetItem)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyTargetAction)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetAction)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyTargetAction)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetAction)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyTargetAction)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetAction)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult)
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult)
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult)
      .toBe(getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult)
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplacePrimaryAction)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplacePrimaryAction)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplacePrimaryAction)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic)
      .toBeTypeOf('function')
    expect(CanvasAppAuthoring.getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel)
      .toBeTypeOf('function')
    expect(CanvasAppFacade.getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel)
      .toBeTypeOf('function')
    expect(CanvasPackage.getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel)
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
    expect(CanvasFoundation.getCanvasAlignmentDelta({
      bounds: { h: 20, w: 40, x: 0, y: 0 },
      frame: { h: 100, w: 200, x: 0, y: 0 },
      mode: 'alignBottom',
    })).toEqual({ x: 0, y: 80 })
    expect(CanvasFoundation.alignCanvasRectList({
      entries: [{ bounds: { h: 20, w: 40, x: 0, y: 0 }, id: 'rect-1' }],
      frame: { h: 100, w: 200, x: 0, y: 0 },
      mode: 'alignCenter',
    })[0]?.bounds).toEqual({ h: 20, w: 40, x: 80, y: 0 })
    expect(CanvasFoundation.distributeCanvasRectList({
      entries: [
        { bounds: { h: 20, w: 40, x: 0, y: 0 }, id: 'rect-1' },
        { bounds: { h: 30, w: 20, x: 100, y: 10 }, id: 'rect-2' },
        { bounds: { h: 10, w: 10, x: 20, y: 80 }, id: 'rect-3' },
      ],
      mode: 'distributeHorizontal',
    })[2]?.delta).toEqual({ x: 45, y: 0 })
    expect(CanvasFoundationFromPackage.getCanvasAlignmentDelta).toBe(
      CanvasFoundation.getCanvasAlignmentDelta,
    )
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
    const mediaObjectHyperlinkRoute: CanvasMediaObjectHyperlinkRoute =
      routeCanvasMediaSourceObjectHyperlink({
        getTarget: ({ selection }) => ({
          id: selection[0] ?? 'consumer-card-one',
          selection,
        }),
        selection: ['consumer-card-one'],
        source: { url: 'https://example.com/reference' },
      })

    expect(mediaObjectHyperlinkRoute).toMatchObject({
      intent: {
        kind: 'object-hyperlink-update',
        target: {
          id: 'consumer-card-one',
          selection: ['consumer-card-one'],
        },
        url: 'https://example.com/reference',
      },
      kind: 'object-hyperlink',
      status: 'routed',
    })
    const imagePasteReplaceRoute: CanvasImagePasteReplaceRoute =
      routeCanvasImagePasteReplace({
        getTarget: ({ selection }) => ({
          id: selection[0] ?? 'consumer-image-one',
          selection,
        }),
        selection: ['consumer-image-one'],
        sources: [{
          dataUrl: 'data:image/png;base64,aW1hZ2U=',
          mimeType: 'image/png',
          name: 'consumer-image.png',
        }],
      })

    expect(imagePasteReplaceRoute).toMatchObject({
      intent: {
        kind: 'image-replace',
        source: {
          dataUrl: 'data:image/png;base64,aW1hZ2U=',
          mimeType: 'image/png',
          name: 'consumer-image.png',
        },
        target: {
          id: 'consumer-image-one',
          selection: ['consumer-image-one'],
        },
      },
      kind: 'image-replace',
      status: 'routed',
    })
    const textPasteReplaceRoute: CanvasTextPasteReplaceRoute =
      routeCanvasTextPasteReplace({
        getTarget: ({ selection }) => ({
          id: selection[0] ?? 'consumer-text-one',
          selection,
        }),
        selection: ['consumer-text-one'],
        source: createCanvasPlainTextPasteSource('Consumer text')!,
      })

    expect(textPasteReplaceRoute).toMatchObject({
      intent: {
        kind: 'text-replace',
        source: {
          format: 'text-plain',
          text: 'Consumer text',
        },
        target: {
          id: 'consumer-text-one',
          selection: ['consumer-text-one'],
        },
        text: 'Consumer text',
      },
      kind: 'text-replace',
      status: 'routed',
      text: 'Consumer text',
    })
    const richTextListType: CanvasRichTextPasteListType = 'numbered'
    const richTextRun: CanvasRichTextPasteRun = { text: 'Consumer item' }
    const richTextParagraph: CanvasRichTextPasteParagraph = {
      bullet: richTextListType,
      runs: [richTextRun],
    }
    const richTextSource: CanvasRichTextPasteSource = {
      format: 'text-html-rich',
      paragraphs: [richTextParagraph],
      text: 'Consumer item',
    }

    expect(richTextSource.paragraphs[0]?.bullet).toBe('numbered')
    const richTextFormat: CanvasRichTextPasteFormat = 'text-markdown-rich'
    const richTextHeadingLevel: CanvasRichTextPasteHeadingLevel = 2
    const markdownRichTextSource: CanvasRichTextPasteSource = {
      format: richTextFormat,
      paragraphs: [{
        headingLevel: richTextHeadingLevel,
        runs: [{ text: 'Consumer heading' }],
      }],
      text: 'Consumer heading',
    }

    expect(markdownRichTextSource).toMatchObject({
      format: richTextFormat,
      paragraphs: [{
        headingLevel: richTextHeadingLevel,
      }],
      text: 'Consumer heading',
    })
    const tableImportTargetReplaceRoute: CanvasTableImportTargetReplaceRoute =
      routeCanvasTableImportTargetReplace({
        getTarget: ({ selection }) => ({
          id: selection[0] ?? 'consumer-table-one',
          selection,
        }),
        selection: ['consumer-table-one'],
        source: {
          format: 'text-tsv',
          rows: [
            ['Metric', 'Value'],
            ['Users', '42'],
          ],
        },
      })

    expect(tableImportTargetReplaceRoute).toMatchObject({
      intent: {
        kind: 'table-rows-replace',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
        target: {
          id: 'consumer-table-one',
          selection: ['consumer-table-one'],
        },
      },
      kind: 'table-rows-replace',
      status: 'routed',
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
    await expect(createCanvasExternalClipboardPasteActionPlan({
      resolvers: [
        createCanvasExternalClipboardImagePasteActionResolver({
          createAction: (source: string) => ({
            kind: 'image',
            source,
          }),
          readImageSource: async () => null,
        }),
      ],
    })).resolves.toEqual([])
    await expect(CanvasAppFacade.createCanvasExternalClipboardPasteActionPlan({
      resolvers: [],
    })).resolves.toEqual([])
    const dataTransferImportConsumedEvents: string[] = []
    const runDataTransferImportActionPlan =
      CanvasAppFacade.runCanvasDataTransferImportActionPlan
    type DataTransferImportAction =
      | { kind: 'clipboard-image'; source: string }
      | { kind: 'clipboard-text'; source: string }
      | { kind: 'stage-drop-media'; source: string }
    const clipboardPasteImageAction: DataTransferImportAction = {
      kind: 'clipboard-image',
      source: 'clipboard.png',
    }
    const clipboardPasteRunInput:
      CanvasDataTransferImportActionPlanRunInput<DataTransferImportAction> = {
        actions: [
          {
            kind: 'clipboard-text',
            source: 'plain',
          },
          clipboardPasteImageAction,
        ],
        onConsumed: (result) => {
          dataTransferImportConsumedEvents.push(
            `paste:${result.consumedAction.kind}`,
          )
        },
        runAction: (action) => action.kind === 'clipboard-image',
    }
    const clipboardPasteRunResult:
      CanvasDataTransferImportActionPlanRunResult<DataTransferImportAction> =
        runDataTransferImportActionPlan(clipboardPasteRunInput)
    const stageDropMediaAction: DataTransferImportAction = {
      kind: 'stage-drop-media',
      source: 'drop.mov',
    }
    const stageDropRunResult =
      runDataTransferImportActionPlan<DataTransferImportAction>({
        actions: [
          stageDropMediaAction,
        ],
        onConsumed: (result) => {
          dataTransferImportConsumedEvents.push(
            `drop:${result.consumedAction.kind}`,
          )
        },
        runAction: (action) => action.kind === 'stage-drop-media',
      })
    expect(getCanvasExternalClipboardPasteCommandRoute({
      clipboard: null,
      hasInternalClipboard: false,
      trigger: 'keyboard-shortcut',
    })).toBe('native-paste-event')
    expect(CanvasAppFacade.getCanvasExternalClipboardPasteCommandRoute({
      clipboard: null,
      hasInternalClipboard: false,
    })).toBe('none')
    expect(clipboardPasteRunResult).toEqual({
      attemptedActions: [
        {
          kind: 'clipboard-text',
          source: 'plain',
        },
        clipboardPasteImageAction,
      ],
      consumed: true,
      consumedAction: clipboardPasteImageAction,
      consumedActionIndex: 1,
    })
    expect(stageDropRunResult).toEqual({
      attemptedActions: [stageDropMediaAction],
      consumed: true,
      consumedAction: stageDropMediaAction,
      consumedActionIndex: 0,
    })
    expect(dataTransferImportConsumedEvents).toEqual([
      'paste:clipboard-image',
      'drop:stage-drop-media',
    ])
    const clipboardRect: CanvasItem = {
      fill: '#fff',
      h: 80,
      id: 'clipboard-rect-1',
      stroke: '#111',
      type: 'rect',
      w: 120,
      x: 10,
      y: 20,
    }
    const clipboardCommandAdapter: CanvasCommandAdapter<CanvasItem> = {
      alignSelection: ({ items }) => items,
      cloneSelection: ({ ids, items }) =>
        items.filter((item) => ids.includes(item.id)),
      deleteSelection: ({ items, selection }) =>
        items.filter((item) => !selection.includes(item.id)),
      distributeSelection: ({ items }) => items,
      groupSelection: ({ items, selection }) => ({ items, selection }),
      lockSelection: ({ items, selection }) => ({ items, selection }),
      nudgeSelection: ({ items }) => items,
      pasteItems: ({ clipboard }) => clipboard,
      reorderSelection: ({ items }) => items,
      selectAll: ({ items }) => items.map((item) => item.id),
      ungroupSelection: ({ items, selection }) => ({ items, selection }),
      unlockAll: ({ items, selection }) => ({ items, selection }),
    }
    const clipboardStageElement: CanvasAppStageElement = {
      addWheelListener: () => () => undefined,
      capturePointer: () => undefined,
      getRect: () => null,
      getScreenPoint: () => ({ x: 0, y: 0 }),
      getViewportCenter: () => ({ x: 0, y: 0 }),
      releasePointer: () => undefined,
    }
    const clipboardPlanContext: CanvasClipboardCommandEffectPlanContext = {
      commandAdapter: clipboardCommandAdapter,
      config: createCanvasAffordanceConfig(),
      createId: (prefix) => `${prefix}-consumer`,
      getClipboardItems: () => [],
      items: [clipboardRect],
      selection: [clipboardRect.id],
      stageElement: clipboardStageElement,
      viewport: { scale: 1, x: 0, y: 0 },
    }
    const clipboardCommand: CanvasClipboardCommand = {
      kind: 'copy',
      pasteIndex: 2,
    }
    const clipboardEffect =
      createCanvasClipboardCommandEffectPlan({
        command: clipboardCommand,
        context: clipboardPlanContext,
      })

    if (!clipboardEffect) {
      throw new Error('Expected clipboard copy command effect')
    }

    const publicClipboardEffect: CanvasClipboardCommandEffect =
      clipboardEffect
    const copiedSelections: string[][] = []
    const clipboardEffectContext: CanvasClipboardCommandEffectContext = {
      commitItemsChange: () => true,
      commitSelection: () => true,
      copyItemsToClipboard: (selection) => {
        copiedSelections.push(selection)

        return true
      },
      selection: [clipboardRect.id],
      setClipboardItems: () => undefined,
      setEditing: (editing: CanvasClipboardEditingUpdate) => {
        if (editing === null) {
          return
        }
      },
    }
    const clipboardApplyResult: CanvasClipboardCommandExecutionResult =
      applyCanvasClipboardCommandEffect({
        context: clipboardEffectContext,
        effect: publicClipboardEffect,
      })
    const clipboardExecutionContext: CanvasClipboardCommandExecutionContext = {
      ...clipboardPlanContext,
      ...clipboardEffectContext,
    }
    const clipboardExecutionResult: CanvasClipboardCommandExecutionResult =
      executeCanvasClipboardCommand({
        command: { kind: 'copy', pasteIndex: 3 },
        context: clipboardExecutionContext,
      })
    type HostClipboardItem = {
      id: string
      kind: 'ppt-shape'
      slideId: string
      x: number
      y: number
    }
    const hostClipboardItem: HostClipboardItem = {
      id: 'ppt-shape-1',
      kind: 'ppt-shape',
      slideId: 'slide-1',
      x: 0,
      y: 0,
    }
    const hostClipboardClone: HostClipboardItem = {
      ...hostClipboardItem,
      id: 'ppt-shape-copy',
      x: 28,
      y: 28,
    }
    const hostClipboardCommandAdapter: CanvasCommandAdapter<HostClipboardItem> =
      {
        alignSelection: ({ items }) => items,
        cloneSelection: () => [hostClipboardClone],
        deleteSelection: ({ items, selection }) =>
          items.filter((item) => !selection.includes(item.id)),
        distributeSelection: ({ items }) => items,
        groupSelection: ({ items, selection }) => ({ items, selection }),
        lockSelection: ({ items, selection }) => ({ items, selection }),
        nudgeSelection: ({ items }) => items,
        pasteItems: ({ clipboard }) => clipboard,
        reorderSelection: ({ items }) => items,
        selectAll: ({ items }) => items.map((item) => item.id),
        ungroupSelection: ({ items, selection }) => ({ items, selection }),
        unlockAll: ({ items, selection }) => ({ items, selection }),
      }
    const hostClipboardPlanContext:
      CanvasClipboardCommandEffectPlanContext<HostClipboardItem> = {
        commandAdapter: hostClipboardCommandAdapter,
        config: createCanvasAffordanceConfig(),
        createId: (prefix) => `${prefix}-host`,
        getClipboardItems: () => [],
        items: [hostClipboardItem],
        selection: [hostClipboardItem.id],
        stageElement: clipboardStageElement,
        viewport: { scale: 1, x: 0, y: 0 },
      }
    const hostClipboardEffect:
      CanvasClipboardCommandEffect<HostClipboardItem> | null =
        createCanvasClipboardCommandEffectPlan({
          command: { kind: 'duplicate' },
          context: hostClipboardPlanContext,
        })

    if (hostClipboardEffect?.kind !== 'transform-items') {
      throw new Error('Expected host clipboard transform effect')
    }

    const hostClipboardChanges:
      CanvasClipboardItemsChange<HostClipboardItem>[] = []
    const hostClipboardEffectContext:
      CanvasClipboardCommandEffectContext<HostClipboardItem> = {
        commitItemsChange: (change) => {
          hostClipboardChanges.push(change)

          return true
        },
        commitSelection: () => true,
        copyItemsToClipboard: () => true,
        selection: [hostClipboardItem.id],
        setClipboardItems: () => true,
        setEditing: () => undefined,
      }
    const hostClipboardApplyResult:
      CanvasClipboardCommandExecutionResult<HostClipboardItem> =
        applyCanvasClipboardCommandEffect({
          context: hostClipboardEffectContext,
          effect: hostClipboardEffect,
        })
    const hostClipboardExecutionContext:
      CanvasClipboardCommandExecutionContext<HostClipboardItem> = {
        ...hostClipboardPlanContext,
        ...hostClipboardEffectContext,
      }
    const hostClipboardExecutionResult:
      CanvasClipboardCommandExecutionResult<HostClipboardItem> =
        executeCanvasClipboardCommand({
          command: { kind: 'duplicate' },
          context: hostClipboardExecutionContext,
        })
    const hostStandardCommandAdapter: CanvasCommandAdapter<HostClipboardItem> =
      {
        ...hostClipboardCommandAdapter,
        nudgeSelection: ({ dx, dy, items, selection }) =>
          items.map((item) =>
            selection.includes(item.id)
              ? { ...item, x: item.x + dx, y: item.y + dy }
              : item,
          ),
      }
    const hostStandardCommand: CanvasStandardCommand = {
      dx: 9,
      dy: 4,
      kind: 'nudge',
    }
    const hostStandardPlanContext:
      CanvasStandardCommandEffectPlanContext<HostClipboardItem> = {
        commandAdapter: hostStandardCommandAdapter,
        config: createCanvasAffordanceConfig(),
        createId: (prefix) => `${prefix}-standard`,
        items: [hostClipboardItem],
        selection: [hostClipboardItem.id],
      }
    const hostStandardEffect:
      CanvasStandardCommandDocumentEffect<HostClipboardItem> | null =
        createCanvasStandardCommandEffectPlan({
          command: hostStandardCommand,
          context: hostStandardPlanContext,
        })

    if (
      hostStandardEffect?.kind !== 'items-change' ||
      hostStandardEffect.change.type !== 'replace-changed'
    ) {
      throw new Error('Expected host standard replace-changed effect')
    }

    const hostStandardChanges:
      CanvasStandardCommandItemsChange<HostClipboardItem>[] = []
    const hostStandardEffectContext:
      CanvasStandardCommandDocumentEffectContext<HostClipboardItem> = {
        commitItemsChange: (change) => {
          hostStandardChanges.push(change)

          return true
        },
        commitSelection: () => true,
        redo: () => undefined,
        selection: [hostClipboardItem.id],
        setEditing: () => undefined,
        setSelection: () => undefined,
        undo: () => undefined,
      }
    const hostStandardApplyResult = applyCanvasStandardDocumentEffect({
      context: hostStandardEffectContext,
      effect: hostStandardEffect,
    })
    const hostStandardExecutionContext:
      CanvasStandardCommandExecutionContext<HostClipboardItem> = {
        ...hostStandardPlanContext,
        ...hostStandardEffectContext,
      }
    const hostStandardExecutionResult = executeCanvasStandardCommand({
      command: hostStandardCommand,
      context: hostStandardExecutionContext,
    })
    const clipboardCommands: CanvasClipboardCommand[] = []
    const runClipboardCommand: RunCanvasClipboardCommand = (command) => {
      clipboardCommands.push(command)

      return []
    }

    expect(publicClipboardEffect).toEqual({ kind: 'copy-selection' })
    expect(clipboardApplyResult).toEqual({
      clonedItems: [],
      executed: true,
      nextPasteIndex: 0,
    })
    expect(clipboardExecutionResult).toEqual(clipboardApplyResult)
    expect(hostClipboardEffect.clonedItems[0]?.slideId).toBe('slide-1')
    expect(hostClipboardApplyResult.clonedItems[0]?.kind).toBe('ppt-shape')
    expect(hostClipboardExecutionResult.clonedItems[0]?.slideId).toBe(
      'slide-1',
    )
    expect(hostStandardEffect.change.items[0]?.slideId).toBe('slide-1')
    expect(hostStandardEffect.change.items[0]?.x).toBe(9)
    expect(hostStandardApplyResult).toBe(true)
    expect(hostStandardExecutionResult).toBe(true)
    const hostStandardApplyChange = hostStandardChanges[0]
    const hostStandardExecutionChange = hostStandardChanges[1]

    if (
      hostStandardApplyChange?.type !== 'replace-changed' ||
      hostStandardExecutionChange?.type !== 'replace-changed'
    ) {
      throw new Error('Expected host standard replace-changed changes')
    }

    expect(hostStandardApplyChange.items[0]?.kind).toBe('ppt-shape')
    expect(hostStandardExecutionChange.items[0]?.slideId).toBe('slide-1')
    expect(hostStandardExecutionChange.items[0]?.y).toBe(4)
    expect(hostClipboardChanges[0]).toEqual({
      afterItems: [hostClipboardItem, hostClipboardClone],
      beforeItems: [hostClipboardItem],
      type: 'transform',
    })
    expect(CanvasAppFacade.createCanvasClipboardCommandEffectPlan)
      .toBe(createCanvasClipboardCommandEffectPlan)
    expect(CanvasAppFacade.applyCanvasClipboardCommandEffect)
      .toBe(applyCanvasClipboardCommandEffect)
    expect(CanvasAppFacade.executeCanvasClipboardCommand)
      .toBe(executeCanvasClipboardCommand)
    expect(CanvasPackage.createCanvasStandardCommandEffectPlan)
      .toBe(createCanvasStandardCommandEffectPlan)
    expect(CanvasAppFacade.createCanvasStandardCommandEffectPlan)
      .toBe(createCanvasStandardCommandEffectPlan)
    expect(CanvasPackage.applyCanvasStandardDocumentEffect)
      .toBe(applyCanvasStandardDocumentEffect)
    expect(CanvasAppFacade.applyCanvasStandardDocumentEffect)
      .toBe(applyCanvasStandardDocumentEffect)
    expect(CanvasPackage.executeCanvasStandardCommand)
      .toBe(executeCanvasStandardCommand)
    expect(CanvasAppFacade.executeCanvasStandardCommand)
      .toBe(executeCanvasStandardCommand)
    expect(cloneCanvasClipboardItems({
      ids: [clipboardRect.id],
      offset: { x: 1, y: 2 },
      runClipboardCommand,
    })).toEqual([])
    copyCanvasClipboardSelection({
      pasteIndex: 4,
      runClipboardCommand,
    })
    cutCanvasClipboardSelection({
      pasteIndex: 5,
      runClipboardCommand,
    })
    duplicateCanvasClipboardSelection({
      offset: { x: 6, y: 7 },
      runClipboardCommand,
      selection: [clipboardRect.id],
    })
    pasteCanvasClipboardSelection({
      pasteIndex: 6,
      runClipboardCommand,
    })
    expect(clipboardCommands).toEqual([
      { ids: [clipboardRect.id], kind: 'clone', offset: { x: 1, y: 2 } },
      { kind: 'copy', pasteIndex: 4 },
      { kind: 'cut', pasteIndex: 5 },
      {
        kind: 'duplicate',
        offset: { x: 6, y: 7 },
        sourceIds: [clipboardRect.id],
      },
      { kind: 'paste', pasteIndex: 6 },
    ])
    expect(copiedSelections).toEqual([
      [clipboardRect.id],
      [clipboardRect.id],
    ])
    expect(CanvasAppFacade.cloneCanvasClipboardItems)
      .toBe(cloneCanvasClipboardItems)
    expect(CanvasAppFacade.copyCanvasClipboardSelection)
      .toBe(copyCanvasClipboardSelection)
    expect(CanvasAppFacade.cutCanvasClipboardSelection)
      .toBe(cutCanvasClipboardSelection)
    expect(CanvasAppFacade.duplicateCanvasClipboardSelection)
      .toBe(duplicateCanvasClipboardSelection)
    expect(CanvasAppFacade.pasteCanvasClipboardSelection)
      .toBe(pasteCanvasClipboardSelection)
    const packageJsonDataTransfer = {
      getData: (format: string) => {
        if (format === 'application/vnd.host.card+json') {
          return '{'
        }

        if (format === 'application/json') {
          return JSON.stringify({ kind: 'host-card', title: 'Package' })
        }

        return ''
      },
    }
    const packageJsonCandidateResult:
      CanvasDataTransferJSONCandidateReadResult<{
        title: string
      }> | null = readCanvasDataTransferJSONCandidate({
        candidates: [
          {
            mimeType: 'application/vnd.host.card+json',
            source: 'custom',
          },
          {
            mimeType: 'application/json',
            source: 'generic-json',
          },
          {
            mimeType: 'text/plain',
            source: 'plain-text',
          },
        ],
        dataTransfer: packageJsonDataTransfer,
        parseValue: ({ json }) => {
          if (
            typeof json !== 'object' ||
            json === null ||
            !('kind' in json) ||
            json.kind !== 'host-card' ||
            !('title' in json)
          ) {
            throw new Error('Invalid package host card')
          }

          return {
            title: String(json.title),
          }
        },
      })

    expect(packageJsonCandidateResult).toMatchObject({
      candidateIndex: 1,
      mimeType: 'application/json',
      source: 'generic-json',
      value: {
        title: 'Package',
      },
    })
    expect(CanvasAppFacade.readCanvasDataTransferJSONCandidate)
      .toBe(readCanvasDataTransferJSONCandidate)
    expect(CanvasPackage.readCanvasDataTransferJSONCandidate)
      .toBe(readCanvasDataTransferJSONCandidate)
    expect(setCanvasDataTransferText({
      dataTransfer: null,
      text: 'smoke',
    })).toBe(false)
    expect(getCanvasDataTransferText({
      dataTransfer: null,
    })).toBe('')
    expect(setCanvasDataTransferDropEffect({
      dataTransfer: null,
      dropEffect: 'move',
    })).toBe(false)
    expect(CanvasAppFacade.getCanvasDataTransferText({
      dataTransfer: null,
    })).toBe('')
    expect(CanvasAppFacade.setCanvasDataTransferDropEffect({
      dataTransfer: null,
      dropEffect: 'move',
    })).toBe(false)
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
    expect(createCanvasSvgPathDataFromPrimitives([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ])).toBe('M 1 2 L 3 4')
    expect(formatCanvasSvgNumber(1.2345)).toBe('1.234')
    expect(escapeCanvasXmlText('A&B <C>')).toBe('A&amp;B &lt;C&gt;')
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
    expect(createCanvasSvgFreehandPathDataFromPrimitives([
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
