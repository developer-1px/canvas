import { describe, expect, it } from 'vitest'
import type { CanvasCustomItem } from '../../entities'
import {
  createCanvasDemoSvgCustomItemRenderers,
  getCanvasDemoSvgCustomItemRenderer,
  type CanvasDemoSvgCustomItemRendererStrategy,
  type CanvasDemoSvgCustomItemRenderers,
} from './CanvasDemoSvgCustomItemRendererRegistry'

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

describe('CanvasDemoSvgCustomItemRenderer registry', () => {
  it('uses externally assembled custom item renderers', () => {
    const renderRisk: CanvasDemoSvgCustomItemRendererStrategy = ({ item }) =>
      String(item.data.severity)
    const renderers = createCanvasDemoSvgCustomItemRenderers({
      'risk-node': renderRisk,
    })

    expect(
      getCanvasDemoSvgCustomItemRenderer({
        item: customItem,
        renderers,
      }),
    ).toBe(renderRisk)
  })

  it('rejects custom renderer keys outside the app extension id contract', () => {
    expect(() =>
      createCanvasDemoSvgCustomItemRenderers(
        null as unknown as CanvasDemoSvgCustomItemRenderers,
      ),
    ).toThrow('Canvas app custom item renderer registry must be an object')

    expect(() =>
      createCanvasDemoSvgCustomItemRenderers({
        'Risk Node': () => null,
      }),
    ).toThrow('Invalid canvas app custom item renderer id: Risk Node')
  })

  it('rejects malformed custom item renderer strategies before registration', () => {
    expect(() =>
      createCanvasDemoSvgCustomItemRenderers({
        'risk-node': undefined,
      } as unknown as CanvasDemoSvgCustomItemRenderers),
    ).toThrow(
      'Canvas app custom item renderer risk-node requires render strategy',
    )
  })
})
