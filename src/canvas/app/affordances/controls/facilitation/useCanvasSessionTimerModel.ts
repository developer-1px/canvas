import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import type { CanvasAffordanceConfig } from '../../../../engine'

export type CanvasSessionTimerStatus = 'idle' | 'running' | 'paused' | 'done'

export type CanvasSessionTimerState = Readonly<{
  durationSeconds: number
  secondsRemaining: number
  status: CanvasSessionTimerStatus
}>

export const CANVAS_SESSION_TIMER_DEFAULT_SECONDS = 300
export const CANVAS_SESSION_TIMER_MAX_SECONDS = 5999
export const CANVAS_SESSION_TIMER_PRESET_SECONDS = Object.freeze([
  300,
  600,
  900,
] as const)

export function useCanvasSessionTimerModel({
  config,
}: {
  config: CanvasAffordanceConfig
}) {
  const [timer, setTimer] = useState<CanvasSessionTimerState>(() =>
    createCanvasSessionTimerState(),
  )

  useEffect(() => {
    if (timer.status !== 'running') {
      return undefined
    }

    const interval = window.setInterval(() => {
      setTimer(tickCanvasSessionTimer)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timer.status])

  const setDuration = useCallback((durationSeconds: number) => {
    setTimer((current) =>
      setCanvasSessionTimerDuration(current, durationSeconds),
    )
  }, [])
  const start = useCallback((durationSeconds: number) => {
    setTimer(startCanvasSessionTimer(durationSeconds))
  }, [])
  const pause = useCallback(() => {
    setTimer(pauseCanvasSessionTimer)
  }, [])
  const resume = useCallback(() => {
    setTimer(resumeCanvasSessionTimer)
  }, [])
  const addMinute = useCallback(() => {
    setTimer((current) => addCanvasSessionTimerSeconds(current, 60))
  }, [])
  const reset = useCallback(() => {
    setTimer(resetCanvasSessionTimer)
  }, [])

  return {
    view: {
      presetSeconds: CANVAS_SESSION_TIMER_PRESET_SECONDS,
      secondsRemaining: timer.secondsRemaining,
      selectedPresetSeconds: timer.durationSeconds,
      status: timer.status,
      visible: config.overlays.sessionTimer,
      onAddMinute: addMinute,
      onPause: pause,
      onReset: reset,
      onResume: resume,
      onSetDuration: setDuration,
      onStart: start,
    },
  }
}

export function createCanvasSessionTimerState(
  durationSeconds = CANVAS_SESSION_TIMER_DEFAULT_SECONDS,
): CanvasSessionTimerState {
  const duration = clampCanvasSessionTimerSeconds(durationSeconds)

  return {
    durationSeconds: duration,
    secondsRemaining: duration,
    status: 'idle',
  }
}

export function setCanvasSessionTimerDuration(
  state: CanvasSessionTimerState,
  durationSeconds: number,
): CanvasSessionTimerState {
  if (state.status === 'running') {
    return state
  }

  return createCanvasSessionTimerState(durationSeconds)
}

export function startCanvasSessionTimer(
  durationSeconds: number,
): CanvasSessionTimerState {
  const duration = clampCanvasSessionTimerSeconds(durationSeconds)

  return {
    durationSeconds: duration,
    secondsRemaining: duration,
    status: 'running',
  }
}

export function pauseCanvasSessionTimer(
  state: CanvasSessionTimerState,
): CanvasSessionTimerState {
  return state.status === 'running'
    ? {
        ...state,
        status: 'paused',
      }
    : state
}

export function resumeCanvasSessionTimer(
  state: CanvasSessionTimerState,
): CanvasSessionTimerState {
  return state.status === 'paused' && state.secondsRemaining > 0
    ? {
        ...state,
        status: 'running',
      }
    : state
}

export function resetCanvasSessionTimer(
  state: CanvasSessionTimerState,
): CanvasSessionTimerState {
  return createCanvasSessionTimerState(state.durationSeconds)
}

export function addCanvasSessionTimerSeconds(
  state: CanvasSessionTimerState,
  seconds: number,
): CanvasSessionTimerState {
  if (state.status === 'idle' || seconds <= 0) {
    return state
  }

  const secondsRemaining = clampCanvasSessionTimerSeconds(
    state.secondsRemaining + seconds,
  )
  const durationSeconds = Math.max(state.durationSeconds, secondsRemaining)

  return {
    durationSeconds,
    secondsRemaining,
    status: state.status === 'done' ? 'paused' : state.status,
  }
}

export function tickCanvasSessionTimer(
  state: CanvasSessionTimerState,
): CanvasSessionTimerState {
  if (state.status !== 'running') {
    return state
  }

  const secondsRemaining = Math.max(0, state.secondsRemaining - 1)

  return {
    ...state,
    secondsRemaining,
    status: secondsRemaining === 0 ? 'done' : 'running',
  }
}

function clampCanvasSessionTimerSeconds(seconds: number) {
  return Math.min(
    CANVAS_SESSION_TIMER_MAX_SECONDS,
    Math.max(1, Math.round(seconds)),
  )
}
