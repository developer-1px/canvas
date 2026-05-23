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

  it('rejects presentation renderer keys outside the app extension id contract', () => {
    expect(() =>
      createCanvasDemoSvgComponentPresentationRenderers({
        'Risk Card': () => null,
      }),
    ).toThrow('Invalid canvas app component presentation renderer id: Risk Card')
  })
})
