import type { ReactNode } from 'react'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../../../entities'
import { CanvasWidgetIsolationHost } from './CanvasWidgetIsolationHost'
import type {
  CanvasAppWidgetIsolationMode,
  CanvasAppWidgetItem,
  CanvasAppWidgetRenderContext,
} from './CanvasAppWidgetModuleTypes'

export function renderCanvasAppWidgetItem<
  TData extends CanvasJsonObject,
>({
  getDefaultData,
  id,
  isWidgetData,
  isolation,
  item,
  renderWidget,
  title,
}: {
  getDefaultData: () => TData
  id: string
  isWidgetData: (data: CanvasJsonObject) => data is TData
  isolation: CanvasAppWidgetIsolationMode
  item: CanvasCustomItem
  renderWidget: (context: CanvasAppWidgetRenderContext<TData>) => ReactNode
  title: string
}) {
  const widgetItem = item as CanvasAppWidgetItem<TData>
  const data = isWidgetData(widgetItem.data)
    ? widgetItem.data
    : getDefaultData()

  return (
    <>
      <foreignObject
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      >
        <div
          className="canvas-widget"
          data-canvas-widget-kind={id}
          style={{
            height: '100%',
            pointerEvents: 'none',
            width: '100%',
          }}
        >
          <CanvasWidgetIsolationHost
            fallbackLabel={`${title} unavailable`}
            mode={isolation}
          >
            {renderWidget({
              data,
              item: widgetItem,
            })}
          </CanvasWidgetIsolationHost>
        </div>
      </foreignObject>
      <rect
        className="canvas-widget-hit"
        data-canvas-widget-hit={id}
        fill="transparent"
        height={item.h}
        pointerEvents="all"
        width={item.w}
        x={item.x}
        y={item.y}
      />
    </>
  )
}

export function getCanvasAppWidgetRenderKey({
  item,
}: {
  item: CanvasCustomItem
}) {
  return [
    item.id,
    item.x,
    item.y,
    item.w,
    item.h,
    item.hidden === true ? 1 : 0,
    item.locked === true ? 1 : 0,
    item.title,
    JSON.stringify(item.data),
  ].join('|')
}
