import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CanvasStage } from '../../ui/CanvasStage'
import { CanvasComponentPalette } from '../../ui/CanvasComponentPalette'
import { CanvasTextEditor } from '../../ui/CanvasTextEditor'
import { CanvasToolbar } from '../../ui/CanvasToolbar'
import { CanvasStatus } from '../../ui/CanvasStatus'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine/CanvasAffordances'
import {
  INITIAL_VIEWPORT,
  type Bounds,
  type Tool,
  type Viewport,
} from '../../engine/CanvasPrimitives'
import {
  type EditingText,
} from '../../host/CanvasModel'
import { INITIAL_ITEMS } from '../../host/CanvasInitialItems'
import { findEditableTextItem } from '../../host/CanvasTree'
import type { Interaction } from '../workflow/CanvasInteractionState'
import { useCanvasPointerDragHandlers } from '../workflow/useCanvasPointerDragHandlers'
import { useCanvasPointerDownHandlers } from '../workflow/useCanvasPointerDownHandlers'
import { ZoomControls } from '../../ui/ZoomControls'
import { useCanvasCommands } from '../workflow/useCanvasCommands'
import { useCanvasKeyboardShortcuts } from '../workflow/useCanvasKeyboardShortcuts'
import { useCanvasHistory } from '../workflow/useCanvasHistory'
import { useCanvasWheelViewport } from '../workflow/useCanvasWheelViewport'
import { useCanvasTextEditing } from '../workflow/useCanvasTextEditing'
import { useCanvasViewportControls } from '../workflow/useCanvasViewportControls'
import { useCanvasComponentInsertion } from '../workflow/useCanvasComponentInsertion'
import { createCanvasOverlayState } from '../../engine/CanvasOverlayEngine'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasSnapGuides,
} from '../../engine/CanvasSnapEngine'
import { getCanvasCommandAvailability } from '../../engine/CanvasCommandEngine'
import { CANVAS_ITEM_COMMAND_ADAPTER } from '../../host/adapters/CanvasItemCommandAdapter'
import { CANVAS_ITEM_CREATION_ADAPTER } from '../../host/adapters/CanvasItemCreationAdapter'
import { createCanvasItemScene } from '../../host/adapters/CanvasItemSceneAdapter'
import { CANVAS_ITEM_TRANSFORM_ADAPTER } from '../../host/adapters/CanvasItemTransformAdapter'
import './CanvasApp.css'

const canvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG

function CanvasApp() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const interactionRef = useRef<Interaction>({ kind: 'none' })
  const idSeed = useRef(INITIAL_ITEMS.length)

  const [tool, setTool] = useState<Tool>('select')
  const {
    canRedo,
    canUndo,
    commitItems: setItems,
    items,
    redo,
    recordHistoryFrom,
    setLiveItems,
    syncDocumentSelection,
    undo,
  } = useCanvasHistory(INITIAL_ITEMS)
  const [selection, setSelection] = useState<string[]>([
    'component-sticky',
    'component-card',
  ])
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
  const [spaceDown, setSpaceDown] = useState(false)
  const [gesture, setGesture] = useState<Interaction['kind']>('none')
  const [marquee, setMarquee] = useState<Bounds | null>(null)
  const [draftRect, setDraftRect] = useState<Bounds | null>(null)
  const [snapGuides, setSnapGuides] = useState<CanvasSnapGuides>(
    EMPTY_CANVAS_SNAP_GUIDES,
  )
  const [editing, setEditing] = useState<EditingText | null>(null)

  const selected = useMemo(() => new Set(selection), [selection])
  const scene = useMemo(() => createCanvasItemScene(items), [items])
  const selectedBounds = useMemo(() => scene.getBounds(selection), [scene, selection])
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
  const overlays = useMemo(
    () =>
      createCanvasOverlayState({
        config: canvasAffordanceConfig,
        draftRect,
        marquee,
        scene,
        selection,
        snapGuides,
        viewport,
      }),
    [draftRect, marquee, scene, selection, snapGuides, viewport],
  )
  const editingItem = editing ? findEditableTextItem(items, editing.id) : null
  const activeMode = spaceDown ? 'pan' : tool

  useEffect(() => {
    syncDocumentSelection(selection)
  }, [selection, syncDocumentSelection])

  useCanvasWheelViewport({
    config: canvasAffordanceConfig,
    setViewport,
    svgRef,
  })

  const {
    blurTextEditor,
    cancelTextEdit,
    commitText,
    editorStyle,
  } = useCanvasTextEditing({
    editing,
    editingItem,
    editorRef,
    selection,
    setEditing,
    setItems,
    viewport,
  })

  const createId = useCallback((prefix: string) => {
    idSeed.current += 1
    return `${prefix}-${idSeed.current}`
  }, [])

  const {
    cloneItems,
    copySelection,
    cutSelection,
    deleteSelection,
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
    commandAdapter: CANVAS_ITEM_COMMAND_ADAPTER,
    config: canvasAffordanceConfig,
    createId,
    items,
    redo,
    selection,
    setEditing,
    setItems,
    setSelection,
    svgRef,
    undo,
    viewport,
  })

  const { fitToItems, resetViewport, zoomBy } = useCanvasViewportControls({
    items,
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
    pasteSelection,
    redoHistory,
    reorderSelection,
    selectAll,
    selection,
    setDraftRect,
    setEditing,
    setGesture,
    setMarquee,
    setSelection,
    setSpaceDown,
    setTool,
    undoHistory,
    ungroupSelection,
    unlockAll,
  })

  const {
    handleCanvasPointerDown,
    handleItemPointerDown,
    handleResizePointerDown,
    handleTextDoubleClick,
  } = useCanvasPointerDownHandlers({
    cloneItems,
    config: canvasAffordanceConfig,
    creationAdapter: CANVAS_ITEM_CREATION_ADAPTER,
    createId,
    interactionRef,
    items,
    scene,
    selectedBounds,
    selection,
    setDraftRect,
    setEditing,
    setGesture,
    setItems,
    setLiveItems,
    setMarquee,
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
    creationAdapter: CANVAS_ITEM_CREATION_ADAPTER,
    createId,
    recordHistoryFrom,
    interactionRef,
    scene,
    selection,
    setItems,
    setDraftRect,
    setEditing,
    setGesture,
    setLiveItems,
    setMarquee,
    setSelection,
    setSnapGuides,
    setTool,
    setViewport,
    svgRef,
    transformAdapter: CANVAS_ITEM_TRANSFORM_ADAPTER,
    viewport,
  })

  const insertComponent = useCanvasComponentInsertion({
    createId,
    selection,
    setEditing,
    setItems,
    setSelection,
    setTool,
    svgRef,
    viewport,
  })

  return (
    <main className="canvas-app">
      {canvasAffordanceConfig.overlays.toolbar ? (
        <CanvasToolbar
          canDelete={commandAvailability.delete}
          canDuplicate={commandAvailability.duplicate}
          canGroup={commandAvailability.group}
          canLock={commandAvailability.lockSelection}
          canUngroup={commandAvailability.ungroup}
          canRedo={commandAvailability.redo}
          canUndo={commandAvailability.undo}
          config={canvasAffordanceConfig}
          tool={tool}
          onDelete={deleteSelection}
          onDuplicate={duplicateSelection}
          onGroup={groupSelection}
          onLock={lockSelection}
          onRedo={redoHistory}
          onToolChange={setTool}
          onUndo={undoHistory}
          onUngroup={ungroupSelection}
          onUnlockAll={unlockAll}
        />
      ) : null}

      <CanvasComponentPalette onInsert={insertComponent} />

      <CanvasStage
        activeMode={activeMode}
        gesture={gesture}
        items={items}
        overlays={overlays}
        selected={selected}
        svgRef={svgRef}
        viewport={viewport}
        onCanvasPointerDown={(event) => {
          blurTextEditor()
          handleCanvasPointerDown(event)
        }}
        onContextMenu={(event) => event.preventDefault()}
        onItemPointerDown={(event, itemId) => {
          blurTextEditor()
          handleItemPointerDown(event, itemId)
        }}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onResizePointerDown={handleResizePointerDown}
        onTextDoubleClick={handleTextDoubleClick}
      />

      <CanvasTextEditor
        editing={editing}
        editorRef={editorRef}
        style={editingItem ? editorStyle : undefined}
        onBlur={commitText}
        onCancel={cancelTextEdit}
        onChange={setEditing}
        onCommit={commitText}
      />

      {canvasAffordanceConfig.overlays.zoomControls ? (
        <ZoomControls
          config={canvasAffordanceConfig}
          scale={viewport.scale}
          onFit={() => fitToItems(selection.length > 0 ? selection : undefined)}
          onReset={resetViewport}
          onZoomIn={() => zoomBy(1.25)}
          onZoomOut={() => zoomBy(0.8)}
        />
      ) : null}

      {canvasAffordanceConfig.overlays.status ? (
        <CanvasStatus
          gesture={gesture}
          scale={viewport.scale}
          selectionLength={selection.length}
          tool={tool}
        />
      ) : null}
    </main>
  )
}

export default CanvasApp
