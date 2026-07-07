import type { CSSProperties } from 'react'
import type {
  CanvasShapeItem,
  RectItem,
  TextItem,
} from '../../entities'

type CanvasWhiteboardSvgTextStyleItem = CanvasShapeItem | RectItem | TextItem

export function getCanvasWhiteboardSvgTextStyle(
  item: CanvasWhiteboardSvgTextStyleItem,
): CSSProperties | undefined {
  if (item.fontSize === undefined && item.textAlign === undefined) {
    return undefined
  }

  return {
    fontSize: item.fontSize,
    textAlign: item.textAlign,
  }
}
