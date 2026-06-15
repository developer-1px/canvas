import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'

export type DomEditGridTrackAxis = 'column' | 'row'

export type DomEditGridTrackGuide = {
  axis: DomEditGridTrackAxis
  index: number
  label: string
  labelX: number
  labelY: number
  rect: DomEditOverlayRect
}

export type DomEditGridLineGuide = {
  axis: DomEditGridTrackAxis
  labelX: number
  labelY: number
  lineNumber: number
  offset: number
  rect: DomEditOverlayRect
}

export type DomEditGridTrackLayout = {
  columnLines: DomEditGridLineGuide[]
  columnTracks: DomEditGridTrackGuide[]
  rowLines: DomEditGridLineGuide[]
  rowTracks: DomEditGridTrackGuide[]
}

export function getDomEditGridTrackLayout({
  columnTemplate,
  container,
  lineThickness = 1,
  rowTemplate,
  tracks,
}: {
  columnTemplate?: string
  container: DomEditOverlayRect
  lineThickness?: number
  rowTemplate?: string
  tracks: DomEditOverlayRect[]
}): DomEditGridTrackLayout {
  const columnTracks = getDomEditGridAxisTracks({
    axis: 'column',
    container,
    lineThickness,
    template: columnTemplate,
    tracks,
  })
  const rowTracks = getDomEditGridAxisTracks({
    axis: 'row',
    container,
    lineThickness,
    template: rowTemplate,
    tracks,
  })

  return {
    columnLines: columnTracks.lines,
    columnTracks: columnTracks.tracks,
    rowLines: rowTracks.lines,
    rowTracks: rowTracks.tracks,
  }
}

export function getDomEditGridHoveredTracks({
  layout,
  point,
}: {
  layout: DomEditGridTrackLayout
  point: { x: number; y: number }
}) {
  return [
    ...layout.columnTracks,
    ...layout.rowTracks,
  ].filter((track) => isDomEditGridPointInsideRect(point, track.rect))
}

export function getDomEditGridTrackKey(track: DomEditGridTrackGuide) {
  return `${track.axis}:${track.index}`
}

type AxisTrackInterval = {
  end: number
  start: number
}

function getDomEditGridAxisTracks({
  axis,
  container,
  lineThickness,
  template,
  tracks,
}: {
  axis: DomEditGridTrackAxis
  container: DomEditOverlayRect
  lineThickness: number
  template?: string
  tracks: DomEditOverlayRect[]
}) {
  const intervals = getDomEditGridTrackIntervals({ axis, container, tracks })
  const templateTokens = parseDomEditGridTemplateTracks(template ?? '')
  const lines = getDomEditGridLineGuides({
    axis,
    container,
    intervals,
    lineThickness,
  })

  return {
    lines,
    tracks: intervals.map((interval, index) =>
      getDomEditGridTrackGuide({
        axis,
        container,
        index,
        interval,
        templateToken: templateTokens[index],
      })),
  }
}

function getDomEditGridTrackIntervals({
  axis,
  container,
  tracks,
}: {
  axis: DomEditGridTrackAxis
  container: DomEditOverlayRect
  tracks: DomEditOverlayRect[]
}): AxisTrackInterval[] {
  const intervals = tracks
    .map((track) => {
      const start = axis === 'column' ? track.x : track.y
      const size = axis === 'column' ? track.w : track.h

      return {
        end: roundDomEditGridTrackLine(start + size),
        start: roundDomEditGridTrackLine(start),
      }
    })
    .filter((interval) => interval.end - interval.start > 0.5)
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const merged = intervals.reduce<AxisTrackInterval[]>((result, interval) => {
    const existing = result.find((candidate) =>
      areDomEditGridTrackLinesEqual(candidate.start, interval.start))

    if (existing) {
      existing.end = Math.max(existing.end, interval.end)
    } else {
      result.push(interval)
    }

    return result
  }, [])

  if (merged.length > 0) {
    return merged
  }

  const start = axis === 'column' ? container.x : container.y
  const size = axis === 'column' ? container.w : container.h

  return [{
    end: roundDomEditGridTrackLine(start + size),
    start: roundDomEditGridTrackLine(start),
  }]
}

function getDomEditGridLineGuides({
  axis,
  container,
  intervals,
  lineThickness,
}: {
  axis: DomEditGridTrackAxis
  container: DomEditOverlayRect
  intervals: AxisTrackInterval[]
  lineThickness: number
}) {
  const lineOffsets = [
    ...intervals.map((interval) => interval.start),
    intervals[intervals.length - 1]?.end ?? (
      axis === 'column'
        ? container.x + container.w
        : container.y + container.h
    ),
  ]

  return lineOffsets.map((offset, index): DomEditGridLineGuide => ({
    axis,
    labelX: axis === 'column' ? offset : container.x - 6,
    labelY: axis === 'column' ? container.y - 6 : offset,
    lineNumber: index + 1,
    offset,
    rect: axis === 'column'
      ? {
          h: container.h,
          w: lineThickness,
          x: offset - lineThickness / 2,
          y: container.y,
        }
      : {
          h: lineThickness,
          w: container.w,
          x: container.x,
          y: offset - lineThickness / 2,
        },
  }))
}

function getDomEditGridTrackGuide({
  axis,
  container,
  index,
  interval,
  templateToken,
}: {
  axis: DomEditGridTrackAxis
  container: DomEditOverlayRect
  index: number
  interval: AxisTrackInterval
  templateToken?: string
}): DomEditGridTrackGuide {
  const size = interval.end - interval.start
  const rect = axis === 'column'
    ? {
        h: container.h,
        w: size,
        x: interval.start,
        y: container.y,
      }
    : {
        h: size,
        w: container.w,
        x: container.x,
        y: interval.start,
      }

  return {
    axis,
    index,
    label: `${axis === 'column' ? 'c' : 'r'}${index + 1} ${
      formatDomEditGridTrackSizeLabel({ size, templateToken })
    }`,
    labelX: axis === 'column'
      ? rect.x + rect.w / 2
      : rect.x + 6,
    labelY: axis === 'column'
      ? rect.y + 6
      : rect.y + rect.h / 2,
    rect,
  }
}

function parseDomEditGridTemplateTracks(template: string): string[] {
  const tokens: string[] = []
  let depth = 0
  let token = ''

  for (const character of template.trim()) {
    if (character === '(') {
      depth += 1
    }

    if (character === ')') {
      depth = Math.max(0, depth - 1)
    }

    if (/\s/.test(character) && depth === 0) {
      if (token) {
        tokens.push(token)
        token = ''
      }

      continue
    }

    token += character
  }

  if (token) {
    tokens.push(token)
  }

  return tokens.filter((value) => value !== 'none')
}

function formatDomEditGridTrackSizeLabel({
  size,
  templateToken,
}: {
  size: number
  templateToken?: string
}) {
  const computed = `${Math.round(size)}px`
  const authored = formatDomEditGridAuthoredTrackSize(templateToken)

  if (!authored || authored === computed) {
    return computed
  }

  return `${authored} · ${computed}`
}

function formatDomEditGridAuthoredTrackSize(token?: string) {
  const trimmed = token?.trim()

  if (!trimmed || trimmed === 'none') {
    return null
  }

  const minmax = trimmed.match(/^minmax\([^,]+,\s*(.+)\)$/)

  if (minmax?.[1]) {
    return minmax[1].trim()
  }

  if (trimmed === 'max-content') {
    return 'max'
  }

  if (trimmed === 'min-content') {
    return 'min'
  }

  return trimmed.replace(/\s+/g, ' ')
}

function isDomEditGridPointInsideRect(
  point: { x: number; y: number },
  rect: DomEditOverlayRect,
) {
  return point.x >= rect.x &&
    point.x <= rect.x + rect.w &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.h
}

function areDomEditGridTrackLinesEqual(first: number, second: number) {
  return Math.abs(first - second) <= 0.5
}

function roundDomEditGridTrackLine(value: number) {
  return Math.round(value * 1000) / 1000
}
