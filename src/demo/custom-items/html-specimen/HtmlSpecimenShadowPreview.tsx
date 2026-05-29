import {
  getOrCreatePreviewSurfaceRoot,
  indexPreviewSurface,
  type PreviewSurfaceNode,
  renderHtmlPreviewSurface,
} from '@interactive-os/preview-surface'
import {
  dispatchCanvasAppCustomFocus,
  dispatchCanvasAppCustomFocusClear,
} from '../../../canvas'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  createHtmlSpecimenPreviewTarget,
  findHtmlSpecimenPreviewNodeByPath,
  reconcileHtmlSpecimenPreviewTarget,
  type HtmlSpecimenPreviewTarget,
} from './HtmlSpecimenPreviewTarget'

const HTML_SPECIMEN_PREVIEW_TARGET_EVENT = 'html-specimen-preview:target'
const HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE =
  'data-html-specimen-preview-hover'
const HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE =
  'data-html-specimen-preview-target'
const HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE =
  'data-html-specimen-preview-tool-style'

export function HtmlSpecimenShadowPreview({
  itemId,
  specimen,
  title,
}: {
  itemId: string
  specimen: HtmlSpecimenData
  title: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const hoverNodeIdRef = useRef<string | null>(null)
  const targetNodeIdRef = useRef<string | null>(null)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null)

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    const root = getOrCreatePreviewSurfaceRoot(host)

    renderHtmlPreviewSurface(root, {
      css: specimen.css,
      html: specimen.html,
    })
    ensureHtmlSpecimenPreviewToolStyle(root)

    const nodes = indexPreviewSurface(root)
    const previousNodeId = targetNodeIdRef.current
    const retainedTarget = reconcileHtmlSpecimenPreviewTarget({
      itemId,
      nodes,
      previousNodeId,
    })

    host.dataset.previewNodeCount = String(nodes.length)
    clearHtmlSpecimenPreviewHoverState({
      host,
      hoverNodeIdRef,
      root,
      setHoverNodeId,
    })
    if (retainedTarget) {
      setHtmlSpecimenPreviewTargetState({
        host,
        nodeId: retainedTarget.nodeId,
        setTargetNodeId,
        targetNodeIdRef,
      })
      markHtmlSpecimenPreviewTargetElement(root, retainedTarget.node.path)
      publishHtmlSpecimenPreviewTarget({
        host,
        itemId,
        nodes,
        target: retainedTarget,
      })
    } else {
      clearHtmlSpecimenPreviewTargetState({
        host,
        itemId,
        previousNodeId,
        setTargetNodeId,
        targetNodeIdRef,
      })
    }
    host.dispatchEvent(new CustomEvent('preview-surface:indexed', {
      bubbles: true,
      detail: { nodes },
    }))

    const handlePointerDown: EventListener = (event) => {
      const target = getHtmlSpecimenPreviewTargetFromEvent({
        eventTarget: event.target,
        itemId,
        nodes,
        root,
      })

      if (!target) {
        return
      }

      setHtmlSpecimenPreviewTargetState({
        host,
        nodeId: target.nodeId,
        setTargetNodeId,
        targetNodeIdRef,
      })
      markHtmlSpecimenPreviewTargetElement(root, target.node.path)
      publishHtmlSpecimenPreviewTarget({
        host,
        itemId,
        nodes,
        target,
      })
    }

    const handlePointerMove: EventListener = (event) => {
      const target = getHtmlSpecimenPreviewTargetFromEvent({
        eventTarget: event.target,
        itemId,
        nodes,
        root,
      })

      if (!target) {
        clearHtmlSpecimenPreviewHoverState({
          host,
          hoverNodeIdRef,
          root,
          setHoverNodeId,
        })
        return
      }

      setHtmlSpecimenPreviewHoverState({
        host,
        hoverNodeIdRef,
        nodeId: target.nodeId,
        setHoverNodeId,
      })
      markHtmlSpecimenPreviewHoverElement(root, target.node.path)
    }

    const handlePointerLeave = () => {
      clearHtmlSpecimenPreviewHoverState({
        host,
        hoverNodeIdRef,
        root,
        setHoverNodeId,
      })
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerleave', handlePointerLeave)
    root.addEventListener('pointerdown', handlePointerDown)

    return () => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerleave', handlePointerLeave)
      root.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [itemId, specimen.css, specimen.html])

  return (
    <div
      ref={hostRef}
      className="demo-html-specimen-preview"
      data-html-specimen-item-id={itemId}
      data-preview-hover-node-id={hoverNodeId ?? undefined}
      data-preview-target-node-id={targetNodeId ?? undefined}
      title={title}
    />
  )
}

function clearHtmlSpecimenPreviewTargetState({
  host,
  itemId,
  previousNodeId,
  setTargetNodeId,
  targetNodeIdRef,
}: {
  host: HTMLElement
  itemId: string
  previousNodeId: string | null
  setTargetNodeId: (nodeId: string | null) => void
  targetNodeIdRef: { current: string | null }
}) {
  setHtmlSpecimenPreviewTargetState({
    host,
    nodeId: null,
    setTargetNodeId,
    targetNodeIdRef,
  })

  if (previousNodeId) {
    dispatchCanvasAppCustomFocusClear(host, {
      itemId,
      ownerId: 'html-specimen',
      targetId: previousNodeId,
    })
  }
}

function setHtmlSpecimenPreviewTargetState({
  host,
  nodeId,
  setTargetNodeId,
  targetNodeIdRef,
}: {
  host: HTMLElement
  nodeId: string | null
  setTargetNodeId: (nodeId: string | null) => void
  targetNodeIdRef: { current: string | null }
}) {
  targetNodeIdRef.current = nodeId
  setTargetNodeId(nodeId)

  if (nodeId) {
    host.dataset.previewTargetNodeId = nodeId
  } else {
    delete host.dataset.previewTargetNodeId
  }
}

function clearHtmlSpecimenPreviewHoverState({
  host,
  hoverNodeIdRef,
  root,
  setHoverNodeId,
}: {
  host: HTMLElement
  hoverNodeIdRef: { current: string | null }
  root: ShadowRoot
  setHoverNodeId: (nodeId: string | null) => void
}) {
  setHtmlSpecimenPreviewHoverState({
    host,
    hoverNodeIdRef,
    nodeId: null,
    setHoverNodeId,
  })
  clearHtmlSpecimenPreviewMarkedElement(
    root,
    HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE,
  )
}

function setHtmlSpecimenPreviewHoverState({
  host,
  hoverNodeIdRef,
  nodeId,
  setHoverNodeId,
}: {
  host: HTMLElement
  hoverNodeIdRef: { current: string | null }
  nodeId: string | null
  setHoverNodeId: (nodeId: string | null) => void
}) {
  hoverNodeIdRef.current = nodeId
  setHoverNodeId(nodeId)

  if (nodeId) {
    host.dataset.previewHoverNodeId = nodeId
  } else {
    delete host.dataset.previewHoverNodeId
  }
}

function publishHtmlSpecimenPreviewTarget({
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
}

function getHtmlSpecimenPreviewTargetFromEvent({
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

function getHtmlSpecimenPreviewElementPath(
  root: ShadowRoot,
  eventTarget: EventTarget | null,
) {
  const surfaceRoot = getHtmlSpecimenPreviewSurfaceRoot(root)
  const target = eventTarget instanceof Element ? eventTarget : null

  if (!surfaceRoot || !target || target === surfaceRoot) {
    return null
  }

  if (!surfaceRoot.contains(target)) {
    return null
  }

  const path: number[] = []
  let current: Element | null = target

  while (current && current !== surfaceRoot) {
    const parent: Element | null = current.parentElement

    if (!parent) {
      return null
    }

    path.unshift([...parent.children].indexOf(current))
    current = parent
  }

  return path.length > 0 ? path : null
}

function markHtmlSpecimenPreviewTargetElement(
  root: ShadowRoot,
  path: readonly number[],
) {
  markHtmlSpecimenPreviewElement({
    attribute: HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE,
    path,
    root,
  })
}

function markHtmlSpecimenPreviewHoverElement(
  root: ShadowRoot,
  path: readonly number[],
) {
  markHtmlSpecimenPreviewElement({
    attribute: HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE,
    path,
    root,
  })
}

function markHtmlSpecimenPreviewElement({
  attribute,
  path,
  root,
}: {
  attribute: string
  path: readonly number[]
  root: ShadowRoot
}) {
  clearHtmlSpecimenPreviewMarkedElement(root, attribute)
  findHtmlSpecimenPreviewElementByPath(root, path)?.setAttribute(
    attribute,
    'true',
  )
}

function clearHtmlSpecimenPreviewMarkedElement(
  root: ShadowRoot,
  attribute: string,
) {
  for (const element of root.querySelectorAll(`[${attribute}]`)) {
    element.removeAttribute(attribute)
  }
}

function findHtmlSpecimenPreviewElementByPath(
  root: ShadowRoot,
  path: readonly number[],
) {
  let element = getHtmlSpecimenPreviewSurfaceRoot(root)

  for (const index of path) {
    const child = element?.children[index]

    if (!child) {
      return null
    }

    element = child
  }

  return element
}

function ensureHtmlSpecimenPreviewToolStyle(root: ShadowRoot) {
  if (root.querySelector(`[${HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE}]`)) {
    return
  }

  const style = root.ownerDocument.createElement('style')

  style.setAttribute(HTML_SPECIMEN_PREVIEW_TOOL_STYLE_ATTRIBUTE, '')
  style.textContent = `[${HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE}] {
  outline: 1px solid #38bdf8 !important;
  outline-offset: 1px !important;
}
[${HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE}] {
  outline: 2px solid #0f766e !important;
  outline-offset: 2px !important;
}`
  root.append(style)
}

function getHtmlSpecimenPreviewSurfaceRoot(root: ShadowRoot) {
  return root.querySelector('[data-preview-surface-root]')
}
