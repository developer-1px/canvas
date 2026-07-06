export type CanvasAxisLockedDragDeltaInput = {
  dx: number
  dy: number
}

export type CanvasAxisLockedDragDelta = CanvasAxisLockedDragDeltaInput

export function getCanvasAxisLockedDragDelta({
  dx,
  dy,
}: CanvasAxisLockedDragDeltaInput): CanvasAxisLockedDragDelta {
  return Math.abs(dx) >= Math.abs(dy)
    ? { dx, dy: 0 }
    : { dx: 0, dy }
}
