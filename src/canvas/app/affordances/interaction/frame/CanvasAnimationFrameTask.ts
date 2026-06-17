export type CanvasAnimationFrameTask = (timestamp: DOMHighResTimeStamp) => void

export type CanvasAnimationFrameTaskRequest = (
  callback: FrameRequestCallback,
) => number

export type CanvasAnimationFrameTaskCancel = (handle: number) => void

export type CanvasAnimationFrameTaskScheduleInput = {
  requestAnimationFrame?: CanvasAnimationFrameTaskRequest | null
  task: CanvasAnimationFrameTask
}

export type CanvasAnimationFrameTaskCancelInput = {
  cancelAnimationFrame?: CanvasAnimationFrameTaskCancel | null
  frame: number | null
}

export function scheduleCanvasAnimationFrameTask({
  requestAnimationFrame = getCanvasAnimationFrameTaskRequest(),
  task,
}: CanvasAnimationFrameTaskScheduleInput) {
  if (!requestAnimationFrame) {
    return null
  }

  return requestAnimationFrame((timestamp) => {
    task(timestamp)
  })
}

export function cancelCanvasAnimationFrameTask({
  cancelAnimationFrame = getCanvasAnimationFrameTaskCancel(),
  frame,
}: CanvasAnimationFrameTaskCancelInput) {
  if (frame === null || !cancelAnimationFrame) {
    return false
  }

  cancelAnimationFrame(frame)

  return true
}

function getCanvasAnimationFrameTaskRequest(): CanvasAnimationFrameTaskRequest | null {
  return typeof requestAnimationFrame === 'undefined'
    ? null
    : requestAnimationFrame
}

function getCanvasAnimationFrameTaskCancel(): CanvasAnimationFrameTaskCancel | null {
  return typeof cancelAnimationFrame === 'undefined'
    ? null
    : cancelAnimationFrame
}
