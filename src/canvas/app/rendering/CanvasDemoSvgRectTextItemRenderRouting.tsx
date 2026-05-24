import type { ReactNode } from 'react'
import type {
  RectItem,
  TextItem,
} from '../../entities'
import {
  getCanvasShapeKind,
  isCanvasTextItem,
} from '../../host'

type CanvasDemoSvgRectTextItem = RectItem | TextItem

type CanvasDemoSvgRectTextItemRenderStrategy<
  TItem extends CanvasDemoSvgRectTextItem,
> = {
  render: (input: { item: TItem }) => ReactNode
}

export const CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES = {
  rect: {
    render: renderCanvasDemoSvgRectItem,
  },
  text: {
    render: renderCanvasDemoSvgTextItem,
  },
} satisfies {
  rect: CanvasDemoSvgRectTextItemRenderStrategy<RectItem>
  text: CanvasDemoSvgRectTextItemRenderStrategy<TextItem>
}

export function renderCanvasDemoSvgRectTextItemByRoute({
  item,
}: {
  item: CanvasDemoSvgRectTextItem
}) {
  return isCanvasTextItem(item)
    ? CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.text.render({ item })
    : CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES.rect.render({ item })
}

function renderCanvasDemoSvgRectItem({
  item,
}: {
  item: RectItem
}) {
  return (
    <>
      {renderCanvasDemoSvgShapeItem({ item })}
      {item.text ? (
        <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
          <div className="canvas-text canvas-rect-text">{item.text}</div>
        </foreignObject>
      ) : null}
    </>
  )
}

function renderCanvasDemoSvgShapeItem({
  item,
}: {
  item: RectItem
}) {
  if (getCanvasShapeKind(item) === 'ellipse') {
    return (
      <ellipse
        className="rect-item"
        cx={item.x + item.w / 2}
        cy={item.y + item.h / 2}
        rx={item.w / 2}
        ry={item.h / 2}
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
    )
  }

  return (
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
