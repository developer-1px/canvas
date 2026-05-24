import {
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  Bounds,
  Tool,
  Viewport,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  createCanvasOverlayState,
  type CanvasAffordanceConfig,
  type CanvasDraftArrowOverlay,
  type CanvasLaserTrailOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasPresenceOverlay,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
} from '../../engine'
import type { Interaction } from '../pointer/CanvasInteractionState'
import { getCanvasInteractionConsumerModel } from './CanvasInteractionConsumerModel'

type UseCanvasInteractionModelArgs = {
  config: CanvasAffordanceConfig
  presence?: readonly CanvasPresenceOverlay[]
  scene: CanvasSceneAdapter
  selection: string[]
  viewport: Viewport
}

export function useCanvasInteractionModel({
  config,
  presence,
  scene,
  selection,
  viewport,
}: UseCanvasInteractionModelArgs) {
  const interactionRef = useRef<Interaction>({ kind: 'none' })
  const [tool, setTool] = useState<Tool>('select')
  const [spaceDown, setSpaceDown] = useState(false)
  const [gesture, setGesture] = useState<Interaction['kind']>('none')
  const [marquee, setMarquee] = useState<Bounds | null>(null)
  const [draftArrow, setDraftArrow] =
    useState<CanvasDraftArrowOverlay | null>(null)
  const [draftRect, setDraftRect] = useState<Bounds | null>(null)
  const [draftStroke, setDraftStroke] =
    useState<CanvasDraftStrokeOverlay | null>(null)
  const [laserTrail, setLaserTrail] =
    useState<CanvasLaserTrailOverlay | null>(null)
  const [snapGuides, setSnapGuides] = useState<CanvasSnapGuides>(
    EMPTY_CANVAS_SNAP_GUIDES,
  )
  const overlays = useMemo(
    () =>
      createCanvasOverlayState({
        config,
        draftArrow,
        draftRect,
        draftStroke,
        laserTrail,
        marquee,
        presence,
        scene,
        selection,
        snapGuides,
        viewport,
      }),
    [
      config,
      draftArrow,
      draftRect,
      draftStroke,
      laserTrail,
      marquee,
      presence,
      scene,
      selection,
      snapGuides,
      viewport,
    ],
  )
  const interactionConsumers = getCanvasInteractionConsumerModel({
    draft: {
      setDraftArrow,
      setDraftRect,
      setDraftStroke,
    },
    gesture,
    marquee: {
      setMarquee,
    },
    laser: {
      setLaserTrail,
    },
    overlays,
    setGesture,
    setSnapGuides,
    setSpaceDown,
    setTool,
    spaceDown,
    tool,
  })

  const keyboard = {
    interactionRef,
    ...interactionConsumers.keyboard,
  }
  const pointer = {
    interactionRef,
    ...interactionConsumers.pointer,
  }

  return {
    ...interactionConsumers,
    keyboard,
    pointer,
  }
}
