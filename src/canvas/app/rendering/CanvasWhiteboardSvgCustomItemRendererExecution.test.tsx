import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasCustomItem } from '../../entities'
import {
  renderCanvasWhiteboardSvgCustomItem,
  shouldReuseCanvasWhiteboardSvgCustomItemRender,
} from './CanvasWhiteboardSvgCustomItemRendererExecution'
import type { CanvasWhiteboardSvgCustomItemRenderers } from './CanvasWhiteboardSvgCustomItemRendererRegistry'
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

describe('CanvasWhiteboardSvgCustomItemRendererExecution', () => {
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

    expect(shouldReuseCanvasWhiteboardSvgCustomItemRender({
      next: {
        item: {
          ...customItem,
          data: { severity: 'high' },
        },
        renderer,
      },
      previous: { item: customItem, renderer },
    })).toBe(true)
    expect(shouldReuseCanvasWhiteboardSvgCustomItemRender({
      next: {
        item: {
          ...customItem,
          data: { severity: 'low' },
        },
        renderer,
      },
      previous: { item: customItem, renderer },
    })).toBe(false)
    expect(shouldReuseCanvasWhiteboardSvgCustomItemRender({
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

function renderCustomItem(renderers: CanvasWhiteboardSvgCustomItemRenderers) {
  return renderToStaticMarkup(
    <svg>
      {renderCanvasWhiteboardSvgCustomItem({
        item: customItem,
        renderers,
      })}
    </svg>,
  )
}
