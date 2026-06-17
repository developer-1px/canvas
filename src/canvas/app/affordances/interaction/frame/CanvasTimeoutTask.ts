export type CanvasTimeoutTask = () => void

export type CanvasTimeoutTaskHandle = number

export type CanvasTimeoutTaskSchedule = (
  callback: CanvasTimeoutTask,
  delayMs: number,
) => CanvasTimeoutTaskHandle

export type CanvasTimeoutTaskCancel = (
  handle: CanvasTimeoutTaskHandle,
) => void

export type CanvasTimeoutTaskScheduleInput = {
  delayMs?: number
  setTimeout?: CanvasTimeoutTaskSchedule | null
  task: CanvasTimeoutTask
}

export type CanvasTimeoutTaskCancelInput = {
  clearTimeout?: CanvasTimeoutTaskCancel | null
  timeout: CanvasTimeoutTaskHandle | null
}

export function scheduleCanvasTimeoutTask({
  delayMs = 0,
  setTimeout = getCanvasTimeoutTaskSchedule(),
  task,
}: CanvasTimeoutTaskScheduleInput): CanvasTimeoutTaskHandle | null {
  if (!setTimeout) {
    return null
  }

  return setTimeout(() => {
    task()
  }, Math.max(0, delayMs))
}

export function cancelCanvasTimeoutTask({
  clearTimeout = getCanvasTimeoutTaskCancel(),
  timeout,
}: CanvasTimeoutTaskCancelInput) {
  if (timeout === null || !clearTimeout) {
    return false
  }

  clearTimeout(timeout)

  return true
}

function getCanvasTimeoutTaskSchedule(): CanvasTimeoutTaskSchedule | null {
  return typeof window === 'undefined' ? null : window.setTimeout.bind(window)
}

function getCanvasTimeoutTaskCancel(): CanvasTimeoutTaskCancel | null {
  return typeof window === 'undefined' ? null : window.clearTimeout.bind(window)
}
