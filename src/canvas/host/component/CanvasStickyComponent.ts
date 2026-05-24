import type {
  CanvasComponentItem,
  CanvasItem,
} from '../model'

export const CANVAS_STICKY_COMPONENT_KIND = 'sticky'
const CANVAS_STICKY_TEXT_HORIZONTAL_PADDING = 32
const CANVAS_STICKY_TEXT_VERTICAL_PADDING = 32
const CANVAS_STICKY_TEXT_AVERAGE_CHARACTER_WIDTH = 9.5
const CANVAS_STICKY_TEXT_LINE_HEIGHT = 22.5

export function isCanvasStickyComponentItem(
  item: CanvasItem,
): item is CanvasComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_STICKY_COMPONENT_KIND
}

export function applyCanvasStickyComponentCreationDefaults(
  item: CanvasComponentItem,
): CanvasComponentItem {
  return { ...item, body: '' }
}

export function getCanvasStickyComponentTextHeight({
  item,
  text,
}: {
  item: CanvasComponentItem
  text: string
}) {
  const contentWidth = Math.max(1, item.w - CANVAS_STICKY_TEXT_HORIZONTAL_PADDING)
  const charactersPerLine = Math.max(
    1,
    Math.floor(contentWidth / CANVAS_STICKY_TEXT_AVERAGE_CHARACTER_WIDTH),
  )
  const lineCount = getCanvasStickyComponentTextLineCount({
    charactersPerLine,
    text,
  })
  const requiredHeight = Math.ceil(
    lineCount * CANVAS_STICKY_TEXT_LINE_HEIGHT +
      CANVAS_STICKY_TEXT_VERTICAL_PADDING,
  )

  return Math.max(item.h, requiredHeight)
}

function getCanvasStickyComponentTextLineCount({
  charactersPerLine,
  text,
}: {
  charactersPerLine: number
  text: string
}) {
  return text
    .split('\n')
    .reduce(
      (total, line) =>
        total +
        Math.max(1, Math.ceil(Array.from(line).length / charactersPerLine)),
      0,
    )
}
