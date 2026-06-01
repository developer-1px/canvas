import {
  findMatchingBrace,
  parseCssDeclarations,
} from './HtmlSpecimenVisualCssDeclarations'
import {
  createCssLayerRegistry,
  findCssRulePreludeStart,
  resolveCssAtRuleLayer,
} from './HtmlSpecimenVisualCssLayers'
import {
  findNextCssBlockStart,
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import {
  formatNestedCssAtRule,
  isCssAtRuleActive,
} from './HtmlSpecimenVisualCssAtRules'
import type {
  CssCascadeLayer,
  CssLayerRegistry,
  CssRule,
  HtmlSpecimenCssMediaContext,
} from './HtmlSpecimenVisualCssTypes'

const CSS_RULE_CACHE_LIMIT = 8

const cssRuleCache = new Map<string, CssRule[]>()

export function parseCssRules(
  css: string,
  mediaContext?: HtmlSpecimenCssMediaContext,
): CssRule[] {
  const cacheKey = getCssRuleCacheKey({ css, mediaContext })
  const cachedRules = cssRuleCache.get(cacheKey)

  if (cachedRules) {
    cssRuleCache.delete(cacheKey)
    cssRuleCache.set(cacheKey, cachedRules)
    return cachedRules
  }

  const rules: CssRule[] = []
  const layerRegistry = createCssLayerRegistry(css)

  collectCssRules({
    atRule: null,
    css,
    end: css.length,
    layer: null,
    layerRegistry,
    mediaContext,
    rules,
    start: 0,
  })

  cssRuleCache.set(cacheKey, rules)
  trimCssRuleCache()

  return rules
}

export function getCssRuleCacheKey({
  css,
  mediaContext,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
}) {
  return [
    mediaContext?.viewportWidth ?? '',
    mediaContext?.viewportHeight ?? '',
    css,
  ].join('\0')
}

export function trimCssRuleCache() {
  while (cssRuleCache.size > CSS_RULE_CACHE_LIMIT) {
    const oldestKey = cssRuleCache.keys().next().value

    if (oldestKey === undefined) {
      return
    }

    cssRuleCache.delete(oldestKey)
  }
}

export function collectCssRules({
  atRule,
  css,
  end,
  layer,
  layerRegistry,
  mediaContext,
  rules,
  start,
}: {
  atRule: string | null
  css: string
  end: number
  layer: CssCascadeLayer | null
  layerRegistry: CssLayerRegistry
  mediaContext?: HtmlSpecimenCssMediaContext
  rules: CssRule[]
  start: number
}) {
  let cursor = start

  while (cursor < end) {
    const blockStart = findNextCssBlockStart(css, cursor, end)

    if (blockStart < 0) {
      break
    }

    const blockEnd = findMatchingBrace(css, blockStart, end)

    if (blockEnd < 0) {
      break
    }

    const preludeStart = findCssRulePreludeStart(css, cursor, blockStart)
    const selector = stripCssComments(css.slice(preludeStart, blockStart)).trim()

    if (selector.startsWith('@')) {
      if (isCssAtRuleActive(selector, mediaContext)) {
        const ruleLayer = resolveCssAtRuleLayer({
          atRule: selector,
          blockStart,
          layer,
          layerRegistry,
        })

        collectCssRules({
          atRule: formatNestedCssAtRule(atRule, selector),
          css,
          end: blockEnd,
          layer: ruleLayer,
          layerRegistry,
          mediaContext,
          rules,
          start: blockStart + 1,
        })
      }
    } else if (selector.length > 0) {
      rules.push({
        atRule,
        blockEnd,
        declarations: parseCssDeclarations({
          blockEnd,
          blockStart: blockStart + 1,
          css,
        }),
        layer,
        ruleIndex: rules.length,
        selector,
      })
    }

    cursor = blockEnd + 1
  }
}
