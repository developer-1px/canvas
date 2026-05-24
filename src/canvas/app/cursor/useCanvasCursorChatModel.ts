import {
  useCallback,
  useRef,
  useState,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Point } from '../../entities'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'

export const CANVAS_CURSOR_CHAT_MAX_LENGTH = 52

type CanvasCursorChatState = {
  open: boolean
  point: Point
  value: string
}

const DEFAULT_CURSOR_CHAT_POINT = Object.freeze({ x: 240, y: 160 })
const CURSOR_CHAT_SCREEN_MARGIN = 14
const CURSOR_CHAT_MAX_WIDTH = 220
const CURSOR_CHAT_MIN_SCREEN_Y = 86

export function useCanvasCursorChatModel({
  config,
  stageElement,
}: {
  config: CanvasAffordanceConfig
  stageElement: CanvasAppStageElement
}) {
  const lastPointRef = useRef<Point | null>(null)
  const [chat, setChat] = useState<CanvasCursorChatState>({
    open: false,
    point: DEFAULT_CURSOR_CHAT_POINT,
    value: '',
  })
  const canUseCursorChat =
    config.overlays.cursorChat && config.shortcuts.cursorChat
  const closeCursorChat = useCallback(() => {
    setChat((current) => ({
      ...current,
      open: false,
      value: '',
    }))
  }, [])
  const openCursorChat = useCallback(() => {
    if (!canUseCursorChat) {
      return
    }

    const point = lastPointRef.current ?? getCanvasCursorChatFallbackPoint(
      stageElement,
    )

    setChat({
      open: true,
      point,
      value: '',
    })
  }, [canUseCursorChat, stageElement])
  const setCursorChatValue = useCallback((value: string) => {
    setChat((current) => ({
      ...current,
      value: value.slice(0, CANVAS_CURSOR_CHAT_MAX_LENGTH),
    }))
  }, [])
  const updateCursorChatPoint = useCallback((event: CanvasAppPointerInput) => {
    const point = getCanvasCursorChatScreenPoint({
      event,
      stageElement,
    })

    lastPointRef.current = point
    setChat((current) =>
      current.open
        ? {
            ...current,
            point,
          }
        : current,
    )
  }, [stageElement])
  const closeCursorChatFromPointer = useCallback((
    event: CanvasAppPointerInput,
  ) => {
    updateCursorChatPoint(event)
    closeCursorChat()
  }, [closeCursorChat, updateCursorChatPoint])

  return {
    keyboard: {
      closeCursorChat,
      openCursorChat,
    },
    stage: {
      onPointerDown: closeCursorChatFromPointer,
      onPointerMove: updateCursorChatPoint,
    },
    view: {
      maxLength: CANVAS_CURSOR_CHAT_MAX_LENGTH,
      point: chat.point,
      value: chat.value,
      visible: canUseCursorChat && chat.open,
      onCancel: closeCursorChat,
      onChange: setCursorChatValue,
    },
  }
}

function getCanvasCursorChatScreenPoint({
  event,
  stageElement,
}: {
  event: CanvasAppPointerInput
  stageElement: CanvasAppStageElement
}) {
  return clampCanvasCursorChatPoint({
    point: stageElement.getScreenPoint(event),
    stageElement,
  })
}

function getCanvasCursorChatFallbackPoint(
  stageElement: CanvasAppStageElement,
): Point {
  const rect = stageElement.getRect()

  const point = rect
    ? {
        x: rect.width / 2,
        y: rect.height / 2,
      }
    : DEFAULT_CURSOR_CHAT_POINT

  return clampCanvasCursorChatPoint({ point, stageElement })
}

function clampCanvasCursorChatPoint({
  point,
  stageElement,
}: {
  point: Point
  stageElement: CanvasAppStageElement
}) {
  const rect = stageElement.getRect()

  if (!rect) {
    return point
  }

  const minX = CURSOR_CHAT_SCREEN_MARGIN
  const maxX = Math.max(
    minX,
    rect.width - CURSOR_CHAT_MAX_WIDTH - CURSOR_CHAT_SCREEN_MARGIN,
  )
  const minY = CURSOR_CHAT_MIN_SCREEN_Y
  const maxY = Math.max(minY, rect.height - CURSOR_CHAT_SCREEN_MARGIN)

  return {
    x: Math.min(maxX, Math.max(minX, point.x)),
    y: Math.min(maxY, Math.max(minY, point.y)),
  }
}
