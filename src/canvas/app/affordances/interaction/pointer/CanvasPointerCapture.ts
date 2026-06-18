import {
  captureCanvasPointerTarget,
  releaseCanvasPointerTarget,
  type CanvasPointerCaptureTarget,
} from '../../../rendering/stage/CanvasAppStageElement'

export type { CanvasPointerCaptureTarget }

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
  return captureCanvasPointerTarget({ pointerId, target })
}

export function releaseCanvasPointerCapture({
  pointerId,
  target,
}: CanvasPointerCaptureInput) {
  return releaseCanvasPointerTarget({ pointerId, target })
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
