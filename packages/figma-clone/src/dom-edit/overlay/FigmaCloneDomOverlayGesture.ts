export function isFigmaCloneEditableKeyboardTarget(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
}

export function constrainFigmaCloneMoveableDrag({
  current,
  isConstrained,
  start,
}: {
  current: number[]
  isConstrained: boolean
  start: [number, number]
}): [number, number] {
  const next: [number, number] = [
    Number(current[0] ?? start[0]),
    Number(current[1] ?? start[1]),
  ]

  if (!isConstrained) {
    return next
  }

  const dx = next[0] - start[0]
  const dy = next[1] - start[1]

  return Math.abs(dx) >= Math.abs(dy)
    ? [next[0], start[1]]
    : [start[0], next[1]]
}

export function readFigmaCloneMoveableTuple(
  value: unknown,
  fallback: [number, number],
): [number, number] {
  if (!Array.isArray(value)) {
    return fallback
  }

  const x = Number(value[0])
  const y = Number(value[1])

  return [
    Number.isFinite(x) ? x : fallback[0],
    Number.isFinite(y) ? y : fallback[1],
  ]
}

export function resolveFigmaCloneResizeSize({
  dist,
  scale,
  start,
}: {
  dist: number[]
  scale: number
  start: [number, number]
}): [number, number] {
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1

  return [
    start[0] + Number(dist[0] ?? 0) / safeScale,
    start[1] + Number(dist[1] ?? 0) / safeScale,
  ]
}

export function resolveFigmaCloneSpacingDragValue(
  value: number,
  event: globalThis.PointerEvent,
) {
  return event.shiftKey ? Math.round(value / 8) * 8 : value
}
