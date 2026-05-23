import { describe, expect, it } from 'vitest'
import {
  createCanvasDemoSvgComponentPresentationRenderers,
  getCanvasDemoSvgComponentPresentationRenderer,
  type CanvasDemoSvgComponentRendererStrategy,
} from './CanvasDemoSvgComponentPresentationRegistry'

describe('CanvasDemoSvgComponentRenderer registry', () => {
  it('uses externally assembled presentation renderers', () => {
    const renderRisk: CanvasDemoSvgComponentRendererStrategy = ({ item }) =>
      item.title
    const renderers = createCanvasDemoSvgComponentPresentationRenderers({
      'risk-card': renderRisk,
    })

    expect(
      getCanvasDemoSvgComponentPresentationRenderer({
        presentation: 'risk-card',
        renderers,
      }),
    ).toBe(renderRisk)
  })
})
