import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'
import {
  dispatchCanvasAppCustomFocus,
  dispatchCanvasAppCustomFocusClear,
} from '../../../canvas'
import {
  clearHtmlSpecimenPreviewBoundsOverlay,
  clearHtmlSpecimenPreviewMarkedElement,
  clearHtmlSpecimenPreviewTargetSpacingOverlays,
  HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE,
  HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE,
} from './HtmlSpecimenPreviewOverlay'
import {
  createHtmlSpecimenPreviewTarget,
  findHtmlSpecimenPreviewNodeByPath,
  type HtmlSpecimenPreviewTarget,
} from './HtmlSpecimenPreviewTarget'
import {
  getHtmlSpecimenPreviewElementPath,
} from './HtmlSpecimenShadowPreviewStructure'

const HTML_SPECIMEN_PREVIEW_TARGET_EVENT = 'html-specimen-preview:target'

export function clearHtmlSpecimenPreviewTargetState({
  host,
  itemId,
  previousNodeId,
  root,
  targetNodeIdRef,
}: {
  host: HTMLElement
  itemId: string
  previousNodeId: string | null
  root: ShadowRoot
  targetNodeIdRef: { current: string | null }
}) {
  setHtmlSpecimenPreviewTargetState({
    host,
    nodeId: null,
    targetNodeIdRef,
  })
  clearHtmlSpecimenPreviewMarkedElement(
    root,
    HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE,
  )
  clearHtmlSpecimenPreviewBoundsOverlay(root, 'target')
  clearHtmlSpecimenPreviewTargetSpacingOverlays(root)

  if (previousNodeId) {
    dispatchCanvasAppCustomFocusClear(host, {
      itemId,
      ownerId: 'html-specimen',
      targetId: previousNodeId,
    })
  }
}

export function setHtmlSpecimenPreviewTargetState({
  host,
  nodeId,
  targetNodeIdRef,
}: {
  host: HTMLElement
  nodeId: string | null
  targetNodeIdRef: { current: string | null }
}) {
  targetNodeIdRef.current = nodeId

  if (nodeId) {
    host.dataset.previewTargetNodeId = nodeId
  } else {
    delete host.dataset.previewTargetNodeId
  }
}

export function clearHtmlSpecimenPreviewHoverState({
  host,
  hoverNodeIdRef,
  root,
}: {
  host: HTMLElement
  hoverNodeIdRef: { current: string | null }
  root: ShadowRoot
}) {
  setHtmlSpecimenPreviewHoverState({
    host,
    hoverNodeIdRef,
    nodeId: null,
  })
  clearHtmlSpecimenPreviewMarkedElement(
    root,
    HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE,
  )
  clearHtmlSpecimenPreviewBoundsOverlay(root, 'hover')
}

export function setHtmlSpecimenPreviewHoverState({
  host,
  hoverNodeIdRef,
  nodeId,
}: {
  host: HTMLElement
  hoverNodeIdRef: { current: string | null }
  nodeId: string | null
}) {
  hoverNodeIdRef.current = nodeId

  if (nodeId) {
    host.dataset.previewHoverNodeId = nodeId
  } else {
    delete host.dataset.previewHoverNodeId
  }
}

export function publishHtmlSpecimenPreviewTarget({
  host,
  itemId,
  nodes,
  target,
}: {
  host: HTMLElement
  itemId: string
  nodes: readonly PreviewSurfaceNode[]
  target: HtmlSpecimenPreviewTarget
}) {
  queueMicrotask(() => {
    if (!host.isConnected) {
      return
    }

    dispatchCanvasAppCustomFocus(host, {
      data: {
        node: target.node,
        nodes,
      },
      itemId,
      ownerId: 'html-specimen',
      targetId: target.nodeId,
    })
    host.dispatchEvent(new CustomEvent(HTML_SPECIMEN_PREVIEW_TARGET_EVENT, {
      bubbles: true,
      composed: true,
      detail: {
        ...target,
        nodes,
      },
    }))
  })
}

export function getHtmlSpecimenPreviewTargetFromEvent({
  eventTarget,
  itemId,
  nodes,
  root,
}: {
  eventTarget: EventTarget | null
  itemId: string
  nodes: readonly PreviewSurfaceNode[]
  root: ShadowRoot
}) {
  const path = getHtmlSpecimenPreviewElementPath(root, eventTarget)

  if (!path) {
    return null
  }

  const node = findHtmlSpecimenPreviewNodeByPath({ nodes, path })

  return node
    ? createHtmlSpecimenPreviewTarget({
        itemId,
        nodeId: node.id,
        nodes,
      })
    : null
}

export function createDefaultHtmlSpecimenPreviewTarget({
  itemId,
  nodes,
}: {
  itemId: string
  nodes: readonly PreviewSurfaceNode[]
}) {
  const node = nodes.find((candidate) =>
    candidate.attributes['data-preview-default-target'] === 'true')

  return node
    ? createHtmlSpecimenPreviewTarget({
        itemId,
        nodeId: node.id,
        nodes,
      })
    : null
}

function queueMicrotask(callback: () => void) {
  if (typeof globalThis.queueMicrotask === 'function') {
    globalThis.queueMicrotask(callback)
    return
  }

  void Promise.resolve().then(callback)
}
