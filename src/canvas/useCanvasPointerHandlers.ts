import type {
  Dispatch,
  MutableRefObject,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import { useRef } from 'react'
import type { CanvasAffordanceConfig } from './CanvasAffordances'
import {
  normalizeBounds,
  pointDistance,
  unique,
  type Bounds,
  type CanvasItem,
  type EditingText,
  type Interaction,
  type Point,
  type RectItem,
  type ResizeHandle,
  type TextItem,
  type Tool,
  type Viewport,
} from './CanvasModel'
import { capturePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import {
  findEditableTextItem,
  findParentGroupId,
  findSelectedAncestorId,
} from './CanvasTree'

type UseCanvasPointerHandlersArgs = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  interactionRef: MutableRefObject<Interaction>
  items: CanvasItem[]
  selectedBounds: Bounds | null
  selection: string[]
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setItems: Dispatch<SetStateAction<CanvasItem[]>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  svgRef: RefObject<SVGSVGElement | null>
  tool: Tool
  viewport: Viewport
}

export function useCanvasPointerHandlers({
  cloneItems,
  config,
  createId,
  interactionRef,
  items,
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
}: UseCanvasPointerHandlersArgs) {
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

    const id = createId('text')
    const nextItem: TextItem = {
      id,
      type: 'text',
      x: point.x,
      y: point.y,
      w: 190,
      h: 42,
      text: 'Text',
    }

    setItems((current) => [...current, nextItem])
    setSelection([id])
    setEditing({ id, value: nextItem.text })
    setTool('select')
  }

  function handleCanvasPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 && event.button !== 1) {
      return
    }

    event.preventDefault()
    capturePointer(svgRef, event.pointerId)

    const startScreen = screenPoint(svgRef, event)
    const startWorld = screenToWorld(startScreen, viewport)

    if (
      config.gestures.pan &&
      (event.button === 1 || spaceDown || tool === 'pan')
    ) {
      beginPan(event.pointerId, startScreen)
      return
    }

    if (tool === 'rect' && config.gestures.createRect) {
      interactionRef.current = {
        kind: 'create-rect',
        pointerId: event.pointerId,
        startScreen,
        startWorld,
        currentWorld: startWorld,
        moved: false,
      }
      setDraftRect(normalizeBounds(startWorld, startWorld))
      setGesture('create-rect')
      return
    }

    if (tool === 'text' && config.gestures.createText) {
      beginCreateText(startWorld)
      return
    }

    if (!config.gestures.marquee) {
      return
    }

    if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
      setSelection([])
    }

    interactionRef.current = {
      kind: 'marquee',
      pointerId: event.pointerId,
      startScreen,
      startWorld,
      currentWorld: startWorld,
      additive: event.shiftKey || event.metaKey || event.ctrlKey,
      baseSelection: selection,
      moved: false,
    }
    setMarquee(normalizeBounds(startWorld, startWorld))
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

    const additive = event.shiftKey || event.metaKey || event.ctrlKey
    const editItem =
      isDoubleClick && !additive && config.gestures.textEdit
        ? findEditableTextItem(items, itemId)
        : null
    const selectedAncestorId = findSelectedAncestorId(items, itemId, selection)
    const dragItemId = additive
      ? itemId
      : selectedAncestorId ?? findParentGroupId(items, itemId) ?? itemId
    const alreadySelected = selection.includes(itemId)
    const dragAlreadySelected = selection.includes(dragItemId)
    let nextSelection = selection

    if (editItem) {
      lastClickRef.current = null
    }

    if (additive) {
      const parentGroupId = findParentGroupId(items, itemId)
      const baseSelection =
        parentGroupId && !alreadySelected
          ? selection.filter((id) => id !== parentGroupId)
          : selection

      nextSelection = alreadySelected
        ? selection.filter((id) => id !== itemId)
        : unique([...baseSelection, itemId])
      setSelection(nextSelection)

      if (alreadySelected) {
        interactionRef.current = { kind: 'none' }
        setGesture('none')
        return
      }
    } else if (!dragAlreadySelected) {
      nextSelection = [dragItemId]
      setSelection(nextSelection)
    }

    let startItems = items
    const historyItems = items

    if (
      event.altKey &&
      config.gestures.altDragDuplicate &&
      config.commands.duplicate
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
      startItems,
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
      historyItems: items,
      moved: false,
    }
    setGesture('resize')
  }

  function handleTextDoubleClick(item: RectItem | TextItem) {
    if (!config.gestures.textEdit) {
      return
    }

    setSelection([item.id])
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
