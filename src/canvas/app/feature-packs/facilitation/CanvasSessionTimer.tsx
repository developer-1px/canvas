import { formatCanvasSessionTimer } from './CanvasSessionTimerFormat'

type CanvasSessionTimerStatus = 'idle' | 'running' | 'paused' | 'done'

type CanvasSessionTimerProps = {
  presetSeconds: readonly number[]
  secondsRemaining: number
  selectedPresetSeconds: number
  status: CanvasSessionTimerStatus
  visible: boolean
  onAddMinute: () => void
  onPause: () => void
  onReset: () => void
  onResume: () => void
  onSetDuration: (seconds: number) => void
  onStart: (seconds: number) => void
}

export function CanvasSessionTimer({
  presetSeconds,
  secondsRemaining,
  selectedPresetSeconds,
  status,
  visible,
  onAddMinute,
  onPause,
  onReset,
  onResume,
  onSetDuration,
  onStart,
}: CanvasSessionTimerProps) {
  if (!visible) {
    return null
  }

  const canSetDuration = status !== 'running'
  const canAddMinute = status === 'running' || status === 'paused' ||
    status === 'done'

  return (
    <section
      className="session-timer"
      data-status={status}
      aria-label="Session timer"
    >
      <div className="session-timer-display" aria-live="polite">
        {formatCanvasSessionTimer(secondsRemaining)}
      </div>
      <div className="session-timer-presets">
        {presetSeconds.map((seconds) => (
          <button
            key={seconds}
            type="button"
            disabled={!canSetDuration}
            aria-pressed={selectedPresetSeconds === seconds}
            onClick={() => onSetDuration(seconds)}
          >
            {formatCanvasSessionTimerPreset(seconds)}
          </button>
        ))}
      </div>
      {status === 'running' ? (
        <button type="button" onClick={onPause}>
          Pause
        </button>
      ) : status === 'paused' ? (
        <button type="button" onClick={onResume}>
          Resume
        </button>
      ) : (
        <button type="button" onClick={() => onStart(selectedPresetSeconds)}>
          Start
        </button>
      )}
      <button type="button" disabled={!canAddMinute} onClick={onAddMinute}>
        +1m
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </section>
  )
}

function formatCanvasSessionTimerPreset(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))}m`
}
