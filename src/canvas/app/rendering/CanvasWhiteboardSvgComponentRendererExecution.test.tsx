import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasComponentItem } from '../../entities'
import {
  DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasWhiteboardSvgComponentPresentationRenderers,
} from './CanvasWhiteboardSvgComponentPresentationRegistry'
import { renderCanvasWhiteboardSvgComponentPresentation } from './CanvasWhiteboardSvgComponentRendererExecution'

const componentItem: CanvasComponentItem = {
  id: 'component-risk-1',
  type: 'component',
  component: 'risk',
  x: 80,
  y: 120,
  w: 180,
  h: 96,
  title: 'Risk',
  fill: '#fff7ed',
  stroke: '#fb923c',
  accent: '#ea580c',
}

describe('CanvasWhiteboardSvgComponentRendererExecution', () => {
  it('renders externally assembled component presentation renderers', () => {
    const markup = renderComponent({
      getComponentPresentation: () => 'risk-card',
      renderers: {
        ...DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
        'risk-card': ({ item }) => (
          <g className="risk-card">{item.title}</g>
        ),
      },
    })

    expect(markup).toContain('class="risk-card"')
    expect(markup).toContain('Risk')
  })

  it('falls back when the component presentation resolver throws', () => {
    const markup = renderComponent({
      getComponentPresentation: () => {
        throw new Error('bad component resolver')
      },
    })

    expect(markup).toMatch(/\bclass="[^"]*\bcomponent-card\b/)
    expect(markup).toContain('Risk')
  })

  it('falls back when the component presentation renderer throws', () => {
    const markup = renderComponent({
      getComponentPresentation: () => 'risk-card',
      renderers: {
        ...DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
        'risk-card': () => {
          throw new Error('bad component renderer')
        },
      },
    })

    expect(markup).toMatch(/\bclass="[^"]*\bcomponent-card\b/)
    expect(markup).toContain('Risk')
  })

  it('uses the built-in link preview presentation without the component resolver', () => {
    const markup = renderToStaticMarkup(
      <svg>
        {renderCanvasWhiteboardSvgComponentPresentation({
          getComponentPresentation: () => {
            throw new Error('link preview should not resolve through library')
          },
          item: {
            ...componentItem,
            body: 'https://www.figma.com/figjam/',
            component: 'link-preview',
            h: 148,
            id: 'component-link-preview',
            title: 'figma.com',
            url: 'https://www.figma.com/figjam/',
            w: 320,
          },
          renderers: DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
        })}
      </svg>,
    )

    expect(markup).toContain('component-link-preview')
    expect(markup).toContain('figma.com')
    expect(markup).toContain('https://www.figma.com/figjam/')
  })
})

function renderComponent({
  getComponentPresentation = (component) => component,
  renderers = DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
}: {
  getComponentPresentation?: (component: string) => string
  renderers?: CanvasWhiteboardSvgComponentPresentationRenderers
}) {
  return renderToStaticMarkup(
    <svg>
      {renderCanvasWhiteboardSvgComponentPresentation({
        getComponentPresentation,
        item: componentItem,
        renderers,
      })}
    </svg>,
  )
}
