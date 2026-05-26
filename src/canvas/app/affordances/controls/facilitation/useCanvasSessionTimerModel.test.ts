import { describe, expect, it } from 'vitest'
import {
  CANVAS_SESSION_TIMER_MAX_SECONDS,
  addCanvasSessionTimerSeconds,
  createCanvasSessionTimerState,
  pauseCanvasSessionTimer,
  resetCanvasSessionTimer,
  resumeCanvasSessionTimer,
  setCanvasSessionTimerDuration,
  startCanvasSessionTimer,
  tickCanvasSessionTimer,
} from './useCanvasSessionTimerModel'

describe('CanvasSessionTimerModel', () => {
  it('starts, pauses, resumes, and resets a single session timer', () => {
    const running = startCanvasSessionTimer(300)
    const paused = pauseCanvasSessionTimer(running)
    const resumed = resumeCanvasSessionTimer(paused)

    expect(running).toEqual({
      durationSeconds: 300,
      secondsRemaining: 300,
      status: 'running',
    })
    expect(paused.status).toBe('paused')
    expect(resumed.status).toBe('running')
    expect(resetCanvasSessionTimer(resumed)).toEqual(
      createCanvasSessionTimerState(300),
    )
  })

  it('ticks running timers to done without mutating idle or paused state', () => {
    const idle = createCanvasSessionTimerState(60)
    const paused = pauseCanvasSessionTimer(startCanvasSessionTimer(60))

    expect(tickCanvasSessionTimer(idle)).toBe(idle)
    expect(tickCanvasSessionTimer(paused)).toBe(paused)
    expect(tickCanvasSessionTimer({
      durationSeconds: 60,
      secondsRemaining: 1,
      status: 'running',
    })).toEqual({
      durationSeconds: 60,
      secondsRemaining: 0,
      status: 'done',
    })
  })

  it('allows extending active timers without reducing running time', () => {
    const running = startCanvasSessionTimer(60)

    expect(setCanvasSessionTimerDuration(running, 300)).toBe(running)
    expect(addCanvasSessionTimerSeconds(running, 60)).toEqual({
      durationSeconds: 120,
      secondsRemaining: 120,
      status: 'running',
    })
    expect(addCanvasSessionTimerSeconds({
      durationSeconds: CANVAS_SESSION_TIMER_MAX_SECONDS,
      secondsRemaining: CANVAS_SESSION_TIMER_MAX_SECONDS,
      status: 'running',
    }, 60).secondsRemaining).toBe(CANVAS_SESSION_TIMER_MAX_SECONDS)
  })
})
