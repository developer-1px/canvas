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
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
} from '../../engine'
import type { Interaction } from '../pointer/CanvasInteractionState'

type UseCanvasInteractionModelArgs = {
  config: CanvasAffordanceConfig
  scene: CanvasSceneAdapter
  selection: string[]
  viewport: Viewport
}

export function useCanvasInteractionModel({
  config,
  scene,
  selection,
  viewport,
}: UseCanvasInteractionModelArgs) {
  const interactionRef = useRef<Interaction>({ kind: 'none' })
  const [tool, setTool] = useState<Tool>('select')
  const [spaceDown, setSpaceDown] = useState(false)
  const [gesture, setGesture] = useState<Interaction['kind']>('none')
  const [marquee, setMarquee] = useState<Bounds | null>(null)
  const [draftRect, setDraftRect] = useState<Bounds | null>(null)
  const [snapGuides, setSnapGuides] = useState<CanvasSnapGuides>(
    EMPTY_CANVAS_SNAP_GUIDES,
  )
  const overlays = useMemo(
    () =>
      createCanvasOverlayState({
        config,
        draftRect,
        marquee,
        scene,
        selection,
        snapGuides,
        viewport,
      }),
    [config, draftRect, marquee, scene, selection, snapGuides, viewport],
  )
  const activeMode = spaceDown ? 'pan' : tool

  return {
    activeMode,
    gesture,
    interactionRef,
    overlays,
    setDraftRect,
    setGesture,
    setMarquee,
    setSnapGuides,
    setSpaceDown,
    setTool,
    spaceDown,
    tool,
  }
}
