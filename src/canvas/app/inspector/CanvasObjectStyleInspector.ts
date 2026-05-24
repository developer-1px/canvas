import type { CanvasItem } from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

export type CanvasObjectStyleChannel = 'fill' | 'stroke'

export type CanvasObjectStyleSwatch = {
  color: string
  selected: boolean
}

export type CanvasObjectStyleControl = {
  disabled: boolean
  id: CanvasObjectStyleChannel
  label: string
  swatches: CanvasObjectStyleSwatch[]
  onSelect: (color: string) => void
}

type CanvasFillStyleItem = Extract<CanvasItem, { type: 'component' | 'rect' }>

type CanvasStrokeStyleItem = Extract<
  CanvasItem,
  { type: 'arrow' | 'component' | 'highlight' | 'marker' | 'rect' }
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

export function getCanvasObjectStyleControls({
  commitItemsChange,
  disabled,
  selectedItems,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleControl[] {
  if (selection.length === 0 || selectedItems.length === 0) {
    return []
  }

  return [
    getCanvasObjectStyleControl({
      channel: 'fill',
      colors: CANVAS_OBJECT_FILL_COLORS,
      commitItemsChange,
      disabled,
      label: 'Fill',
      selectedItems,
      selection,
    }),
    getCanvasObjectStyleControl({
      channel: 'stroke',
      colors: CANVAS_OBJECT_STROKE_COLORS,
      commitItemsChange,
      disabled,
      label: 'Stroke',
      selectedItems,
      selection,
    }),
  ].filter((control): control is CanvasObjectStyleControl => control !== null)
}

function getCanvasObjectStyleControl({
  channel,
  colors,
  commitItemsChange,
  disabled,
  label,
  selectedItems,
  selection,
}: {
  channel: CanvasObjectStyleChannel
  colors: readonly string[]
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  label: string
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectStyle(item, channel),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    label,
    swatches: colors.map((color) => ({
      color,
      selected: stylableItems.every((item) =>
        getCanvasObjectStyleValue(item, channel) === color,
      ),
    })),
    onSelect: (color) => {
      if (disabled) {
        return
      }

      commitItemsChange({
        type: 'replace-changed',
        items: selectedItems.map((item) =>
          canApplyCanvasObjectStyle(item, channel)
            ? applyCanvasObjectStyle(item, channel, color)
            : item,
        ),
      }, {
        before: selection,
        after: selection,
      })
    },
  }
}

function canApplyCanvasObjectStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleChannel,
) {
  if (channel === 'fill') {
    return hasCanvasObjectFill(item)
  }

  return hasCanvasObjectStroke(item)
}

function getCanvasObjectStyleValue(
  item: CanvasItem,
  channel: CanvasObjectStyleChannel,
) {
  if (channel === 'fill') {
    return hasCanvasObjectFill(item) ? item.fill : undefined
  }

  return hasCanvasObjectStroke(item) ? item.stroke : undefined
}

function applyCanvasObjectStyle(
  item: CanvasItem,
  channel: CanvasObjectStyleChannel,
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

function hasCanvasObjectFill(item: CanvasItem): item is CanvasFillStyleItem {
  return item.type === 'component' || item.type === 'rect'
}

function hasCanvasObjectStroke(item: CanvasItem): item is CanvasStrokeStyleItem {
  return (
    item.type === 'arrow' ||
    item.type === 'component' ||
    item.type === 'highlight' ||
    item.type === 'marker' ||
    item.type === 'rect'
  )
}
