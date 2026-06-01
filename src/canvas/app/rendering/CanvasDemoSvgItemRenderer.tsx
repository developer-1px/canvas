import type { PointerEvent } from 'react'
import type {
  CanvasArrowEndpoint,
  CanvasEditableTextItem,
  CanvasItem,
} from '../../entities'
import {
  getCanvasItemRotation,
  getCanvasItemBounds,
  getCanvasItemRotationTransform,
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
  onArrowEndpointPointerDown: (
    event: PointerEvent<SVGCircleElement>,
    itemId: string,
    endpoint: CanvasArrowEndpoint,
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
  onArrowEndpointPointerDown,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: CanvasDemoSvgItemRenderArgs) {
  if (item.hidden) {
    return null
  }

  const isSelected = selected.has(item.id)
  const isLocked = locked || item.locked === true
  const outlined = outlineIds.has(item.id)
  const bounds = getCanvasItemBounds(item)
  const rotation = getCanvasItemRotation(item)
  const rotationTransform = getCanvasItemRotationTransform(item)
  const route = getCanvasDemoSvgItemRenderRoute({
    bounds,
    componentPresentationRenderers,
    customItemRenderers,
    getComponentPresentation,
    item,
    locked: isLocked,
    onArrowEndpointPointerDown,
    onTextDoubleClick,
    selected: isSelected,
    renderChild: (child, childLocked) =>
      renderCanvasDemoSvgItem({
        componentPresentationRenderers,
        customItemRenderers,
        getComponentPresentation,
        item: child,
        locked: childLocked,
        onArrowEndpointPointerDown,
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
      rotation={rotation}
      rotationTransform={rotationTransform}
      selected={isSelected}
      onDoubleClick={route.onDoubleClick}
      onItemPointerDown={onItemPointerDown}
    >
      {route.children}
    </CanvasDemoSvgItemFrame>
  )
}
