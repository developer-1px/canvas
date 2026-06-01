import {
  cloneHtmlSpecimenOutline,
  cloneHtmlSpecimenOutlineElementForInsert,
  findHtmlSpecimenOutlineElementByPath,
  findHtmlSpecimenOutlineLocationById,
  getHtmlSpecimenElementChildren,
  getHtmlSpecimenOutlineElementText,
  getNearestHtmlSpecimenFocusId,
  getNextHtmlSpecimenElementLocation,
  getPreviousHtmlSpecimenElementLocation,
  refreshHtmlSpecimenOutlinePaths,
} from './HtmlSpecimenOutlineStructure'
import type {
  HtmlSpecimenOutline,
  HtmlSpecimenOutlineEditResult,
  HtmlSpecimenOutlineElement,
  HtmlSpecimenOutlineTextEditResult,
} from './HtmlSpecimenOutlineTypes'

export function replaceHtmlSpecimenOutlineText({
  nextText,
  nodeId,
  outline,
}: {
  nextText: string
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineTextEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location) {
    return { ok: false, reason: 'invalid-target' }
  }

  if (location.node.voidElement) {
    return { ok: false, reason: 'void-element' }
  }

  if (getHtmlSpecimenElementChildren(location.node).length > 0) {
    return { ok: false, reason: 'has-element-children' }
  }

  const previousText = getHtmlSpecimenOutlineElementText(location.node)
  location.node.content = nextText.length > 0
    ? [{ kind: 'text', text: nextText }]
    : []

  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextNode = findHtmlSpecimenOutlineElementByPath({
    outline: refreshed,
    path: location.node.path,
  })

  return {
    nextFocusId: nextNode?.id ?? nodeId,
    ok: true,
    outline: refreshed,
    previousText,
  }
}

export function deleteHtmlSpecimenOutlineNode({
  nodeId,
  outline,
}: {
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location) {
    return { ok: false, reason: 'invalid-target' }
  }

  const next = getNextHtmlSpecimenElementLocation(location)
  const previous = getPreviousHtmlSpecimenElementLocation(location)
  const nextFocusPath = next
    ? [
        ...next.node.path.slice(0, -1),
        Math.max(0, next.elementIndex - 1),
      ]
    : previous?.node.path ?? location.parentNode?.path ?? null

  location.parentContent.splice(location.contentIndex, 1)
  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextFocus = nextFocusPath
    ? findHtmlSpecimenOutlineElementByPath({
        outline: refreshed,
        path: nextFocusPath,
      })
    : null

  return {
    nextFocusId: nextFocus?.id ??
      getNearestHtmlSpecimenFocusId(refreshed, location),
    ok: true,
    outline: refreshed,
  }
}

export function duplicateHtmlSpecimenOutlineNode({
  nodeId,
  outline,
}: {
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location) {
    return { ok: false, reason: 'invalid-target' }
  }

  const copy = cloneHtmlSpecimenOutlineElementForInsert(location.node)
  location.parentContent.splice(location.contentIndex + 1, 0, copy)

  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextNode = findHtmlSpecimenOutlineElementByPath({
    outline: refreshed,
    path: [...location.node.path.slice(0, -1), location.elementIndex + 1],
  })

  return {
    nextFocusId: nextNode?.id ?? null,
    ok: true,
    outline: refreshed,
  }
}

export function moveHtmlSpecimenOutlineNode({
  direction,
  nodeId,
  outline,
}: {
  direction: 'down' | 'up'
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location) {
    return { ok: false, reason: 'invalid-target' }
  }

  const sibling = direction === 'up'
    ? getPreviousHtmlSpecimenElementLocation(location)
    : getNextHtmlSpecimenElementLocation(location)

  if (!sibling) {
    return {
      ok: false,
      reason: direction === 'up' ? 'no-previous-sibling' : 'no-next-sibling',
    }
  }

  const [node] = location.parentContent.splice(location.contentIndex, 1)

  if (!node || node.kind !== 'element') {
    return { ok: false, reason: 'invalid-target' }
  }

  location.parentContent.splice(sibling.contentIndex, 0, node)

  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextNode = findHtmlSpecimenOutlineElementByPath({
    outline: refreshed,
    path: direction === 'up'
      ? [...location.node.path.slice(0, -1), location.elementIndex - 1]
      : [...location.node.path.slice(0, -1), location.elementIndex + 1],
  })

  return {
    nextFocusId: nextNode?.id ?? nodeId,
    ok: true,
    outline: refreshed,
  }
}

export function demoteHtmlSpecimenOutlineNode({
  nodeId,
  outline,
}: {
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location) {
    return { ok: false, reason: 'invalid-target' }
  }

  const previous = getPreviousHtmlSpecimenElementLocation(location)

  if (!previous) {
    return { ok: false, reason: 'no-previous-sibling' }
  }

  if (previous.node.voidElement) {
    return { ok: false, reason: 'void-element' }
  }

  const [node] = location.parentContent.splice(location.contentIndex, 1)

  if (!node || node.kind !== 'element') {
    return { ok: false, reason: 'invalid-target' }
  }

  previous.node.content.push(node)

  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextParent = findHtmlSpecimenOutlineElementByPath({
    outline: refreshed,
    path: previous.node.path,
  })
  const nextNode = nextParent
    ? getHtmlSpecimenElementChildren(nextParent).at(-1) ?? null
    : null

  return {
    nextFocusId: nextNode?.id ?? nodeId,
    ok: true,
    outline: refreshed,
  }
}

export function promoteHtmlSpecimenOutlineNode({
  nodeId,
  outline,
}: {
  nodeId: string
  outline: HtmlSpecimenOutline
}): HtmlSpecimenOutlineEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location) {
    return { ok: false, reason: 'invalid-target' }
  }

  if (!location.parentNode) {
    return { ok: false, reason: 'root-target' }
  }

  const parentLocation = findHtmlSpecimenOutlineLocationById(
    draft,
    location.parentNode.id,
  )

  if (!parentLocation) {
    return { ok: false, reason: 'missing-parent' }
  }

  const [node] = location.parentContent.splice(location.contentIndex, 1)

  if (!node || node.kind !== 'element') {
    return { ok: false, reason: 'invalid-target' }
  }

  parentLocation.parentContent.splice(parentLocation.contentIndex + 1, 0, node)

  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextNode = findHtmlSpecimenOutlineElementByPath({
    outline: refreshed,
    path: [
      ...parentLocation.node.path.slice(0, -1),
      parentLocation.elementIndex + 1,
    ],
  })

  return {
    nextFocusId: nextNode?.id ?? nodeId,
    ok: true,
    outline: refreshed,
  }
}

export function pasteHtmlSpecimenOutlineNodes({
  mode,
  nodeId,
  outline,
  payload,
}: {
  mode: 'child' | 'sibling'
  nodeId: string
  outline: HtmlSpecimenOutline
  payload: readonly HtmlSpecimenOutlineElement[]
}): HtmlSpecimenOutlineEditResult {
  const draft = cloneHtmlSpecimenOutline(outline)
  const location = findHtmlSpecimenOutlineLocationById(draft, nodeId)

  if (!location || payload.length === 0) {
    return { ok: false, reason: 'invalid-target' }
  }

  const clones = payload.map(cloneHtmlSpecimenOutlineElementForInsert)
  const nextFocusPath = mode === 'child'
    ? [
        ...location.node.path,
        getHtmlSpecimenElementChildren(location.node).length,
      ]
    : [...location.node.path.slice(0, -1), location.elementIndex + 1]

  if (mode === 'child') {
    if (location.node.voidElement) {
      return { ok: false, reason: 'void-element' }
    }

    location.node.content.push(...clones)
  } else {
    location.parentContent.splice(location.contentIndex + 1, 0, ...clones)
  }

  const refreshed = refreshHtmlSpecimenOutlinePaths(draft)
  const nextFocus = findHtmlSpecimenOutlineElementByPath({
    outline: refreshed,
    path: nextFocusPath,
  })

  return {
    nextFocusId: nextFocus?.id ?? null,
    ok: true,
    outline: refreshed,
  }
}
