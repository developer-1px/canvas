import { createHtmlSpecimenOutlineElementId } from './HtmlSpecimenOutlineIdentity'
import type {
  HtmlSpecimenOutline,
  HtmlSpecimenOutlineContent,
  HtmlSpecimenOutlineElement,
  HtmlSpecimenOutlineLocation,
  HtmlSpecimenOutlineTextContent,
} from './HtmlSpecimenOutlineTypes'

export function listHtmlSpecimenOutlineElements(
  outline: HtmlSpecimenOutline,
) {
  const nodes: HtmlSpecimenOutlineElement[] = []

  collectHtmlSpecimenOutlineElements(outline.content, nodes)

  return nodes
}

export function findHtmlSpecimenOutlineElementById({
  nodeId,
  outline,
}: {
  nodeId: string
  outline: HtmlSpecimenOutline
}) {
  return listHtmlSpecimenOutlineElements(outline)
    .find((node) => node.id === nodeId) ?? null
}

export function getHtmlSpecimenOutlineElementText(
  node: HtmlSpecimenOutlineElement,
) {
  return node.content
    .filter((child): child is HtmlSpecimenOutlineTextContent =>
      child.kind === 'text')
    .map((child) => child.text)
    .join('')
}

export function isHtmlSpecimenOutlineTextEditable(
  node: HtmlSpecimenOutlineElement,
) {
  return !node.voidElement && getHtmlSpecimenElementChildren(node).length === 0
}

export function refreshHtmlSpecimenOutlinePaths(
  outline: HtmlSpecimenOutline,
): HtmlSpecimenOutline {
  return {
    content: refreshHtmlSpecimenContentPaths(outline.content, []),
  }
}

export function cloneHtmlSpecimenOutline(
  outline: HtmlSpecimenOutline,
): HtmlSpecimenOutline {
  return {
    content: cloneHtmlSpecimenContent(outline.content),
  }
}

export function cloneHtmlSpecimenOutlineElementForInsert(
  node: HtmlSpecimenOutlineElement,
): HtmlSpecimenOutlineElement {
  const clone = cloneHtmlSpecimenOutlineElement(node)

  scrubHtmlSpecimenOutlineInsertIdentity(clone)

  return clone
}

export function findHtmlSpecimenOutlineLocationById(
  outline: HtmlSpecimenOutline,
  nodeId: string,
) {
  return findHtmlSpecimenOutlineLocationInContent({
    content: outline.content,
    nodeId,
    parentNode: null,
  })
}

export function findHtmlSpecimenOutlineElementByPath({
  outline,
  path,
}: {
  outline: HtmlSpecimenOutline
  path: readonly number[]
}) {
  let content = outline.content
  let node: HtmlSpecimenOutlineElement | null = null

  for (const segment of path) {
    node = getHtmlSpecimenElementChildByIndex(content, segment)

    if (!node) {
      return null
    }

    content = node.content
  }

  return node
}

export function getHtmlSpecimenElementChildren(
  node: HtmlSpecimenOutlineElement,
) {
  return node.content.filter((child): child is HtmlSpecimenOutlineElement =>
    child.kind === 'element')
}

export function getPreviousHtmlSpecimenElementLocation(
  location: HtmlSpecimenOutlineLocation,
) {
  let elementIndex = 0
  let previous: HtmlSpecimenOutlineLocation | null = null

  for (
    let contentIndex = 0;
    contentIndex < location.parentContent.length;
    contentIndex += 1
  ) {
    const child = location.parentContent[contentIndex]

    if (child?.kind !== 'element') {
      continue
    }

    if (contentIndex === location.contentIndex) {
      return previous
    }

    previous = {
      contentIndex,
      elementIndex,
      node: child,
      parentContent: location.parentContent,
      parentNode: location.parentNode,
    }
    elementIndex += 1
  }

  return null
}

export function getNextHtmlSpecimenElementLocation(
  location: HtmlSpecimenOutlineLocation,
) {
  let elementIndex = 0
  let found = false

  for (
    let contentIndex = 0;
    contentIndex < location.parentContent.length;
    contentIndex += 1
  ) {
    const child = location.parentContent[contentIndex]

    if (child?.kind !== 'element') {
      continue
    }

    if (found) {
      return {
        contentIndex,
        elementIndex,
        node: child,
        parentContent: location.parentContent,
        parentNode: location.parentNode,
      }
    }

    if (contentIndex === location.contentIndex) {
      found = true
    }

    elementIndex += 1
  }

  return null
}

export function getNearestHtmlSpecimenFocusId(
  outline: HtmlSpecimenOutline,
  removed: HtmlSpecimenOutlineLocation,
) {
  const next = getNextHtmlSpecimenElementLocation(removed)
  const previous = getPreviousHtmlSpecimenElementLocation(removed)

  return next?.node.id ??
    previous?.node.id ??
    removed.parentNode?.id ??
    listHtmlSpecimenOutlineElements(outline).find((node) =>
      node.id !== removed.node.id)?.id ??
    null
}

function collectHtmlSpecimenOutlineElements(
  content: readonly HtmlSpecimenOutlineContent[],
  nodes: HtmlSpecimenOutlineElement[],
) {
  for (const child of content) {
    if (child.kind !== 'element') {
      continue
    }

    nodes.push(child)
    collectHtmlSpecimenOutlineElements(child.content, nodes)
  }
}

function refreshHtmlSpecimenContentPaths(
  content: readonly HtmlSpecimenOutlineContent[],
  parentPath: readonly number[],
) {
  let elementIndex = 0

  return content.map((child): HtmlSpecimenOutlineContent => {
    if (child.kind === 'text') {
      return { ...child }
    }

    const path = [...parentPath, elementIndex]
    elementIndex += 1

    return {
      ...child,
      content: refreshHtmlSpecimenContentPaths(child.content, path),
      id: createHtmlSpecimenOutlineElementId({
        attributes: child.attributes,
        path,
        tagName: child.tagName,
      }),
      path,
    }
  })
}

function cloneHtmlSpecimenContent(
  content: readonly HtmlSpecimenOutlineContent[],
): HtmlSpecimenOutlineContent[] {
  return content.map((child) =>
    child.kind === 'text'
      ? { ...child }
      : cloneHtmlSpecimenOutlineElement(child))
}

function cloneHtmlSpecimenOutlineElement(
  node: HtmlSpecimenOutlineElement,
): HtmlSpecimenOutlineElement {
  return {
    ...node,
    attributes: { ...node.attributes },
    content: cloneHtmlSpecimenContent(node.content),
    path: [...node.path],
  }
}

function scrubHtmlSpecimenOutlineInsertIdentity(
  node: HtmlSpecimenOutlineElement,
) {
  delete node.attributes.id
  delete node.attributes['data-surface-id']

  for (const child of node.content) {
    if (child.kind === 'element') {
      scrubHtmlSpecimenOutlineInsertIdentity(child)
    }
  }
}

function findHtmlSpecimenOutlineLocationInContent({
  content,
  nodeId,
  parentNode,
}: {
  content: HtmlSpecimenOutlineContent[]
  nodeId: string
  parentNode: HtmlSpecimenOutlineElement | null
}): HtmlSpecimenOutlineLocation | null {
  let elementIndex = 0

  for (
    let contentIndex = 0;
    contentIndex < content.length;
    contentIndex += 1
  ) {
    const child = content[contentIndex]

    if (child?.kind !== 'element') {
      continue
    }

    if (child.id === nodeId) {
      return {
        contentIndex,
        elementIndex,
        node: child,
        parentContent: content,
        parentNode,
      }
    }

    const nested = findHtmlSpecimenOutlineLocationInContent({
      content: child.content,
      nodeId,
      parentNode: child,
    })

    if (nested) {
      return nested
    }

    elementIndex += 1
  }

  return null
}

function getHtmlSpecimenElementChildByIndex(
  content: readonly HtmlSpecimenOutlineContent[],
  index: number,
) {
  let elementIndex = 0

  for (const child of content) {
    if (child.kind !== 'element') {
      continue
    }

    if (elementIndex === index) {
      return child
    }

    elementIndex += 1
  }

  return null
}
