import {
  createElement,
  useCallback,
  useMemo,
  useRef,
  type PointerEvent,
} from 'react'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  getCanvasCommandAvailability,
} from '../../engine'
import {
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
} from '../../host'
import { useCanvasCommands } from '../commands/useCanvasCommands'
import { useCanvasComponentInsertion } from '../components/useCanvasComponentInsertion'
import { useCanvasObjectInspector } from '../inspector/useCanvasObjectInspector'
import { useCanvasKeyboardShortcuts } from '../keyboard/useCanvasKeyboardShortcuts'
import { useCanvasPointerDownHandlers } from '../pointer/useCanvasPointerDownHandlers'
import { useCanvasPointerDragHandlers } from '../pointer/useCanvasPointerDragHandlers'
import { CanvasDemoSvgItemLayer } from '../rendering'
import { useCanvasViewportControls } from '../viewport/useCanvasViewportControls'
import { useCanvasWheelViewport } from '../viewport/useCanvasWheelViewport'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasInteractionModel } from './useCanvasInteractionModel'
import { useCanvasWorkspaceModel } from './useCanvasWorkspaceModel'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'

const canvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG

export function useCanvasAppModel() {
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
  } = useCanvasWorkspaceModel()
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
    commandAdapter: CANVAS_ITEM_ENGINE_ADAPTERS.command,
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
    creationAdapter: CANVAS_ITEM_ENGINE_ADAPTERS.creation,
    createId,
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
    creationAdapter: CANVAS_ITEM_ENGINE_ADAPTERS.creation,
    commitItemsChange,
    createId,
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
    transformAdapter: CANVAS_ITEM_ENGINE_ADAPTERS.transform,
    viewport,
  })

  const insertComponent = useCanvasComponentInsertion({
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
      components: CANVAS_COMPONENT_LIBRARY.templates,
      onInsert: insertComponent,
    },
    findReplace,
    inspector,
    stage: {
      activeMode,
      children: createElement(CanvasDemoSvgItemLayer, {
        getComponentPresentation: CANVAS_COMPONENT_LIBRARY.getPresentation,
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
      gesture,
      scale: viewport.scale,
      selectionLength: selection.length,
      tool,
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
