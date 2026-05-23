import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import { useRef } from 'react'
import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  ResizeHandle,
  RectItem,
  TextItem,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import {
  normalizeBounds,
  pointDistance,
  isCanvasCustomToolId,
} from '../../core'
import { capturePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import {
  createCanvasText,
  getCanvasItemPointerIntent,
  getCanvasItemPointerSelection,
  getCanvasPointerGesture,
  isAdditivePointerInput,
  snapCanvasPointToGrid,
  shouldRouteCanvasItemPointerToCanvasGesture,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSceneAdapter,
} from '../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { Interaction } from './CanvasInteractionState'
import { createCanvasDraftStroke } from './CanvasPointerDrawing'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { getCanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationToolRuntime'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'

type UseCanvasPointerDownHandlersArgs = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interactionRef: MutableRefObject<Interaction>
  itemReadModel: CanvasItemReadModel
  items: CanvasItem[]
  scene: CanvasSceneAdapter
  selectedBounds: Bounds | null
  selection: string[]
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  stageElement: CanvasAppStageElement
  tool: Tool
  viewport: Viewport
}

export function useCanvasPointerDownHandlers({
  cloneItems,
  commitSelection,
  commitItemsChange,
  config,
  creationAdapter,
  createId,
  customCreationTools,
  interactionRef,
  itemReadModel,
  items,
  scene,
  selectedBounds,
  selection,
  setDraftArrow,
  setDraftRect,
  setDraftStroke,
  setEditing,
  setGesture,
  setLiveItems,
  setSelection,
  setTool,
  spaceDown,
  stageElement,
  tool,
  viewport,
}: UseCanvasPointerDownHandlersArgs) {
  const lastClickRef = useRef<{
    id: string
    point: Point
    time: number
  } | null>(null)

  function beginPan(pointerId: number, point: Point) {
    if (!config.gestures.pan) {
      return
    }

    interactionRef.current = {
      kind: 'pan',
      pointerId,
      startScreen: point,
      origin: viewport,
    }
    setGesture('pan')
  }

  function beginCreateText(point: Point) {
    if (!config.gestures.createText) {
      return
    }

    const created = createCanvasText({
      adapter: creationAdapter,
      createId,
      point,
    })

    commitItemsChange({ type: 'add', items: [created.item] }, {
      before: selection,
      after: [created.item.id],
    })
    setEditing({ id: created.item.id, value: created.editValue })
    setTool('select')
  }

  function handleCanvasPointerDown(event: CanvasAppPointerInput) {
    const pointerGesture = getCanvasPointerGesture({
      config,
      input: event,
      spaceDown,
      tool,
    })

    if (pointerGesture === 'none') {
      return
    }

    event.preventDefault()
    capturePointer(stageElement, event.pointerId)

    const startScreen = screenPoint(stageElement, event)
    const startWorld = screenToWorld(startScreen, viewport)

    if (pointerGesture === 'pan') {
      beginPan(event.pointerId, startScreen)
      return
    }

    if (pointerGesture === 'create-rect') {
      const snappedStartWorld = snapCanvasPointToGrid({
        config,
        point: startWorld,
      })

      interactionRef.current = {
        kind: 'create-rect',
        pointerId: event.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        moved: false,
      }
      setDraftRect(normalizeBounds(snappedStartWorld, snappedStartWorld))
      setGesture('create-rect')
      return
    }

    if (pointerGesture === 'draw-marker' || pointerGesture === 'draw-highlight') {
      const kind =
        pointerGesture === 'draw-marker' ? 'marker' : 'highlight'
      interactionRef.current = {
        kind: pointerGesture,
        pointerId: event.pointerId,
        startScreen,
        startWorld,
        currentWorld: startWorld,
        points: [startWorld],
        moved: false,
      }
      setDraftStroke(createCanvasDraftStroke(kind, [startWorld]))
      setGesture(pointerGesture)
      return
    }

    if (pointerGesture === 'create-arrow') {
      const snappedStartWorld = snapCanvasPointToGrid({
        config,
        point: startWorld,
      })

      interactionRef.current = {
        kind: 'create-arrow',
        pointerId: event.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        moved: false,
      }
      setDraftArrow({
        end: snappedStartWorld,
        start: snappedStartWorld,
      })
      setGesture('create-arrow')
      return
    }

    if (pointerGesture === 'create-custom' && isCanvasCustomToolId(tool)) {
      if (!getCanvasAppCustomCreationTool(customCreationTools, tool)) {
        return
      }

      const snappedStartWorld = snapCanvasPointToGrid({
        config,
        point: startWorld,
      })

      interactionRef.current = {
        kind: 'create-custom',
        pointerId: event.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        tool,
        moved: false,
      }
      setGesture('create-custom')
      return
    }

    if (pointerGesture === 'create-text') {
      beginCreateText(startWorld)
      return
    }

    const additive = isAdditivePointerInput(event)

    if (!additive) {
      setSelection([])
    }

    interactionRef.current = {
      kind: 'marquee',
      pointerId: event.pointerId,
      startScreen,
      startWorld,
      currentWorld: startWorld,
      additive,
      baseSelection: selection,
      moved: false,
    }
    setGesture('marquee')
  }

  function handleItemPointerDown(
    event: CanvasAppPointerInput,
    itemId: string,
  ) {
    if (event.button !== 0) {
      return
    }

    if (shouldRouteCanvasItemPointerToCanvasGesture({ spaceDown, tool })) {
      event.stopPropagation()
      handleCanvasPointerDown(event)
      return
    }

    event.preventDefault()
    event.stopPropagation()
    capturePointer(stageElement, event.pointerId)

    const startScreen = screenPoint(stageElement, event)
    const lastClick = lastClickRef.current
    const now = performance.now()
    const isDoubleClick =
      lastClick?.id === itemId &&
      now - lastClick.time < 360 &&
      pointDistance(startScreen, lastClick.point) < 6

    lastClickRef.current = { id: itemId, point: startScreen, time: now }

    const itemIntent = getCanvasItemPointerIntent({
      config,
      input: event,
      isDoubleClick,
    })
    const editItem =
      itemIntent.textEdit
        ? itemReadModel.findEditableTextItem(itemId)
        : null
    const itemSelection = getCanvasItemPointerSelection({
      additive: itemIntent.additive,
      itemId,
      scene,
      selection,
    })
    let nextSelection = itemSelection.nextSelection
    const historySelection = nextSelection
    const moveBounds = scene.getBounds(nextSelection)

    if (editItem) {
      lastClickRef.current = null
    }

    if (itemIntent.additive) {
      commitSelection(nextSelection)

      if (itemSelection.alreadySelected) {
        interactionRef.current = { kind: 'none' }
        setGesture('none')
        return
      }
    } else if (nextSelection !== selection) {
      commitSelection(nextSelection)
    }

    let startItems = items
    const historyItems = items

    if (
      itemIntent.altDragDuplicate
    ) {
      const clones = cloneItems(nextSelection, { x: 0, y: 0 })

      if (clones.length > 0) {
        nextSelection = clones.map((item) => item.id)
        startItems = [...items, ...clones]
        setLiveItems(startItems)
        setSelection(nextSelection)
      }
    }

    if (!config.gestures.move) {
      interactionRef.current = { kind: 'none' }
      setGesture('none')
      return
    }

    const startWorld = screenToWorld(startScreen, viewport)

    interactionRef.current = {
      kind: 'move',
      pointerId: event.pointerId,
      startScreen,
      startWorld,
      ids: nextSelection,
      bounds: moveBounds,
      historySelection,
      startItems,
      currentItems: startItems,
      historyItems,
      edit: editItem
        ? {
            id: editItem.id,
            value: editItem.type === 'rect' ? editItem.text ?? '' : editItem.text,
          }
        : undefined,
      moved: false,
    }
    setGesture('move')
  }

  function handleResizePointerDown(
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) {
    if (event.button !== 0 || !selectedBounds || !config.gestures.resize) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    capturePointer(stageElement, event.pointerId)

    const startScreen = screenPoint(stageElement, event)
    const startWorld = screenToWorld(startScreen, viewport)

    interactionRef.current = {
      kind: 'resize',
      pointerId: event.pointerId,
      handle,
      startScreen,
      startWorld,
      ids: selection,
      bounds: selectedBounds,
      startItems: items,
      currentItems: items,
      historyItems: items,
      moved: false,
    }
    setGesture('resize')
  }

  function handleTextDoubleClick(item: RectItem | TextItem) {
    if (!config.gestures.textEdit) {
      return
    }

    commitSelection([item.id])
    setEditing({
      id: item.id,
      value: item.type === 'rect' ? item.text ?? '' : item.text,
    })
    setTool('select')
  }

  return {
    handleCanvasPointerDown,
    handleItemPointerDown,
    handleResizePointerDown,
    handleTextDoubleClick,
  }
}
