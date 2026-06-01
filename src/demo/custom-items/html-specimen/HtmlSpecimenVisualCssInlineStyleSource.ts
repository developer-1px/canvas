import {
  compareCssInlineDeclaration,
} from './HtmlSpecimenVisualCssCascade'
import {
  parseCssDeclarations,
} from './HtmlSpecimenVisualCssDeclarations'
import {
  resolveHtmlSpecimenCssDeclarationMatch,
} from './HtmlSpecimenVisualCssDeclarationMatch'
import {
  getCssInlineStyleSourceProperties,
} from './HtmlSpecimenVisualCssProperties'
import {
  findNode,
} from './HtmlSpecimenVisualCssNodeLookup'
import type {
  CssDeclaration,
  HtmlSpecimenCssInlineStyleSource,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssInlineStyleSource({
  css,
  mediaContext,
  nodeId,
  nodes,
  property,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  nodeId: string
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): HtmlSpecimenCssInlineStyleSource | null {
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const inlineDeclaration = resolveHtmlSpecimenInlineDeclaration({
    node,
    property,
  })

  if (!inlineDeclaration) {
    return null
  }

  if (!inlineDeclaration.important) {
    const stylesheetSource = resolveHtmlSpecimenCssDeclarationMatch({
      css,
      mediaContext,
      node,
      nodes,
      property,
    })

    if (stylesheetSource?.declaration.important) {
      return null
    }
  }

  return {
    affectedNodeIds: [node.id],
    important: inlineDeclaration.important,
    property: inlineDeclaration.property,
    value: inlineDeclaration.value,
  }
}

export function hasHtmlSpecimenWinningInlineStyleSource({
  css,
  mediaContext,
  node,
  nodes,
  properties,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  properties: Iterable<string>
}) {
  return Array.from(properties).some((property) =>
    resolveHtmlSpecimenCssInlineStyleSource({
      css,
      mediaContext,
      nodeId: node.id,
      nodes,
      property,
    }) !== null)
}

export function resolveHtmlSpecimenInlineDeclaration({
  node,
  property,
}: {
  node: HtmlSpecimenVisualCssNode
  property: string
}) {
  const style = node.attributes.style

  if (!style) {
    return null
  }

  const declarations = parseCssDeclarations({
    blockEnd: style.length + 1,
    blockStart: 1,
    css: `{${style}}`,
  })
  const properties = new Set(getCssInlineStyleSourceProperties(property))
  let winner: CssDeclaration | null = null

  for (const declaration of declarations) {
    if (!properties.has(declaration.property)) {
      continue
    }

    if (!winner || compareCssInlineDeclaration(declaration, winner) > 0) {
      winner = declaration
    }
  }

  return winner
}
