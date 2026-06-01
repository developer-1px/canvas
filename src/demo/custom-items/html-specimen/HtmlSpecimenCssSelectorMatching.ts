import {
  matchesCompoundSelector,
} from './HtmlSpecimenCssSelectorCompound'
import {
  getNodeAncestors,
  getPreviousNodeSibling,
  getPreviousNodeSiblings,
} from './HtmlSpecimenCssNodeRelations'
import {
  parseCssSelectorSegments,
} from './HtmlSpecimenCssSelectorParser'
import type {
  CssSelectorSegment,
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function matchesSelector(
  selector: string,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const segments = parseCssSelectorSegments(selector)

  return segments !== null &&
    segments.length > 0 &&
    matchesCssSelectorSegment({
      index: segments.length - 1,
      node,
      nodes,
      segments,
    })
}

function matchesCssSelectorSegment({
  index,
  node,
  nodes,
  segments,
}: {
  index: number
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
  segments: readonly CssSelectorSegment[]
}): boolean {
  const segment = segments[index]

  if (!segment || !matchesCompoundSelector(segment.compound, node, nodes)) {
    return false
  }

  if (index === 0) {
    return true
  }

  const ancestors = getNodeAncestors({ node, nodes })

  if (segment.relationToPrevious === 'child') {
    const parent = ancestors.at(-1)

    return parent
      ? matchesCssSelectorSegment({
          index: index - 1,
          node: parent,
          nodes,
          segments,
        })
      : false
  }

  if (segment.relationToPrevious === 'adjacent-sibling') {
    const sibling = getPreviousNodeSibling({ node, nodes })

    return sibling
      ? matchesCssSelectorSegment({
          index: index - 1,
          node: sibling,
          nodes,
          segments,
        })
      : false
  }

  if (segment.relationToPrevious === 'subsequent-sibling') {
    for (const sibling of getPreviousNodeSiblings({ node, nodes })) {
      if (matchesCssSelectorSegment({
        index: index - 1,
        node: sibling,
        nodes,
        segments,
      })) {
        return true
      }
    }

    return false
  }

  for (let ancestorIndex = ancestors.length - 1; ancestorIndex >= 0; ancestorIndex -= 1) {
    if (matchesCssSelectorSegment({
      index: index - 1,
      node: ancestors[ancestorIndex],
      nodes,
      segments,
    })) {
      return true
    }
  }

  return false
}
