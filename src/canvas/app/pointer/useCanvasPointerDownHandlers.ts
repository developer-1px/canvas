import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import { useRef } from 'react'
import type {
  Bounds,
  CanvasArrowEndpoint,
  CanvasEditableTextItem,
  CanvasItem,
  EditingText,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../entities'
import {
  shouldRouteCanvasItemPointerToCanvasGesture,
} from '../../engine'
import type {
  CanvasAffordanceConfig,
  CanvasCreationAdapter,
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasSceneAdapter,
} from '../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { Interaction } from './CanvasInteractionState'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasDrawingStrokeStyleSet } from '../../host'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { startCanvasPointerInteraction } from './CanvasPointerInteractionStart'
import {
  startCanvasItemPointerInteraction,
  startCanvasTextEditInteraction,
} from './CanvasItemPointerInteractionStart'
import { startCanvasResizePointerInteraction } from './CanvasResizePointerInteractionStart'
import {
  startCanvasArrowEndpointPointerInteraction,
} from './CanvasArrowEndpointPointerInteractionStart'
import {
  recordCanvasItemPointerClick,
  type CanvasPointerClickMemory,
} from './CanvasPointerClickMemory'
import {
  applyCanvasItemPointerInteractionStartEffect,
  applyCanvasPointerInteractionStartEffect,
  applyCanvasResizePointerInteractionStartEffect,
  applyCanvasTextEditInteractionStartEffect,
} from './CanvasPointerInteractionStartEffects'
import { getCanvasPointerStartProjection } from './CanvasPointerStartSession'

type UseCanvasPointerDownHandlersArgs = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  componentLibrary: CanvasAppComponentLibrary
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  drawingStyles: CanvasDrawingStrokeStyleSet
  interactionRef: MutableRefObject<Interaction>
  itemReadModel: CanvasAppItemReadModel
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
  componentLibrary,
  commitSelection,
  commitItemsChange,
  config,
  creationAdapter,
  createId,
  customCreationTools,
  drawingStyles,
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
  const lastClickRef = useRef<CanvasPointerClickMemory>(null)
  const startEffectContext = {
    commitItemsChange,
    commitSelection,
    interactionRef,
    selection,
    setDraftArrow,
    setDraftRect,
    setDraftStroke,
    setEditing,
    setGesture,
    setLiveItems,
    setSelection,
    setTool,
    stageElement,
  }

  function handleCanvasPointerDown(
    event: CanvasAppPointerInput,
    targetItemId?: string,
  ) {
    const projection = getCanvasPointerStartProjection({
      event,
      stageElement,
      viewport,
    })
    const start = startCanvasPointerInteraction({
      componentLibrary,
      config,
      creationAdapter,
      createId,
      customCreationTools,
      drawingStyles,
      input: event,
      itemReadModel,
      scene,
      selection,
      spaceDown,
      startScreen: projection.startScreen,
      startWorld: projection.startWorld,
      targetItemId,
      tool,
      viewport,
    })

    applyCanvasPointerInteractionStartEffect({
      context: startEffectContext,
      event,
      start,
    })
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
      handleCanvasPointerDown(event, itemId)
      return
    }

    const projection = getCanvasPointerStartProjection({
      event,
      stageElement,
      viewport,
    })
    const clickMemory = recordCanvasItemPointerClick({
      itemId,
      lastClick: lastClickRef.current,
      point: projection.startScreen,
      time: performance.now(),
    })

    lastClickRef.current = clickMemory.nextClick
    const start = startCanvasItemPointerInteraction({
      cloneItems,
      config,
      input: event,
      isDoubleClick: clickMemory.isDoubleClick,
      itemId,
      itemReadModel,
      items,
      scene,
      selection,
      startScreen: projection.startScreen,
      startWorld: projection.startWorld,
    })

    applyCanvasItemPointerInteractionStartEffect({
      clearLastClick: () => {
        lastClickRef.current = null
      },
      context: startEffectContext,
      event,
      start,
    })
  }

  function handleResizePointerDown(
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) {
    const projection = getCanvasPointerStartProjection({
      event,
      stageElement,
      viewport,
    })
    const start = startCanvasResizePointerInteraction({
      config,
      handle,
      input: event,
      items,
      selectedBounds,
      selection,
      startScreen: projection.startScreen,
      startWorld: projection.startWorld,
    })

    applyCanvasResizePointerInteractionStartEffect({
      context: startEffectContext,
      event,
      start,
    })
  }

  function handleArrowEndpointPointerDown(
    event: CanvasAppPointerInput,
    arrowId: string,
    endpoint: CanvasArrowEndpoint,
  ) {
    const projection = getCanvasPointerStartProjection({
      event,
      stageElement,
      viewport,
    })
    const start = startCanvasArrowEndpointPointerInteraction({
      arrowId,
      config,
      endpoint,
      input: event,
      items,
      startScreen: projection.startScreen,
      startWorld: projection.startWorld,
    })

    applyCanvasResizePointerInteractionStartEffect({
      context: startEffectContext,
      event,
      start,
    })
  }

  function handleTextDoubleClick(item: CanvasEditableTextItem) {
    const start = startCanvasTextEditInteraction({ config, item })

    applyCanvasTextEditInteractionStartEffect({
      context: startEffectContext,
      start,
    })
  }

  return {
    handleArrowEndpointPointerDown,
    handleCanvasPointerDown,
    handleItemPointerDown,
    handleResizePointerDown,
    handleTextDoubleClick,
  }
}
