/* eslint-disable react-refresh/only-export-components */
import { useId } from 'react'
import {
  defineReactDesignWidget,
  type DesignDocumentRead,
  type DesignNode,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetInspectorProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  getFigJamNodeAnchorPoint,
  getFigJamNodeWorldBounds,
} from './FigJamNodeGeometry'
import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  includes,
  isFiniteNumber,
  isJSONObject,
  isNonEmptyString,
  isPoint,
  isPositiveFiniteNumber,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamPoint,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_CONNECTOR_DEFINITION_ID = 'figjam.connector'
export const FIGJAM_CONNECTOR_ROUTINGS = ['straight', 'elbow'] as const
export const FIGJAM_CONNECTOR_ARROWHEADS = ['end', 'none'] as const
export const FIGJAM_CONNECTOR_ANCHORS = [
  'center',
  'top',
  'right',
  'bottom',
  'left',
] as const

export type FigJamConnectorRouting = typeof FIGJAM_CONNECTOR_ROUTINGS[number]
export type FigJamConnectorArrowhead =
  typeof FIGJAM_CONNECTOR_ARROWHEADS[number]
export type FigJamConnectorAnchor = typeof FIGJAM_CONNECTOR_ANCHORS[number]

export type FigJamConnectorEndpoint = {
  readonly anchor: FigJamConnectorAnchor
  readonly attachedNodeId: string | null
  /** Fallback point in the connector node's persisted coordinate space. */
  readonly point: FigJamPoint
}

export type FigJamConnectorEndpointInput = {
  readonly anchor?: FigJamConnectorAnchor
  readonly attachedNodeId?: string | null
  /** Endpoint in world coordinates; the factory converts it to local storage. */
  readonly point: FigJamPoint
}

export type FigJamConnectorProps = {
  readonly arrowhead: FigJamConnectorArrowhead
  readonly coordinateHeight: number
  readonly coordinateWidth: number
  readonly end: FigJamConnectorEndpoint
  readonly position: 'absolute'
  readonly routing: FigJamConnectorRouting
  readonly start: FigJamConnectorEndpoint
  readonly stroke: string
  readonly strokeWidth: number
}

export type FigJamResolvedConnectorBounds = {
  readonly h: number
  readonly w: number
  readonly x: number
  readonly y: number
}

export type CreateFigJamConnectorNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly arrowhead?: FigJamConnectorArrowhead
    readonly end: FigJamConnectorEndpointInput
    readonly routing?: FigJamConnectorRouting
    readonly start: FigJamConnectorEndpointInput
    readonly stroke?: string
    readonly strokeWidth?: number
    readonly text?: string
  }

export const FIGJAM_CONNECTOR_DEFAULT_PROPS = Object.freeze({
  arrowhead: 'end',
  coordinateHeight: 64,
  coordinateWidth: 220,
  end: Object.freeze({
    anchor: 'center',
    attachedNodeId: null,
    point: Object.freeze({ x: 220, y: 64 }),
  }),
  position: 'absolute',
  routing: 'elbow',
  start: Object.freeze({
    anchor: 'center',
    attachedNodeId: null,
    point: Object.freeze({ x: 0, y: 0 }),
  }),
  stroke: '#475569',
  strokeWidth: 2.5,
} as const satisfies FigJamConnectorProps)

export const FIGJAM_CONNECTOR_DEFINITION =
  defineReactDesignWidget<FigJamConnectorProps>({
    id: FIGJAM_CONNECTOR_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_CONNECTOR_DEFAULT_PROPS,
      safeParse: parseFigJamConnectorProps,
    },
    create: ({ nodeId, x, y }) => createFigJamConnectorNode({
      end: { point: { x: x + 220, y: y + 64 } },
      nodeId,
      start: { point: { x, y } },
      x,
      y,
    }),
    capabilities: {
      textEdit: { source: 'node-text', multiline: false },
      transform: { move: true, resize: true },
    },
    renderer: FigJamConnector,
    fallback: FigJamConnectorFallback,
    Inspector: FigJamConnectorInspector,
  })

export function createFigJamConnectorNode({
  arrowhead = FIGJAM_CONNECTOR_DEFAULT_PROPS.arrowhead,
  end,
  height,
  nodeId,
  routing = FIGJAM_CONNECTOR_DEFAULT_PROPS.routing,
  start,
  stroke = FIGJAM_CONNECTOR_DEFAULT_PROPS.stroke,
  strokeWidth = FIGJAM_CONNECTOR_DEFAULT_PROPS.strokeWidth,
  text = '',
  width,
  x,
  y,
}: CreateFigJamConnectorNodeInput) {
  const normalizedStart = normalizeEndpointInput(start, x, y)
  const normalizedEnd = normalizeEndpointInput(end, x, y)
  const fallbackWidth = Math.max(
    Math.abs(normalizedEnd.point.x - normalizedStart.point.x),
    24,
  )
  const fallbackHeight = Math.max(
    Math.abs(normalizedEnd.point.y - normalizedStart.point.y),
    24,
  )
  const nodeWidth = width ?? fallbackWidth
  const nodeHeight = height ?? fallbackHeight
  const parsed = parseFigJamConnectorProps({
    arrowhead,
    coordinateHeight: nodeHeight,
    coordinateWidth: nodeWidth,
    end: normalizedEnd,
    position: 'absolute',
    routing,
    start: normalizedStart,
    stroke,
    strokeWidth,
  })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_CONNECTOR_DEFINITION_ID,
    height: nodeHeight,
    label: 'Connector',
    nodeId,
    props: cloneDesignProps(parsed.value),
    text,
    width: nodeWidth,
    x,
    y,
  })
}

export function parseFigJamConnectorProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    includes(FIGJAM_CONNECTOR_ROUTINGS, value.routing) &&
    includes(FIGJAM_CONNECTOR_ARROWHEADS, value.arrowhead) &&
    isPositiveFiniteNumber(value.coordinateWidth) &&
    isPositiveFiniteNumber(value.coordinateHeight) &&
    isNonEmptyString(value.stroke) &&
    isPositiveFiniteNumber(value.strokeWidth)
  ) {
    const start = parseConnectorEndpoint(value.start)
    const end = parseConnectorEndpoint(value.end)

    if (start && end) {
      return {
        ok: true as const,
        value: {
          arrowhead: value.arrowhead,
          coordinateHeight: value.coordinateHeight,
          coordinateWidth: value.coordinateWidth,
          end,
          position: value.position,
          routing: value.routing,
          start,
          stroke: value.stroke,
          strokeWidth: value.strokeWidth,
        } satisfies FigJamConnectorProps,
      }
    }
  }

  return {
    ok: false as const,
    reason: 'Connector props require stable endpoints, routing, and style',
  }
}

export function getFigJamResolvedConnectorBounds(
  read: DesignDocumentRead,
  nodeId: string,
): FigJamResolvedConnectorBounds | null {
  const node = read.node(nodeId)

  if (
    !node ||
    node.definition.kind !== 'widget' ||
    node.definition.id !== FIGJAM_CONNECTOR_DEFINITION_ID
  ) {
    return null
  }

  const parsed = parseFigJamConnectorProps(node.props)

  return parsed.ok
    ? resolveConnectorWorldGeometry({ node, props: parsed.value, read })?.bounds
      ?? null
    : null
}

function FigJamConnector({
  node,
  props,
  read,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamConnectorProps>) {
  const markerId = createConnectorMarkerId(node.id, props.stroke, useId())
  const geometry = resolveConnectorGeometry({ node, props, read })
  const { end, start } = geometry
  const path = props.routing === 'elbow'
    ? toElbowPath(start, end)
    : `M${start.x} ${start.y} L${end.x} ${end.y}`

  return (
    <div
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-connector')}
      data-connector-end-id={props.end.attachedNodeId ?? undefined}
      data-connector-routing={props.routing}
      data-connector-start-id={props.start.attachedNodeId ?? undefined}
      data-figjam-widget="connector"
      style={{
        ...rootProps.style,
        height: geometry.height,
        left: geometry.left,
        top: geometry.top,
        width: geometry.width,
      }}
    >
      <svg
        aria-hidden="true"
        className="figjam-connector__geometry"
        preserveAspectRatio="none"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      >
        {props.arrowhead === 'end' ? (
          <defs>
            <marker
              id={markerId}
              markerHeight="7"
              markerWidth="7"
              orient="auto-start-reverse"
              refX="6"
              refY="3.5"
              viewBox="0 0 7 7"
            >
              <path d="M0 0 7 3.5 0 7Z" fill={props.stroke} />
            </marker>
          </defs>
        ) : null}
        <path
          d={path}
          fill="none"
          markerEnd={props.arrowhead === 'end'
            ? `url(#${markerId})`
            : undefined}
          stroke={props.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={props.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {node.text ? (
        <span className="figjam-connector__label">{node.text}</span>
      ) : null}
    </div>
  )
}

function FigJamConnectorFallback({
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamConnectorProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(
        rootProps.className,
        'figjam-connector',
        'figjam-widget-fallback',
      )}
      data-figjam-widget="connector"
      data-figjam-widget-error={reason}
    >
      Connector unavailable
    </div>
  )
}

function FigJamConnectorInspector({
  editProp,
  props,
}: ReactDesignWidgetInspectorProps<FigJamConnectorProps>) {
  return (
    <div className="figjam-widget-inspector">
      <label>
        <span>Routing</span>
        <select
          aria-label="Connector routing"
          value={props.routing}
          onChange={(event) => editProp(
            'routing',
            event.currentTarget.value as FigJamConnectorRouting,
            'Change connector routing',
          )}
        >
          {FIGJAM_CONNECTOR_ROUTINGS.map((routing) => (
            <option key={routing} value={routing}>{routing}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

function parseConnectorEndpoint(value: unknown): FigJamConnectorEndpoint | null {
  if (
    !isJSONObject(value) ||
    !isPoint(value.point) ||
    !includes(FIGJAM_CONNECTOR_ANCHORS, value.anchor) ||
    !(
      value.attachedNodeId === null ||
      isNonEmptyString(value.attachedNodeId)
    )
  ) {
    return null
  }

  return {
    anchor: value.anchor,
    attachedNodeId: value.attachedNodeId,
    point: { ...value.point },
  }
}

function normalizeEndpointInput(
  endpoint: FigJamConnectorEndpointInput,
  x: number,
  y: number,
): FigJamConnectorEndpoint {
  return {
    anchor: endpoint.anchor ?? 'center',
    attachedNodeId: endpoint.attachedNodeId ?? null,
    point: {
      x: endpoint.point.x - x,
      y: endpoint.point.y - y,
    },
  }
}

function resolveConnectorGeometry({
  node,
  props,
  read,
}: Pick<ReactDesignWidgetRenderProps<FigJamConnectorProps>,
  'node' | 'props' | 'read'>) {
  const width = readLayoutSize(node.layout.w, props.coordinateWidth)
  const height = readLayoutSize(node.layout.h, props.coordinateHeight)
  const worldGeometry = resolveConnectorWorldGeometry({ node, props, read })

  if (!worldGeometry) {
    return {
      end: props.end.point,
      height,
      left: readLayoutPosition(node.layout.x),
      start: props.start.point,
      top: readLayoutPosition(node.layout.y),
      width,
    }
  }

  const connectorBounds = getFigJamNodeWorldBounds(read, node.id)

  if (!connectorBounds) {
    return {
      end: props.end.point,
      height,
      left: readLayoutPosition(node.layout.x),
      start: props.start.point,
      top: readLayoutPosition(node.layout.y),
      width,
    }
  }

  const parentWorldX = connectorBounds.x - readLayoutPosition(node.layout.x)
  const parentWorldY = connectorBounds.y - readLayoutPosition(node.layout.y)

  return {
    end: {
      x: worldGeometry.end.x - worldGeometry.bounds.x,
      y: worldGeometry.end.y - worldGeometry.bounds.y,
    },
    height: worldGeometry.bounds.h,
    left: worldGeometry.bounds.x - parentWorldX,
    start: {
      x: worldGeometry.start.x - worldGeometry.bounds.x,
      y: worldGeometry.start.y - worldGeometry.bounds.y,
    },
    top: worldGeometry.bounds.y - parentWorldY,
    width: worldGeometry.bounds.w,
  }
}

function resolveConnectorWorldGeometry({
  node,
  props,
  read,
}: {
  readonly node: DesignNode
  readonly props: FigJamConnectorProps
  readonly read: DesignDocumentRead
}) {
  const connectorBounds = getFigJamNodeWorldBounds(read, node.id)

  if (!connectorBounds) {
    return null
  }

  const width = readLayoutSize(node.layout.w, props.coordinateWidth)
  const height = readLayoutSize(node.layout.h, props.coordinateHeight)
  const start = resolveConnectorEndpointWorld({
    connectorBounds,
    endpoint: props.start,
    height,
    props,
    read,
    width,
  })
  const end = resolveConnectorEndpointWorld({
    connectorBounds,
    endpoint: props.end,
    height,
    props,
    read,
    width,
  })
  const naturalX = Math.min(start.x, end.x)
  const naturalY = Math.min(start.y, end.y)
  const naturalWidth = Math.abs(end.x - start.x)
  const naturalHeight = Math.abs(end.y - start.y)
  const resolvedWidth = Math.max(naturalWidth, 24)
  const resolvedHeight = Math.max(naturalHeight, 24)

  return {
    bounds: {
      h: resolvedHeight,
      w: resolvedWidth,
      x: naturalX - (resolvedWidth - naturalWidth) / 2,
      y: naturalY - (resolvedHeight - naturalHeight) / 2,
    },
    end,
    start,
  }
}

function resolveConnectorEndpointWorld({
  connectorBounds,
  endpoint,
  height,
  props,
  read,
  width,
}: {
  readonly connectorBounds: NonNullable<
    ReturnType<typeof getFigJamNodeWorldBounds>
  >
  readonly endpoint: FigJamConnectorEndpoint
  readonly height: number
  readonly props: FigJamConnectorProps
  readonly read: ReactDesignWidgetRenderProps<FigJamConnectorProps>['read']
  readonly width: number
}) {
  if (endpoint.attachedNodeId) {
    const targetBounds = getFigJamNodeWorldBounds(read, endpoint.attachedNodeId)

    if (targetBounds) {
      return getFigJamNodeAnchorPoint(targetBounds, endpoint.anchor)
    }
  }

  return {
    x: connectorBounds.x + endpoint.point.x * width / props.coordinateWidth,
    y: connectorBounds.y + endpoint.point.y * height / props.coordinateHeight,
  }
}

function toElbowPath(start: FigJamPoint, end: FigJamPoint) {
  const middleX = start.x + (end.x - start.x) / 2
  return `M${start.x} ${start.y} H${middleX} V${end.y} H${end.x}`
}

function readLayoutSize(value: unknown, fallback: number) {
  return isPositiveFiniteNumber(value) ? value : fallback
}

function readLayoutPosition(value: unknown) {
  return isFiniteNumber(value) ? value : 0
}

function createConnectorMarkerId(
  nodeId: string,
  stroke: string,
  reactId: string,
) {
  const instanceId = reactId.replace(/[^a-zA-Z0-9_-]/g, '') || 'instance'
  return `figjam-arrowhead-${hashSvgIdPart(`${nodeId}\u0000${stroke}`)}-${instanceId}`
}

function hashSvgIdPart(value: string) {
  let hash = 2_166_136_261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }

  return (hash >>> 0).toString(36)
}
