import {
  matchesCssMediaQuery,
  splitCssMediaQueryList,
} from './HtmlSpecimenVisualCssMediaQueries'
import {
  matchesCssSupportsRule,
} from './HtmlSpecimenVisualCssSupports'
import {
  isCssIdentifierChar,
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import {
  isCssLayerAtRule,
} from './HtmlSpecimenVisualCssLayers'
import type { HtmlSpecimenCssMediaContext } from './HtmlSpecimenVisualCssTypes'

export function formatNestedCssAtRule(parent: string | null, atRule: string) {
  return parent ? `${parent} / ${atRule}` : atRule
}

export function isCssAtRuleActive(
  atRule: string,
  mediaContext: HtmlSpecimenCssMediaContext | undefined,
) {
  const source = stripCssComments(atRule).trim()

  if (isCssAtRuleKeyword(source, '@media')) {
    if (!mediaContext) {
      return true
    }

    const queryList = source.slice('@media'.length).trim()

    return splitCssMediaQueryList(queryList).some((query) =>
      matchesCssMediaQuery(query, mediaContext))
  }

  if (isCssAtRuleKeyword(source, '@supports')) {
    return matchesCssSupportsRule(source) ?? false
  }

  if (isCssLayerAtRule(source)) {
    return true
  }

  return false
}

export function isCssAtRuleKeyword(source: string, keyword: string) {
  return source.slice(0, keyword.length).toLowerCase() === keyword &&
    !isCssIdentifierChar(source[keyword.length] ?? '')
}
