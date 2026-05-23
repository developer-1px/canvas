import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  Bounds,
  CanvasItem,
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../engine'
import { releasePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { Interaction } from './CanvasInteractionState'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  cancelCanvasPointerInteraction,
  commitCanvasPointerInteraction,
} from './CanvasPointerInteractionLifecycle'
import { previewCanvasPointerInteraction } from './CanvasPointerInteractionPreview'

type UseCanvasPointerDragHandlersArgs = {
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interactionRef: MutableRefObject<Interaction>
  scene: CanvasSceneAdapter
  selection: string[]
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setTool: Dispatch<SetStateAction<Tool>>
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
  transformAdapter: CanvasTransformAdapter<CanvasItem>
  viewport: Viewport
}

export function useCanvasPointerDragHandlers({
  commitSelection,
  commitItemsChange,
  config,
  creationAdapter,
  createId,
  customCreationTools,
  interactionRef,
  scene,
  selection,
  setDraftArrow,
  setDraftRect,
  setDraftStroke,
  setEditing,
  setGesture,
  setLiveItems,
  setMarquee,
  setSelection,
  setSnapGuides,
  setTool,
  setViewport,
  stageElement,
  transformAdapter,
  viewport,
}: UseCanvasPointerDragHandlersArgs) {
  function handlePointerMove(event: CanvasAppPointerInput) {
    const interaction = interactionRef.current

    if (interaction.kind === 'none' || interaction.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()

    const currentScreen = screenPoint(stageElement, event)
    const currentWorld = screenToWorld(currentScreen, viewport)
    const preview = previewCanvasPointerInteraction({
      config,
      currentScreen,
      currentWorld,
      input: event,
      interaction,
      scene,
      transformAdapter,
      viewport,
    })

    if (preview.kind === 'none') {
      return
    }

    if (preview.snapGuides) {
      setSnapGuides(preview.snapGuides)
    }

    if (preview.viewport) {
      setViewport(preview.viewport)
    }

    if (preview.interaction) {
      interactionRef.current = preview.interaction
    }

    if (preview.liveItems) {
      setLiveItems(preview.liveItems)
    }

    if (preview.marquee) {
      setMarquee(preview.marquee)
    }

    if (preview.selection) {
      setSelection(preview.selection)
    }

    if (preview.draftRect) {
      setDraftRect(preview.draftRect)
    }

    if (preview.draftStroke) {
      setDraftStroke(preview.draftStroke)
    }

    if (preview.draftArrow) {
      setDraftArrow(preview.draftArrow)
    }
  }

  function handlePointerUp(event: CanvasAppPointerInput) {
    const interaction = interactionRef.current

    if (interaction.kind === 'none' || interaction.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    releasePointer(stageElement, event.pointerId)

    commitCanvasPointerInteraction({
      commitItemsChange,
      commitSelection,
      creationAdapter,
      createId,
      customCreationTools,
      interaction,
      scene,
      selection,
      setEditing,
      setSelection,
      setTool,
    })

    interactionRef.current = { kind: 'none' }
    setGesture('none')
    setMarquee(null)
    setDraftArrow(null)
    setDraftRect(null)
    setDraftStroke(null)
    setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
  }

  function handlePointerCancel(event: CanvasAppPointerInput) {
    const interaction = interactionRef.current

    cancelCanvasPointerInteraction({
      interaction,
      setLiveItems,
      setSelection,
    })

    releasePointer(stageElement, event.pointerId)
    interactionRef.current = { kind: 'none' }
    setGesture('none')
    setMarquee(null)
    setDraftArrow(null)
    setDraftRect(null)
    setDraftStroke(null)
    setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
  }

  return {
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
  }
}
