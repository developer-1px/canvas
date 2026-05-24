import type {
  PointerEvent,
  ReactNode,
} from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'

export type CanvasDemoSvgSelectionOutlineKind = 'group'

export type CanvasDemoSvgItemFrameProps = {
  bounds: Bounds
  children: ReactNode
  className?: string
  component?: string
  customKind?: string
  itemId: string
  itemType: CanvasItem['type']
  locked: boolean
  outlined: boolean
  outlineKind?: CanvasDemoSvgSelectionOutlineKind
  selected: boolean
  onDoubleClick?: () => void
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
}

export function CanvasDemoSvgItemFrame({
  bounds,
  children,
  className = 'canvas-item',
  component,
  customKind,
  itemId,
  itemType,
  locked,
  outlined,
  outlineKind,
  selected,
  onDoubleClick,
  onItemPointerDown,
}: CanvasDemoSvgItemFrameProps) {
  return (
    <g
      className={className}
      data-component={component}
      data-canvas-item-id={itemId}
      data-custom-kind={customKind}
      data-locked={locked || undefined}
      data-selected={selected}
      data-type={itemType}
      pointerEvents={locked ? 'none' : undefined}
      onDoubleClick={locked ? undefined : onDoubleClick}
      onPointerDown={
        locked ? undefined : (event) => onItemPointerDown(event, itemId)
      }
    >
      {children}
      {outlined ? (
        <CanvasDemoSvgSelectionOutline bounds={bounds} kind={outlineKind} />
      ) : null}
    </g>
  )
}

function CanvasDemoSvgSelectionOutline({
  bounds,
  kind,
}: {
  bounds: Bounds
  kind?: CanvasDemoSvgSelectionOutlineKind
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
