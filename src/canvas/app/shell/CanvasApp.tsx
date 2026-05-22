import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CanvasAppView } from './CanvasAppView'
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
import { useCanvasCommands } from '../workflow/useCanvasCommands'
import { useCanvasKeyboardShortcuts } from '../workflow/useCanvasKeyboardShortcuts'
import { useCanvasHistory } from '../workflow/useCanvasHistory'
import { useCanvasWheelViewport } from '../workflow/useCanvasWheelViewport'
import { useCanvasTextEditing } from '../workflow/useCanvasTextEditing'
import { useCanvasViewportControls } from '../workflow/useCanvasViewportControls'
import { useCanvasComponentInsertion } from '../workflow/useCanvasComponentInsertion'
import { useCanvasObjectInspector } from '../workflow/useCanvasObjectInspector'
import {
  getCanvasItemIdSeed,
  readStoredCanvasWorkspace,
  useCanvasWorkspacePersistence,
} from '../workflow/CanvasWorkspacePersistence'
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
const DEFAULT_INITIAL_SELECTION = ['component-sticky', 'component-card']

function CanvasApp() {
  const storedWorkspace = useMemo(() => readStoredCanvasWorkspace(), [])
  const initialItems = storedWorkspace?.items ?? INITIAL_ITEMS

  const svgRef = useRef<SVGSVGElement | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const interactionRef = useRef<Interaction>({ kind: 'none' })
  const idSeed = useRef(getCanvasItemIdSeed(initialItems))

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
  } = useCanvasHistory(initialItems)
  const [selection, setSelection] = useState<string[]>(
    () => storedWorkspace?.selection ?? [...DEFAULT_INITIAL_SELECTION],
  )
  const [viewport, setViewport] = useState<Viewport>(
    () => storedWorkspace?.viewport ?? INITIAL_VIEWPORT,
  )
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
  const inspector = useCanvasObjectInspector({
    items,
    selected,
    selection,
    setItems,
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

  useCanvasWorkspacePersistence({
    items,
    selection,
    viewport,
  })

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
    resetViewport,
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
    zoomBy,
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
    <CanvasAppView
      activeMode={activeMode}
      blurTextEditor={blurTextEditor}
      commandAvailability={commandAvailability}
      config={canvasAffordanceConfig}
      editing={editing}
      editorRef={editorRef}
      editorStyle={editingItem ? editorStyle : undefined}
      fitToItems={fitToItems}
      gesture={gesture}
      inspector={inspector}
      insertComponent={insertComponent}
      items={items}
      overlays={overlays}
      selected={selected}
      selection={selection}
      svgRef={svgRef}
      tool={tool}
      viewport={viewport}
      onAlign={alignSelection}
      onCancelTextEdit={cancelTextEdit}
      onChangeEditing={setEditing}
      onCommitText={commitText}
      onDelete={deleteSelection}
      onDistribute={distributeSelection}
      onDuplicate={duplicateSelection}
      onGroup={groupSelection}
      onItemPointerDown={handleItemPointerDown}
      onLock={lockSelection}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onRedo={redoHistory}
      onResetViewport={resetViewport}
      onResizePointerDown={handleResizePointerDown}
      onTextDoubleClick={handleTextDoubleClick}
      onToolChange={setTool}
      onUndo={undoHistory}
      onUngroup={ungroupSelection}
      onUnlockAll={unlockAll}
      onZoomBy={zoomBy}
    />
  )
}

export default CanvasApp
