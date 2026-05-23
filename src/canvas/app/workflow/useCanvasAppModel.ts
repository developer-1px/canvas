import {
  createElement,
  useCallback,
  useMemo,
  useRef,
  type PointerEvent,
} from 'react'
import {
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCES,
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  getCanvasCommandAvailability,
} from '../../engine'
import {
  isCanvasCustomToolId,
  type CanvasInteractionKind,
  type Tool,
} from '../../entities'
import { useCanvasCommands } from '../commands/useCanvasCommands'
import {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
  type CanvasAppCustomCommandContext,
} from '../commands/CanvasAppCustomCommands'
import { useCanvasComponentInsertion } from '../components/useCanvasComponentInsertion'
import { useCanvasObjectInspector } from '../inspector/useCanvasObjectInspector'
import { useCanvasKeyboardShortcuts } from '../keyboard/useCanvasKeyboardShortcuts'
import { useCanvasPointerDownHandlers } from '../pointer/useCanvasPointerDownHandlers'
import { useCanvasPointerDragHandlers } from '../pointer/useCanvasPointerDragHandlers'
import { CanvasDemoSvgItemLayer } from '../rendering'
import {
  getCanvasAppCustomCreationToolStates,
  type CanvasAppCustomCreationToolState,
} from '../tools/CanvasAppCustomCreationTools'
import { useCanvasViewportControls } from '../viewport/useCanvasViewportControls'
import { useCanvasWheelViewport } from '../viewport/useCanvasWheelViewport'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasInteractionModel } from './useCanvasInteractionModel'
import { useCanvasWorkspaceModel } from './useCanvasWorkspaceModel'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  type CanvasAppAssembly,
} from './CanvasAppAssembly'

const canvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG

export function useCanvasAppModel({
  assembly = DEFAULT_CANVAS_APP_ASSEMBLY,
}: {
  assembly?: CanvasAppAssembly
} = {}) {
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
  } = assembly
  const svgRef = useRef<SVGSVGElement | null>(null)
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
  const commandAvailability = useMemo(
    () =>
      getCanvasCommandAvailability({
        canRedo,
        canUndo,
        config: canvasAffordanceConfig,
        hasSelectedGroup: selection.some(scene.isGroup),
        selection,
      }),
    [canRedo, canUndo, scene, selection],
  )
  useCanvasWheelViewport({
    config: canvasAffordanceConfig,
    setViewport,
    svgRef,
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

  const customCommandContext = useMemo<CanvasAppCustomCommandContext>(
    () => ({
      commitItemsChange,
      commitSelection,
      createId,
      items,
      selection,
      setEditing,
      viewport,
    }),
    [
      commitItemsChange,
      commitSelection,
      createId,
      items,
      selection,
      setEditing,
      viewport,
    ],
  )
  const customCommandStates = useMemo(
    () =>
      getCanvasAppCustomCommandStates({
        commands: customCommands,
        context: customCommandContext,
      }),
    [customCommandContext, customCommands],
  )
  const customCreationToolStates = useMemo(
    () => getCanvasAppCustomCreationToolStates(customCreationTools),
    [customCreationTools],
  )
  const runCustomCommand = useCallback(
    (commandId: string) => {
      runCanvasAppCustomCommand({
        commandId,
        commands: customCommands,
        context: customCommandContext,
      })
    },
    [customCommandContext, customCommands],
  )

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
    svgRef,
    undo,
    viewport,
  })

  const { fitToItems, resetViewport, zoomBy } =
    useCanvasViewportControls({
      itemReadModel,
      setViewport,
      svgRef,
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

  const {
    handleCanvasPointerDown,
    handleItemPointerDown,
    handleResizePointerDown,
    handleTextDoubleClick,
  } = useCanvasPointerDownHandlers({
    cloneItems,
    commitSelection,
    config: canvasAffordanceConfig,
    creationAdapter: itemAdapters.creation,
    createId,
    customCreationTools,
    commitItemsChange,
    interactionRef,
    itemReadModel,
    items,
    scene,
    selectedBounds,
    selection,
    setDraftRect,
    setDraftArrow,
    setDraftStroke,
    setEditing,
    setGesture,
    setLiveItems,
    setSelection,
    setTool,
    spaceDown,
    svgRef,
    tool,
    viewport,
  })

  const {
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
  } = useCanvasPointerDragHandlers({
    config: canvasAffordanceConfig,
    creationAdapter: itemAdapters.creation,
    commitItemsChange,
    createId,
    customCreationTools,
    commitSelection,
    interactionRef,
    scene,
    selection,
    setDraftRect,
    setDraftArrow,
    setDraftStroke,
    setEditing,
    setGesture,
    setLiveItems,
    setMarquee,
    setSelection,
    setSnapGuides,
    setTool,
    setViewport,
    svgRef,
    transformAdapter: itemAdapters.transform,
    viewport,
  })

  const insertComponent = useCanvasComponentInsertion({
    componentLibrary,
    commitItemsChange,
    createId,
    selection,
    setEditing,
    setTool,
    svgRef,
    viewport,
  })

  const handleStageCanvasPointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      blurTextEditor()
      handleCanvasPointerDown(event)
    },
    [blurTextEditor, handleCanvasPointerDown],
  )

  const handleStageItemPointerDown = useCallback(
    (event: PointerEvent<SVGGElement>, itemId: string) => {
      blurTextEditor()
      handleItemPointerDown(event, itemId)
    },
    [blurTextEditor, handleItemPointerDown],
  )

  return {
    componentPalette: {
      components: componentLibrary.templates,
      onInsert: insertComponent,
    },
    findReplace,
    inspector,
    stage: {
      activeMode,
      children: createElement(CanvasDemoSvgItemLayer, {
        componentPresentationRenderers,
        customItemRenderers,
        getComponentPresentation: componentLibrary.getPresentation,
        items,
        onItemPointerDown: handleStageItemPointerDown,
        onTextDoubleClick: handleTextDoubleClick,
        outlineIds: overlays.itemOutlineIds,
        selected,
      }),
      gesture,
      overlays,
      svgRef,
      viewport,
      onCanvasPointerDown: handleStageCanvasPointerDown,
      onContextMenu: (event: PointerEvent<SVGSVGElement>) =>
        event.preventDefault(),
      onPointerCancel: handlePointerCancel,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onResizePointerDown: handleResizePointerDown,
    },
    status: {
      mode: getCanvasAppStatusMode({
        customCreationTools: customCreationToolStates,
        gesture,
        tool,
      }),
      scale: viewport.scale,
      selectionLength: selection.length,
      visible: canvasAffordanceConfig.overlays.status,
    },
    textEditor,
    toolbar: {
      canAlign: selection.length > 1,
      canDelete: commandAvailability.delete,
      canDuplicate: commandAvailability.duplicate,
      canDistribute: selection.length > 2,
      canGroup: commandAvailability.group,
      canLock: commandAvailability.lockSelection,
      canRedo: commandAvailability.redo,
      canUndo: commandAvailability.undo,
      canUngroup: commandAvailability.ungroup,
      config: canvasAffordanceConfig,
      customCommands: customCommandStates,
      customTools: customCreationToolStates,
      tool,
      visible: canvasAffordanceConfig.overlays.toolbar,
      onAlign: alignSelection,
      onDelete: deleteSelection,
      onDistribute: distributeSelection,
      onDuplicate: duplicateSelection,
      onGroup: groupSelection,
      onLock: lockSelection,
      onRedo: redoHistory,
      onToolChange: setTool,
      onCustomCommand: runCustomCommand,
      onUndo: undoHistory,
      onUngroup: ungroupSelection,
      onUnlockAll: unlockAll,
    },
    zoomControls: {
      config: canvasAffordanceConfig,
      scale: viewport.scale,
      visible: canvasAffordanceConfig.overlays.zoomControls,
      onFit: () => fitToItems(selection.length > 0 ? selection : undefined),
      onReset: resetViewport,
      onZoomIn: () => zoomBy(1.25),
      onZoomOut: () => zoomBy(0.8),
    },
  }
}

function getCanvasAppStatusMode({
  customCreationTools,
  gesture,
  tool,
}: {
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  tool: Tool
}) {
  const gestureLabel = CANVAS_GESTURE_STATUS_LABELS[gesture]

  if (gestureLabel) {
    return gestureLabel
  }

  if (isCanvasCustomToolId(tool)) {
    return (
      customCreationTools.find((customTool) => customTool.id === tool)
        ?.statusLabel ?? 'Canvas'
    )
  }

  return CANVAS_TOOL_AFFORDANCES[tool].statusLabel
}
