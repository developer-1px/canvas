import {
  cssSpecificityCache,
  rememberCssSelectorCacheValue,
} from './HtmlSpecimenCssSelectorCache'
import {
  readCssAttributeSelectorRanges,
  removeCssAttributeSelectors,
} from './HtmlSpecimenCssAttributeSelectors'
import {
  parseCssSelectorSegments,
  splitHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorParser'
import {
  getSelectorTagName,
  readCssSimpleSelectorNames,
} from './HtmlSpecimenCssSimpleSelectors'
import {
  readCssPseudoSelectors,
  readCssPseudoFunctionSelectors,
  removeCssPseudoSelectors,
} from './HtmlSpecimenCssSelectorPseudo'
import type {
  CssPseudoFunctionSelector,
} from './HtmlSpecimenCssSelectorTypes'

export function compareHtmlSpecimenCssSpecificity(
  left: [number, number, number],
  right: [number, number, number],
) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index]
    }
  }

  return 0
}

export function calculateSpecificity(selector: string): [number, number, number] {
  const cachedSpecificity = cssSpecificityCache.get(selector)

  if (cachedSpecificity) {
    cssSpecificityCache.delete(selector)
    cssSpecificityCache.set(selector, cachedSpecificity)
    return cachedSpecificity
  }

  const pseudoFunctionSpecificity =
    calculateCssPseudoFunctionSpecificity(selector)
  const pseudoSelectors = readCssPseudoSelectors(selector) ?? {
    functions: [],
    stateClasses: [],
    structuralClasses: [],
  }
  const selectorWithoutPseudos = removeCssPseudoSelectors(
    selector,
    [
      ...pseudoSelectors.functions,
      ...pseudoSelectors.stateClasses,
      ...pseudoSelectors.structuralClasses,
    ],
  )
  const selectorWithoutAttributes =
    removeCssAttributeSelectors(selectorWithoutPseudos)
  const attributeCount =
    readCssAttributeSelectorRanges(selectorWithoutPseudos)?.length ?? 0
  const idCount = readCssSimpleSelectorNames(
    selectorWithoutAttributes,
    '#',
  ).length
  const classCount = (
    readCssSimpleSelectorNames(selectorWithoutAttributes, '.').length +
    attributeCount +
    pseudoSelectors.stateClasses.length +
    pseudoSelectors.structuralClasses.length
  )
  const tagCount = selectorWithoutAttributes
    .split(/[\s>+~]+/)
    .filter((part) => getSelectorTagName(part) !== null)
    .length

  const specificity = addHtmlSpecimenCssSpecificity(
    [idCount, classCount, tagCount],
    pseudoFunctionSpecificity,
  )

  return rememberCssSelectorCacheValue(
    cssSpecificityCache,
    selector,
    specificity,
  )
}

function calculateCssPseudoFunctionSpecificity(
  selector: string,
): [number, number, number] {
  const pseudoFunctions = readCssPseudoFunctionSelectors(selector)

  if (!pseudoFunctions) {
    return [0, 0, 0]
  }

  return pseudoFunctions.reduce<[number, number, number]>(
    (specificity, pseudoFunction) =>
      addHtmlSpecimenCssSpecificity(
        specificity,
        calculateSingleCssPseudoFunctionSpecificity(pseudoFunction),
      ),
    [0, 0, 0],
  )
}

function calculateSingleCssPseudoFunctionSpecificity(
  pseudoFunction: CssPseudoFunctionSelector,
): [number, number, number] {
  if (pseudoFunction.name === 'where') {
    return [0, 0, 0]
  }

  let specificity: [number, number, number] = [0, 0, 0]

  for (const selector of splitHtmlSpecimenCssSelectorList(pseudoFunction.args)) {
    const selectorPart = selector.trim()

    if (
      selectorPart.length === 0 ||
      parseCssSelectorSegments(selectorPart) === null
    ) {
      continue
    }

    const candidateSpecificity = calculateSpecificity(selectorPart)

    if (
      compareHtmlSpecimenCssSpecificity(candidateSpecificity, specificity) > 0
    ) {
      specificity = candidateSpecificity
    }
  }

  return specificity
}

function addHtmlSpecimenCssSpecificity(
  left: [number, number, number],
  right: [number, number, number],
): [number, number, number] {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
  ]
}
