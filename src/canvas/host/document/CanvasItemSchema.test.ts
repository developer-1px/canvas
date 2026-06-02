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
  it('accepts optional base hidden state and rejects invalid hidden values', () => {
    expect(validateCanvasItems([{ ...customItem, hidden: true }])).toEqual([
      { ...customItem, hidden: true },
    ])

    expect(() =>
      validateCanvasItems([
        {
          ...customItem,
          hidden: 'true',
        } as unknown as CanvasItem,
      ]),
    ).toThrow()
  })

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

describe('CanvasItemSchema rotation storage', () => {
  it('accepts rotation on supported bounded items', () => {
    const shape: CanvasItem = {
      fill: '#ffffff',
      h: 40,
      id: 'shape-1',
      rotation: 15,
      shapeType: 'rect',
      stroke: '#111827',
      type: 'shape',
      w: 80,
      x: 0,
      y: 0,
    }

    expect(validateCanvasItems([shape])).toEqual([shape])
  })

  it('rejects rotation on unsupported drawing items', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...arrowItem,
          rotation: 15,
        },
      ]),
    ).toThrow()
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
  text: 'Flow',
}

const pathItem: CanvasItem = {
  h: 74,
  id: 'path-1',
  opacity: 1,
  segments: [
    { point: { x: 20, y: 40 }, type: 'move' },
    {
      control1: { x: 50, y: 20 },
      control2: { x: 70, y: 90 },
      point: { x: 110, y: 60 },
      type: 'cubic',
    },
  ],
  stroke: '#334155',
  strokeWidth: 4,
  type: 'path',
  w: 94,
  x: 18,
  y: 18,
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
    expect(validateCanvasItems([markerItem, arrowItem, pathItem])).toEqual([
      markerItem,
      arrowItem,
      pathItem,
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
        {
          ...pathItem,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        },
      ]),
    ).toEqual([markerItem, arrowItem, pathItem])
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

    expect(() =>
      validateCanvasItems([
        {
          ...pathItem,
          segments: [{ point: { x: 20, y: 40 }, type: 'move' }],
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

  it('rejects connector labels outside string storage', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...arrowItem,
          text: 1,
        } as unknown as CanvasItem,
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

  it('rejects stamp attachment fields', () => {
    expect(() =>
      validateCanvasItems([
        {
          ...stampItem,
          attachedTo: 'component-sticky',
        },
      ] as unknown as CanvasItem[]),
    ).toThrow()
  })
})
