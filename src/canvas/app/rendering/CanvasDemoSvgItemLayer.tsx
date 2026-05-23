import type { PointerEvent } from 'react'
import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../../entities'
import { getCanvasItemBounds } from '../../host'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  createCanvasSvgPathData,
} from '../../renderer'
import { CanvasDemoSvgComponentRenderer } from './CanvasDemoSvgComponentRenderer'
import { CanvasDemoSvgItemFrame } from './CanvasDemoSvgItemFrame'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasDemoSvgComponentPresentationRenderers,
} from './CanvasDemoSvgComponentPresentationRegistry'
import {
  DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  getCanvasDemoSvgCustomItemRenderer,
  type CanvasDemoSvgCustomItemRenderers,
} from './CanvasDemoSvgCustomItemRendererRegistry'
import { CanvasDemoSvgUnknownCustomItem } from './CanvasDemoSvgUnknownCustomItem'

type CanvasDemoSvgItemLayerProps = {
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  componentPresentationRenderers?: CanvasDemoSvgComponentPresentationRenderers
  customItemRenderers?: CanvasDemoSvgCustomItemRenderers
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export function CanvasDemoSvgItemLayer({
  componentPresentationRenderers =
    DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  customItemRenderers = DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  getComponentPresentation,
  items,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: CanvasDemoSvgItemLayerProps) {
  return (
    <>
      {items.map((item) =>
        renderCanvasItem({
          getComponentPresentation,
          item,
          locked: false,
          componentPresentationRenderers,
          customItemRenderers,
          onItemPointerDown,
          onTextDoubleClick,
          outlineIds,
          selected,
        }),
      )}
    </>
  )
}

type RenderCanvasItemArgs = {
  getComponentPresentation: (component: string) => string
  item: CanvasItem
  locked: boolean
  outlineIds: Set<string>
  componentPresentationRenderers: CanvasDemoSvgComponentPresentationRenderers
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

function renderCanvasItem({
  getComponentPresentation,
  item,
  locked,
  componentPresentationRenderers,
  customItemRenderers,
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: RenderCanvasItemArgs) {
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
          renderCanvasItem({
            getComponentPresentation,
            item: child,
            locked: isLocked,
            componentPresentationRenderers,
            customItemRenderers,
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
    const renderCustomItem = getCanvasDemoSvgCustomItemRenderer({
      item,
      renderers: customItemRenderers,
    })

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
        {renderCanvasDemoSvgCustomItemSafely({ item, renderCustomItem })}
      </CanvasDemoSvgItemFrame>
    )
  }

  if (item.type === 'marker' || item.type === 'highlight') {
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
        <path
          className={`${item.type}-hit`}
          d={createCanvasSvgPathData(item.points)}
          vectorEffect="non-scaling-stroke"
        />
        <path
          className={`${item.type}-item`}
          d={createCanvasSvgPathData(item.points)}
          opacity={item.opacity}
          stroke={item.stroke}
          strokeWidth={item.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </CanvasDemoSvgItemFrame>
    )
  }

  if (item.type === 'arrow') {
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
        <line
          className="arrow-hit"
          x1={item.start.x}
          y1={item.start.y}
          x2={item.end.x}
          y2={item.end.y}
          vectorEffect="non-scaling-stroke"
        />
        <line
          className="arrow-item"
          x1={item.start.x}
          y1={item.start.y}
          x2={item.end.x}
          y2={item.end.y}
          stroke={item.stroke}
          strokeWidth={item.strokeWidth}
          markerEnd={CANVAS_SVG_ARROW_MARKER_IRI}
          vectorEffect="non-scaling-stroke"
        />
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
      {item.type === 'rect' ? (
        <>
          <rect
            className="rect-item"
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            rx="6"
            fill={item.fill}
            stroke={item.stroke}
            vectorEffect="non-scaling-stroke"
          />
          {item.text ? (
            <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
              <div className="canvas-text canvas-rect-text">{item.text}</div>
            </foreignObject>
          ) : null}
        </>
      ) : (
        <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
          <div className="canvas-text">{item.text}</div>
        </foreignObject>
      )}
    </CanvasDemoSvgItemFrame>
  )
}

function renderCanvasDemoSvgCustomItemSafely({
  item,
  renderCustomItem,
}: {
  item: Extract<CanvasItem, { type: 'custom' }>
  renderCustomItem: ReturnType<typeof getCanvasDemoSvgCustomItemRenderer>
}) {
  try {
    return renderCustomItem({ item })
  } catch {
    return <CanvasDemoSvgUnknownCustomItem item={item} />
  }
}
