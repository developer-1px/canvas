import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'
import {
  findHtmlSpecimenPreviewElementByPath,
  normalizeHtmlSpecimenPreviewText,
} from './HtmlSpecimenShadowPreviewStructure'

export function patchHtmlSpecimenPreviewTextOnly({
  nextHtml,
  nodes,
  previousHtml,
  root,
}: {
  nextHtml: string
  nodes: readonly PreviewSurfaceNode[]
  previousHtml: string
  root: ShadowRoot
}): { nodes: readonly PreviewSurfaceNode[] } | null {
  const previousDocument = parseHtmlSpecimenPreviewDocument(previousHtml)
  const nextDocument = parseHtmlSpecimenPreviewDocument(nextHtml)

  if (!previousDocument || !nextDocument) {
    return null
  }

  const updates = collectHtmlSpecimenPreviewTextUpdates({
    nextElement: nextDocument.body,
    path: [],
    previousElement: previousDocument.body,
  })

  if (!updates) {
    return null
  }

  if (updates.length === 0) {
    return { nodes }
  }

  for (const update of updates) {
    const element = findHtmlSpecimenPreviewElementByPath(root, update.path)

    if (!element) {
      return null
    }

    element.textContent = update.text
  }

  const byPath = new Map(
    updates.map((update) => [formatHtmlSpecimenPreviewPath(update.path), update]),
  )

  return {
    nodes: nodes.map((node) => {
      const update = byPath.get(formatHtmlSpecimenPreviewPath(node.path))

      return update
        ? {
            ...node,
            text: normalizeHtmlSpecimenPreviewText(update.text),
          }
        : node
    }),
  }
}

function parseHtmlSpecimenPreviewDocument(html: string) {
  if (typeof DOMParser === 'undefined') {
    return null
  }

  return new DOMParser().parseFromString(html, 'text/html')
}

function collectHtmlSpecimenPreviewTextUpdates({
  nextElement,
  path,
  previousElement,
}: {
  nextElement: Element
  path: readonly number[]
  previousElement: Element
}): { path: readonly number[]; text: string }[] | null {
  if (!haveSameHtmlSpecimenPreviewElementSignature(previousElement, nextElement)) {
    return null
  }

  const previousChildren = [...previousElement.children]
  const nextChildren = [...nextElement.children]

  if (previousChildren.length !== nextChildren.length) {
    return null
  }

  if (previousChildren.length === 0) {
    const previousText = previousElement.textContent ?? ''
    const nextText = nextElement.textContent ?? ''

    return previousText === nextText
      ? []
      : [{ path, text: nextText }]
  }

  if (
    readDirectHtmlSpecimenPreviewText(previousElement) !==
    readDirectHtmlSpecimenPreviewText(nextElement)
  ) {
    return null
  }

  const updates: { path: readonly number[]; text: string }[] = []

  for (let index = 0; index < previousChildren.length; index += 1) {
    const childUpdates = collectHtmlSpecimenPreviewTextUpdates({
      nextElement: nextChildren[index],
      path: path.length === 0 ? [index] : [...path, index],
      previousElement: previousChildren[index],
    })

    if (!childUpdates) {
      return null
    }

    updates.push(...childUpdates)
  }

  return updates
}

function haveSameHtmlSpecimenPreviewElementSignature(
  previousElement: Element,
  nextElement: Element,
) {
  return previousElement.tagName === nextElement.tagName &&
    formatHtmlSpecimenPreviewAttributes(previousElement) ===
      formatHtmlSpecimenPreviewAttributes(nextElement)
}

function formatHtmlSpecimenPreviewAttributes(element: Element) {
  return [...element.attributes]
    .map((attribute) => [attribute.name, attribute.value] as const)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join('\n')
}

function readDirectHtmlSpecimenPreviewText(element: Element) {
  return [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join('')
}

function formatHtmlSpecimenPreviewPath(path: readonly number[]) {
  return path.join('/')
}
