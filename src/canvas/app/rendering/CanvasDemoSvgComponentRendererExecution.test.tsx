import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasComponentItem } from '../../entities'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasDemoSvgComponentPresentationRenderers,
} from './CanvasDemoSvgComponentPresentationRegistry'
import { renderCanvasDemoSvgComponentPresentation } from './CanvasDemoSvgComponentRendererExecution'

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

describe('CanvasDemoSvgComponentRendererExecution', () => {
  it('renders externally assembled component presentation renderers', () => {
    const markup = renderComponent({
      getComponentPresentation: () => 'risk-card',
      renderers: {
        ...DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
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

    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })

  it('falls back when the component presentation renderer throws', () => {
    const markup = renderComponent({
      getComponentPresentation: () => 'risk-card',
      renderers: {
        ...DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
        'risk-card': () => {
          throw new Error('bad component renderer')
        },
      },
    })

    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })
})

function renderComponent({
  getComponentPresentation = (component) => component,
  renderers = DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
}: {
  getComponentPresentation?: (component: string) => string
  renderers?: CanvasDemoSvgComponentPresentationRenderers
}) {
  return renderToStaticMarkup(
    <svg>
      {renderCanvasDemoSvgComponentPresentation({
        getComponentPresentation,
        item: componentItem,
        renderers,
      })}
    </svg>,
  )
}
