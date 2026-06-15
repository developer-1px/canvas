import { describe, expect, it } from 'vitest'
import {
  getDomEditPaddingDelta,
  getDomEditPaddingDragActiveSides,
  getDomEditPaddingDragSide,
  getDomEditPaddingDragScope,
} from './DomEditAutoLayoutGeometry'

describe('DomEditAutoLayoutGeometry', () => {
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
