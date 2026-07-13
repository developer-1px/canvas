export function constrainDomEditMoveableDrag({
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

export function readDomEditMoveableTuple(
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

export function resolveDomEditResizeSize({
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

export const DEFAULT_DOM_EDIT_SPACING_GRID_SIZE = 4

export type DomEditSpacingGridConfig = {
  readonly gridSize?: number
}

export function snapDomEditSpacingValue(
  value: number,
  config: DomEditSpacingGridConfig = {},
) {
  const gridSize = resolveDomEditSpacingGridSize(config)

  return Math.round(value / gridSize) * gridSize
}

export function resolveDomEditSpacingDragValue(
  value: number,
  event: globalThis.PointerEvent,
  config: DomEditSpacingGridConfig = {},
) {
  const gridSize = resolveDomEditSpacingGridSize(config)
  const step = event.shiftKey ? gridSize * 2 : gridSize

  return Math.round(value / step) * step
}

export function resolveDomEditSpacingGridSize(
  config: DomEditSpacingGridConfig = {},
) {
  const configuredSize = config.gridSize ?? DEFAULT_DOM_EDIT_SPACING_GRID_SIZE

  return Number.isFinite(configuredSize) && configuredSize > 0
    ? Math.max(1, Math.round(configuredSize))
    : DEFAULT_DOM_EDIT_SPACING_GRID_SIZE
}
