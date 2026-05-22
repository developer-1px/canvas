import type {
  Dispatch,
  MutableRefObject,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import { useRef } from 'react'
import type { CanvasAffordanceConfig } from '../../engine/affordance/CanvasAffordances'
import type {
  Bounds,
  Point,
  ResizeHandle,
  Tool,
  Viewport
} from '../../core'
import type {
  CanvasItem,
  EditingText,
  RectItem,
  TextItem
} from '../../host/model'
import {
  normalizeBounds,
  pointDistance,
} from '../../engine/primitives/CanvasPrimitives'
import { capturePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import {
  createCanvasText,
  type CanvasCreationAdapter,
} from '../../engine/creation/CanvasCreationEngine'
import {
  getCanvasItemPointerIntent,
  getCanvasPointerGesture,
  isAdditivePointerInput,
} from '../../engine/gesture/CanvasGestureEngine'
import { getCanvasItemPointerSelection } from '../../engine/selection/CanvasSelectionEngine'
import { snapCanvasPointToGrid } from '../../engine/snap/CanvasSnapEngine'
import type { CanvasSceneAdapter } from '../../engine/scene/CanvasSceneAdapter'
import { findEditableTextItem } from '../../host/tree/CanvasTree'
import type {
  CommitCanvasSelection,
  CommitCanvasItemsPatch,
} from '../document/useCanvasDocument'
import type { Interaction } from './CanvasInteractionState'

type UseCanvasPointerDownHandlersArgs = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  commitSelection: CommitCanvasSelection
  commitItemsPatch: CommitCanvasItemsPatch
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  interactionRef: MutableRefObject<Interaction>
  items: CanvasItem[]
  scene: CanvasSceneAdapter
  selectedBounds: Bounds | null
  selection: string[]
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  svgRef: RefObject<SVGSVGElement | null>
  tool: Tool
  viewport: Viewport
}

export function useCanvasPointerDownHandlers({
  cloneItems,
  commitSelection,
  commitItemsPatch,
  config,
  creationAdapter,
  createId,
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

    commitItemsPatch([{ op: 'add', path: '/-', value: created.item }], {
      before: selection,
      after: [created.item.id],
    })
    setEditing({ id: created.item.id, value: created.editValue })
    setTool('select')
  }

  function handleCanvasPointerDown(event: PointerEvent<SVGSVGElement>) {
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
    capturePointer(svgRef, event.pointerId)

    const startScreen = screenPoint(svgRef, event)
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
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    capturePointer(svgRef, event.pointerId)

    const startScreen = screenPoint(svgRef, event)
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
        ? findEditableTextItem(items, itemId)
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
    event: PointerEvent<SVGRectElement>,
    handle: ResizeHandle,
  ) {
    if (event.button !== 0 || !selectedBounds || !config.gestures.resize) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    capturePointer(svgRef, event.pointerId)

    const startScreen = screenPoint(svgRef, event)
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
