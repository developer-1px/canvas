import { describe, expect, it } from 'vitest'
import type {
  CanvasCustomItem,
  CanvasItem,
} from '../model'
import {
  assertCustomCanvasItems,
  isCanvasCustomItemStorageEnvelope,
} from './CanvasCustomItemValidation'

const riskItem: CanvasCustomItem = {
  id: 'risk-1',
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
  },
}

describe('CanvasCustomItemValidation', () => {
  it('owns the stable custom item storage envelope contract', () => {
    expect(isCanvasCustomItemStorageEnvelope(riskItem)).toBe(true)
    expect(isCanvasCustomItemStorageEnvelope({
      ...riskItem,
      kind: 'Risk',
    })).toBe(false)
    expect(isCanvasCustomItemStorageEnvelope({
      ...riskItem,
      data: { run: () => undefined },
    })).toBe(false)
  })

  it('runs product-owned validators by custom item kind through groups', () => {
    const items: CanvasItem[] = [{
      children: [riskItem],
      h: 100,
      id: 'group-1',
      type: 'group',
      w: 200,
      x: 0,
      y: 0,
    }]

    expect(() =>
      assertCustomCanvasItems(items, {
        risk: (item) => item.data.severity === 'low',
      }),
    ).toThrow('Invalid custom canvas item: risk')
  })

  it('rejects custom item validator keys outside the stable id contract', () => {
    expect(() =>
      assertCustomCanvasItems([riskItem], {
        Risk: () => true,
      }),
    ).toThrow('Invalid canvas custom item validator id: Risk')
  })
})
