import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import type {
  DomEditNodeState,
} from '../../../shared/model/DomEditTypes'

export type DomEditFlexWrapLineGuide = DomEditOverlayRect & {
  index: number
  labelX: number
  labelY: number
}

export type DomEditFlexWrapLineGapGuide = DomEditOverlayRect & {
  axis: 'column' | 'row'
  index: number
  label: string
  labelX: number
  labelY: number
}

export type DomEditFlexWrapLayout = {
  direction: DomEditNodeState['direction']
  gaps: DomEditFlexWrapLineGapGuide[]
  lines: DomEditFlexWrapLineGuide[]
}

export function getDomEditFlexWrapLayout({
  children,
  container,
  direction,
  gap,
}: {
  children: DomEditOverlayRect[]
  container: DomEditOverlayRect
  direction: DomEditNodeState['direction']
  gap: number
}): DomEditFlexWrapLayout | null {
  if (children.length < 2) {
    return null
  }

  const lineGroups = groupDomEditFlexWrapLines({ children, direction })

  if (lineGroups.length < 2) {
    return null
  }

  const lines = lineGroups.map((line, index) =>
    getDomEditFlexWrapLineGuide({
      container,
      direction,
      index,
      line,
    }))

  return {
    direction,
    gaps: getDomEditFlexWrapLineGaps({ direction, gap, lines }),
    lines,
  }
}

type FlexWrapLineGroup = {
  children: DomEditOverlayRect[]
  crossEnd: number
  crossStart: number
}

function groupDomEditFlexWrapLines({
  children,
  direction,
}: {
  children: DomEditOverlayRect[]
  direction: DomEditNodeState['direction']
}): FlexWrapLineGroup[] {
  const sorted = [...children]
    .filter((child) => child.w > 0.5 && child.h > 0.5)
    .sort((a, b) => {
      const crossDelta = getDomEditFlexWrapCrossStart(a, direction) -
        getDomEditFlexWrapCrossStart(b, direction)

      return Math.abs(crossDelta) > FLEX_WRAP_LINE_TOLERANCE
        ? crossDelta
        : getDomEditFlexWrapMainStart(a, direction) -
          getDomEditFlexWrapMainStart(b, direction)
    })

  return sorted.reduce<FlexWrapLineGroup[]>((lines, child) => {
    const crossStart = getDomEditFlexWrapCrossStart(child, direction)
    const crossEnd = getDomEditFlexWrapCrossEnd(child, direction)
    const existing = lines.find((line) =>
      Math.abs(line.crossStart - crossStart) <= FLEX_WRAP_LINE_TOLERANCE)

    if (existing) {
      existing.children.push(child)
      existing.crossEnd = Math.max(existing.crossEnd, crossEnd)
      existing.crossStart = Math.min(existing.crossStart, crossStart)
    } else {
      lines.push({
        children: [child],
        crossEnd,
        crossStart,
      })
    }

    return lines
  }, [])
}

function getDomEditFlexWrapLineGuide({
  container,
  direction,
  index,
  line,
}: {
  container: DomEditOverlayRect
  direction: DomEditNodeState['direction']
  index: number
  line: FlexWrapLineGroup
}): DomEditFlexWrapLineGuide {
  if (direction === 'row') {
    return {
      h: line.crossEnd - line.crossStart,
      index,
      labelX: container.x + 6,
      labelY: line.crossStart + 6,
      w: container.w,
      x: container.x,
      y: line.crossStart,
    }
  }

  return {
    h: container.h,
    index,
    labelX: line.crossStart + 6,
    labelY: container.y + 6,
    w: line.crossEnd - line.crossStart,
    x: line.crossStart,
    y: container.y,
  }
}

function getDomEditFlexWrapLineGaps({
  direction,
  gap,
  lines,
}: {
  direction: DomEditNodeState['direction']
  gap: number
  lines: DomEditFlexWrapLineGuide[]
}): DomEditFlexWrapLineGapGuide[] {
  return lines.slice(0, -1).flatMap<DomEditFlexWrapLineGapGuide>((line, index) => {
    const nextLine = lines[index + 1]

    if (direction === 'row') {
      const y = line.y + line.h
      const h = nextLine.y - y

      if (h <= 0.5) {
        return []
      }

      return [{
        axis: 'row',
        h,
        index,
        label: `row gap ${Math.round(h || gap)}`,
        labelX: line.x + line.w / 2,
        labelY: y + h / 2,
        w: line.w,
        x: line.x,
        y,
      }]
    }

    const x = line.x + line.w
    const w = nextLine.x - x

    if (w <= 0.5) {
      return []
    }

    return [{
      axis: 'column',
      h: line.h,
      index,
      label: `col gap ${Math.round(w || gap)}`,
      labelX: x + w / 2,
      labelY: line.y + line.h / 2,
      w,
      x,
      y: line.y,
    }]
  })
}

function getDomEditFlexWrapCrossStart(
  rect: DomEditOverlayRect,
  direction: DomEditNodeState['direction'],
) {
  return direction === 'row' ? rect.y : rect.x
}

function getDomEditFlexWrapCrossEnd(
  rect: DomEditOverlayRect,
  direction: DomEditNodeState['direction'],
) {
  return direction === 'row' ? rect.y + rect.h : rect.x + rect.w
}

function getDomEditFlexWrapMainStart(
  rect: DomEditOverlayRect,
  direction: DomEditNodeState['direction'],
) {
  return direction === 'row' ? rect.x : rect.y
}

const FLEX_WRAP_LINE_TOLERANCE = 4
