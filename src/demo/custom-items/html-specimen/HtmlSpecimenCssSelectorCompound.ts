import {
  matchHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  parseCssAttributeSelectors,
  matchesCssAttributeSelector,
  removeCssAttributeSelectors,
} from './HtmlSpecimenCssAttributeSelectors'
import {
  getNodeClassSet,
  getNodeChildPosition,
  getNodeLastChildPosition,
  getNodeLastOfTypePosition,
  getNodeOfTypePosition,
  isFirstNodeChild,
  isLastNodeChild,
} from './HtmlSpecimenCssNodeRelations'
import {
  isCheckedCssFormControl,
  isDisabledCssFormControl,
  isEnableableCssFormControl,
} from './HtmlSpecimenCssFormControlState'
import {
  parseCssSelectorSegments,
  splitHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorParser'
import {
  getSelectorTagName,
  readCssSimpleSelectorNames,
} from './HtmlSpecimenCssSimpleSelectors'
import {
  hasUnsupportedCssPseudoSelector,
  readCssPseudoSelectors,
  removeCssPseudoSelectors,
} from './HtmlSpecimenCssSelectorPseudo'
import {
  matchesCssNthFormula,
} from './HtmlSpecimenCssNthFormula'
import {
  matchesCssHasPseudoFunctionSelector,
  parseCssHasRelativeSelectors,
} from './HtmlSpecimenCssSelectorHas'
import type {
  CssPseudoFunctionSelector,
  CssStatePseudoClassSelector,
  CssStructuralPseudoClassSelector,
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function matchesCompoundSelector(
  compound: string,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const pseudoSelectors = readCssPseudoSelectors(compound)

  if (!pseudoSelectors) {
    return false
  }

  for (const pseudoFunction of pseudoSelectors.functions) {
    if (!canMatchCssPseudoFunctionSelector(pseudoFunction)) {
      return false
    }

    if (pseudoFunction.name === 'has') {
      if (!matchesCssHasPseudoFunctionSelector(pseudoFunction, node, nodes)) {
        return false
      }

      continue
    }

    const matchesPseudoArgs =
      matchHtmlSpecimenCssSelectorList(pseudoFunction.args, node, nodes) !== null

    if (pseudoFunction.name === 'not') {
      if (matchesPseudoArgs) {
        return false
      }

      continue
    }

    if (!matchesPseudoArgs) {
      return false
    }
  }

  if (!pseudoSelectors.structuralClasses.every((pseudoClass) =>
    matchesCssStructuralPseudoClassSelector(pseudoClass, node, nodes))) {
    return false
  }

  if (!pseudoSelectors.stateClasses.every((pseudoClass) =>
    matchesCssStatePseudoClassSelector(pseudoClass, node, nodes))) {
    return false
  }

  const compoundWithoutPseudos = removeCssPseudoSelectors(
    compound,
    [
      ...pseudoSelectors.functions,
      ...pseudoSelectors.stateClasses,
      ...pseudoSelectors.structuralClasses,
    ],
  )

  if (hasUnsupportedCssPseudoSelector(compoundWithoutPseudos)) {
    return false
  }

  if (
    compoundWithoutPseudos.length === 0 ||
    compoundWithoutPseudos === '*'
  ) {
    return true
  }

  const attributes = parseCssAttributeSelectors(compoundWithoutPseudos)

  if (!attributes) {
    return false
  }

  const simpleCompound = removeCssAttributeSelectors(compoundWithoutPseudos)
  const classNames = readCssSimpleSelectorNames(simpleCompound, '.')
  const ids = readCssSimpleSelectorNames(simpleCompound, '#')
  const nodeClasses = getNodeClassSet(node)
  const nodeId = node.attributes.id ?? ''

  if (ids.some((id) => id !== nodeId)) {
    return false
  }

  if (classNames.some((className) => !nodeClasses.has(className))) {
    return false
  }

  if (!attributes.every((attribute) =>
    matchesCssAttributeSelector(attribute, node))) {
    return false
  }

  const tagName = getSelectorTagName(simpleCompound)

  return tagName === null || tagName === node.tagName.toLowerCase()
}

function canMatchCssPseudoFunctionSelector(
  pseudoFunction: CssPseudoFunctionSelector,
) {
  if (pseudoFunction.name === 'has') {
    return parseCssHasRelativeSelectors(pseudoFunction.args) !== null
  }

  const selectors = splitHtmlSpecimenCssSelectorList(pseudoFunction.args)

  return selectors.length > 0 &&
    selectors.every((selector) => {
      const selectorPart = selector.trim()

      return selectorPart.length > 0 &&
        parseCssSelectorSegments(selectorPart) !== null
    })
}

function matchesCssStructuralPseudoClassSelector(
  pseudoClass: CssStructuralPseudoClassSelector,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  switch (pseudoClass.name) {
    case 'first-child':
      return isFirstNodeChild(node)
    case 'first-of-type':
      return getNodeOfTypePosition(node, nodes) === 1
    case 'last-child':
      return isLastNodeChild(node, nodes)
    case 'last-of-type':
      return getNodeLastOfTypePosition(node, nodes) === 1
    case 'nth-child':
      return matchesCssNthFormula(
        getNodeChildPosition(node),
        pseudoClass.formula,
      )
    case 'nth-last-child':
      return matchesCssNthFormula(
        getNodeLastChildPosition(node, nodes),
        pseudoClass.formula,
      )
    case 'nth-last-of-type':
      return matchesCssNthFormula(
        getNodeLastOfTypePosition(node, nodes),
        pseudoClass.formula,
      )
    case 'nth-of-type':
      return matchesCssNthFormula(
        getNodeOfTypePosition(node, nodes),
        pseudoClass.formula,
      )
    case 'only-child':
      return isFirstNodeChild(node) && isLastNodeChild(node, nodes)
    case 'only-of-type':
      return getNodeOfTypePosition(node, nodes) === 1 &&
        getNodeLastOfTypePosition(node, nodes) === 1
  }
}

function matchesCssStatePseudoClassSelector(
  pseudoClass: CssStatePseudoClassSelector,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  switch (pseudoClass.name) {
    case 'checked':
      return isCheckedCssFormControl(node)
    case 'disabled':
      return isDisabledCssFormControl(node, nodes)
    case 'enabled':
      return isEnableableCssFormControl(node) &&
        !isDisabledCssFormControl(node, nodes)
  }
}
