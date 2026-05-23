import type { PointerEvent } from 'react'
import type { CanvasItem } from '../../entities'
import {
  getCanvasItemBounds,
  type CanvasEditableTextItem,
} from '../../host'
import { CanvasDemoSvgItemFrame } from './CanvasDemoSvgItemFrame'
import { getCanvasDemoSvgItemRenderRoute } from './CanvasDemoSvgItemRenderRouting'
import type { CanvasDemoSvgComponentPresentationRenderers } from './CanvasDemoSvgComponentPresentationRegistry'
import type { CanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistry'

export type CanvasDemoSvgItemRenderArgs = {
  componentPresentationRenderers: CanvasDemoSvgComponentPresentationRenderers
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  getComponentPresentation: (component: string) => string
  item: CanvasItem
  locked: boolean
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: CanvasEditableTextItem) => void
  outlineIds: Set<string>
  selected: Set<string>
}

export function renderCanvasDemoSvgItem({
  componentPresentationRenderers,
  customItemRenderers,
  getComponentPresentation,
  item,
  locked,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: CanvasDemoSvgItemRenderArgs) {
  const isSelected = selected.has(item.id)
  const isLocked = locked || item.locked === true
  const outlined = outlineIds.has(item.id)
  const bounds = getCanvasItemBounds(item)
  const route = getCanvasDemoSvgItemRenderRoute({
    bounds,
    componentPresentationRenderers,
    customItemRenderers,
    getComponentPresentation,
    item,
    locked: isLocked,
    onTextDoubleClick,
    renderChild: (child, childLocked) =>
      renderCanvasDemoSvgItem({
        componentPresentationRenderers,
        customItemRenderers,
        getComponentPresentation,
        item: child,
        locked: childLocked,
        onItemPointerDown,
        onTextDoubleClick,
        outlineIds,
        selected,
      }),
  })

  return (
    <CanvasDemoSvgItemFrame
      key={item.id}
      bounds={bounds}
      className={route.className}
      component={route.component}
      customKind={route.customKind}
      itemId={item.id}
      itemType={item.type}
      locked={isLocked}
      outlined={outlined}
      outlineKind={route.outlineKind}
      selected={isSelected}
      onDoubleClick={route.onDoubleClick}
      onItemPointerDown={onItemPointerDown}
    >
      {route.children}
    </CanvasDemoSvgItemFrame>
  )
}
