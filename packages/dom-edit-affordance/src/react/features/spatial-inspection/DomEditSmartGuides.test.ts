import { describe, expect, it } from 'vitest'
import {
  getDomEditSmartGuides,
} from './DomEditSmartGuides'

describe('DomEditSmartGuides', () => {
  it('finds parent edge alignment guides', () => {
    const guides = getDomEditSmartGuides({
      parent: { h: 100, w: 200, x: 10, y: 20 },
      selected: { h: 30, w: 40, x: 10, y: 45 },
    })

    expect(guides).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        coordinate: 10,
        family: 'alignment',
        orientation: 'vertical',
        pointKind: 'edge',
        referencePosition: 'left',
        source: 'parent',
        targetPosition: 'left',
      }),
    ]))
  })

  it('finds parent center alignment guides', () => {
    const guides = getDomEditSmartGuides({
      parent: { h: 100, w: 200, x: 10, y: 20 },
      selected: { h: 20, w: 40, x: 90, y: 60 },
    })

    expect(guides).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        coordinate: 110,
        family: 'alignment',
        orientation: 'vertical',
        pointKind: 'center',
        referencePosition: 'center-x',
        source: 'parent',
        targetPosition: 'center-x',
      }),
      expect.objectContaining({
        axis: 'y',
        coordinate: 70,
        family: 'alignment',
        orientation: 'horizontal',
        pointKind: 'center',
        referencePosition: 'center-y',
        source: 'parent',
        targetPosition: 'center-y',
      }),
    ]))
  })

  it('finds sibling edge alignment guides', () => {
    const guides = getDomEditSmartGuides({
      selected: { h: 40, w: 50, x: 100, y: 20 },
      siblings: [{
        id: 'sibling-a',
        rect: { h: 30, w: 80, x: 20, y: 20 },
        source: 'sibling',
      }],
    })

    expect(guides).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        coordinate: 100,
        family: 'alignment',
        pointKind: 'edge',
        referencePosition: 'right',
        source: 'sibling',
        sourceId: 'sibling-a',
        targetPosition: 'left',
      }),
      expect.objectContaining({
        axis: 'y',
        coordinate: 20,
        family: 'alignment',
        pointKind: 'edge',
        referencePosition: 'top',
        source: 'sibling',
        sourceId: 'sibling-a',
        targetPosition: 'top',
      }),
    ]))
  })

  it('finds nearest horizontal and vertical sibling distances', () => {
    const guides = getDomEditSmartGuides({
      selected: { h: 40, w: 50, x: 100, y: 100 },
      siblings: [
        {
          id: 'left',
          rect: { h: 24, w: 60, x: 20, y: 108 },
          source: 'sibling',
        },
        {
          id: 'top',
          rect: { h: 40, w: 20, x: 112, y: 40 },
          source: 'sibling',
        },
        {
          id: 'far-right',
          rect: { h: 40, w: 30, x: 200, y: 100 },
          source: 'sibling',
        },
      ],
    })

    expect(guides).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        family: 'distance',
        length: 20,
        orientation: 'horizontal',
        sourceId: 'left',
        spacingKind: 'nearest',
        spacingSource: 'visual-gap',
      }),
      expect.objectContaining({
        axis: 'y',
        family: 'distance',
        length: 20,
        orientation: 'vertical',
        sourceId: 'top',
        spacingKind: 'nearest',
        spacingSource: 'visual-gap',
      }),
    ]))
  })

  it('promotes repeated gaps into equal spacing guides', () => {
    const guides = getDomEditSmartGuides({
      selected: { h: 40, w: 40, x: 80, y: 20 },
      siblings: [
        {
          id: 'left',
          rect: { h: 40, w: 40, x: 20, y: 20 },
          source: 'sibling',
        },
        {
          id: 'right',
          rect: { h: 40, w: 40, x: 140, y: 20 },
          source: 'sibling',
        },
      ],
    })
    const equalSpacingGuides = guides.filter((guide) =>
      guide.family === 'equal-spacing' && guide.axis === 'x')

    expect(equalSpacingGuides).toHaveLength(2)
    expect(equalSpacingGuides).toEqual(expect.arrayContaining([
      expect.objectContaining({
        length: 20,
        orientation: 'horizontal',
        spacingKind: 'equal',
      }),
    ]))
    expect(guides.some((guide) =>
      guide.family === 'distance' &&
      guide.axis === 'x' &&
      guide.length === 20)).toBe(false)
  })

  it('marks threshold matches as snap candidates while dragging', () => {
    const guides = getDomEditSmartGuides({
      isDragging: true,
      selected: { h: 20, w: 20, x: 99, y: 40 },
      siblings: [{
        id: 'snap-target',
        rect: { h: 20, w: 80, x: 20, y: 40 },
        source: 'sibling',
      }],
      threshold: 2,
    })

    expect(guides).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        emphasis: 'snap',
        family: 'alignment',
        sourceId: 'snap-target',
      }),
    ]))
  })

  it('dedupes alignment candidates by priority', () => {
    const guides = getDomEditSmartGuides({
      isDragging: true,
      parent: { h: 100, w: 120, x: 10, y: 10 },
      selected: { h: 20, w: 20, x: 11, y: 30 },
      siblings: [{
        id: 'sibling-priority',
        rect: { h: 20, w: 30, x: 10, y: 60 },
        source: 'sibling',
      }],
      threshold: 2,
    })
    const leftAlignmentGuides = guides.filter((guide) =>
      guide.family === 'alignment' &&
      guide.axis === 'x' &&
      guide.coordinate === 10 &&
      guide.pointKind === 'edge')

    expect(leftAlignmentGuides).toHaveLength(1)
    expect(leftAlignmentGuides[0]).toEqual(expect.objectContaining({
      emphasis: 'snap',
      source: 'sibling',
      sourceId: 'sibling-priority',
    }))
  })
})
