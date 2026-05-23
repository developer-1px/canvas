import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CanvasAppView } from './CanvasAppView'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  EMPTY_CANVAS_SNAP_GUIDES,
  createCanvasOverlayState,
  getCanvasCommandAvailability,
  type CanvasSnapGuides,
} from '../../engine'
import type {
  Bounds,
  Tool,
} from '../../core'
import type { EditingText } from '../../host'
import {
  CANVAS_ITEM_ENGINE_ADAPTERS,
} from '../../host'
import type { Interaction } from '../pointer/CanvasInteractionState'
import { useCanvasPointerDragHandlers } from '../pointer/useCanvasPointerDragHandlers'
import { useCanvasPointerDownHandlers } from '../pointer/useCanvasPointerDownHandlers'
import { useCanvasCommands } from '../commands/useCanvasCommands'
import { useCanvasKeyboardShortcuts } from '../keyboard/useCanvasKeyboardShortcuts'
import { useCanvasWheelViewport } from '../viewport/useCanvasWheelViewport'
import { useCanvasTextEditing } from '../text/useCanvasTextEditing'
import { useCanvasViewportControls } from '../viewport/useCanvasViewportControls'
import { useCanvasComponentInsertion } from '../components/useCanvasComponentInsertion'
import { useCanvasObjectInspector } from '../inspector/useCanvasObjectInspector'
import { useCanvasWorkspaceModel } from '../workflow/useCanvasWorkspaceModel'
import './CanvasApp.css'

const canvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG

function CanvasApp() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const interactionRef = useRef<Interaction>({ kind: 'none' })

  const [tool, setTool] = useState<Tool>('select')
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
  const [spaceDown, setSpaceDown] = useState(false)
  const [gesture, setGesture] = useState<Interaction['kind']>('none')
  const [marquee, setMarquee] = useState<Bounds | null>(null)
  const [draftRect, setDraftRect] = useState<Bounds | null>(null)
  const [snapGuides, setSnapGuides] = useState<CanvasSnapGuides>(
    EMPTY_CANVAS_SNAP_GUIDES,
  )
  const [editing, setEditing] = useState<EditingText | null>(null)
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [findReplacement, setFindReplacement] = useState('')

  const inspector = useCanvasObjectInspector({
    commitItemsChange,
    items,
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
  const editingItem = editing
    ? itemReadModel.findEditableTextItem(editing.id)
    : null
  const activeMode = spaceDown ? 'pan' : tool
  const findMatches = findDocumentText(findQuery)
  const findMatchCount = findMatches.reduce(
    (total, match) => total + match.occurrences,
    0,
  )

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
    commitItemsChange,
    editing,
    editingItem,
    editorRef,
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

  const { fitToItems, resetViewport, zoomBy } = useCanvasViewportControls({
    items,
    setViewport,
    svgRef,
  })

  const openFindReplace = useCallback(() => {
    setFindReplaceOpen(true)
  }, [])

  const replaceAllText = useCallback(() => {
    replaceDocumentText(findQuery, findReplacement)
  }, [findQuery, findReplacement, replaceDocumentText])

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
    items,
    scene,
    selectedBounds,
    selection,
    setDraftRect,
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
      findReplace={{
        matchCount: findMatchCount,
        open: findReplaceOpen,
        query: findQuery,
        replacement: findReplacement,
        onClose: () => setFindReplaceOpen(false),
        onQueryChange: setFindQuery,
        onReplaceAll: replaceAllText,
        onReplacementChange: setFindReplacement,
      }}
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
