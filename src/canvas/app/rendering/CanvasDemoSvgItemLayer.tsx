import type { PointerEvent } from 'react'
import type {
  Bounds,
  CanvasItem,
  RectItem,
  TextItem,
} from '../../entities'
import { getCanvasItemBounds } from '../../host'
import { CanvasDemoSvgComponentRenderer } from './CanvasDemoSvgComponentRenderer'

type CanvasDemoSvgItemLayerProps = {
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export function CanvasDemoSvgItemLayer({
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
  onItemPointerDown,
  onTextDoubleClick,
  outlineIds,
  selected,
}: RenderCanvasItemArgs) {
  const isSelected = selected.has(item.id)
  const isLocked = locked || item.locked === true
  const hasOutline = outlineIds.has(item.id)
  const bounds = getCanvasItemBounds(item)

  if (item.type === 'group') {
    return (
      <g
        key={item.id}
        className="canvas-item canvas-group"
        data-locked={isLocked || undefined}
        data-selected={isSelected}
        data-type="group"
        pointerEvents={isLocked ? 'none' : undefined}
        onPointerDown={
          isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
        }
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
            onItemPointerDown,
            onTextDoubleClick,
            outlineIds,
            selected,
          }),
        )}
        {hasOutline ? (
          <CanvasDemoSvgSelectionOutline bounds={bounds} kind="group" />
        ) : null}
      </g>
    )
  }

  if (item.type === 'component') {
    return (
      <g
        key={item.id}
        className="canvas-item"
        data-component={item.component}
        data-locked={isLocked || undefined}
        data-selected={isSelected}
        data-type={item.type}
        pointerEvents={isLocked ? 'none' : undefined}
        onPointerDown={
          isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
        }
      >
        <CanvasDemoSvgComponentRenderer
          getComponentPresentation={getComponentPresentation}
          item={item}
        />
        {hasOutline ? <CanvasDemoSvgSelectionOutline bounds={bounds} /> : null}
      </g>
    )
  }

  if (item.type === 'marker' || item.type === 'highlight') {
    return (
      <g
        key={item.id}
        className="canvas-item"
        data-locked={isLocked || undefined}
        data-selected={isSelected}
        data-type={item.type}
        pointerEvents={isLocked ? 'none' : undefined}
        onPointerDown={
          isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
        }
      >
        <path
          className={`${item.type}-hit`}
          d={createSvgPathData(item.points)}
          vectorEffect="non-scaling-stroke"
        />
        <path
          className={`${item.type}-item`}
          d={createSvgPathData(item.points)}
          opacity={item.opacity}
          stroke={item.stroke}
          strokeWidth={item.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        {hasOutline ? <CanvasDemoSvgSelectionOutline bounds={bounds} /> : null}
      </g>
    )
  }

  if (item.type === 'arrow') {
    return (
      <g
        key={item.id}
        className="canvas-item"
        data-locked={isLocked || undefined}
        data-selected={isSelected}
        data-type={item.type}
        pointerEvents={isLocked ? 'none' : undefined}
        onPointerDown={
          isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
        }
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
          markerEnd="url(#canvas-arrow-head)"
          vectorEffect="non-scaling-stroke"
        />
        {hasOutline ? <CanvasDemoSvgSelectionOutline bounds={bounds} /> : null}
      </g>
    )
  }

  return (
    <g
      key={item.id}
      className="canvas-item"
      data-locked={isLocked || undefined}
      data-selected={isSelected}
      data-type={item.type}
      pointerEvents={isLocked ? 'none' : undefined}
      onPointerDown={
        isLocked ? undefined : (event) => onItemPointerDown(event, item.id)
      }
      onDoubleClick={isLocked ? undefined : () => onTextDoubleClick(item)}
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

      {hasOutline ? <CanvasDemoSvgSelectionOutline bounds={bounds} /> : null}
    </g>
  )
}

function createSvgPathData(points: { x: number; y: number }[]) {
  const [first, ...rest] = points

  if (!first) {
    return ''
  }

  return [
    `M ${first.x} ${first.y}`,
    ...rest.map((point) => `L ${point.x} ${point.y}`),
  ].join(' ')
}

function CanvasDemoSvgSelectionOutline({
  bounds,
  kind,
}: {
  bounds: Bounds
  kind?: 'group'
}) {
  return (
    <rect
      className={kind === 'group' ? 'item-outline group-outline' : 'item-outline'}
      x={bounds.x}
      y={bounds.y}
      width={bounds.w}
      height={bounds.h}
      vectorEffect="non-scaling-stroke"
    />
  )
}
