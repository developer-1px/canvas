import type {
  CanvasPointerCaptureTarget,
} from './CanvasAppStageElementContracts'

export function captureCanvasPointerTarget({
  pointerId,
  target,
}: {
  pointerId: number
  target?: CanvasPointerCaptureTarget | null
}) {
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

export function releaseCanvasPointerTarget({
  pointerId,
  target,
}: {
  pointerId: number
  target?: CanvasPointerCaptureTarget | null
}) {
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
