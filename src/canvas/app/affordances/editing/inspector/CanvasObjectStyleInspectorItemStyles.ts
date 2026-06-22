import type {
  ArrowItem,
  CanvasArrowhead,
  CanvasArrowRouting,
  CanvasItem,
} from '../../../../entities'
import { isCanvasShapeItem } from '../../../../host'
import type {
  CanvasObjectStyleColorChannel,
  CanvasObjectStyleNumberChannel,
  CanvasObjectStyleSegmentedChannel,
  CanvasObjectTextAlign,
} from './CanvasObjectStyleInspectorContracts'

type CanvasFillStyleItem = Extract<
  CanvasItem,
  { type: 'component' | 'rect' | 'shape' }
>

type CanvasStrokeStyleItem = Extract<
  CanvasItem,
  { type: 'arrow' | 'component' | 'highlight' | 'marker' | 'rect' | 'shape' }
>

type CanvasOpacityStyleItem = Extract<
  CanvasItem,
  {
    type:
      | 'arrow'
      | 'component'
      | 'highlight'
      | 'marker'
      | 'rect'
      | 'shape'
      | 'text'
  }
>

type CanvasStrokeWidthStyleItem = Extract<
  CanvasItem,
  { type: 'arrow' | 'highlight' | 'marker' | 'rect' | 'shape' }
>

type CanvasTextStyleItem = Extract<
  CanvasItem,
  { type: 'arrow' | 'component' | 'rect' | 'shape' | 'text' }
>

export function canApplyCanvasObjectColorStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleColorChannel,
) {
  return channel === 'fill'
    ? hasCanvasObjectFill(item)
    : hasCanvasObjectStroke(item)
}

export function canApplyCanvasObjectNumberStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleNumberChannel,
) {
  if (channel === 'opacity') {
    return hasCanvasObjectOpacity(item)
  }

  if (channel === 'strokeWidth') {
    return hasCanvasObjectStrokeWidth(item)
  }

  return hasCanvasObjectTextStyle(item)
}

export function canApplyCanvasObjectSegmentedStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleSegmentedChannel,
) {
  if (channel === 'arrowRouting' || channel === 'arrowhead') {
    return item.type === 'arrow'
  }

  return hasCanvasObjectTextStyle(item)
}

export function getCanvasObjectColorStyleValue(
  item: CanvasItem,
  channel: CanvasObjectStyleColorChannel,
) {
  if (channel === 'fill') {
    return hasCanvasObjectFill(item) ? item.fill : undefined
  }

  return hasCanvasObjectStroke(item) ? item.stroke : undefined
}

export function getCanvasObjectNumberStyleValue(
  item: CanvasItem,
  channel: CanvasObjectStyleNumberChannel,
) {
  if (channel === 'opacity') {
    return hasCanvasObjectOpacity(item) ? getCanvasObjectOpacity(item) : null
  }

  if (channel === 'strokeWidth') {
    return hasCanvasObjectStrokeWidth(item)
      ? getCanvasObjectStrokeWidth(item)
      : null
  }

  return hasCanvasObjectTextStyle(item) ? getCanvasObjectFontSize(item) : null
}

export function getCanvasObjectSegmentedStyleValue(
  item: CanvasItem,
  channel: CanvasObjectStyleSegmentedChannel,
) {
  if (channel === 'arrowRouting') {
    return item.type === 'arrow' ? getCanvasObjectArrowRouting(item) : null
  }

  if (channel === 'arrowhead') {
    return item.type === 'arrow' ? getCanvasObjectArrowhead(item) : null
  }

  return hasCanvasObjectTextStyle(item) ? getCanvasObjectTextAlign(item) : null
}

export function applyCanvasObjectColorStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleColorChannel,
  color: string,
): CanvasItem {
  if (channel === 'fill' && hasCanvasObjectFill(item)) {
    return {
      ...item,
      fill: color,
    }
  }

  if (channel === 'stroke' && hasCanvasObjectStroke(item)) {
    return {
      ...item,
      stroke: color,
    }
  }

  return item
}

export function applyCanvasObjectNumberStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleNumberChannel,
  value: number,
): CanvasItem {
  if (channel === 'opacity' && hasCanvasObjectOpacity(item)) {
    return {
      ...item,
      opacity: value,
    }
  }

  if (channel === 'strokeWidth' && hasCanvasObjectStrokeWidth(item)) {
    return {
      ...item,
      strokeWidth: value,
    }
  }

  if (channel === 'fontSize' && hasCanvasObjectTextStyle(item)) {
    return {
      ...item,
      fontSize: value,
    }
  }

  return item
}

export function applyCanvasObjectSegmentedStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleSegmentedChannel,
  value: string,
): CanvasItem {
  if (channel === 'arrowRouting' && item.type === 'arrow') {
    return {
      ...item,
      routing: value === 'elbow' ? 'elbow' : 'straight',
    }
  }

  if (channel === 'arrowhead' && item.type === 'arrow') {
    return setCanvasObjectArrowhead(
      item,
      value === 'none' ? 'none' : 'end',
    )
  }

  if (channel === 'textAlign' && hasCanvasObjectTextStyle(item)) {
    return {
      ...item,
      textAlign: getCanvasObjectTextAlignValue(value),
    }
  }

  return item
}

export function clampCanvasObjectNumberStyle(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(max, Math.max(min, value))
}

function setCanvasObjectArrowhead(
  item: ArrowItem,
  arrowhead: CanvasArrowhead,
): ArrowItem {
  if (arrowhead === 'none') {
    return { ...item, arrowhead }
  }

  const next = { ...item }
  delete next.arrowhead
  return next
}

function hasCanvasObjectFill(item: CanvasItem): item is CanvasFillStyleItem {
  return item.type === 'component' || isCanvasShapeItem(item)
}

function hasCanvasObjectStroke(item: CanvasItem): item is CanvasStrokeStyleItem {
  return (
    item.type === 'arrow' ||
    item.type === 'highlight' ||
    item.type === 'marker' ||
    isCanvasShapeItem(item)
  )
}

function hasCanvasObjectOpacity(
  item: CanvasItem,
): item is CanvasOpacityStyleItem {
  return (
    item.type === 'arrow' ||
    item.type === 'highlight' ||
    item.type === 'marker' ||
    item.type === 'text' ||
    isCanvasShapeItem(item)
  )
}

function hasCanvasObjectStrokeWidth(
  item: CanvasItem,
): item is CanvasStrokeWidthStyleItem {
  return (
    item.type === 'arrow' ||
    item.type === 'component' ||
    item.type === 'highlight' ||
    item.type === 'marker' ||
    isCanvasShapeItem(item)
  )
}

function hasCanvasObjectTextStyle(
  item: CanvasItem,
): item is CanvasTextStyleItem {
  return (
    item.type === 'arrow' ||
    item.type === 'component' ||
    item.type === 'text' ||
    isCanvasShapeItem(item)
  )
}

function getCanvasObjectOpacity(item: CanvasOpacityStyleItem) {
  return item.opacity ?? 1
}

function getCanvasObjectStrokeWidth(item: CanvasStrokeWidthStyleItem) {
  return item.strokeWidth ?? 1.25
}

function getCanvasObjectFontSize(item: CanvasTextStyleItem) {
  return item.fontSize ?? (item.type === 'arrow' ? 9.5 : 16)
}

function getCanvasObjectTextAlign(item: CanvasTextStyleItem): CanvasObjectTextAlign {
  if (item.textAlign) {
    return item.textAlign
  }

  return item.type === 'shape' || item.type === 'rect' || item.type === 'arrow'
    ? 'center'
    : 'left'
}

function getCanvasObjectArrowRouting(item: ArrowItem): CanvasArrowRouting {
  return item.routing ?? 'straight'
}

function getCanvasObjectArrowhead(item: ArrowItem): CanvasArrowhead {
  return item.arrowhead ?? 'end'
}

function getCanvasObjectTextAlignValue(value: string): CanvasObjectTextAlign {
  return value === 'center' || value === 'right' ? value : 'left'
}
