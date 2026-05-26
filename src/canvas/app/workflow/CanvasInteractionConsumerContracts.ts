import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
  CanvasDraftArrowOverlay,
  CanvasDraftShapeOverlay,
  CanvasLaserTrailOverlay,
  CanvasDraftStrokeOverlay,
  CanvasOverlayState,
  CanvasSnapGuides,
} from '../../engine'
import type {
  Bounds,
  Tool,
} from '../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'

export type CanvasInteractionDraftWriters = {
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftRect: Dispatch<SetStateAction<CanvasDraftShapeOverlay | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
}

export type CanvasInteractionLaserWriters = {
  setLaserTrail: Dispatch<SetStateAction<CanvasLaserTrailOverlay | null>>
}

export type CanvasInteractionMarqueeWriters = {
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
}

export type CanvasInteractionConsumerModelInput = {
  draft: CanvasInteractionDraftWriters
  gesture: Interaction['kind']
  laser: CanvasInteractionLaserWriters
  marquee: CanvasInteractionMarqueeWriters
  overlays: CanvasOverlayState
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  spaceDown: boolean
  tool: Tool
}

export type CanvasInteractionComponentContext = {
  setTool: Dispatch<SetStateAction<Tool>>
}

export type CanvasInteractionControlContext = {
  gesture: Interaction['kind']
  onToolChange: Dispatch<SetStateAction<Tool>>
  tool: Tool
}

export type CanvasInteractionKeyboardContext =
  CanvasInteractionDraftWriters &
  CanvasInteractionLaserWriters &
  CanvasInteractionMarqueeWriters & {
    setGesture: Dispatch<SetStateAction<Interaction['kind']>>
    setSpaceDown: Dispatch<SetStateAction<boolean>>
    setTool: Dispatch<SetStateAction<Tool>>
  }

export type CanvasInteractionPointerContext =
  CanvasInteractionDraftWriters &
  CanvasInteractionLaserWriters &
  CanvasInteractionMarqueeWriters & {
    setGesture: Dispatch<SetStateAction<Interaction['kind']>>
    setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
    setTool: Dispatch<SetStateAction<Tool>>
    spaceDown: boolean
    tool: Tool
  }

export type CanvasInteractionStageContext = {
  activeMode: Tool
  gesture: Interaction['kind']
  overlays: CanvasOverlayState
}

export type CanvasInteractionConsumerModel = {
  component: CanvasInteractionComponentContext
  control: CanvasInteractionControlContext
  keyboard: CanvasInteractionKeyboardContext
  pointer: CanvasInteractionPointerContext
  stage: CanvasInteractionStageContext
}
