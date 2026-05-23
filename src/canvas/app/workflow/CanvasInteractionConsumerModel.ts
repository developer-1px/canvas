import type {
  CanvasInteractionConsumerModel,
  CanvasInteractionConsumerModelInput,
} from './CanvasAppConsumerContracts'

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
}: CanvasInteractionConsumerModelInput): CanvasInteractionConsumerModel {
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
