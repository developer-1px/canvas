import { describe, expect, it } from 'vitest'
import {
  CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION,
  getCanvasDemoSvgComponentFallbackRenderer,
} from './CanvasDemoSvgComponentRenderFallback'
import {
  createCanvasDemoSvgComponentPresentationRenderers,
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  getCanvasDemoSvgComponentPresentationRenderer,
  type CanvasDemoSvgComponentRendererStrategy,
  type CanvasDemoSvgComponentPresentationRenderers,
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

  it('uses the named fallback presentation renderer when a presentation is missing', () => {
    expect(
      DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS[
        CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION
      ],
    ).toBe(getCanvasDemoSvgComponentFallbackRenderer())
    expect(
      getCanvasDemoSvgComponentPresentationRenderer({
        presentation: 'unknown-card',
        renderers:
          DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
      }),
    ).toBe(getCanvasDemoSvgComponentFallbackRenderer())
  })

  it('rejects presentation renderer keys outside the app extension id contract', () => {
    expect(() =>
      createCanvasDemoSvgComponentPresentationRenderers(
        null as unknown as CanvasDemoSvgComponentPresentationRenderers,
      ),
    ).toThrow(
      'Canvas app component presentation renderer registry must be an object',
    )

    expect(() =>
      createCanvasDemoSvgComponentPresentationRenderers({
        'Risk Card': () => null,
      }),
    ).toThrow('Invalid canvas app component presentation renderer id: Risk Card')
  })

  it('rejects malformed presentation renderer strategies before registration', () => {
    expect(() =>
      createCanvasDemoSvgComponentPresentationRenderers({
        'risk-card': undefined,
      } as unknown as CanvasDemoSvgComponentPresentationRenderers),
    ).toThrow(
      'Canvas app component presentation renderer risk-card requires render strategy',
    )
  })
})
