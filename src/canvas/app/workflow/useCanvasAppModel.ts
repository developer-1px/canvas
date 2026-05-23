import {
  useMemo,
  useRef,
} from 'react'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
} from '../../engine'
import { useCanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { getCanvasAppControlModel } from './CanvasAppControlModel'
import { renderCanvasAppStageModel } from './CanvasAppStageModel'
import { useCanvasAppCommandModel } from './useCanvasAppCommandModel'
import { useCanvasAppComponentModel } from './useCanvasAppComponentModel'
import { useCanvasAppExtensionModel } from './useCanvasAppExtensionModel'
import { useCanvasAppInspectorModel } from './useCanvasAppInspectorModel'
import { useCanvasAppKeyboardModel } from './useCanvasAppKeyboardModel'
import { useCanvasAppPointerModel } from './useCanvasAppPointerModel'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasInteractionModel } from './useCanvasInteractionModel'
import { useCanvasAppViewportModel } from './useCanvasAppViewportModel'
import { useCanvasWorkspaceModel } from './useCanvasWorkspaceModel'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  assertCanvasAppAssembly,
  type CanvasAppAssembly,
} from './CanvasAppAssembly'

const canvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG

export function useCanvasAppModel({
  assembly = DEFAULT_CANVAS_APP_ASSEMBLY,
}: {
  assembly?: CanvasAppAssembly
} = {}) {
  const validatedAssembly = useMemo(
    () => assertCanvasAppAssembly(assembly),
    [assembly],
  )
  const {
    componentLibrary,
    componentPresentationRenderers,
    customCommands,
    customCreationTools,
    customItemRenderers,
    customItemValidators,
    inspectorPanels,
    initialItems,
    itemAdapters,
    itemLayerAdapter,
    stageAdapter,
  } = validatedAssembly
  const stageElement = useCanvasAppStageElement()
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const {
    canRedo,
    canUndo,
    commitSelection,
    commitItemsChange,
    copyItemsToClipboard,
    createId,
    getClipboardItems,
    findDocumentText,
    itemReadModel,
    items,
    redo,
    replaceDocumentText,
    scene,
    selected,
    selectedBounds,
    selection,
    setClipboardItems,
    setLiveItems,
    setSelection,
    setViewport,
    undo,
    viewport,
  } = useCanvasWorkspaceModel({
    customItemValidators,
    initialItems,
  })
  const {
    activeMode,
    gesture,
    interactionRef,
    overlays,
    setDraftArrow,
    setDraftRect,
    setDraftStroke,
    setGesture,
    setMarquee,
    setSnapGuides,
    setSpaceDown,
    setTool,
    spaceDown,
    tool,
  } = useCanvasInteractionModel({
    config: canvasAffordanceConfig,
    scene,
    selection,
    viewport,
  })

  const inspector = useCanvasAppInspectorModel({
    commitItemsChange,
    inspectorPanels,
    itemReadModel,
    selected,
    selection,
  })
  const {
    blurTextEditor,
    setEditing,
    textEditor,
  } = useCanvasTextEditorModel({
    commitItemsChange,
    editorRef,
    itemReadModel,
    selection,
    viewport,
  })

  const { findReplace, openFindReplace } = useCanvasFindReplaceModel({
    findDocumentText,
    replaceDocumentText,
  })

  const {
    customCommandStates,
    customCreationToolStates,
    runCustomCommand,
  } = useCanvasAppExtensionModel({
    commitItemsChange,
    commitSelection,
    createId,
    customCommands,
    customCreationTools,
    items,
    selection,
    setEditing,
    viewport,
  })

  const commands = useCanvasAppCommandModel({
    commandAdapter: itemAdapters.command,
    config: canvasAffordanceConfig,
    createId,
    document: {
      commitItemsChange,
      commitSelection,
      copyItemsToClipboard,
      getClipboardItems,
      redo,
      setClipboardItems,
      undo,
    },
    setEditing,
    stageElement,
    workspace: {
      items,
      selection,
      setSelection,
      viewport,
    },
  })

  const viewportControls = useCanvasAppViewportModel({
    config: canvasAffordanceConfig,
    itemReadModel,
    setViewport,
    stageElement,
  })

  useCanvasAppKeyboardModel({
    command: {
      commitSelection,
      copySelection: commands.copySelection,
      cutSelection: commands.cutSelection,
      deleteSelection: commands.deleteSelection,
      duplicateSelection: commands.duplicateSelection,
      groupSelection: commands.groupSelection,
      lockSelection: commands.lockSelection,
      moveSelection: commands.moveSelection,
      pasteSelection: commands.pasteSelection,
      redoHistory: commands.redoHistory,
      reorderSelection: commands.reorderSelection,
      selectAll: commands.selectAll,
      undoHistory: commands.undoHistory,
      ungroupSelection: commands.ungroupSelection,
      unlockAll: commands.unlockAll,
    },
    config: canvasAffordanceConfig,
    customCreationTools: customCreationToolStates,
    interaction: {
      interactionRef,
      setDraftArrow,
      setDraftRect,
      setDraftStroke,
      setEditing,
      setGesture,
      setMarquee,
      setSpaceDown,
      setTool,
    },
    openFindReplace,
    selection,
    viewport: {
      fitToItems: viewportControls.fitToItems,
      resetViewport: viewportControls.resetViewport,
      zoomBy: viewportControls.zoomBy,
    },
  })

  const pointer = useCanvasAppPointerModel({
    command: {
      cloneItems: commands.cloneItems,
      commitItemsChange,
      commitSelection,
    },
    config: canvasAffordanceConfig,
    createId,
    customCreationTools,
    interaction: {
      interactionRef,
      setDraftArrow,
      setDraftRect,
      setDraftStroke,
      setGesture,
      setMarquee,
      setSnapGuides,
      setTool,
      spaceDown,
      tool,
    },
    itemAdapters: {
      creation: itemAdapters.creation,
      transform: itemAdapters.transform,
    },
    stageElement,
    workspace: {
      itemReadModel,
      items,
      scene,
      selectedBounds,
      selection,
      setEditing,
      setLiveItems,
      setSelection,
      setViewport,
      viewport,
    },
  })

  const components = useCanvasAppComponentModel({
    command: {
      commitItemsChange,
    },
    componentLibrary,
    createId,
    interaction: {
      setEditing,
      setTool,
    },
    stageElement,
    workspace: {
      selection,
      viewport,
    },
  })

  const controls = getCanvasAppControlModel({
    canRedo,
    canUndo,
    components: componentLibrary.templates,
    config: canvasAffordanceConfig,
    customCommands: customCommandStates,
    customTools: customCreationToolStates,
    gesture,
    scene,
    selection,
    tool,
    viewport,
    onAlign: commands.alignSelection,
    onDelete: commands.deleteSelection,
    onDistribute: commands.distributeSelection,
    onDuplicate: commands.duplicateSelection,
    onFitItems: viewportControls.fitToItems,
    onGroup: commands.groupSelection,
    onInsertComponent: components.insertComponent,
    onLock: commands.lockSelection,
    onRedo: commands.redoHistory,
    onRunCustomCommand: runCustomCommand,
    onToolChange: setTool,
    onUndo: commands.undoHistory,
    onUngroup: commands.ungroupSelection,
    onUnlockAll: commands.unlockAll,
    onViewportReset: viewportControls.resetViewport,
    onZoomBy: viewportControls.zoomBy,
  })

  return {
    componentPalette: controls.componentPalette,
    findReplace,
    inspector,
    stage: renderCanvasAppStageModel({
      blurTextEditor,
      itemLayerAdapter,
      itemLayerInput: {
        componentPresentationRenderers,
        customItemRenderers,
        getComponentPresentation: componentLibrary.getPresentation,
        items,
        onItemPointerDown: pointer.itemLayerHandlers.onItemPointerDown,
        onTextDoubleClick: pointer.itemLayerHandlers.onTextDoubleClick,
        outlineIds: overlays.itemOutlineIds,
        selected,
      },
      stageAdapter,
      stageInput: {
        activeMode,
        gesture,
        overlays,
        stageElement: stageElement.mount,
        viewport,
        onCanvasPointerDown: pointer.stageHandlers.onCanvasPointerDown,
        onPointerCancel: pointer.stageHandlers.onPointerCancel,
        onPointerMove: pointer.stageHandlers.onPointerMove,
        onPointerUp: pointer.stageHandlers.onPointerUp,
        onResizePointerDown: pointer.stageHandlers.onResizePointerDown,
      },
    }),
    status: controls.status,
    textEditor,
    toolbar: controls.toolbar,
    zoomControls: controls.zoomControls,
  }
}
