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
import { pointDistance } from '../../core'
import { capturePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import {
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
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { startCanvasPointerInteraction } from './CanvasPointerInteractionStart'
import {
  startCanvasItemPointerInteraction,
  startCanvasTextEditInteraction,
} from './CanvasItemPointerInteractionStart'
import { startCanvasResizePointerInteraction } from './CanvasResizePointerInteractionStart'

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

  function handleCanvasPointerDown(event: CanvasAppPointerInput) {
    const startScreen = screenPoint(stageElement, event)
    const startWorld = screenToWorld(startScreen, viewport)
    const start = startCanvasPointerInteraction({
      config,
      creationAdapter,
      createId,
      customCreationTools,
      input: event,
      selection,
      spaceDown,
      startScreen,
      startWorld,
      tool,
      viewport,
    })

    if (start.kind === 'none') {
      return
    }

    event.preventDefault()

    if (start.capturePointer) {
      capturePointer(stageElement, event.pointerId)
    }

    if (start.kind === 'created-text') {
      commitItemsChange({ type: 'add', items: [start.item] }, {
        before: selection,
        after: [start.item.id],
      })
      setEditing(start.edit)
      setTool('select')
      return
    }

    if (start.clearSelection) {
      setSelection([])
    }

    interactionRef.current = start.interaction

    if (start.draftRect) {
      setDraftRect(start.draftRect)
    }

    if (start.draftStroke) {
      setDraftStroke(start.draftStroke)
    }

    if (start.draftArrow) {
      setDraftArrow(start.draftArrow)
    }

    setGesture(start.gesture)
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

    const startScreen = screenPoint(stageElement, event)
    const lastClick = lastClickRef.current
    const now = performance.now()
    const isDoubleClick =
      lastClick?.id === itemId &&
      now - lastClick.time < 360 &&
      pointDistance(startScreen, lastClick.point) < 6

    lastClickRef.current = { id: itemId, point: startScreen, time: now }
    const startWorld = screenToWorld(startScreen, viewport)
    const start = startCanvasItemPointerInteraction({
      cloneItems,
      config,
      input: event,
      isDoubleClick,
      itemId,
      itemReadModel,
      items,
      scene,
      selection,
      startScreen,
      startWorld,
    })

    event.preventDefault()
    event.stopPropagation()

    if (start.clearLastClick) {
      lastClickRef.current = null
    }

    if (start.commitSelection) {
      commitSelection(start.commitSelection)
    }

    if (start.liveItems) {
      setLiveItems(start.liveItems)
    }

    if (start.selection) {
      setSelection(start.selection)
    }

    if (start.kind === 'none') {
      interactionRef.current = { kind: 'none' }
      setGesture('none')
      return
    }

    capturePointer(stageElement, event.pointerId)
    interactionRef.current = start.interaction
    setGesture('move')
  }

  function handleResizePointerDown(
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) {
    const startScreen = screenPoint(stageElement, event)
    const startWorld = screenToWorld(startScreen, viewport)
    const start = startCanvasResizePointerInteraction({
      config,
      handle,
      input: event,
      items,
      selectedBounds,
      selection,
      startScreen,
      startWorld,
    })

    if (start.kind === 'none') {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    if (start.capturePointer) {
      capturePointer(stageElement, event.pointerId)
    }

    interactionRef.current = start.interaction
    setGesture(start.gesture)
  }

  function handleTextDoubleClick(item: RectItem | TextItem) {
    const start = startCanvasTextEditInteraction({ config, item })

    if (start.kind === 'none') {
      return
    }

    commitSelection(start.selection)
    setEditing(start.editing)
    setTool(start.tool)
  }

  return {
    handleCanvasPointerDown,
    handleItemPointerDown,
    handleResizePointerDown,
    handleTextDoubleClick,
  }
}
