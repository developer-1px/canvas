import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'

export type HtmlSpecimenPreviewTarget = {
  itemId: string
  node: PreviewSurfaceNode
  nodeId: string
}

export function createHtmlSpecimenPreviewTarget({
  itemId,
  nodeId,
  nodes,
}: {
  itemId: string
  nodeId: string
  nodes: readonly PreviewSurfaceNode[]
}): HtmlSpecimenPreviewTarget | null {
  const node = nodes.find((candidate) => candidate.id === nodeId)

  return node
    ? {
        itemId,
        node,
        nodeId: node.id,
      }
    : null
}

export function reconcileHtmlSpecimenPreviewTarget({
  itemId,
  nodes,
  previousNodeId,
}: {
  itemId: string
  nodes: readonly PreviewSurfaceNode[]
  previousNodeId: string | null
}) {
  return previousNodeId
    ? createHtmlSpecimenPreviewTarget({
        itemId,
        nodeId: previousNodeId,
        nodes,
      })
    : null
}

export function findHtmlSpecimenPreviewNodeByPath({
  nodes,
  path,
}: {
  nodes: readonly PreviewSurfaceNode[]
  path: readonly number[]
}) {
  return nodes.find((node) => hasSamePath(node.path, path)) ?? null
}

function hasSamePath(
  left: readonly number[],
  right: readonly number[],
) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}
