import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { CanvasStage } from '../../ui/CanvasStage'
import { CanvasComponentPalette } from '../../ui/CanvasComponentPalette'
import { CanvasTextEditor } from '../../ui/CanvasTextEditor'
import { CanvasToolbar } from '../../ui/CanvasToolbar'
import { CanvasStatus } from '../../ui/CanvasStatus'
import { createCanvasComponentItem } from '../../host/CanvasComponentCatalog'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine/CanvasAffordances'
import {
  fitBoundsIntoViewport,
  INITIAL_VIEWPORT,
  zoomViewport,
  type Bounds,
  type Tool,
  type Viewport,
} from '../../engine/CanvasPrimitives'
import {
  INITIAL_ITEMS,
  type CanvasComponentKind,
  type EditingText,
  type Interaction,
} from '../../host/CanvasModel'
import { updateItemText } from '../../host/CanvasOperations'
import {
  findEditableTextItem,
  flattenCanvasItems,
  unionBounds,
} from '../../host/CanvasTree'
import { useCanvasPointerDragHandlers } from '../workflow/useCanvasPointerDragHandlers'
import { useCanvasPointerHandlers } from '../workflow/useCanvasPointerHandlers'
import { ZoomControls } from '../../ui/ZoomControls'
import { useCanvasCommands } from '../workflow/useCanvasCommands'
import { useCanvasKeyboardShortcuts } from '../workflow/useCanvasKeyboardShortcuts'
import { useCanvasHistory } from '../workflow/useCanvasHistory'
import { createCanvasOverlayState } from '../../engine/CanvasOverlayEngine'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasSnapGuides,
} from '../../engine/CanvasSnapEngine'
import {
  getCanvasWheelViewport,
  shouldHandleCanvasWheelViewport,
  type CanvasWheelInput,
} from '../../engine/CanvasViewportEngine'
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
  const editingId = editing?.id
  const activeMode = spaceDown ? 'pan' : tool

  useEffect(() => {
    syncDocumentSelection(selection)
  }, [selection, syncDocumentSelection])

  useEffect(() => {
    if (!editingId) {
      return
    }

    const frame = requestAnimationFrame(() => {
      editorRef.current?.focus()
      editorRef.current?.select()
    })

    return () => cancelAnimationFrame(frame)
  }, [editingId])

  useEffect(() => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    const svgElement = svg

    function handleNativeWheel(event: globalThis.WheelEvent) {
      const input = getCanvasWheelInput(event)

      if (
        !shouldHandleCanvasWheelViewport({
          config: canvasAffordanceConfig,
          input,
        })
      ) {
        return
      }

      event.preventDefault()

      const rect = svgElement.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      setViewport(
        (current) =>
          getCanvasWheelViewport({
            config: canvasAffordanceConfig,
            input,
            point,
            viewport: current,
          }) ?? current,
      )
    }

    svgElement.addEventListener('wheel', handleNativeWheel, { passive: false })

    return () => {
      svgElement.removeEventListener('wheel', handleNativeWheel)
    }
  }, [])

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
    moveSelection,
    pasteSelection,
    redoHistory,
    undoHistory,
    ungroupSelection,
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
    undo,
  })

  const fitToItems = useCallback(
    (ids?: string[]) => {
      const targetIds =
        ids && ids.length > 0
          ? ids
          : flattenCanvasItems(items).map((entry) => entry.item.id)
      const bounds = unionBounds(items, new Set(targetIds))
      const rect = svgRef.current?.getBoundingClientRect()

      if (!bounds || !rect) {
        return
      }

      setViewport(fitBoundsIntoViewport(bounds, rect))
    },
    [items],
  )

  useCanvasKeyboardShortcuts({
    config: canvasAffordanceConfig,
    copySelection,
    cutSelection,
    deleteSelection,
    duplicateSelection,
    fitToItems,
    groupSelection,
    interactionRef,
    moveSelection,
    pasteSelection,
    redoHistory,
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
  })

  function commitText() {
    if (!editing) {
      return
    }

    if (!editingItem) {
      setEditing(null)
      return
    }

    const value =
      editingItem.type === 'text' && !editing.value.trim()
        ? 'Text'
        : editing.value

    setItems((current) => updateItemText(current, editing.id, value), {
      before: selection,
      after: selection,
    })
    setEditing(null)
  }

  function cancelTextEdit() {
    setEditing(null)
  }

  function blurTextEditor() {
    editorRef.current?.blur()
  }

  const {
    handleCanvasPointerDown,
    handleItemPointerDown,
    handleResizePointerDown,
    handleTextDoubleClick,
  } = useCanvasPointerHandlers({
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

  function zoomBy(multiplier: number) {
    const rect = svgRef.current?.getBoundingClientRect()

    if (!rect) {
      return
    }

    const point = {
      x: rect.width / 2,
      y: rect.height / 2,
    }

    setViewport((current) => zoomViewport(current, point, multiplier))
  }

  function insertComponent(component: CanvasComponentKind) {
    const rect = svgRef.current?.getBoundingClientRect()
    const point = rect
      ? {
          x: (rect.width / 2 - viewport.x) / viewport.scale,
          y: (rect.height / 2 - viewport.y) / viewport.scale,
        }
      : { x: 120, y: 120 }
    const nextItem = createCanvasComponentItem({
      id: createId('component'),
      point,
      templateId: component,
    })

    setItems((current) => [...current, nextItem], {
      before: selection,
      after: [nextItem.id],
    })
    setSelection([nextItem.id])
    setEditing(null)
    setTool('select')
  }

  const editorStyle: CSSProperties | undefined =
    editingItem && editing
      ? {
          left: viewport.x + editingItem.x * viewport.scale,
          top: viewport.y + editingItem.y * viewport.scale,
          width: editingItem.w * viewport.scale,
          height: editingItem.h * viewport.scale,
          minHeight: editingItem.h * viewport.scale,
          fontSize: 16 * viewport.scale,
        }
      : undefined

  return (
    <main className="canvas-app">
      {canvasAffordanceConfig.overlays.toolbar ? (
        <CanvasToolbar
          canDelete={commandAvailability.delete}
          canDuplicate={commandAvailability.duplicate}
          canGroup={commandAvailability.group}
          canUngroup={commandAvailability.ungroup}
          canRedo={commandAvailability.redo}
          canUndo={commandAvailability.undo}
          config={canvasAffordanceConfig}
          tool={tool}
          onDelete={deleteSelection}
          onDuplicate={duplicateSelection}
          onGroup={groupSelection}
          onRedo={redoHistory}
          onToolChange={setTool}
          onUndo={undoHistory}
          onUngroup={ungroupSelection}
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
          onReset={() => setViewport(INITIAL_VIEWPORT)}
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

function getCanvasWheelInput(event: globalThis.WheelEvent): CanvasWheelInput {
  return {
    ctrlKey: event.ctrlKey,
    deltaMode: event.deltaMode,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  }
}

export default CanvasApp
