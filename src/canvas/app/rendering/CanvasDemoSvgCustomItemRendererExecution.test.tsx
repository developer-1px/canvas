import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasCustomItem } from '../../entities'
import {
  renderCanvasDemoSvgCustomItem,
  shouldReuseCanvasDemoSvgCustomItemRender,
} from './CanvasDemoSvgCustomItemRendererExecution'
import type { CanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistry'
import type {
  CanvasAppCustomItemRendererDescriptor,
} from './CanvasAppRenderingContracts'

const customItem: CanvasCustomItem = {
  id: 'custom-risk-1',
  type: 'custom',
  kind: 'risk',
  presentation: 'risk-node',
  title: 'Risk',
  x: 80,
  y: 120,
  w: 180,
  h: 96,
  data: { severity: 'high' },
}

describe('CanvasDemoSvgCustomItemRendererExecution', () => {
  it('renders externally assembled custom item renderers', () => {
    const markup = renderCustomItem({
      'risk-node': ({ item }) => (
        <g className="risk-node">{String(item.data.severity)}</g>
      ),
    })

    expect(markup).toContain('class="risk-node"')
    expect(markup).toContain('high')
  })

  it('renders descriptor custom item renderers', () => {
    const markup = renderCustomItem({
      'risk-node': {
        getRenderKey: ({ item }) => String(item.data.severity),
        renderItem: ({ item }) => (
          <g className="risk-node">{String(item.data.severity)}</g>
        ),
      },
    })

    expect(markup).toContain('class="risk-node"')
    expect(markup).toContain('high')
  })

  it('reuses descriptor renders only when the render key is stable', () => {
    const renderer = {
      getRenderKey: ({ item }) => String(item.data.severity),
      renderItem: ({ item }) => String(item.data.severity),
    } satisfies CanvasAppCustomItemRendererDescriptor

    expect(shouldReuseCanvasDemoSvgCustomItemRender({
      next: {
        item: {
          ...customItem,
          data: { severity: 'high' },
        },
        renderer,
      },
      previous: { item: customItem, renderer },
    })).toBe(true)
    expect(shouldReuseCanvasDemoSvgCustomItemRender({
      next: {
        item: {
          ...customItem,
          data: { severity: 'low' },
        },
        renderer,
      },
      previous: { item: customItem, renderer },
    })).toBe(false)
    expect(shouldReuseCanvasDemoSvgCustomItemRender({
      next: { item: customItem, renderer },
      previous: {
        item: customItem,
        renderer: {
          ...renderer,
          getRenderKey: () => 'other',
        },
      },
    })).toBe(false)
  })

  it('falls back when a custom item renderer is missing', () => {
    const markup = renderCustomItem({})

    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })

  it('falls back when a custom item renderer throws', () => {
    const markup = renderCustomItem({
      'risk-node': () => {
        throw new Error('bad custom renderer')
      },
    })

    expect(markup).toContain('class="component-card"')
    expect(markup).toContain('Risk')
  })
})

function renderCustomItem(renderers: CanvasDemoSvgCustomItemRenderers) {
  return renderToStaticMarkup(
    <svg>
      {renderCanvasDemoSvgCustomItem({
        item: customItem,
        renderers,
      })}
    </svg>,
  )
}
