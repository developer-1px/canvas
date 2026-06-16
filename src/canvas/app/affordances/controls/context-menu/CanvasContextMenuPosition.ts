import {
  clamp,
  type Point,
} from '../../../../core'

export type CanvasContextMenuPosition = Point

export type CanvasContextMenuSize = {
  height: number
  width: number
}

export type CanvasContextMenuViewportSize = {
  height: number
  width: number
}

export type CanvasContextMenuPositionInput = {
  margin?: number
  menuSize: CanvasContextMenuSize
  point: Point
  viewportSize?: CanvasContextMenuViewportSize | null
}

export type CanvasContextMenuKeyboardIntentKind = 'open-context-menu'

export type CanvasContextMenuKeyboardIntent = {
  kind: CanvasContextMenuKeyboardIntentKind
  preventDefault: true
}

export type CanvasContextMenuKeyboardIntentInput = {
  event: {
    shiftKey: boolean
  }
  key: string
}

const DEFAULT_CANVAS_CONTEXT_MENU_MARGIN = 8

export function getCanvasContextMenuKeyboardIntent({
  event,
  key,
}: CanvasContextMenuKeyboardIntentInput):
  CanvasContextMenuKeyboardIntent | null {
  if (key === 'ContextMenu' || (key === 'F10' && event.shiftKey)) {
    return {
      kind: 'open-context-menu',
      preventDefault: true,
    }
  }

  return null
}

export function getCanvasContextMenuPosition({
  margin = DEFAULT_CANVAS_CONTEXT_MENU_MARGIN,
  menuSize,
  point,
  viewportSize,
}: CanvasContextMenuPositionInput): CanvasContextMenuPosition {
  const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0
  const safeMenuWidth = Math.max(0, menuSize.width)
  const safeMenuHeight = Math.max(0, menuSize.height)
  const width = getCanvasContextMenuViewportDimension({
    anchor: point.x,
    margin: safeMargin,
    menuSize: safeMenuWidth,
    viewportSize: viewportSize?.width,
  })
  const height = getCanvasContextMenuViewportDimension({
    anchor: point.y,
    margin: safeMargin,
    menuSize: safeMenuHeight,
    viewportSize: viewportSize?.height,
  })

  return {
    x: clamp(
      point.x,
      safeMargin,
      Math.max(safeMargin, width - safeMenuWidth - safeMargin),
    ),
    y: clamp(
      point.y,
      safeMargin,
      Math.max(safeMargin, height - safeMenuHeight - safeMargin),
    ),
  }
}

function getCanvasContextMenuViewportDimension({
  anchor,
  margin,
  menuSize,
  viewportSize,
}: {
  anchor: number
  margin: number
  menuSize: number
  viewportSize: number | null | undefined
}) {
  if (viewportSize && viewportSize > 0) {
    return viewportSize
  }

  return anchor + menuSize + margin
}
