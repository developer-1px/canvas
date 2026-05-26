import {
  renderCanvasToolbarItemByKind,
  type CanvasToolbarItemRenderContext,
} from './CanvasToolbarItemRenderDispatch'
import type { CanvasToolbarItem } from './CanvasToolbarItems'

export type { CanvasToolbarItemRenderContext } from './CanvasToolbarItemRenderDispatch'

export function renderCanvasToolbarItem({
  context,
  item,
}: {
  context: CanvasToolbarItemRenderContext
  item: CanvasToolbarItem
}) {
  return renderCanvasToolbarItemByKind({ context, item })
}
