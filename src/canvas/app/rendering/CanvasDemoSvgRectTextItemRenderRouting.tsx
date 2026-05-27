import type { ReactNode } from 'react'
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

type CanvasDemoSvgRectTextItem = CanvasShapeItem | RectItem | TextItem

type CanvasDemoSvgRectTextItemRenderStrategy<
  TItem extends CanvasDemoSvgRectTextItem,
> = {
  render: (input: { item: TItem }) => ReactNode
}

export const CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES = {
  rect: {
    render: renderCanvasDemoSvgShapeItem,
  },
  shape: {
    render: renderCanvasDemoSvgShapeItem,
  },
  text: {
    render: renderCanvasDemoSvgTextItem,
  },
} satisfies {
  rect: CanvasDemoSvgRectTextItemRenderStrategy<RectItem>
  shape: CanvasDemoSvgRectTextItemRenderStrategy<CanvasShapeItem>
  text: CanvasDemoSvgRectTextItemRenderStrategy<TextItem>
}

export function renderCanvasDemoSvgRectTextItemByRoute({
  item,
}: {
  item: CanvasDemoSvgRectTextItem
}) {
  if (isCanvasTextItem(item)) {
    return CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.text.render({
      item,
    })
  }

  return item.type === 'shape'
    ? CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.shape.render({ item })
    : CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.rect.render({ item })
}

function renderCanvasDemoSvgShapeItem({
  item,
}: {
  item: CanvasShapeItem | RectItem
}) {
  return (
    <>
      {renderCanvasDemoSvgShapeNode({ item })}
      {item.text ? (
        <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
          <div className="canvas-text canvas-shape-text">{item.text}</div>
        </foreignObject>
      ) : null}
    </>
  )
}

function renderCanvasDemoSvgShapeNode({
  item,
}: {
  item: CanvasShapeItem | RectItem
}) {
  const geometry = getCanvasItemSvgShapeGeometry(item)

  return renderCanvasDemoSvgShapeGeometry({
    fill: item.fill,
    geometry,
    stroke: item.stroke,
  })
}

function renderCanvasDemoSvgShapeGeometry({
  fill,
  geometry,
  stroke,
}: {
  fill: string
  geometry: CanvasSvgShapeGeometry
  stroke: string
}) {
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
      vectorEffect="non-scaling-stroke"
    />
  )
}

function renderCanvasDemoSvgTextItem({
  item,
}: {
  item: TextItem
}) {
  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div className="canvas-text">{item.text}</div>
    </foreignObject>
  )
}
