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
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../engine'
import { screenPoint, screenToWorld } from './CanvasPointerGeometry'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { Interaction } from './CanvasInteractionState'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  commitCanvasPointerInteraction,
} from './CanvasPointerInteractionLifecycle'
import {
  applyCanvasPointerInteractionCancelEffect,
  applyCanvasPointerInteractionEndEffect,
  applyCanvasPointerInteractionPreviewEffect,
} from './CanvasPointerInteractionDragEffects'
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
  const dragEffectContext = {
    interactionRef,
    setDraftArrow,
    setDraftRect,
    setDraftStroke,
    setGesture,
    setLiveItems,
    setMarquee,
    setSelection,
    setSnapGuides,
    setViewport,
    stageElement,
  }

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

    applyCanvasPointerInteractionPreviewEffect({
      context: dragEffectContext,
      preview,
    })
  }

  function handlePointerUp(event: CanvasAppPointerInput) {
    const interaction = interactionRef.current

    if (interaction.kind === 'none' || interaction.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
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

    applyCanvasPointerInteractionEndEffect({
      context: dragEffectContext,
      event,
    })
  }

  function handlePointerCancel(event: CanvasAppPointerInput) {
    const interaction = interactionRef.current

    applyCanvasPointerInteractionCancelEffect({
      context: dragEffectContext,
      event,
      interaction,
    })
  }

  return {
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
  }
}
