import type {
  ArrowItem,
  CanvasArrowhead,
  CanvasArrowRouting,
  CanvasItem,
} from '../../../../entities'
import { isCanvasShapeItem } from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'

export type CanvasObjectStyleColorChannel = 'fill' | 'stroke'
export type CanvasObjectStyleNumberChannel =
  | 'fontSize'
  | 'opacity'
  | 'strokeWidth'
export type CanvasObjectStyleSegmentedChannel =
  | 'arrowhead'
  | 'arrowRouting'
  | 'textAlign'
export type CanvasObjectTextAlign = 'center' | 'left' | 'right'

export type CanvasObjectStyleSwatch = {
  color: string
  selected: boolean
}

export type CanvasObjectStyleSegment = {
  label: string
  selected: boolean
  value: string
}

export type CanvasObjectStyleSwatchControl = {
  disabled: boolean
  id: CanvasObjectStyleColorChannel
  kind: 'swatches'
  label: string
  mixed: boolean
  swatches: CanvasObjectStyleSwatch[]
  onSelect: (color: string) => void
}

export type CanvasObjectStyleNumberControl = {
  disabled: boolean
  id: CanvasObjectStyleNumberChannel
  kind: 'number'
  label: string
  max: number
  min: number
  mixed: boolean
  step: number
  value: number | null
  onChange: (value: number) => void
}

export type CanvasObjectStyleSegmentedControl = {
  disabled: boolean
  id: CanvasObjectStyleSegmentedChannel
  kind: 'segmented'
  label: string
  mixed: boolean
  segments: CanvasObjectStyleSegment[]
  value: string | null
  onSelect: (value: string) => void
}

export type CanvasObjectStyleControl =
  | CanvasObjectStyleNumberControl
  | CanvasObjectStyleSegmentedControl
  | CanvasObjectStyleSwatchControl

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

const CANVAS_OBJECT_FILL_COLORS = [
  '#FFFFFF',
  '#D9D9D9',
  '#CDF4D3',
  '#C6FAF6',
  '#C2E5FF',
  '#E4CCFF',
  '#FFC2EC',
  '#FFCDC2',
  '#FFE0C2',
  '#FFECBD',
] as const

const CANVAS_OBJECT_STROKE_COLORS = [
  '#1E1E1E',
  '#757575',
  '#B3B3B3',
  '#66D575',
  '#5AD8CC',
  '#3DADFF',
  '#9747FF',
  '#F849C1',
  '#FF7556',
  '#FF9E42',
  '#FFC943',
] as const

const CANVAS_TEXT_ALIGN_SEGMENTS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
] as const

const CANVAS_ARROW_ROUTING_SEGMENTS = [
  { label: 'Line', value: 'straight' },
  { label: 'Elbow', value: 'elbow' },
] as const

const CANVAS_ARROWHEAD_SEGMENTS = [
  { label: 'Arrow', value: 'end' },
  { label: 'Plain', value: 'none' },
] as const

export function getCanvasObjectStyleControls({
  commitItemsChange,
  disabled,
  enabled = true,
  items,
  selectedItems,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  enabled?: boolean
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleControl[] {
  if (!enabled || selection.length === 0 || selectedItems.length === 0) {
    return []
  }

  return [
    getCanvasObjectColorStyleControl({
      channel: 'fill',
      colors: CANVAS_OBJECT_FILL_COLORS,
      commitItemsChange,
      disabled,
      items,
      label: 'Fill',
      selectedItems,
      selection,
    }),
    getCanvasObjectColorStyleControl({
      channel: 'stroke',
      colors: CANVAS_OBJECT_STROKE_COLORS,
      commitItemsChange,
      disabled,
      items,
      label: 'Stroke',
      selectedItems,
      selection,
    }),
    getCanvasObjectNumberStyleControl({
      channel: 'opacity',
      commitItemsChange,
      disabled,
      items,
      label: 'Opacity',
      max: 1,
      min: 0.05,
      selectedItems,
      selection,
      step: 0.05,
    }),
    getCanvasObjectNumberStyleControl({
      channel: 'strokeWidth',
      commitItemsChange,
      disabled,
      items,
      label: 'Stroke width',
      max: 32,
      min: 0.5,
      selectedItems,
      selection,
      step: 0.5,
    }),
    getCanvasObjectNumberStyleControl({
      channel: 'fontSize',
      commitItemsChange,
      disabled,
      items,
      label: 'Font size',
      max: 72,
      min: 8,
      selectedItems,
      selection,
      step: 1,
    }),
    getCanvasObjectSegmentedStyleControl({
      channel: 'textAlign',
      commitItemsChange,
      disabled,
      items,
      label: 'Text align',
      options: CANVAS_TEXT_ALIGN_SEGMENTS,
      selectedItems,
      selection,
    }),
    getCanvasObjectSegmentedStyleControl({
      channel: 'arrowRouting',
      commitItemsChange,
      disabled,
      items,
      label: 'Line',
      options: CANVAS_ARROW_ROUTING_SEGMENTS,
      selectedItems,
      selection,
    }),
    getCanvasObjectSegmentedStyleControl({
      channel: 'arrowhead',
      commitItemsChange,
      disabled,
      items,
      label: 'Arrowhead',
      options: CANVAS_ARROWHEAD_SEGMENTS,
      selectedItems,
      selection,
    }),
  ].filter((control): control is CanvasObjectStyleControl => control !== null)
}

function getCanvasObjectColorStyleControl({
  channel,
  colors,
  commitItemsChange,
  disabled,
  items,
  label,
  selectedItems,
  selection,
}: {
  channel: CanvasObjectStyleColorChannel
  colors: readonly string[]
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  label: string
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleSwatchControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectColorStyle(item, channel),
  )
  const sharedValue = getSharedCanvasStyleValue(
    stylableItems.map((item) => getCanvasObjectColorStyleValue(item, channel)),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    kind: 'swatches',
    label,
    mixed: sharedValue === null,
    swatches: colors.map((color) => ({
      color,
      selected: sharedValue === color,
    })),
    onSelect: (color) => {
      commitCanvasObjectStyleChange({
        apply: (item) => applyCanvasObjectColorStyle(item, channel, color),
        canApply: (item) => canApplyCanvasObjectColorStyle(item, channel),
        commitItemsChange,
        disabled,
        items,
        selectedItems,
        selection,
      })
    },
  }
}

function getCanvasObjectNumberStyleControl({
  channel,
  commitItemsChange,
  disabled,
  items,
  label,
  max,
  min,
  selectedItems,
  selection,
  step,
}: {
  channel: CanvasObjectStyleNumberChannel
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  label: string
  max: number
  min: number
  selectedItems: CanvasItem[]
  selection: string[]
  step: number
}): CanvasObjectStyleNumberControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectNumberStyle(item, channel),
  )
  const sharedValue = getSharedCanvasStyleValue(
    stylableItems.map((item) => getCanvasObjectNumberStyleValue(item, channel)),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    kind: 'number',
    label,
    max,
    min,
    mixed: sharedValue === null,
    step,
    value: sharedValue,
    onChange: (value) => {
      if (!Number.isFinite(value)) {
        return
      }

      commitCanvasObjectStyleChange({
        apply: (item) =>
          applyCanvasObjectNumberStyle(
            item,
            channel,
            clampCanvasObjectNumberStyle(value, min, max),
          ),
        canApply: (item) => canApplyCanvasObjectNumberStyle(item, channel),
        commitItemsChange,
        disabled,
        items,
        selectedItems,
        selection,
      })
    },
  }
}

function getCanvasObjectSegmentedStyleControl({
  channel,
  commitItemsChange,
  disabled,
  items,
  label,
  options,
  selectedItems,
  selection,
}: {
  channel: CanvasObjectStyleSegmentedChannel
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  label: string
  options: readonly { label: string; value: string }[]
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleSegmentedControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectSegmentedStyle(item, channel),
  )
  const sharedValue = getSharedCanvasStyleValue(
    stylableItems.map((item) =>
      getCanvasObjectSegmentedStyleValue(item, channel),
    ),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    kind: 'segmented',
    label,
    mixed: sharedValue === null,
    segments: options.map((option) => ({
      ...option,
      selected: sharedValue === option.value,
    })),
    value: sharedValue,
    onSelect: (value) => {
      commitCanvasObjectStyleChange({
        apply: (item) => applyCanvasObjectSegmentedStyle(item, channel, value),
        canApply: (item) => canApplyCanvasObjectSegmentedStyle(item, channel),
        commitItemsChange,
        disabled,
        items,
        selectedItems,
        selection,
      })
    },
  }
}

function commitCanvasObjectStyleChange({
  apply,
  canApply,
  commitItemsChange,
  disabled,
  items,
  selectedItems,
  selection,
}: {
  apply: (item: CanvasItem) => CanvasItem
  canApply: (item: CanvasItem) => boolean
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}) {
  if (disabled) {
    return
  }

  const selectedIds = new Set(selection)

  commitItemsChange({
    type: 'replace-changed',
    items: (items ?? selectedItems).map((item) =>
      selectedIds.has(item.id) && canApply(item) ? apply(item) : item,
    ),
  }, {
    before: selection,
    after: selection,
  })
}

function canApplyCanvasObjectColorStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleColorChannel,
) {
  return channel === 'fill'
    ? hasCanvasObjectFill(item)
    : hasCanvasObjectStroke(item)
}

function canApplyCanvasObjectNumberStyle(
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

function canApplyCanvasObjectSegmentedStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleSegmentedChannel,
) {
  if (channel === 'arrowRouting' || channel === 'arrowhead') {
    return item.type === 'arrow'
  }

  return hasCanvasObjectTextStyle(item)
}

function getCanvasObjectColorStyleValue(
  item: CanvasItem,
  channel: CanvasObjectStyleColorChannel,
) {
  if (channel === 'fill') {
    return hasCanvasObjectFill(item) ? item.fill : undefined
  }

  return hasCanvasObjectStroke(item) ? item.stroke : undefined
}

function getCanvasObjectNumberStyleValue(
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

function getCanvasObjectSegmentedStyleValue(
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

function applyCanvasObjectColorStyle(
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

function applyCanvasObjectNumberStyle(
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

function applyCanvasObjectSegmentedStyle(
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

function getSharedCanvasStyleValue<TValue>(
  values: readonly TValue[],
): TValue | null {
  const [first] = values

  if (first === undefined) {
    return null
  }

  return values.every((value) => Object.is(value, first)) ? first : null
}

function clampCanvasObjectNumberStyle(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(max, Math.max(min, value))
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
