import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import type {
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function getHtmlSpecimenNodeInheritanceChain({
  node,
  nodes,
}: {
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
}) {
  const chain = [node]

  if (!node.path) {
    return chain
  }

  for (let depth = node.path.length - 1; depth > 0; depth -= 1) {
    const ancestorPath = node.path.slice(0, depth)
    const ancestor = nodes.find((candidate) =>
      areHtmlSpecimenNodePathsEqual(candidate.path, ancestorPath))

    if (ancestor) {
      chain.push(ancestor)
    }
  }

  return chain
}

export function areHtmlSpecimenNodePathsEqual(
  left: readonly number[] | undefined,
  right: readonly number[],
) {
  return left !== undefined &&
    left.length === right.length &&
    left.every((part, index) => part === right[index])
}

export function findNode(
  nodes: readonly HtmlSpecimenVisualCssNode[],
  nodeId: string,
) {
  return nodes.find((node) => node.id === nodeId) ?? null
}

export function getHtmlSpecimenCssMediaContext(
  specimen: HtmlSpecimenData,
): HtmlSpecimenCssMediaContext {
  return {
    viewportHeight: specimen.viewportHeight,
    viewportWidth: specimen.viewportWidth,
  }
}
