import { describe, expect, it } from 'vitest'
import type {
  CanvasCustomItem,
  CanvasItem,
} from '../model'
import { validateCanvasItems } from './CanvasItemSchema'

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
  data: {
    severity: 'high',
    score: 7,
    tags: ['external', 'validated'],
  },
}

describe('CanvasItemSchema custom items', () => {
  it('rejects component item kinds outside the stable id contract', () => {
    expect(() =>
      validateCanvasItems([
        {
          id: 'component-risk-1',
          type: 'component',
          component: 'Risk',
          title: 'Risk',
          x: 80,
          y: 120,
          w: 180,
          h: 96,
          fill: '#fff7ed',
          stroke: '#fb923c',
          accent: '#ea580c',
        },
      ]),
    ).toThrow()
  })

  it('accepts the stable custom item storage envelope', () => {
    expect(validateCanvasItems([customItem])).toEqual([customItem])
  })

  it('rejects custom item data that is not JSON-storable', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...customItem,
          data: {
            run: () => undefined,
          },
        } as unknown as CanvasCustomItem,
      ]),
    ).toThrow()
  })

  it('rejects custom item kind and presentation keys outside the stable id contract', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...customItem,
          kind: 'Risk',
        },
      ]),
    ).toThrow()

    expect(() =>
      validateCanvasItems([
        {
          ...customItem,
          presentation: 'Risk Node',
        },
      ]),
    ).toThrow()
  })

  it('rejects custom item validator keys outside the stable id contract', () => {
    expect(() =>
      validateCanvasItems([customItem], {
        customItemValidators: {
          Risk: () => true,
        },
      }),
    ).toThrow('Invalid canvas custom item validator id: Risk')
  })

  it('runs product-owned custom item validators by kind', () => {
    expect(() =>
      validateCanvasItems([customItem], {
        customItemValidators: {
          risk: (item) => item.data.severity === 'low',
        },
      }),
    ).toThrow('Invalid custom canvas item: risk')
  })
})

const markerItem: CanvasItem = {
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
}

const arrowItem: CanvasItem = {
  id: 'arrow-1',
  type: 'arrow',
  x: 88,
  y: 108,
  w: 164,
  h: 44,
  start: { x: 100, y: 120 },
  end: { x: 240, y: 140 },
  stroke: '#334155',
  strokeWidth: 3,
}

const stampItem: CanvasItem = {
  h: 44,
  id: 'stamp-1',
  label: '+1',
  stamp: 'thumbs-up',
  type: 'stamp',
  w: 44,
  x: 40,
  y: 60,
}

describe('CanvasItemSchema drawing items', () => {
  it('accepts built-in drawing item storage envelopes', () => {
    expect(validateCanvasItems([markerItem, arrowItem])).toEqual([
      markerItem,
      arrowItem,
    ])
  })

  it('normalizes built-in drawing bounds from internal geometry', () => {
    expect(
      validateCanvasItems([
        {
          ...markerItem,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        },
        {
          ...arrowItem,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        },
      ]),
    ).toEqual([markerItem, arrowItem])
  })

  it('rejects drawing strokes without visible geometry', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...markerItem,
          points: [{ x: 10, y: 20 }],
        },
      ]),
    ).toThrow()

    expect(() =>
      validateCanvasItems([
        {
          ...arrowItem,
          end: arrowItem.start,
        },
      ]),
    ).toThrow()
  })

  it('rejects drawing styles that cannot render predictably', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...markerItem,
          strokeWidth: 0,
        },
      ]),
    ).toThrow()

    expect(() =>
      validateCanvasItems([
        {
          ...markerItem,
          opacity: 0,
        },
      ]),
    ).toThrow()

    expect(() =>
      validateCanvasItems([
        {
          ...markerItem,
          opacity: 2,
        },
      ]),
    ).toThrow()
  })
})

describe('CanvasItemSchema stamp items', () => {
  it('accepts the built-in stamp storage envelope', () => {
    expect(validateCanvasItems([stampItem])).toEqual([stampItem])
  })

  it('rejects stamp ids outside the stable id contract', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...stampItem,
          stamp: 'Thumbs Up',
        },
      ]),
    ).toThrow()
  })
})
