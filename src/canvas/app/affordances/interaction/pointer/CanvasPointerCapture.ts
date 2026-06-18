export type CanvasPointerCaptureTarget = {
  hasPointerCapture?: (pointerId: number) => boolean
  releasePointerCapture?: (pointerId: number) => void
  setPointerCapture?: (pointerId: number) => void
}

export type CanvasPointerCaptureInput = {
  pointerId: number
  target?: CanvasPointerCaptureTarget | null
}

export type CanvasPointerCaptureEvent = {
  currentTarget: CanvasPointerCaptureTarget | null
  pointerId: number
}

export function captureCanvasPointer({
  pointerId,
  target,
}: CanvasPointerCaptureInput) {
  if (!target?.setPointerCapture) {
    return false
  }

  if (target.hasPointerCapture?.(pointerId)) {
    return false
  }

  try {
    target.setPointerCapture(pointerId)
  } catch {
    return false
  }

  return true
}

export function releaseCanvasPointerCapture({
  pointerId,
  target,
}: CanvasPointerCaptureInput) {
  if (!target?.releasePointerCapture) {
    return false
  }

  if (target.hasPointerCapture && !target.hasPointerCapture(pointerId)) {
    return false
  }

  try {
    target.releasePointerCapture(pointerId)
  } catch {
    return false
  }

  return true
}

export function captureCanvasPointerFromEvent({
  currentTarget,
  pointerId,
}: CanvasPointerCaptureEvent) {
  return captureCanvasPointer({
    pointerId,
    target: currentTarget,
  })
}
