import {
  nodeClassSetCache,
} from './HtmlSpecimenCssSelectorCache'
import type {
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function getNodeAncestors({
  node,
  nodes,
}: {
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  return nodes
    .filter((candidate) => isNodeAncestor(candidate, node))
    .sort((left, right) => (left.path?.length ?? 0) - (right.path?.length ?? 0))
}

export function getPreviousNodeSibling({
  node,
  nodes,
}: {
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  return getPreviousNodeSiblings({ node, nodes })[0] ?? null
}

export function getPreviousNodeSiblings({
  node,
  nodes,
}: {
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  if (!node.path || node.path.length === 0) {
    return []
  }

  const siblingIndex = node.path.at(-1)

  if (siblingIndex === undefined) {
    return []
  }

  const parentPath = node.path.slice(0, -1)

  return nodes
    .filter((candidate) =>
      isPreviousNodeSibling({
        candidate,
        parentPath,
        siblingIndex,
      }))
    .sort((left, right) =>
      (right.path?.at(-1) ?? 0) - (left.path?.at(-1) ?? 0))
}

export function isPreviousNodeSibling({
  candidate,
  parentPath,
  siblingIndex,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  parentPath: readonly number[]
  siblingIndex: number
}) {
  if (!candidate.path || candidate.path.length !== parentPath.length + 1) {
    return false
  }

  const candidateSiblingIndex = candidate.path.at(-1)

  return candidateSiblingIndex !== undefined &&
    candidateSiblingIndex < siblingIndex &&
    parentPath.every((part, index) => part === candidate.path?.[index])
}

export function isNextNodeSibling({
  candidate,
  node,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  node: HtmlSpecimenCssSelectorNode
}) {
  if (!candidate.path || !node.path || node.path.length === 0) {
    return false
  }

  const nodeSiblingIndex = node.path.at(-1)
  const candidateSiblingIndex = candidate.path.at(-1)

  return nodeSiblingIndex !== undefined &&
    candidateSiblingIndex === nodeSiblingIndex + 1 &&
    hasSameParentPath(candidate.path, node.path)
}

export function isSubsequentNodeSibling({
  candidate,
  node,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  node: HtmlSpecimenCssSelectorNode
}) {
  if (!candidate.path || !node.path || node.path.length === 0) {
    return false
  }

  const nodeSiblingIndex = node.path.at(-1)
  const candidateSiblingIndex = candidate.path.at(-1)

  return nodeSiblingIndex !== undefined &&
    candidateSiblingIndex !== undefined &&
    candidateSiblingIndex > nodeSiblingIndex &&
    hasSameParentPath(candidate.path, node.path)
}

export function isNodeParent(
  candidate: HtmlSpecimenCssSelectorNode,
  node: HtmlSpecimenCssSelectorNode,
) {
  return Boolean(
    candidate.path &&
    node.path &&
    candidate.path.length + 1 === node.path.length &&
    candidate.path.every((part, index) => part === node.path?.[index]),
  )
}

export function isFirstNodeChild(node: HtmlSpecimenCssSelectorNode) {
  return getNodeSiblingIndex(node) === 0
}

export function isLastNodeChild(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const siblingIndex = getNodeSiblingIndex(node)
  const lastSiblingIndex = getLastNodeSiblingIndex(node, nodes)

  return siblingIndex !== null && siblingIndex === lastSiblingIndex
}

export function getNodeChildPosition(node: HtmlSpecimenCssSelectorNode) {
  const siblingIndex = getNodeSiblingIndex(node)

  return siblingIndex === null ? null : siblingIndex + 1
}

export function getNodeLastChildPosition(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const siblingIndex = getNodeSiblingIndex(node)
  const lastSiblingIndex = getLastNodeSiblingIndex(node, nodes)

  return siblingIndex === null || lastSiblingIndex === null
    ? null
    : lastSiblingIndex - siblingIndex + 1
}

export function getNodeOfTypePosition(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const siblingIndex = getNodeSiblingIndex(node)
  const nodePath = node.path

  if (!nodePath || siblingIndex === null) {
    return null
  }

  let position = 0

  for (const candidate of nodes) {
    const candidateSiblingIndex = candidate.path?.at(-1)

    if (
      candidateSiblingIndex !== undefined &&
      candidateSiblingIndex <= siblingIndex &&
      isSameNodeTypeSibling(candidate, node, nodePath)
    ) {
      position += 1
    }
  }

  return position
}

export function getNodeLastOfTypePosition(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const siblingIndex = getNodeSiblingIndex(node)
  const nodePath = node.path

  if (!nodePath || siblingIndex === null) {
    return null
  }

  let position = 0

  for (const candidate of nodes) {
    const candidateSiblingIndex = candidate.path?.at(-1)

    if (
      candidateSiblingIndex !== undefined &&
      candidateSiblingIndex >= siblingIndex &&
      isSameNodeTypeSibling(candidate, node, nodePath)
    ) {
      position += 1
    }
  }

  return position
}

export function isSameNodeTypeSibling(
  candidate: HtmlSpecimenCssSelectorNode,
  node: HtmlSpecimenCssSelectorNode,
  nodePath: readonly number[],
) {
  return candidate.path !== undefined &&
    candidate.tagName.toLowerCase() === node.tagName.toLowerCase() &&
    hasSameParentPath(candidate.path, nodePath)
}

export function getNodeSiblingIndex(node: HtmlSpecimenCssSelectorNode) {
  if (!node.path || node.path.length === 0) {
    return null
  }

  return node.path.at(-1) ?? null
}

export function getLastNodeSiblingIndex(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const nodePath = node.path
  let lastSiblingIndex = getNodeSiblingIndex(node)

  if (!nodePath || lastSiblingIndex === null) {
    return null
  }

  for (const candidate of nodes) {
    if (!candidate.path || !hasSameParentPath(candidate.path, nodePath)) {
      continue
    }

    const candidateSiblingIndex = candidate.path.at(-1)

    if (
      candidateSiblingIndex !== undefined &&
      candidateSiblingIndex > lastSiblingIndex
    ) {
      lastSiblingIndex = candidateSiblingIndex
    }
  }

  return lastSiblingIndex
}

export function isNodeAncestor(
  candidate: HtmlSpecimenCssSelectorNode,
  node: HtmlSpecimenCssSelectorNode,
) {
  if (!candidate.path || !node.path || candidate.path.length >= node.path.length) {
    return false
  }

  return candidate.path.every((part, index) => part === node.path?.[index])
}

export function hasSameParentPath(
  left: readonly number[],
  right: readonly number[],
) {
  if (left.length !== right.length || left.length === 0) {
    return false
  }

  return left
    .slice(0, -1)
    .every((part, index) => part === right[index])
}

export function getNodeClassSet(node: HtmlSpecimenCssSelectorNode) {
  const cachedClassSet = nodeClassSetCache.get(node)

  if (cachedClassSet) {
    return cachedClassSet
  }

  const classSet = new Set([
    ...node.classList,
    ...(node.attributes.class ?? '').split(/\s+/),
  ].filter((className) => className.length > 0))

  nodeClassSetCache.set(node, classSet)

  return classSet
}
