import { describe, expect, it } from 'vitest'
import {
  getDomEditMainAxisGuideRect,
  getDomEditPaddingDelta,
  getDomEditPaddingDragActiveSides,
  getDomEditPaddingDragSide,
  getDomEditPaddingDragScope,
} from './DomEditAutoLayoutGeometry'

describe('DomEditAutoLayoutGeometry', () => {
  it('places row main-axis guides inside the padded content lane', () => {
    expect(getDomEditMainAxisGuideRect({
      direction: 'row',
      padding: {
        bottom: 8,
        left: 10,
        right: 20,
        top: 12,
      },
      rect: {
        h: 80,
        w: 120,
        x: 30,
        y: 40,
      },
    })).toEqual({
      h: 2,
      w: 90,
      x: 40,
      y: 81,
    })
  })

  it('places column main-axis guides inside the padded content lane', () => {
    expect(getDomEditMainAxisGuideRect({
      direction: 'column',
      padding: {
        bottom: 14,
        left: 18,
        right: 6,
        top: 10,
      },
      rect: {
        h: 100,
        w: 90,
        x: 20,
        y: 30,
      },
    })).toEqual({
      h: 76,
      w: 2,
      x: 70,
      y: 40,
    })
  })

  it('maps side padding handles to axis pairs', () => {
    expect(getDomEditPaddingDragScope('padding-top')).toBe('vertical')
    expect(getDomEditPaddingDragScope('padding-bottom')).toBe('vertical')
    expect(getDomEditPaddingDragScope('padding-left')).toBe('horizontal')
    expect(getDomEditPaddingDragScope('padding-right')).toBe('horizontal')
    expect(getDomEditPaddingDragActiveSides('padding-top')).toEqual([
      'top',
      'bottom',
    ])
    expect(getDomEditPaddingDragActiveSides('padding-left')).toEqual([
      'left',
      'right',
    ])
  })

  it('maps corner padding handles to all sides', () => {
    expect(getDomEditPaddingDragScope('padding-corner-top-left')).toBe('all')
    expect(getDomEditPaddingDragScope('padding-corner-top-right')).toBe('all')
    expect(getDomEditPaddingDragScope('padding-corner-bottom-right')).toBe('all')
    expect(getDomEditPaddingDragScope('padding-corner-bottom-left')).toBe('all')
    expect(getDomEditPaddingDragActiveSides('padding-corner-top-left')).toEqual([
      'top',
      'right',
      'bottom',
      'left',
    ])
  })

  it('maps a pinned side handle to one side', () => {
    expect(getDomEditPaddingDragSide('padding-left')).toBe('left')
    expect(getDomEditPaddingDragScope('padding-left', {
      pinnedSide: 'left',
    })).toBe('left')
    expect(getDomEditPaddingDragActiveSides('padding-left', {
      pinnedSide: 'left',
    })).toEqual(['left'])
    expect(getDomEditPaddingDragScope('padding-left', {
      pinnedSide: 'top',
    })).toBe('horizontal')
  })

  it('increases corner padding when dragged inward', () => {
    expect(getDomEditPaddingDelta('padding-corner-top-left', 8, 8)).toBe(8)
    expect(getDomEditPaddingDelta('padding-corner-top-right', -8, 8)).toBe(8)
    expect(getDomEditPaddingDelta('padding-corner-bottom-right', -8, -8)).toBe(8)
    expect(getDomEditPaddingDelta('padding-corner-bottom-left', 8, -8)).toBe(8)
  })
})
