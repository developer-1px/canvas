import {
  advanceCssScannerState,
  createCssScannerState,
  isCssIdentifierChar,
  isCssScannerTopLevel,
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import {
  findMatchingBrace,
} from './HtmlSpecimenVisualCssDeclarations'
import type {
  CssCascadeLayer,
  CssLayerRegistry,
} from './HtmlSpecimenVisualCssTypes'

export function createCssLayerRegistry(css: string): CssLayerRegistry {
  const layers = new Map<string, CssCascadeLayer>()
  let nextOrder = 0

  const getOrCreateLayer = (name: string): CssCascadeLayer => {
    const existing = layers.get(name)

    if (existing) {
      return existing
    }

    const layer = {
      name,
      order: nextOrder,
    }

    nextOrder += 1
    layers.set(name, layer)

    return layer
  }

  collectCssLayerOrderDeclarations(css, getOrCreateLayer)

  return {
    createAnonymousLayer() {
      const layer = {
        name: `(anonymous ${nextOrder})`,
        order: nextOrder,
      }

      nextOrder += 1

      return layer
    },
    getOrCreateLayer,
  }
}

export function collectCssLayerOrderDeclarations(
  css: string,
  getOrCreateLayer: (name: string) => CssCascadeLayer,
) {
  const scanner = createCssScannerState()
  let index = 0

  while (index < css.length) {
    if (isCssScannerTopLevel(scanner) && isCssLayerKeywordAt(css, index)) {
      const preludeStart = index + '@layer'.length
      const terminator = findCssAtRulePreludeTerminator(css, preludeStart)

      if (!terminator) {
        return
      }

      for (const name of splitCssLayerNameList(
        stripCssComments(css.slice(preludeStart, terminator.index)).trim(),
      )) {
        getOrCreateLayer(name)
      }

      if (terminator.kind === 'block') {
        const blockEnd = findMatchingBrace(css, terminator.index)

        index = blockEnd >= 0 ? blockEnd + 1 : terminator.index + 1
        continue
      }

      index = terminator.index + 1
      continue
    }

    index = advanceCssScannerState(css, index, scanner)
  }
}

export function resolveCssAtRuleLayer({
  atRule,
  blockStart,
  layer,
  layerRegistry,
}: {
  atRule: string
  blockStart: number
  layer: CssCascadeLayer | null
  layerRegistry: CssLayerRegistry
}) {
  if (!isCssLayerAtRule(atRule)) {
    return layer
  }

  const names = splitCssLayerNameList(
    stripCssComments(atRule.slice('@layer'.length)).trim(),
  )

  if (names.length === 0) {
    return layerRegistry.createAnonymousLayer()
  }

  const name = layer ? `${layer.name}.${names[0]}` : names[0]

  return layerRegistry.getOrCreateLayer(name ?? `(anonymous ${blockStart})`)
}

export function isCssLayerAtRule(atRule: string) {
  return isCssLayerKeywordAt(stripCssComments(atRule).trim(), 0)
}

export function isCssLayerKeywordAt(source: string, index: number) {
  return source.slice(index, index + '@layer'.length).toLowerCase() ===
    '@layer' &&
    !isCssIdentifierChar(source[index + '@layer'.length] ?? '')
}

export function findCssAtRulePreludeTerminator(css: string, start: number) {
  const scanner = createCssScannerState()
  let index = start

  while (index < css.length) {
    if (isCssScannerTopLevel(scanner)) {
      if (css[index] === ';') {
        return {
          index,
          kind: 'statement' as const,
        }
      }

      if (css[index] === '{') {
        return {
          index,
          kind: 'block' as const,
        }
      }
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return null
}

export function splitCssLayerNameList(source: string) {
  const names: string[] = []
  const scanner = createCssScannerState()
  let start = 0
  let index = 0

  while (index < source.length) {
    if (source[index] === ',' && isCssScannerTopLevel(scanner)) {
      appendCssLayerName(names, source.slice(start, index))
      start = index + 1
      index += 1
      continue
    }

    index = advanceCssScannerState(source, index, scanner)
  }

  appendCssLayerName(names, source.slice(start))

  return names
}

export function appendCssLayerName(names: string[], rawName: string) {
  const name = rawName.trim()

  if (/^[a-z_][\w-]*(?:\.[a-z_][\w-]*)*$/i.test(name)) {
    names.push(name)
  }
}

export function findCssRulePreludeStart(
  css: string,
  start: number,
  end: number,
) {
  const scanner = createCssScannerState()
  let preludeStart = start
  let index = start

  while (index < end) {
    if (css[index] === ';' && isCssScannerTopLevel(scanner)) {
      preludeStart = index + 1
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return preludeStart
}
