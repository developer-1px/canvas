import type { Point } from '../../entities'
import type { CanvasComponentItem, CanvasComponentKind } from '../../entities'
import { getCanvasComponentTemplate } from './CanvasComponentCatalog'

export function createCanvasComponentItem({
  id,
  point,
  templateId,
}: {
  id: string
  point: Point
  templateId: CanvasComponentKind
}): CanvasComponentItem {
  const template = getCanvasComponentTemplate(templateId)
  const item: CanvasComponentItem = {
    id,
    type: 'component',
    component: template.id,
    x: point.x,
    y: point.y,
    w: template.w,
    h: template.h,
    title: template.title,
    fill: template.fill,
    stroke: template.stroke,
    accent: template.accent,
  }

  if (template.body !== undefined) {
    item.body = template.body
  }

  if (template.items) {
    item.items = [...template.items]
  }

  if (template.columns) {
    item.columns = [...template.columns]
  }

  return item
}
