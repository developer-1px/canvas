import { describe, expect, it } from 'vitest'
import {
  assertCanvasAppExtensionId,
  assertCanvasAppExtensionRecordKeys,
  isCanvasAppExtensionId,
} from './CanvasAppExtensionIds'

describe('CanvasAppExtensionIds', () => {
  it('accepts stable lower-kebab extension ids', () => {
    expect(isCanvasAppExtensionId('risk')).toBe(true)
    expect(isCanvasAppExtensionId('risk-node')).toBe(true)
    expect(isCanvasAppExtensionId('risk-2-node')).toBe(true)
  })

  it('rejects ids that are unsafe as public registry contracts', () => {
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

    expect(
      invalidIds.filter((id) => isCanvasAppExtensionId(id)),
    ).toEqual([])
  })

  it('names invalid extension ids by the public contract slot', () => {
    expect(() =>
      assertCanvasAppExtensionId({
        id: 'Risk',
        label: 'custom item module',
      }),
    ).toThrow('Invalid canvas app custom item module id: Risk')
  })

  it('validates registry record keys', () => {
    expect(() =>
      assertCanvasAppExtensionRecordKeys({
        entries: {
          'risk-node': true,
          'Risk Node': true,
        },
        label: 'custom item renderer',
      }),
    ).toThrow('Invalid canvas app custom item renderer id: Risk Node')
  })
})
