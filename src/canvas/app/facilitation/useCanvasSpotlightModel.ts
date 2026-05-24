import {
  useCallback,
  useState,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'

export type CanvasSpotlightState = Readonly<{
  active: boolean
}>

export function useCanvasSpotlightModel({
  config,
  followerCount,
}: {
  config: CanvasAffordanceConfig
  followerCount: number
}) {
  const [spotlight, setSpotlight] = useState<CanvasSpotlightState>(() =>
    createCanvasSpotlightState(),
  )
  const start = useCallback(() => {
    setSpotlight(startCanvasSpotlight)
  }, [])
  const stop = useCallback(() => {
    setSpotlight(stopCanvasSpotlight)
  }, [])

  return {
    view: {
      active: spotlight.active,
      followerCount: spotlight.active ? followerCount : 0,
      visible: config.overlays.spotlight,
      onStart: start,
      onStop: stop,
    },
  }
}

export function createCanvasSpotlightState(): CanvasSpotlightState {
  return {
    active: false,
  }
}

export function startCanvasSpotlight(
  state: CanvasSpotlightState,
): CanvasSpotlightState {
  return state.active ? state : { active: true }
}

export function stopCanvasSpotlight(
  state: CanvasSpotlightState,
): CanvasSpotlightState {
  return state.active ? { active: false } : state
}
