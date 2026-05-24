import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { CanvasDemoSvgItemLayer } from './CanvasDemoSvgItemLayer'

describe('CanvasDemoSvgItemLayer drawing items', () => {
  it('renders marker and highlighter strokes as SVG paths', () => {
    const markup = renderItemLayer([
      {
        id: 'marker-1',
        type: 'marker',
        x: 8,
        y: 18,
        w: 24,
        h: 24,
        points: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        opacity: 1,
        stroke: '#475569',
        strokeWidth: 4,
      },
      {
        id: 'highlight-1',
        type: 'highlight',
        x: 40,
        y: 50,
        w: 60,
        h: 30,
        points: [
          { x: 42, y: 60 },
          { x: 94, y: 68 },
        ],
        opacity: 0.42,
        stroke: '#fde047',
        strokeWidth: 18,
      },
    ])

    expect(markup).toContain('data-type="marker"')
    expect(markup).toContain('class="marker-item"')
    expect(markup).toContain('d="M 10 20 L 30 40"')
    expect(markup).toContain('data-type="highlight"')
    expect(markup).toContain('class="highlight-item"')
    expect(markup).toContain('d="M 42 60 L 94 68"')
  })

  it('renders arrow items as SVG lines with an arrow head marker', () => {
    const markup = renderItemLayer([
      {
        id: 'arrow-1',
        type: 'arrow',
        x: 88,
        y: 108,
        w: 164,
        h: 44,
        start: { x: 100, y: 120 },
        end: { x: 240, y: 140 },
        routing: 'elbow',
        stroke: '#334155',
        strokeWidth: 3,
      },
    ])

    expect(markup).toContain('data-type="arrow"')
    expect(markup).toContain('class="arrow-item"')
    expect(markup).toContain('d="M 100 120 L 170 120 L 170 140 L 240 140"')
    expect(markup).toContain('marker-end="url(#canvas-arrow-head)"')
  })
})

describe('CanvasDemoSvgItemLayer external renderers', () => {
  it('falls back when a component presentation renderer throws', () => {
    const markup = renderItemLayer(
      [
        {
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
        },
      ],
      {
        componentPresentationRenderers: {
          'risk-card': () => {
            throw new Error('bad component renderer')
          },
        },
        getComponentPresentation: () => 'risk-card',
      },
    )

    expect(markup).toContain('data-type="component"')
    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })

  it('falls back when a component presentation resolver throws', () => {
    const markup = renderItemLayer(
      [
        {
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
        },
      ],
      {
        getComponentPresentation: () => {
          throw new Error('bad component resolver')
        },
      },
    )

    expect(markup).toContain('data-type="component"')
    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })

  it('falls back when a custom item renderer throws', () => {
    const markup = renderItemLayer(
      [
        {
          id: 'risk-1',
          type: 'custom',
          kind: 'risk',
          presentation: 'risk-node',
          title: 'Risk',
          x: 80,
          y: 120,
          w: 180,
          h: 96,
          data: { severity: 'high' },
        },
      ],
      {
        customItemRenderers: {
          'risk-node': () => {
            throw new Error('bad custom renderer')
          },
        },
      },
    )

    expect(markup).toContain('data-type="custom"')
    expect(markup).toContain('data-custom-kind="risk"')
    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })
})

function renderItemLayer(
  items: CanvasItem[],
  options: Partial<Parameters<typeof CanvasDemoSvgItemLayer>[0]> = {},
) {
  return renderToStaticMarkup(
    <svg>
      <CanvasDemoSvgItemLayer
        getComponentPresentation={(component) => component}
        items={items}
        outlineIds={new Set()}
        selected={new Set()}
        onArrowEndpointPointerDown={() => undefined}
        onItemPointerDown={() => undefined}
        onTextDoubleClick={() => undefined}
        {...options}
      />
    </svg>,
  )
}
