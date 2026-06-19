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

export type CanvasContextMenuContainerRect = {
  height: number
  left: number
  top: number
  width: number
}

export type CanvasContextMenuPositionInput = {
  margin?: number
  menuSize?: CanvasContextMenuSize
  point: Point
  viewportSize?: CanvasContextMenuViewportSize | null
}

export type CanvasContextMenuClientPointInput = {
  clientPoint: Point
  containerRect?: CanvasContextMenuContainerRect | null
  margin?: number
  menuSize?: CanvasContextMenuSize
}

export type CanvasContextMenuKeyboardIntentKind = 'open-context-menu'

export type CanvasContextMenuKeyboardIntent = {
  kind: CanvasContextMenuKeyboardIntentKind
  preventDefault: true
  stopPropagation: true
}

export type CanvasContextMenuPointerIntentKind = 'open-context-menu'

export type CanvasContextMenuPointerIntent = {
  kind: CanvasContextMenuPointerIntentKind
  preventDefault: true
  stopPropagation: true
}

export type CanvasContextMenuDismissKeyboardIntentKind = 'close-context-menu'

export type CanvasContextMenuDismissKeyboardIntent = {
  kind: CanvasContextMenuDismissKeyboardIntentKind
  preventDefault: true
  stopPropagation: true
}

export type CanvasContextMenuKeyboardIntentInput = {
  event: {
    shiftKey: boolean
  }
  key: string
}

export type CanvasContextMenuDismissKeyboardIntentInput = {
  key: string
}

export const CANVAS_CONTEXT_MENU_DEFAULT_SIZE = {
  height: 160,
  width: 250,
} as const satisfies CanvasContextMenuSize

export const DEFAULT_CANVAS_CONTEXT_MENU_MARGIN = 8

export function getCanvasContextMenuKeyboardIntent({
  event,
  key,
}: CanvasContextMenuKeyboardIntentInput):
  CanvasContextMenuKeyboardIntent | null {
  if (key === 'ContextMenu' || (key === 'F10' && event.shiftKey)) {
    return {
      kind: 'open-context-menu',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  return null
}

export function getCanvasContextMenuPointerIntent():
  CanvasContextMenuPointerIntent {
  return {
    kind: 'open-context-menu',
    preventDefault: true,
    stopPropagation: true,
  }
}

export function getCanvasContextMenuDismissKeyboardIntent({
  key,
}: CanvasContextMenuDismissKeyboardIntentInput):
  CanvasContextMenuDismissKeyboardIntent | null {
  if (key === 'Escape') {
    return {
      kind: 'close-context-menu',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  return null
}

export function getCanvasContextMenuPosition({
  margin = DEFAULT_CANVAS_CONTEXT_MENU_MARGIN,
  menuSize = CANVAS_CONTEXT_MENU_DEFAULT_SIZE,
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

export function getCanvasContextMenuPositionForClientPoint({
  clientPoint,
  containerRect,
  margin,
  menuSize = CANVAS_CONTEXT_MENU_DEFAULT_SIZE,
}: CanvasContextMenuClientPointInput): CanvasContextMenuPosition {
  if (!containerRect) {
    return getCanvasContextMenuPosition({
      margin,
      menuSize,
      point: clientPoint,
    })
  }

  return getCanvasContextMenuPosition({
    margin,
    menuSize,
    point: {
      x: clientPoint.x - containerRect.left,
      y: clientPoint.y - containerRect.top,
    },
    viewportSize: {
      height: containerRect.height,
      width: containerRect.width,
    },
  })
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
