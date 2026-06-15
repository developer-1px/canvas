import { describe, expect, it } from 'vitest'
import {
  createDomEditUniformPaddingSides,
  getDomEditOppositePaddingSide,
  getDomEditPaddingScopeFields,
  getDomEditPaddingScopeSides,
  getDomEditPaddingSides,
  getDomEditPaddingSummary,
  getDomEditUniformPadding,
} from './DomEditPadding'

describe('DomEditPadding', () => {
  it('projects shorthand padding into four sides for legacy state', () => {
    expect(getDomEditPaddingSides({
      padding: 12,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
    })).toEqual(createDomEditUniformPaddingSides(12))
  })

  it('maps padding scopes to cohesive side groups', () => {
    expect(getDomEditPaddingScopeSides('all')).toEqual([
      'top',
      'right',
      'bottom',
      'left',
    ])
    expect(getDomEditPaddingScopeFields('horizontal')).toEqual([
      'paddingLeft',
      'paddingRight',
    ])
    expect(getDomEditPaddingScopeFields('vertical')).toEqual([
      'paddingTop',
      'paddingBottom',
    ])
  })

  it('maps padding sides to their opposite side', () => {
    expect(getDomEditOppositePaddingSide('top')).toBe('bottom')
    expect(getDomEditOppositePaddingSide('right')).toBe('left')
    expect(getDomEditOppositePaddingSide('bottom')).toBe('top')
    expect(getDomEditOppositePaddingSide('left')).toBe('right')
  })

  it('summarizes uniform, pair, and mixed padding values', () => {
    expect(getDomEditUniformPadding({
      bottom: 16,
      left: 16,
      right: 16,
      top: 16,
    })).toBe(16)
    expect(getDomEditPaddingSummary({
      bottom: 12,
      left: 24,
      right: 24,
      top: 12,
    })).toBe('Y 12 X 24')
    expect(getDomEditPaddingSummary({
      bottom: 8,
      left: 16,
      right: 20,
      top: 4,
    })).toBe('T 4 R 20 B 8 L 16')
  })
})
