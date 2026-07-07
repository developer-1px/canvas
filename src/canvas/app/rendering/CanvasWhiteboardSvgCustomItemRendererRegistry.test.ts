import { describe, expect, it } from 'vitest'
import type { CanvasCustomItem } from '../../entities'
import { getCanvasWhiteboardSvgCustomItemFallbackRenderer } from './CanvasWhiteboardSvgCustomItemRenderFallback'
import {
  createCanvasWhiteboardSvgCustomItemRenderers,
  DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
  getCanvasWhiteboardSvgCustomItemRenderer,
  type CanvasWhiteboardSvgCustomItemRendererStrategy,
  type CanvasWhiteboardSvgCustomItemRenderers,
} from './CanvasWhiteboardSvgCustomItemRendererRegistry'
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

describe('CanvasWhiteboardSvgCustomItemRenderer registry', () => {
  it('uses externally assembled custom item renderers', () => {
    const renderRisk: CanvasWhiteboardSvgCustomItemRendererStrategy = ({ item }) =>
      String(item.data.severity)
    const renderers = createCanvasWhiteboardSvgCustomItemRenderers({
      'risk-node': renderRisk,
    })

    expect(
      getCanvasWhiteboardSvgCustomItemRenderer({
        item: customItem,
        renderers,
      }),
    ).toBe(renderRisk)
  })

  it('accepts custom item render descriptors with a render key strategy', () => {
    const renderRisk: CanvasWhiteboardSvgCustomItemRendererStrategy = ({ item }) =>
      String(item.data.severity)
    const renderer = {
      getRenderKey: ({ item }) => String(item.data.severity),
      renderItem: renderRisk,
    } satisfies CanvasAppCustomItemRendererDescriptor
    const renderers = createCanvasWhiteboardSvgCustomItemRenderers({
      'risk-node': renderer,
    })

    expect(
      getCanvasWhiteboardSvgCustomItemRenderer({
        item: customItem,
        renderers,
      }),
    ).toBe(renderer)
  })

  it('uses the fallback renderer when a custom presentation is missing', () => {
    expect(
      getCanvasWhiteboardSvgCustomItemRenderer({
        item: customItem,
        renderers: DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
      }),
    ).toBe(getCanvasWhiteboardSvgCustomItemFallbackRenderer())
  })

  it('rejects custom renderer keys outside the app extension id contract', () => {
    expect(() =>
      createCanvasWhiteboardSvgCustomItemRenderers(
        null as unknown as CanvasWhiteboardSvgCustomItemRenderers,
      ),
    ).toThrow('Canvas app custom item renderer registry must be an object')

    expect(() =>
      createCanvasWhiteboardSvgCustomItemRenderers({
        'Risk Node': () => null,
      }),
    ).toThrow('Invalid canvas app custom item renderer id: Risk Node')
  })

  it('rejects malformed custom item renderer strategies before registration', () => {
    expect(() =>
      createCanvasWhiteboardSvgCustomItemRenderers({
        'risk-node': undefined,
      } as unknown as CanvasWhiteboardSvgCustomItemRenderers),
    ).toThrow(
      'Canvas app custom item renderer risk-node requires render strategy',
    )

    expect(() =>
      createCanvasWhiteboardSvgCustomItemRenderers({
        'risk-node': {
          getRenderKey: undefined,
          renderItem: () => null,
        },
      } as unknown as CanvasWhiteboardSvgCustomItemRenderers),
    ).toThrow(
      'Canvas app custom item renderer risk-node requires render key strategy',
    )
  })
})
