import {
  useMemo,
  useRef,
} from 'react'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
} from '../../engine'
import { useCanvasCommands } from '../commands/useCanvasCommands'
import { useCanvasComponentInsertion } from '../components/useCanvasComponentInsertion'
import { useCanvasObjectInspector } from '../inspector/useCanvasObjectInspector'
import { useCanvasKeyboardShortcuts } from '../keyboard/useCanvasKeyboardShortcuts'
import { useCanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { useCanvasViewportControls } from '../viewport/useCanvasViewportControls'
import { useCanvasWheelViewport } from '../viewport/useCanvasWheelViewport'
import { getCanvasAppControlModel } from './CanvasAppControlModel'
import { renderCanvasAppStageModel } from './CanvasAppStageModel'
import { useCanvasAppExtensionModel } from './useCanvasAppExtensionModel'
import { useCanvasAppPointerModel } from './useCanvasAppPointerModel'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasInteractionModel } from './useCanvasInteractionModel'
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

  const inspector = useCanvasObjectInspector({
    commitItemsChange,
    inspectorPanels,
    itemReadModel,
    selected,
    selection,
  })
  useCanvasWheelViewport({
    config: canvasAffordanceConfig,
    setViewport,
    stageElement,
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

  const {
    alignSelection,
    cloneItems,
    copySelection,
    cutSelection,
    deleteSelection,
    distributeSelection,
    duplicateSelection,
    groupSelection,
    lockSelection,
    moveSelection,
    pasteSelection,
    redoHistory,
    reorderSelection,
    selectAll,
    undoHistory,
    ungroupSelection,
    unlockAll,
  } = useCanvasCommands({
    commandAdapter: itemAdapters.command,
    commitSelection,
    commitItemsChange,
    config: canvasAffordanceConfig,
    copyItemsToClipboard,
    createId,
    getClipboardItems,
    items,
    redo,
    selection,
    setEditing,
    setClipboardItems,
    setSelection,
    stageElement,
    undo,
    viewport,
  })

  const { fitToItems, resetViewport, zoomBy } =
    useCanvasViewportControls({
      itemReadModel,
      setViewport,
      stageElement,
    })

  useCanvasKeyboardShortcuts({
    config: canvasAffordanceConfig,
    copySelection,
    customCreationTools: customCreationToolStates,
    cutSelection,
    deleteSelection,
    duplicateSelection,
    fitToItems,
    groupSelection,
    lockSelection,
    interactionRef,
    moveSelection,
    openFindReplace,
    pasteSelection,
    redoHistory,
    resetViewport,
    reorderSelection,
    selectAll,
    selection,
    commitSelection,
    setDraftRect,
    setDraftArrow,
    setDraftStroke,
    setEditing,
    setGesture,
    setMarquee,
    setSpaceDown,
    setTool,
    undoHistory,
    ungroupSelection,
    unlockAll,
    zoomBy,
  })

  const pointer = useCanvasAppPointerModel({
    command: {
      cloneItems,
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

  const insertComponent = useCanvasComponentInsertion({
    componentLibrary,
    commitItemsChange,
    createId,
    selection,
    setEditing,
    setTool,
    stageElement,
    viewport,
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
    onAlign: alignSelection,
    onDelete: deleteSelection,
    onDistribute: distributeSelection,
    onDuplicate: duplicateSelection,
    onFitItems: fitToItems,
    onGroup: groupSelection,
    onInsertComponent: insertComponent,
    onLock: lockSelection,
    onRedo: redoHistory,
    onRunCustomCommand: runCustomCommand,
    onToolChange: setTool,
    onUndo: undoHistory,
    onUngroup: ungroupSelection,
    onUnlockAll: unlockAll,
    onViewportReset: resetViewport,
    onZoomBy: zoomBy,
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
