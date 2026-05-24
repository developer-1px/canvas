import type { ReactNode } from 'react'
import type {
  RectItem,
  TextItem,
} from '../../entities'
import { isCanvasTextItem } from '../../host'

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
