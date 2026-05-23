import { describe, expect, it } from 'vitest'
import type { CanvasCustomItem } from '../model'
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
