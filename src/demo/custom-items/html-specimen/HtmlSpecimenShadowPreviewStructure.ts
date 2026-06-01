import {
  createPreviewSurfaceNodeSnapshot,
  readPreviewSurfaceComputedStyle,
  type PreviewSurfaceNode,
} from '@interactive-os/preview-surface'
import {
  getHtmlSpecimenPreviewSurfaceRoot,
} from './HtmlSpecimenPreviewOverlay'
import type {
  HtmlSpecimenPreviewTarget,
} from './HtmlSpecimenPreviewTarget'

const EMPTY_PREVIEW_SURFACE_BOUNDS: PreviewSurfaceNode['bounds'] = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
}
const EMPTY_PREVIEW_SURFACE_COMPUTED_STYLE:
  PreviewSurfaceNode['computedStyle'] = {
    backgroundColor: '',
    borderColor: '',
    borderRadius: '',
    color: '',
    display: '',
    fontFamily: '',
    fontSize: '',
    fontWeight: '',
    lineHeight: '',
    margin: '',
    opacity: '',
    padding: '',
    position: '',
    transform: '',
  }

export function refreshHtmlSpecimenPreviewTargetSnapshot({
  nodes,
  root,
  target,
}: {
  nodes: readonly PreviewSurfaceNode[]
  root: ShadowRoot
  target: HtmlSpecimenPreviewTarget
}) {
  const node = refreshHtmlSpecimenPreviewNodeSnapshot({
    node: target.node,
    root,
  })

  if (!node) {
    return { nodes, target }
  }

  const nextNodes = nodes.map((candidate) =>
    candidate.id === target.nodeId ? node : candidate)
  const nextTarget = {
    ...target,
    node,
  }

  return {
    nodes: nextNodes,
    target: nextTarget,
  }
}

export function indexHtmlSpecimenPreviewSurfaceStructure(root: ShadowRoot) {
  const surfaceRoot = getHtmlSpecimenPreviewSurfaceRoot(root)
  const nodes: PreviewSurfaceNode[] = []

  if (!surfaceRoot) {
    return nodes
  }

  for (let index = 0; index < surfaceRoot.children.length; index += 1) {
    visitHtmlSpecimenPreviewElementStructure({
      element: surfaceRoot.children[index],
      nodes,
      path: [index],
    })
  }

  return nodes
}

export function findHtmlSpecimenPreviewElementByPath(
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

export function getHtmlSpecimenPreviewElementPath(
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

export function normalizeHtmlSpecimenPreviewText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function visitHtmlSpecimenPreviewElementStructure({
  element,
  nodes,
  path,
}: {
  element: Element
  nodes: PreviewSurfaceNode[]
  path: readonly number[]
}) {
  nodes.push(createPreviewSurfaceNodeSnapshot({
    attributes: readHtmlSpecimenPreviewElementAttributes(element),
    bounds: EMPTY_PREVIEW_SURFACE_BOUNDS,
    classList: [...element.classList],
    computedStyle: EMPTY_PREVIEW_SURFACE_COMPUTED_STYLE,
    path,
    tagName: element.tagName,
    text: element.textContent ?? '',
  }))

  for (let index = 0; index < element.children.length; index += 1) {
    visitHtmlSpecimenPreviewElementStructure({
      element: element.children[index],
      nodes,
      path: [...path, index],
    })
  }
}

function readHtmlSpecimenPreviewElementAttributes(element: Element) {
  return Object.fromEntries(
    [...element.attributes].map((attribute) => [
      attribute.name,
      attribute.value,
    ]),
  )
}

function refreshHtmlSpecimenPreviewNodeSnapshot({
  node,
  root,
}: {
  node: PreviewSurfaceNode
  root: ShadowRoot
}): PreviewSurfaceNode | null {
  const element = findHtmlSpecimenPreviewElementByPath(root, node.path)

  if (!element) {
    return null
  }

  return {
    ...node,
    bounds: readHtmlSpecimenPreviewElementBounds({
      element,
      root,
    }),
    computedStyle: readPreviewSurfaceComputedStyle(getComputedStyle(element)),
    text: normalizeHtmlSpecimenPreviewText(element.textContent ?? ''),
  }
}

function readHtmlSpecimenPreviewElementBounds({
  element,
  root,
}: {
  element: Element
  root: ShadowRoot
}) {
  const rootElement = root.host
  const rootRect = rootElement.getBoundingClientRect()
  const rect = element.getBoundingClientRect()

  return {
    height: rect.height,
    width: rect.width,
    x: rect.x - rootRect.x,
    y: rect.y - rootRect.y,
  }
}
