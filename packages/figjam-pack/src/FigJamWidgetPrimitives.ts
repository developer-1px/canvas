import type {
  DesignJSONObject,
  DesignNode,
  DesignNodeId,
} from '@interactive-os/canvas/react-design'

export type FigJamPlacementInput = {
  readonly nodeId: DesignNodeId
  readonly x: number
  readonly y: number
}

export type FigJamSizeInput = {
  readonly height?: number
  readonly width?: number
}

export type FigJamPoint = {
  readonly x: number
  readonly y: number
}

export function createFigJamAbsoluteWidgetNode({
  definitionId,
  height,
  label,
  nodeId,
  props,
  text,
  width,
  x,
  y,
}: FigJamPlacementInput & {
  readonly definitionId: string
  readonly height: number
  readonly label: string
  readonly props: DesignJSONObject
  readonly text: string | null
  readonly width: number
}): DesignNode {
  assertFinitePlacement({ nodeId, x, y })
  assertPositiveSize(width, 'width')
  assertPositiveSize(height, 'height')

  return {
    id: nodeId,
    label,
    definition: { id: definitionId, kind: 'widget' },
    children: [],
    props,
    text,
    layout: {
      x,
      y,
      w: width,
      h: height,
      widthMode: 'fixed',
      heightMode: 'fixed',
    },
    style: {},
    frame: null,
    component: null,
  }
}

export function assertFinitePlacement({
  nodeId,
  x,
  y,
}: FigJamPlacementInput) {
  if (!nodeId.trim()) {
    throw new Error('FigJam node id must not be empty')
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('FigJam node placement must use finite coordinates')
  }
}

export function assertPositiveSize(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`FigJam ${name} must be a positive finite number`)
  }
}

export function isJSONObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

export function isPoint(value: unknown): value is FigJamPoint {
  return isJSONObject(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y)
}

export function includes<const Values extends readonly string[]>(
  values: Values,
  value: unknown,
): value is Values[number] {
  return typeof value === 'string' && values.includes(value)
}

export function joinClassNames(...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

export function cloneDesignProps<Props extends object>(props: Props) {
  return JSON.parse(JSON.stringify(props)) as Props & DesignJSONObject
}
