import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasSessionTimer } from './CanvasSessionTimer'
import { formatCanvasSessionTimer } from './CanvasSessionTimerFormat'

describe('CanvasSessionTimer', () => {
  it('renders nothing when hidden', () => {
    const markup = renderToStaticMarkup(
      <CanvasSessionTimer {...createSessionTimerProps({ visible: false })} />,
    )

    expect(markup).toBe('')
  })

  it('renders a compact meeting timer surface', () => {
    const markup = renderToStaticMarkup(
      <CanvasSessionTimer {...createSessionTimerProps({ visible: true })} />,
    )

    expect(markup).toContain('class="session-timer"')
    expect(markup).toContain('aria-label="Session timer"')
    expect(markup).toContain('05:00')
    expect(markup).toContain('5m')
    expect(markup).toContain('Start')
  })

  it('formats countdown time with fixed-width minutes and seconds', () => {
    expect(formatCanvasSessionTimer(65)).toBe('01:05')
    expect(formatCanvasSessionTimer(0)).toBe('00:00')
  })
})

function createSessionTimerProps({ visible }: { visible: boolean }) {
  const noop = vi.fn()

  return {
    presetSeconds: [300, 600, 900],
    secondsRemaining: 300,
    selectedPresetSeconds: 300,
    status: 'idle' as const,
    visible,
    onAddMinute: noop,
    onPause: noop,
    onReset: noop,
    onResume: noop,
    onSetDuration: noop,
    onStart: noop,
  }
}
