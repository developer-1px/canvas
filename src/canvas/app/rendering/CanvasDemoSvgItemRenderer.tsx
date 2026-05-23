import type { PointerEvent } from 'react'
import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../../entities'
import { getCanvasItemBounds } from '../../host'
import { CanvasDemoSvgComponentRenderer } from './CanvasDemoSvgComponentRenderer'
import {
  isCanvasDemoSvgDrawingItem,
  renderCanvasDemoSvgDrawingItem,
} from './CanvasDemoSvgDrawingItemRenderer'
import { CanvasDemoSvgItemFrame } from './CanvasDemoSvgItemFrame'
import { renderCanvasDemoSvgRectTextItem } from './CanvasDemoSvgRectTextItemRenderer'
import type { CanvasDemoSvgComponentPresentationRenderers } from './CanvasDemoSvgComponentPresentationRegistry'
import type { CanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistry'
import { renderCanvasDemoSvgCustomItem } from './CanvasDemoSvgCustomItemRendererExecution'

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
  onTextDoubleClick: (item: RectItem | TextItem) => void
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

  if (item.type === 'group') {
    return (
      <CanvasDemoSvgItemFrame
        key={item.id}
        bounds={bounds}
        className="canvas-item canvas-group"
        itemId={item.id}
        itemType="group"
        locked={isLocked}
        outlined={outlined}
        outlineKind="group"
        selected={isSelected}
        onItemPointerDown={onItemPointerDown}
      >
        <rect
          className="group-hit"
          x={bounds.x}
          y={bounds.y}
          width={bounds.w}
          height={bounds.h}
        />
        {item.children.map((child) =>
          renderCanvasDemoSvgItem({
            componentPresentationRenderers,
            customItemRenderers,
            getComponentPresentation,
            item: child,
            locked: isLocked,
            onItemPointerDown,
            onTextDoubleClick,
            outlineIds,
            selected,
          }),
        )}
      </CanvasDemoSvgItemFrame>
    )
  }

  if (item.type === 'component') {
    return (
      <CanvasDemoSvgItemFrame
        key={item.id}
        bounds={bounds}
        component={item.component}
        itemId={item.id}
        itemType={item.type}
        locked={isLocked}
        outlined={outlined}
        selected={isSelected}
        onItemPointerDown={onItemPointerDown}
      >
        <CanvasDemoSvgComponentRenderer
          getComponentPresentation={getComponentPresentation}
          item={item}
          renderers={componentPresentationRenderers}
        />
      </CanvasDemoSvgItemFrame>
    )
  }

  if (item.type === 'custom') {
    return (
      <CanvasDemoSvgItemFrame
        key={item.id}
        bounds={bounds}
        customKind={item.kind}
        itemId={item.id}
        itemType={item.type}
        locked={isLocked}
        outlined={outlined}
        selected={isSelected}
        onItemPointerDown={onItemPointerDown}
      >
        {renderCanvasDemoSvgCustomItem({
          item,
          renderers: customItemRenderers,
        })}
      </CanvasDemoSvgItemFrame>
    )
  }

  if (isCanvasDemoSvgDrawingItem(item)) {
    return (
      <CanvasDemoSvgItemFrame
        key={item.id}
        bounds={bounds}
        itemId={item.id}
        itemType={item.type}
        locked={isLocked}
        outlined={outlined}
        selected={isSelected}
        onItemPointerDown={onItemPointerDown}
      >
        {renderCanvasDemoSvgDrawingItem({ item })}
      </CanvasDemoSvgItemFrame>
    )
  }

  return (
    <CanvasDemoSvgItemFrame
      key={item.id}
      bounds={bounds}
      itemId={item.id}
      itemType={item.type}
      locked={isLocked}
      outlined={outlined}
      selected={isSelected}
      onDoubleClick={() => onTextDoubleClick(item)}
      onItemPointerDown={onItemPointerDown}
    >
      {renderCanvasDemoSvgRectTextItem({ item })}
    </CanvasDemoSvgItemFrame>
  )
}
