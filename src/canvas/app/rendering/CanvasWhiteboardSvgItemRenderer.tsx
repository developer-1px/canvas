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
import { CanvasWhiteboardSvgItemFrame } from './CanvasWhiteboardSvgItemFrame'
import { getCanvasWhiteboardSvgItemRenderRoute } from './CanvasWhiteboardSvgItemRenderRouting'
import type { CanvasWhiteboardSvgComponentPresentationRenderers } from './CanvasWhiteboardSvgComponentPresentationRegistry'
import type { CanvasWhiteboardSvgCustomItemRenderers } from './CanvasWhiteboardSvgCustomItemRendererRegistry'

export type CanvasWhiteboardSvgItemRenderArgs = {
  componentPresentationRenderers: CanvasWhiteboardSvgComponentPresentationRenderers
  customItemRenderers: CanvasWhiteboardSvgCustomItemRenderers
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

export function renderCanvasWhiteboardSvgItem({
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
}: CanvasWhiteboardSvgItemRenderArgs) {
  if (item.hidden) {
    return null
  }

  const isSelected = selected.has(item.id)
  const isLocked = locked || item.locked === true
  const outlined = outlineIds.has(item.id)
  const bounds = getCanvasItemBounds(item)
  const rotation = getCanvasItemRotation(item)
  const rotationTransform = getCanvasItemRotationTransform(item)
  const route = getCanvasWhiteboardSvgItemRenderRoute({
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
      renderCanvasWhiteboardSvgItem({
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
    <CanvasWhiteboardSvgItemFrame
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
    </CanvasWhiteboardSvgItemFrame>
  )
}
