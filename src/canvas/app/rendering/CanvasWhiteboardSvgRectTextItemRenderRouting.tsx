import type {
  CSSProperties,
  ReactNode,
} from 'react'
import type {
  CanvasShapeItem,
  RectItem,
  TextItem,
} from '../../entities'
import {
  getCanvasItemSvgShapeGeometry,
  isCanvasTextItem,
  type CanvasSvgShapeGeometry,
} from '../../host'
import { CanvasWhiteboardSvgTextItem } from './CanvasWhiteboardSvgTextItem'
import { getCanvasWhiteboardSvgTextStyle } from './CanvasWhiteboardSvgTextStyle'

type CanvasWhiteboardSvgRectTextItem = CanvasShapeItem | RectItem | TextItem

type CanvasWhiteboardSvgRectTextItemRenderStrategy<
  TItem extends CanvasWhiteboardSvgRectTextItem,
> = {
  render: (input: { item: TItem }) => ReactNode
}

export const CANVAS_WHITEBOARD_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES = {
  rect: {
    render: renderCanvasWhiteboardSvgShapeItem,
  },
  shape: {
    render: renderCanvasWhiteboardSvgShapeItem,
  },
  text: {
    render: renderCanvasWhiteboardSvgTextItem,
  },
} satisfies {
  rect: CanvasWhiteboardSvgRectTextItemRenderStrategy<RectItem>
  shape: CanvasWhiteboardSvgRectTextItemRenderStrategy<CanvasShapeItem>
  text: CanvasWhiteboardSvgRectTextItemRenderStrategy<TextItem>
}

export function renderCanvasWhiteboardSvgRectTextItemByRoute({
  item,
}: {
  item: CanvasWhiteboardSvgRectTextItem
}) {
  if (isCanvasTextItem(item)) {
    return CANVAS_WHITEBOARD_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.text.render({
      item,
    })
  }

  return item.type === 'shape'
    ? CANVAS_WHITEBOARD_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.shape.render({ item })
    : CANVAS_WHITEBOARD_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.rect.render({ item })
}

function renderCanvasWhiteboardSvgShapeItem({
  item,
}: {
  item: CanvasShapeItem | RectItem
}) {
  return (
    <g opacity={item.opacity}>
      {renderCanvasWhiteboardSvgShapeNode({ item })}
      {item.text ? (
        <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
          <div
            className="canvas-text canvas-shape-text"
            style={getCanvasWhiteboardSvgTextStyle(item)}
          >
            {item.text}
          </div>
        </foreignObject>
      ) : null}
    </g>
  )
}

function renderCanvasWhiteboardSvgShapeNode({
  item,
}: {
  item: CanvasShapeItem | RectItem
}) {
  const geometry = getCanvasItemSvgShapeGeometry(item)

  return renderCanvasWhiteboardSvgShapeGeometry({
    fill: item.fill,
    geometry,
    stroke: item.stroke,
    strokeWidth: item.strokeWidth,
  })
}

function renderCanvasWhiteboardSvgShapeGeometry({
  fill,
  geometry,
  stroke,
  strokeWidth,
}: {
  fill: string
  geometry: CanvasSvgShapeGeometry
  stroke: string
  strokeWidth?: number
}) {
  const style = getCanvasWhiteboardSvgStrokeWidthStyle(strokeWidth)

  if (geometry.kind === 'ellipse') {
    return (
      <ellipse
        className="shape-item"
        cx={geometry.cx}
        cy={geometry.cy}
        rx={geometry.rx}
        ry={geometry.ry}
        fill={fill}
        stroke={stroke}
        style={style}
        vectorEffect="non-scaling-stroke"
      />
    )
  }

  if (geometry.kind === 'path') {
    return (
      <path
        className="shape-item"
        d={geometry.d}
        fill={fill}
        stroke={stroke}
        style={style}
        vectorEffect="non-scaling-stroke"
      />
    )
  }

  return (
    <rect
      className="shape-item"
      x={geometry.x}
      y={geometry.y}
      width={geometry.width}
      height={geometry.height}
      rx={geometry.rx}
      fill={fill}
      stroke={stroke}
      style={style}
      vectorEffect="non-scaling-stroke"
    />
  )
}

function renderCanvasWhiteboardSvgTextItem({
  item,
}: {
  item: TextItem
}) {
  return <CanvasWhiteboardSvgTextItem item={item} />
}

function getCanvasWhiteboardSvgStrokeWidthStyle(
  strokeWidth: number | undefined,
): CSSProperties | undefined {
  return strokeWidth === undefined ? undefined : { strokeWidth }
}
