import type { CanvasComponentItem } from '../../entities'
import { CanvasSvgShapeComponentRenderer } from './CanvasSvgShapeComponentRenderer'
import { CanvasSvgStructuredComponentRenderer } from './CanvasSvgStructuredComponentRenderer'
import { CanvasSvgTextComponentRenderer } from './CanvasSvgTextComponentRenderer'

export function CanvasSvgComponentRenderer({
  item,
}: {
  item: CanvasComponentItem
}) {
  if (item.component === 'connector' || item.component === 'vote') {
    return <CanvasSvgShapeComponentRenderer item={item} />
  }

  if (
    item.component === 'checklist' ||
    item.component === 'kanban' ||
    item.component === 'table'
  ) {
    return <CanvasSvgStructuredComponentRenderer item={item} />
  }

  return <CanvasSvgTextComponentRenderer item={item} />
}
