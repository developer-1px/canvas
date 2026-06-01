import {
  splitHtmlSpecimenCssSelectorList,
  parseCssSelectorSegments,
} from './HtmlSpecimenCssSelectorParser'
import {
  getNodeAncestors,
  getPreviousNodeSibling,
  getPreviousNodeSiblings,
  isNextNodeSibling,
  isNodeAncestor,
  isNodeParent,
  isSubsequentNodeSibling,
} from './HtmlSpecimenCssNodeRelations'
import {
  matchesCompoundSelector,
} from './HtmlSpecimenCssSelectorCompound'
import type {
  CssHasRelativeSelector,
  CssPseudoFunctionSelector,
  CssSelectorRelation,
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function matchesCssHasPseudoFunctionSelector(
  pseudoFunction: CssPseudoFunctionSelector,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const relatives = parseCssHasRelativeSelectors(pseudoFunction.args)

  if (!relatives) {
    return false
  }

  return relatives.some((relative) =>
    nodes.some((candidate) =>
      matchesCssHasRelativeSelectorSegments({
        anchor: node,
        candidate,
        index: relative.segments.length - 1,
        nodes,
        relative,
      })))
}

export function parseCssHasRelativeSelectors(
  args: string,
): CssHasRelativeSelector[] | null {
  const relatives: CssHasRelativeSelector[] = []

  for (const selector of splitHtmlSpecimenCssSelectorList(args)) {
    const relative = parseCssHasRelativeSelector(selector)

    if (!relative) {
      return null
    }

    relatives.push(relative)
  }

  return relatives.length > 0 ? relatives : null
}

function parseCssHasRelativeSelector(
  selector: string,
): CssHasRelativeSelector | null {
  let source = selector.trim()
  let relationToScope: CssSelectorRelation = 'descendant'

  if (source.startsWith('>')) {
    relationToScope = 'child'
    source = source.slice(1).trim()
  } else if (source.startsWith('+')) {
    relationToScope = 'adjacent-sibling'
    source = source.slice(1).trim()
  } else if (source.startsWith('~')) {
    relationToScope = 'subsequent-sibling'
    source = source.slice(1).trim()
  }

  const segments = parseCssSelectorSegments(source)

  return segments && segments.length > 0
    ? {
        relationToScope,
        segments,
      }
    : null
}

function matchesCssHasRelativeSelectorSegments({
  anchor,
  candidate,
  index,
  nodes,
  relative,
}: {
  anchor: HtmlSpecimenCssSelectorNode
  candidate: HtmlSpecimenCssSelectorNode
  index: number
  nodes: readonly HtmlSpecimenCssSelectorNode[]
  relative: CssHasRelativeSelector
}): boolean {
  const segment = relative.segments[index]

  if (
    !segment ||
    !matchesCompoundSelector(segment.compound, candidate, nodes)
  ) {
    return false
  }

  if (index === 0) {
    return matchesCssHasScopeRelation({
      candidate,
      relation: relative.relationToScope,
      scope: anchor,
    })
  }

  const ancestors = getNodeAncestors({ node: candidate, nodes })

  if (segment.relationToPrevious === 'child') {
    const parent = ancestors.at(-1)

    return parent
      ? matchesCssHasRelativeSelectorSegments({
          anchor,
          candidate: parent,
          index: index - 1,
          nodes,
          relative,
        })
      : false
  }

  if (segment.relationToPrevious === 'adjacent-sibling') {
    const sibling = getPreviousNodeSibling({ node: candidate, nodes })

    return sibling
      ? matchesCssHasRelativeSelectorSegments({
          anchor,
          candidate: sibling,
          index: index - 1,
          nodes,
          relative,
        })
      : false
  }

  if (segment.relationToPrevious === 'subsequent-sibling') {
    for (const sibling of getPreviousNodeSiblings({ node: candidate, nodes })) {
      if (matchesCssHasRelativeSelectorSegments({
        anchor,
        candidate: sibling,
        index: index - 1,
        nodes,
        relative,
      })) {
        return true
      }
    }

    return false
  }

  for (let ancestorIndex = ancestors.length - 1; ancestorIndex >= 0; ancestorIndex -= 1) {
    if (matchesCssHasRelativeSelectorSegments({
      anchor,
      candidate: ancestors[ancestorIndex],
      index: index - 1,
      nodes,
      relative,
    })) {
      return true
    }
  }

  return false
}

function matchesCssHasScopeRelation({
  candidate,
  relation,
  scope,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  relation: CssSelectorRelation
  scope: HtmlSpecimenCssSelectorNode
}) {
  switch (relation) {
    case 'adjacent-sibling':
      return isNextNodeSibling({ candidate, node: scope })
    case 'child':
      return isNodeParent(scope, candidate)
    case 'descendant':
      return isNodeAncestor(scope, candidate)
    case 'subsequent-sibling':
      return isSubsequentNodeSibling({ candidate, node: scope })
  }
}
