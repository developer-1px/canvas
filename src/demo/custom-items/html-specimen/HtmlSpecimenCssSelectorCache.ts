import type {
  CssAttributeSelector,
  CssPseudoSelectors,
  CssSelectorSegment,
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export const CSS_SELECTOR_CACHE_LIMIT = 4096
export const cssAttributeSelectorCache = new Map<string, CssAttributeSelector[] | null>()
export const cssAttributeSelectorRangeCache = new Map<string, {
  content: string
  end: number
  start: number
}[] | null>()
export const cssPseudoSelectorCache = new Map<string, CssPseudoSelectors | null>()
export const cssSelectorListCache = new Map<string, string[]>()
export const cssSelectorMatchCache =
  new WeakMap<readonly HtmlSpecimenCssSelectorNode[], Map<
    string,
    [number, number, number] | null
  >>()
export const cssSelectorSegmentCache = new Map<string, CssSelectorSegment[] | null>()
export const cssSimpleSelectorNameCache = new Map<string, string[]>()
export const cssSpecificityCache = new Map<string, [number, number, number]>()
export const nodeClassSetCache = new WeakMap<HtmlSpecimenCssSelectorNode, Set<string>>()

export function rememberCssSelectorCacheValue<T>(
  cache: Map<string, T>,
  key: string,
  value: T,
) {
  cache.set(key, value)

  if (cache.size > CSS_SELECTOR_CACHE_LIMIT) {
    trimCssSelectorCache(cache)
  }

  return value
}

export function trimCssSelectorCache(cache: Map<string, unknown>) {
  while (cache.size > CSS_SELECTOR_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value

    if (oldestKey === undefined) {
      return
    }

    cache.delete(oldestKey)
  }
}

export function getCssSelectorMatchCache(
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const existing = cssSelectorMatchCache.get(nodes)

  if (existing) {
    return existing
  }

  const cache = new Map<string, [number, number, number] | null>()

  cssSelectorMatchCache.set(nodes, cache)

  return cache
}

export function getCssSelectorMatchCacheKey({
  node,
  selector,
}: {
  node: HtmlSpecimenCssSelectorNode
  selector: string
}) {
  const attributes = Object.entries(node.attributes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join('\0')

  return [
    selector,
    node.path?.join('.') ?? '',
    node.tagName,
    node.id ?? '',
    node.classList.join('\0'),
    attributes,
  ].join('\0')
}
