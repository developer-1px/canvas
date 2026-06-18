import {
  useCallback,
  useRef,
  useState,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasEmoteBurstOverlay,
} from '../../../engine'
import type {
  Point,
  Viewport,
} from '../../../entities'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import type { CanvasAppPointerInput } from '../../affordances/interaction/pointer/CanvasAppPointerInput'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import {
  CANVAS_DEFAULT_EMOTE,
  CANVAS_EMOTE_DEFINITIONS,
  type CanvasEmoteDefinition,
} from './CanvasEmoteCatalog'

export const CANVAS_EMOTE_BURST_TTL_MS = 900
export const CANVAS_EMOTE_BURST_LIMIT = 6

const CANVAS_EMOTE_BURST_PARTICLES = Object.freeze([
  Object.freeze({ dx: -24, dy: -8 }),
  Object.freeze({ dx: -12, dy: -28 }),
  Object.freeze({ dx: 8, dy: -34 }),
  Object.freeze({ dx: 24, dy: -14 }),
  Object.freeze({ dx: 0, dy: 8 }),
] as const)

export function useCanvasEmoteModel({
  config,
  stageElement,
  viewport,
}: {
  config: CanvasAffordanceConfig
  stageElement: CanvasAppStageElement
  viewport: Viewport
}) {
  const sequenceRef = useRef(0)
  const lastWorldPointRef = useRef<Point | null>(null)
  const [bursts, setBursts] = useState<CanvasEmoteBurstOverlay[]>([])
  const canReleaseEmote = config.overlays.emoteBursts &&
    config.gestures.emoteBurst
  const visible = config.overlays.emoteControls
  const updatePointer = useCallback((event: CanvasAppPointerInput) => {
    lastWorldPointRef.current = getCanvasEmoteWorldPoint({
      event,
      stageElement,
      viewport,
    })
  }, [stageElement, viewport])
  const releaseEmote = useCallback((emote: CanvasEmoteDefinition) => {
    if (!canReleaseEmote) {
      return false
    }

    const point = lastWorldPointRef.current ??
      stageElement.getViewportCenter(viewport)

    if (!point) {
      return false
    }

    sequenceRef.current += 1

    const burst = createCanvasEmoteBurstOverlay({
      emote,
      id: `emote-${sequenceRef.current}`,
      point,
    })

    setBursts((current) =>
      [...current, burst].slice(-CANVAS_EMOTE_BURST_LIMIT),
    )

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setBursts((current) =>
          current.filter((candidate) => candidate.id !== burst.id),
        )
      }, CANVAS_EMOTE_BURST_TTL_MS)
    }

    return true
  }, [canReleaseEmote, stageElement, viewport])
  const releaseDefaultEmoteFromPointer = useCallback((
    event: CanvasAppPointerInput,
  ) => {
    updatePointer(event)

    if (!event.shiftKey || event.button !== 0) {
      return false
    }

    const released = releaseEmote(CANVAS_DEFAULT_EMOTE)

    if (released) {
      event.preventDefault()
      event.stopPropagation()
    }

    return released
  }, [releaseEmote, updatePointer])

  return {
    overlay: {
      bursts,
    },
    stage: {
      onPointerDown: releaseDefaultEmoteFromPointer,
      onPointerMove: updatePointer,
    },
    view: {
      emotes: CANVAS_EMOTE_DEFINITIONS,
      visible,
      onReleaseEmote: releaseEmote,
    },
  }
}

export function createCanvasEmoteBurstOverlay({
  emote,
  id,
  point,
}: {
  emote: CanvasEmoteDefinition
  id: string
  point: Point
}): CanvasEmoteBurstOverlay {
  return {
    emote: emote.emote,
    id,
    label: emote.label,
    particles: [...CANVAS_EMOTE_BURST_PARTICLES],
    point,
  }
}

export function getCanvasEmoteWorldPoint({
  event,
  stageElement,
  viewport,
}: {
  event: { clientX: number; clientY: number }
  stageElement: Pick<CanvasAppStageElement, 'getScreenPoint'>
  viewport: Viewport
}): Point {
  const screenPoint = stageElement.getScreenPoint(event)

  return getCanvasViewportWorldPoint(viewport, screenPoint)
}
