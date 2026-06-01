import type {
  Bounds,
  Point,
} from '../../core'
import type {
  ArrowItem,
} from '../model'

const CANVAS_ARROW_LABEL_HEIGHT = 32
const CANVAS_ARROW_LABEL_MAX_WIDTH = 220
const CANVAS_ARROW_LABEL_MIN_WIDTH = 96
const CANVAS_ARROW_LABEL_PADDING_X = 28
const CANVAS_ARROW_LABEL_TEXT_WIDTH = 7

export function getCanvasArrowLabelBounds(item: ArrowItem): Bounds {
  const width = getCanvasArrowLabelWidth(item.text ?? '')
  const point = getCanvasArrowLabelPoint(item, width)

  return {
    x: point.x - width / 2,
    y: point.y - CANVAS_ARROW_LABEL_HEIGHT / 2,
    w: width,
    h: CANVAS_ARROW_LABEL_HEIGHT,
  }
}

function getCanvasArrowLabelPoint(item: ArrowItem, width: number): Point {
  if (item.routing !== 'elbow') {
    return {
      x: (item.start.x + item.end.x) / 2,
      y: (item.start.y + item.end.y) / 2,
    }
  }

  const elbowX = item.start.x + (item.end.x - item.start.x) / 2
  const segments = [
    {
      end: { x: elbowX, y: item.start.y },
      start: item.start,
    },
    {
      end: { x: elbowX, y: item.end.y },
      start: { x: elbowX, y: item.start.y },
    },
    {
      end: item.end,
      start: { x: elbowX, y: item.end.y },
    },
  ].filter((segment) =>
    segment.start.x !== segment.end.x || segment.start.y !== segment.end.y,
  )

  if (segments.length === 0) {
    return {
      x: item.start.x,
      y: item.start.y,
    }
  }

  const longest = segments.reduce((result, segment) =>
    getCanvasSegmentLength(segment) > getCanvasSegmentLength(result)
      ? segment
      : result,
  )
  const midpoint = {
    x: (longest.start.x + longest.end.x) / 2,
    y: (longest.start.y + longest.end.y) / 2,
  }
  const isVertical = longest.start.x === longest.end.x

  return isVertical
    ? {
        x: midpoint.x + width / 2 + 8,
        y: midpoint.y,
      }
    : {
        x: midpoint.x,
        y: midpoint.y - CANVAS_ARROW_LABEL_HEIGHT / 2 - 8,
      }
}

function getCanvasArrowLabelWidth(text: string) {
  const longestLine = text
    .split('\n')
    .reduce((length, line) => Math.max(length, line.length), 0)

  return Math.min(
    Math.max(
      longestLine * CANVAS_ARROW_LABEL_TEXT_WIDTH +
        CANVAS_ARROW_LABEL_PADDING_X,
      CANVAS_ARROW_LABEL_MIN_WIDTH,
    ),
    CANVAS_ARROW_LABEL_MAX_WIDTH,
  )
}

function getCanvasSegmentLength({
  end,
  start,
}: {
  end: Point
  start: Point
}) {
  return Math.hypot(end.x - start.x, end.y - start.y)
}
