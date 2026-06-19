import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasAffordanceConfig,
  type CanvasAffordanceConfigInput,
} from '../../../engine'
import { MAX_SCALE, MIN_SCALE } from '../../../core'
import { ZoomControls } from './ZoomControls'

describe('ZoomControls', () => {
  it('renders nothing when every zoom command is unavailable', () => {
    const markup = renderZoomControls({
      config: createConfig({
        fitView: false,
        zoomIn: false,
        zoomOut: false,
        zoomReset: false,
      }),
    })

    expect(markup).toBe('')
  })

  it('normalizes the displayed scale through the viewport scale contract', () => {
    const invalidMarkup = renderZoomControls({ scale: Number.NaN })
    const oversizedMarkup = renderZoomControls({ scale: MAX_SCALE * 2 })

    expect(invalidMarkup).toContain(`${Math.round(MIN_SCALE * 100)}%`)
    expect(oversizedMarkup).toContain(`${Math.round(MAX_SCALE * 100)}%`)
    expect(invalidMarkup).not.toContain('NaN')
  })

  it('disables zoom out at the minimum scale and zoom in at the maximum scale', () => {
    const minMarkup = renderZoomControls({ scale: MIN_SCALE })
    const maxMarkup = renderZoomControls({ scale: MAX_SCALE })

    expect(minMarkup).toContain('aria-label="Zoom out"')
    expect(minMarkup).toContain('aria-disabled="true"')
    expect(minMarkup).toContain('disabled=""')
    expect(maxMarkup).toContain('aria-label="Zoom in"')
    expect(maxMarkup).toContain('aria-disabled="true"')
    expect(maxMarkup).toContain('disabled=""')
  })
})

function renderZoomControls({
  config = createConfig(),
  scale = 1,
}: {
  config?: CanvasAffordanceConfig
  scale?: number
} = {}) {
  return renderToStaticMarkup(
    <ZoomControls
      config={config}
      scale={scale}
      onFit={vi.fn()}
      onReset={vi.fn()}
      onZoomIn={vi.fn()}
      onZoomOut={vi.fn()}
    />,
  )
}

function createConfig(
  commands: NonNullable<CanvasAffordanceConfigInput['commands']> = {},
): CanvasAffordanceConfig {
  return createCanvasAffordanceConfig({ commands })
}
