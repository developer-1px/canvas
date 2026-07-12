import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftShapeOverlay,
  type CanvasLaserTrailOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../../../workflow/CanvasWorkflowContract'
import type { Interaction } from './CanvasInteractionState'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { CanvasAppCustomCreationTool } from '../../../extensions/custom-tools/CanvasAppCustomCreationTools'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppComponentLibrary } from '../../../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import {
  commitCanvasPointerInteraction,
} from './CanvasPointerInteractionLifecycle'
import {
  applyCanvasPointerInteractionCancelEffect,
  applyCanvasPointerInteractionCommitResultEffect,
  applyCanvasPointerInteractionPreviewEffect,
} from './CanvasPointerInteractionDragEffects'
import { previewCanvasPointerInteraction } from './CanvasPointerInteractionPreview'
import {
  getCanvasPointerDragProjection,
  getCanvasPointerDragSession,
} from './CanvasPointerDragSession'

type UseCanvasPointerDragHandlersArgs = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  componentLibrary: CanvasAppComponentLibrary
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interactionRef: MutableRefObject<Interaction>
  itemReadModel: CanvasAppItemReadModel
  scene: CanvasSceneAdapter
  selection: string[]
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<CanvasDraftShapeOverlay | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setLaserTrail: Dispatch<SetStateAction<CanvasLaserTrailOverlay | null>>
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
  cloneItems,
  componentLibrary,
  commitSelection,
  commitItemsChange,
  config,
  creationAdapter,
  createId,
  customCreationTools,
  interactionRef,
  itemReadModel,
  scene,
  selection,
  setDraftArrow,
  setDraftRect,
  setDraftStroke,
  setLaserTrail,
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
    setLaserTrail,
    setGesture,
    setLiveItems,
    setMarquee,
    setSelection,
    setSnapGuides,
    setViewport,
    stageElement,
  }

  function handlePointerMove(event: CanvasAppPointerInput) {
    const drag = getCanvasPointerDragProjection({
      event,
      interaction: interactionRef.current,
      stageElement,
      viewport,
    })

    if (!drag) {
      return
    }

    event.preventDefault()

    const preview = previewCanvasPointerInteraction({
      config,
      cloneItems,
      currentScreen: drag.currentScreen,
      currentWorld: drag.currentWorld,
      input: event,
      interaction: drag.interaction,
      itemReadModel,
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
    const drag = getCanvasPointerDragSession({
      event,
      interaction: interactionRef.current,
    })

    if (!drag) {
      return
    }

    event.preventDefault()
    const committed = commitCanvasPointerInteraction({
      componentLibrary,
      commitItemsChange,
      commitSelection,
      creationAdapter,
      createId,
      customCreationTools,
      interaction: drag.interaction,
      scene,
      selection,
      setEditing,
      setSelection,
      setTool,
      textTarget: itemReadModel.textTarget,
    })

    applyCanvasPointerInteractionCommitResultEffect({
      committed,
      context: dragEffectContext,
      event,
      interaction: drag.interaction,
    })
  }

  function handlePointerCancel(event: CanvasAppPointerInput) {
    const drag = getCanvasPointerDragSession({
      event,
      interaction: interactionRef.current,
    })

    if (!drag) {
      return
    }

    applyCanvasPointerInteractionCancelEffect({
      context: dragEffectContext,
      event,
      interaction: drag.interaction,
    })
  }

  return {
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
  }
}
