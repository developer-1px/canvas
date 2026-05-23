import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
  CanvasOverlayState,
  CanvasSnapGuides,
} from '../../engine'
import type {
  Bounds,
  Tool,
} from '../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'

type CanvasInteractionConsumerModelInput = {
  draft: {
    setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
    setDraftRect: Dispatch<SetStateAction<Bounds | null>>
    setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  }
  gesture: Interaction['kind']
  marquee: {
    setMarquee: Dispatch<SetStateAction<Bounds | null>>
  }
  overlays: CanvasOverlayState
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

export function getCanvasInteractionConsumerModel({
  draft,
  gesture,
  marquee,
  overlays,
  setGesture,
  setSnapGuides,
  setSpaceDown,
  setTool,
  spaceDown,
  tool,
}: CanvasInteractionConsumerModelInput) {
  const activeMode = spaceDown ? 'pan' : tool

  return {
    component: {
      setTool,
    },
    control: {
      gesture,
      onToolChange: setTool,
      tool,
    },
    keyboard: {
      setDraftArrow: draft.setDraftArrow,
      setDraftRect: draft.setDraftRect,
      setDraftStroke: draft.setDraftStroke,
      setGesture,
      setMarquee: marquee.setMarquee,
      setSpaceDown,
      setTool,
    },
    pointer: {
      setDraftArrow: draft.setDraftArrow,
      setDraftRect: draft.setDraftRect,
      setDraftStroke: draft.setDraftStroke,
      setGesture,
      setMarquee: marquee.setMarquee,
      setSnapGuides,
      setTool,
      spaceDown,
      tool,
    },
    stage: {
      activeMode,
      gesture,
      overlays,
    },
  }
}
