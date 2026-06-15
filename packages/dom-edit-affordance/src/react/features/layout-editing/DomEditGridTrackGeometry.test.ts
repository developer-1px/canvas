import { describe, expect, it } from 'vitest'

import {
  getDomEditGridHoveredTracks,
  getDomEditGridTrackKey,
  getDomEditGridTrackLayout,
} from './DomEditGridTrackGeometry'

describe('DomEditGridTrackGeometry', () => {
  const container = { h: 96, w: 176, x: 0, y: 0 }
  const tracks = [
    { h: 40, w: 80, x: 0, y: 0 },
    { h: 40, w: 80, x: 96, y: 0 },
    { h: 40, w: 80, x: 0, y: 56 },
    { h: 40, w: 80, x: 96, y: 56 },
  ]

  it('derives column and row line numbers from occupied tracks', () => {
    const layout = getDomEditGridTrackLayout({
      columnTemplate: 'minmax(0, 1fr) 320px',
      container,
      rowTemplate: 'auto auto',
      tracks,
    })

    expect(layout.columnLines.map((line) => line.lineNumber)).toEqual([1, 2, 3])
    expect(layout.columnLines.map((line) => line.offset)).toEqual([0, 96, 176])
    expect(layout.rowLines.map((line) => line.lineNumber)).toEqual([1, 2, 3])
    expect(layout.rowLines.map((line) => line.offset)).toEqual([0, 56, 96])
  })

  it('labels tracks with authored and computed sizes', () => {
    const layout = getDomEditGridTrackLayout({
      columnTemplate: 'minmax(0, 1fr) 320px',
      container,
      rowTemplate: 'auto auto',
      tracks,
    })

    expect(layout.columnTracks.map((track) => track.label)).toEqual([
      'c1 1fr · 80px',
      'c2 320px · 80px',
    ])
    expect(layout.rowTracks.map((track) => track.label)).toEqual([
      'r1 auto · 40px',
      'r2 auto · 40px',
    ])
  })

  it('finds hovered row and column tracks', () => {
    const layout = getDomEditGridTrackLayout({ container, tracks })

    expect(getDomEditGridHoveredTracks({
      layout,
      point: { x: 20, y: 20 },
    }).map(getDomEditGridTrackKey)).toEqual(['column:0', 'row:0'])
    expect(getDomEditGridHoveredTracks({
      layout,
      point: { x: 180, y: 20 },
    })).toEqual([])
  })

  it('merges tracks with the same row start into one row guide', () => {
    const layout = getDomEditGridTrackLayout({
      container,
      tracks: [
        { h: 40, w: 80, x: 0, y: 0 },
        { h: 52, w: 80, x: 96, y: 0 },
      ],
    })

    expect(layout.rowLines.map((line) => line.offset)).toEqual([0, 52])
    expect(layout.rowTracks.map((track) => track.label)).toEqual(['r1 52px'])
  })

  it('falls back to one track when no child tracks are measurable', () => {
    const layout = getDomEditGridTrackLayout({
      container,
      tracks: [],
    })

    expect(layout.columnLines.map((line) => line.lineNumber)).toEqual([1, 2])
    expect(layout.rowLines.map((line) => line.lineNumber)).toEqual([1, 2])
    expect(layout.columnTracks[0]?.label).toBe('c1 176px')
    expect(layout.rowTracks[0]?.label).toBe('r1 96px')
  })
})
