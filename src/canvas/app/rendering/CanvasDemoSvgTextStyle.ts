import type { CSSProperties } from 'react'
import type {
  CanvasShapeItem,
  RectItem,
  TextItem,
} from '../../entities'

type CanvasDemoSvgTextStyleItem = CanvasShapeItem | RectItem | TextItem

export function getCanvasDemoSvgTextStyle(
  item: CanvasDemoSvgTextStyleItem,
): CSSProperties | undefined {
  if (item.fontSize === undefined && item.textAlign === undefined) {
    return undefined
  }

  return {
    fontSize: item.fontSize,
    textAlign: item.textAlign,
  }
}
