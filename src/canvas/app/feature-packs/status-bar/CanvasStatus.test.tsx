import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CanvasStatus } from './CanvasStatus'

describe('CanvasStatus', () => {
  it('renders mode, selection, and zoom as one status announcement', () => {
    const markup = renderToStaticMarkup(
      <CanvasStatus mode="Select" scalePercent={125} selectionLength={2} />,
    )

    expect(markup).toContain('Select')
    expect(markup).toContain('2 selected')
    expect(markup).toContain('125%')
    expect(markup).toContain('aria-label="Select, 2 selected, Zoom 125%"')
  })

  it('keeps the zoom readout stable for existing status renderers', () => {
    const markup = renderToStaticMarkup(
      <CanvasStatus mode="Canvas" selectionLength={0} />,
    )

    expect(markup).toContain('No selection')
    expect(markup).toContain('100%')
  })
})
