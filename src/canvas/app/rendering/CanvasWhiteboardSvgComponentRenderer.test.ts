import { describe, expect, it } from 'vitest'
import {
  CANVAS_WHITEBOARD_SVG_COMPONENT_FALLBACK_PRESENTATION,
  getCanvasWhiteboardSvgComponentFallbackRenderer,
} from './CanvasWhiteboardSvgComponentRenderFallback'
import {
  createCanvasWhiteboardSvgComponentPresentationRenderers,
  DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
  getCanvasWhiteboardSvgComponentPresentationRenderer,
  type CanvasWhiteboardSvgComponentRendererStrategy,
  type CanvasWhiteboardSvgComponentPresentationRenderers,
} from './CanvasWhiteboardSvgComponentPresentationRegistry'

describe('CanvasWhiteboardSvgComponentRenderer registry', () => {
  it('uses externally assembled presentation renderers', () => {
    const renderRisk: CanvasWhiteboardSvgComponentRendererStrategy = ({ item }) =>
      item.title
    const renderers = createCanvasWhiteboardSvgComponentPresentationRenderers({
      'risk-card': renderRisk,
    })

    expect(
      getCanvasWhiteboardSvgComponentPresentationRenderer({
        presentation: 'risk-card',
        renderers,
      }),
    ).toBe(renderRisk)
  })

  it('uses the named fallback presentation renderer when a presentation is missing', () => {
    expect(
      DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS[
        CANVAS_WHITEBOARD_SVG_COMPONENT_FALLBACK_PRESENTATION
      ],
    ).toBe(getCanvasWhiteboardSvgComponentFallbackRenderer())
    expect(
      getCanvasWhiteboardSvgComponentPresentationRenderer({
        presentation: 'unknown-card',
        renderers:
          DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
      }),
    ).toBe(getCanvasWhiteboardSvgComponentFallbackRenderer())
  })

  it('rejects presentation renderer keys outside the app extension id contract', () => {
    expect(() =>
      createCanvasWhiteboardSvgComponentPresentationRenderers(
        null as unknown as CanvasWhiteboardSvgComponentPresentationRenderers,
      ),
    ).toThrow(
      'Canvas app component presentation renderer registry must be an object',
    )

    expect(() =>
      createCanvasWhiteboardSvgComponentPresentationRenderers({
        'Risk Card': () => null,
      }),
    ).toThrow('Invalid canvas app component presentation renderer id: Risk Card')
  })

  it('rejects malformed presentation renderer strategies before registration', () => {
    expect(() =>
      createCanvasWhiteboardSvgComponentPresentationRenderers({
        'risk-card': undefined,
      } as unknown as CanvasWhiteboardSvgComponentPresentationRenderers),
    ).toThrow(
      'Canvas app component presentation renderer risk-card requires render strategy',
    )
  })
})
