import { describe, expect, it } from 'vitest'
import {
  assertCanvasStableId,
  assertCanvasStableIdRecordKeys,
  isCanvasStableId,
} from './CanvasStableIds'

describe('CanvasStableIds', () => {
  it('accepts lower-kebab ids as stable persisted keys', () => {
    expect(isCanvasStableId('risk')).toBe(true)
    expect(isCanvasStableId('risk-node')).toBe(true)
    expect(isCanvasStableId('risk-2-node')).toBe(true)
  })

  it('rejects keys that are unsafe for registries and persisted item kinds', () => {
    const invalidIds = [
      '',
      'Risk',
      '1-risk',
      'risk node',
      'risk_node',
      'risk--node',
      'risk-',
      'custom:risk',
    ]

    expect(invalidIds.filter((id) => isCanvasStableId(id))).toEqual([])
  })

  it('uses the caller label in assertion errors', () => {
    expect(() =>
      assertCanvasStableId({
        id: 'Risk',
        label: 'custom item kind',
      }),
    ).toThrow('Invalid canvas custom item kind id: Risk')
  })

  it('validates record keys', () => {
    expect(() =>
      assertCanvasStableIdRecordKeys({
        entries: {
          risk: true,
          Risk: true,
        },
        label: 'custom item validator',
      }),
    ).toThrow('Invalid canvas custom item validator id: Risk')
  })
})
