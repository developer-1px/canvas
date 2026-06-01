export type { HtmlSpecimenCssSelectorNode } from './HtmlSpecimenCssSelectorTypes'
export { splitHtmlSpecimenCssSelectorList } from './HtmlSpecimenCssSelectorParser'
export { compareHtmlSpecimenCssSpecificity } from './HtmlSpecimenCssSpecificity'

import {
  getCssSelectorMatchCache,
  getCssSelectorMatchCacheKey,
  trimCssSelectorCache,
} from './HtmlSpecimenCssSelectorCache'
import {
  splitHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorParser'
import {
  calculateSpecificity,
  compareHtmlSpecimenCssSpecificity,
} from './HtmlSpecimenCssSpecificity'
import {
  matchesSelector,
} from './HtmlSpecimenCssSelectorMatching'
import type {
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function matchHtmlSpecimenCssSelectorList(
  selector: string,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
): [number, number, number] | null {
  const cache = getCssSelectorMatchCache(nodes)
  const cacheKey = getCssSelectorMatchCacheKey({ node, selector })

  if (cache.has(cacheKey)) {
    const cachedMatch = cache.get(cacheKey) ?? null

    if (cachedMatch) {
      cache.delete(cacheKey)
      cache.set(cacheKey, cachedMatch)
    }

    return cachedMatch
  }

  let best: [number, number, number] | null = null

  for (const candidate of splitHtmlSpecimenCssSelectorList(selector)) {
    const selectorPart = candidate.trim()

    if (!matchesSelector(selectorPart, node, nodes)) {
      continue
    }

    const specificity = calculateSpecificity(selectorPart)

    if (!best || compareHtmlSpecimenCssSpecificity(specificity, best) > 0) {
      best = specificity
    }
  }

  cache.set(cacheKey, best)
  trimCssSelectorCache(cache)

  return best
}
