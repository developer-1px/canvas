import type {
  PointerEvent,
  ReactNode,
} from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'

export type CanvasWhiteboardSvgSelectionOutlineKind = 'group'

export type CanvasWhiteboardSvgItemFrameProps = {
  bounds: Bounds
  children: ReactNode
  className?: string
  component?: string
  customKind?: string
  itemId: string
  itemType: CanvasItem['type']
  locked: boolean
  outlined: boolean
  outlineKind?: CanvasWhiteboardSvgSelectionOutlineKind
  rotation?: number
  rotationTransform?: string
  selected: boolean
  onDoubleClick?: () => void
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
}

export function CanvasWhiteboardSvgItemFrame({
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
  rotation,
  rotationTransform,
  selected,
  onDoubleClick,
  onItemPointerDown,
}: CanvasWhiteboardSvgItemFrameProps) {
  return (
    <g
      className={className}
      data-component={component}
      data-canvas-item-id={itemId}
      data-custom-kind={customKind}
      data-locked={locked || undefined}
      data-rotation={rotation === undefined || rotation === 0 ? undefined : rotation}
      data-selected={selected}
      data-type={itemType}
      pointerEvents={locked ? 'none' : undefined}
      onDoubleClick={locked ? undefined : onDoubleClick}
      onPointerDown={
        locked ? undefined : (event) => onItemPointerDown(event, itemId)
      }
    >
      {rotationTransform ? (
        <g className="canvas-item-rotation" transform={rotationTransform}>
          {children}
        </g>
      ) : children}
      {outlined ? (
        <CanvasWhiteboardSvgSelectionOutline bounds={bounds} kind={outlineKind} />
      ) : null}
    </g>
  )
}

function CanvasWhiteboardSvgSelectionOutline({
  bounds,
  kind,
}: {
  bounds: Bounds
  kind?: CanvasWhiteboardSvgSelectionOutlineKind
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
