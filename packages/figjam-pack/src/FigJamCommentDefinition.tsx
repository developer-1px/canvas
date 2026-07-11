/* eslint-disable react-refresh/only-export-components */
import {
  defineReactDesignWidget,
  type DesignDocumentRead,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetInspectorProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  isJSONObject,
  isNonEmptyString,
  isPoint,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamPoint,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'
import { getFigJamNodeWorldBounds } from './FigJamNodeGeometry'

export const FIGJAM_COMMENT_DEFINITION_ID = 'figjam.comment'

export type FigJamCommentMessage = {
  readonly authorName: string
  readonly body: string
  readonly createdAt: string
  readonly id: string
}

export type FigJamCommentProps = {
  readonly attachmentOffset: FigJamPoint
  readonly attachmentOrigin: FigJamPoint
  readonly attachedNodeId: string | null
  readonly position: 'absolute'
  readonly resolved: boolean
  readonly thread: readonly FigJamCommentMessage[]
}

export type FigJamResolvedCommentBounds = {
  readonly h: number
  readonly w: number
  readonly x: number
  readonly y: number
}

export type CreateFigJamCommentNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly attachedNodeId?: string | null
    readonly attachmentOffset?: FigJamPoint
    readonly body?: string
    readonly resolved?: boolean
    readonly thread?: readonly FigJamCommentMessage[]
  }

export const FIGJAM_COMMENT_DEFAULT_PROPS = Object.freeze({
  attachmentOffset: Object.freeze({ x: -12, y: -12 }),
  attachmentOrigin: Object.freeze({ x: 0, y: 0 }),
  attachedNodeId: null,
  position: 'absolute',
  resolved: false,
  thread: Object.freeze([]),
} as const satisfies FigJamCommentProps)

export const FIGJAM_COMMENT_DEFINITION =
  defineReactDesignWidget<FigJamCommentProps>({
    id: FIGJAM_COMMENT_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_COMMENT_DEFAULT_PROPS,
      safeParse: parseFigJamCommentProps,
    },
    create: ({ nodeId, x, y }) => createFigJamCommentNode({ nodeId, x, y }),
    capabilities: {
      textEdit: { source: 'node-text', multiline: true },
      transform: { move: true, resize: false },
    },
    renderer: FigJamComment,
    fallback: FigJamCommentFallback,
    Inspector: FigJamCommentInspector,
  })

export function createFigJamCommentNode({
  attachmentOffset = FIGJAM_COMMENT_DEFAULT_PROPS.attachmentOffset,
  attachedNodeId = null,
  body = 'Comment',
  height = 36,
  nodeId,
  resolved = false,
  thread = [],
  width = 220,
  x,
  y,
}: CreateFigJamCommentNodeInput) {
  const parsed = parseFigJamCommentProps({
    attachmentOffset,
    attachmentOrigin: { x, y },
    attachedNodeId,
    position: 'absolute',
    resolved,
    thread,
  })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_COMMENT_DEFINITION_ID,
    height,
    label: 'Comment',
    nodeId,
    props: cloneDesignProps(parsed.value),
    text: body,
    width,
    x,
    y,
  })
}

export function parseFigJamCommentProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isPoint(value.attachmentOffset) &&
    isPoint(value.attachmentOrigin) &&
    typeof value.resolved === 'boolean' &&
    (value.attachedNodeId === null || isNonEmptyString(value.attachedNodeId)) &&
    Array.isArray(value.thread) &&
    value.thread.every(isCommentMessage)
  ) {
    return {
      ok: true as const,
      value: {
        attachmentOffset: { ...value.attachmentOffset },
        attachmentOrigin: { ...value.attachmentOrigin },
        attachedNodeId: value.attachedNodeId,
        position: value.position,
        resolved: value.resolved,
        thread: value.thread.map((message) => ({ ...message })),
      } satisfies FigJamCommentProps,
    }
  }

  return {
    ok: false as const,
    reason: 'Comment props require attachment, resolution, and thread metadata',
  }
}

export function getFigJamResolvedCommentBounds(
  read: DesignDocumentRead,
  nodeId: string,
): FigJamResolvedCommentBounds | null {
  const node = read.node(nodeId)

  if (
    !node ||
    node.definition.kind !== 'widget' ||
    node.definition.id !== FIGJAM_COMMENT_DEFINITION_ID
  ) {
    return null
  }

  const canonicalBounds = getFigJamNodeWorldBounds(read, nodeId)
  const parsed = parseFigJamCommentProps(node.props)

  if (!canonicalBounds || !parsed.ok) {
    return null
  }

  const canonical = {
    h: canonicalBounds.height,
    w: canonicalBounds.width,
    x: canonicalBounds.x,
    y: canonicalBounds.y,
  }
  const target = parsed.value.attachedNodeId
    ? getFigJamNodeWorldBounds(read, parsed.value.attachedNodeId)
    : null

  if (!target) {
    return canonical
  }

  const localX = typeof node.layout.x === 'number' ? node.layout.x : 0
  const localY = typeof node.layout.y === 'number' ? node.layout.y : 0

  return {
    ...canonical,
    x: target.x + target.width + parsed.value.attachmentOffset.x + localX -
      parsed.value.attachmentOrigin.x,
    y: target.y + parsed.value.attachmentOffset.y + localY -
      parsed.value.attachmentOrigin.y,
  }
}

function FigJamComment({
  node,
  props,
  read,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamCommentProps>) {
  const attachedStyle = getAttachedCommentStyle({
    nodeId: node.id,
    props,
    read,
  })

  return (
    <article
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-comment')}
      data-comment-attached-to={props.attachedNodeId ?? undefined}
      data-comment-resolved={props.resolved}
      data-figjam-widget="comment"
      style={{ ...rootProps.style, ...attachedStyle }}
    >
      <span aria-hidden="true" className="figjam-comment__pin">{props.thread.length + 1}</span>
      <p>{node.text}</p>
    </article>
  )
}

function getAttachedCommentStyle({
  nodeId,
  props,
  read,
}: {
  readonly nodeId: string
  readonly props: FigJamCommentProps
  readonly read: ReactDesignWidgetRenderProps<FigJamCommentProps>['read']
}) {
  if (!props.attachedNodeId) {
    return undefined
  }

  const comment = getFigJamNodeWorldBounds(read, nodeId)
  const resolved = getFigJamResolvedCommentBounds(read, nodeId)
  const node = read.node(nodeId)
  const localX = typeof node?.layout.x === 'number' ? node.layout.x : 0
  const localY = typeof node?.layout.y === 'number' ? node.layout.y : 0

  if (!comment || !resolved) {
    return undefined
  }

  const parentX = comment.x - localX
  const parentY = comment.y - localY

  return {
    left: resolved.x - parentX,
    top: resolved.y - parentY,
  }
}

function FigJamCommentFallback({
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamCommentProps>) {
  return (
    <article
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-comment', 'figjam-widget-fallback')}
      data-figjam-widget="comment"
      data-figjam-widget-error={reason}
    >
      Comment unavailable
    </article>
  )
}

function FigJamCommentInspector({
  editProp,
  props,
}: ReactDesignWidgetInspectorProps<FigJamCommentProps>) {
  return (
    <label className="figjam-widget-check">
      <input
        aria-label="Comment resolved"
        checked={props.resolved}
        type="checkbox"
        onChange={(event) => editProp(
          'resolved',
          event.currentTarget.checked,
          'Change comment resolution',
        )}
      />
      <span>Resolved</span>
    </label>
  )
}

function isCommentMessage(value: unknown): value is FigJamCommentMessage {
  return isJSONObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.authorName) &&
    typeof value.body === 'string' &&
    isNonEmptyString(value.createdAt)
}
