import {
  getOrCreatePreviewSurfaceRoot,
  indexPreviewSurface,
  type PreviewSurfaceNode,
  renderHtmlPreviewSurface,
} from '@interactive-os/preview-surface'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  createHtmlSpecimenPreviewTarget,
  findHtmlSpecimenPreviewNodeByPath,
} from './HtmlSpecimenPreviewTarget'

const HTML_SPECIMEN_PREVIEW_TARGET_EVENT = 'html-specimen-preview:target'
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
    setTargetNodeId(null)
    host.dataset.previewNodeCount = String(nodes.length)
    delete host.dataset.previewTargetNodeId
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

      setTargetNodeId(target.nodeId)
      host.dataset.previewTargetNodeId = target.nodeId
      markHtmlSpecimenPreviewTargetElement(root, target.node.path)
      host.dispatchEvent(new CustomEvent(HTML_SPECIMEN_PREVIEW_TARGET_EVENT, {
        bubbles: true,
        composed: true,
        detail: target,
      }))
    }

    root.addEventListener('pointerdown', handlePointerDown)

    return () => {
      root.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [itemId, specimen.css, specimen.html])

  return (
    <div
      ref={hostRef}
      className="demo-html-specimen-preview"
      data-html-specimen-item-id={itemId}
      data-preview-target-node-id={targetNodeId ?? undefined}
      title={title}
    />
  )
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
  for (const element of root.querySelectorAll(
    `[${HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE}]`,
  )) {
    element.removeAttribute(HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE)
  }

  findHtmlSpecimenPreviewElementByPath(root, path)?.setAttribute(
    HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE,
    'true',
  )
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
  style.textContent = `[${HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE}] {
  outline: 2px solid #0f766e !important;
  outline-offset: 2px !important;
}`
  root.append(style)
}

function getHtmlSpecimenPreviewSurfaceRoot(root: ShadowRoot) {
  return root.querySelector('[data-preview-surface-root]')
}
