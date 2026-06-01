import type {
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  isHtmlSpecimenItem,
  type HtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import { isHtmlSpecimenCssComputedValueNoOp } from './HtmlSpecimenCssValueNoOp'
import {
  resolveHtmlSpecimenCssDeclarationSource,
  resolveHtmlSpecimenCssInlineStyleSource,
  resolveHtmlSpecimenCssRuleSource,
  resolveHtmlSpecimenCssShorthandConflictSource,
  resolveHtmlSpecimenCssTokenDefinitionSource,
  resolveHtmlSpecimenCssTokenSource,
  type HtmlSpecimenCssDeclarationSource,
  type HtmlSpecimenCssInlineStyleSource,
  type HtmlSpecimenCssRuleSource,
  type HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssEdit'
import {
  formatHtmlSpecimenPreviewNodeSelector,
} from './HtmlSpecimenPreviewNodeLabel'

export type HtmlSpecimenCssControl = {
  computedStyleKey:
    | 'backgroundColor'
    | 'borderColor'
    | 'borderRadius'
    | 'color'
    | 'fontSize'
    | 'margin'
    | 'padding'
  label: string
  property: string
}

export type HtmlSpecimenPreviewFocusData = {
  node: HtmlSpecimenPreviewFocusNode
  nodes: readonly HtmlSpecimenPreviewFocusNode[]
}

export type HtmlSpecimenPreviewFocusNode = HtmlSpecimenVisualCssNode & {
  computedStyle?: Partial<Record<
    HtmlSpecimenCssControl['computedStyleKey'],
    string
  >>
  provenance?: {
    componentId?: string
    sourceId?: string
  }
  text?: string
}

export type HtmlSpecimenCssControlModel = {
  blockedReason: 'inline-style' | 'shorthand-conflict' | 'token-value' | null
  conflictSource: HtmlSpecimenCssDeclarationSource | null
  editable: boolean
  inlineSource: HtmlSpecimenCssInlineStyleSource | null
  source: HtmlSpecimenCssDeclarationSource | null
  ruleSource: HtmlSpecimenCssRuleSource | null
  tokenDefinitionSource: HtmlSpecimenCssDeclarationSource | null
  tokenSource: HtmlSpecimenCssDeclarationSource | null
  value: string
}

export type HtmlSpecimenCssControlEntry = {
  control: HtmlSpecimenCssControl
  model: HtmlSpecimenCssControlModel
}

export type HtmlSpecimenCssInspectorTarget = {
  item: CanvasCustomItem
  node: HtmlSpecimenPreviewFocusData['node']
  nodes: readonly HtmlSpecimenVisualCssNode[]
}

const HTML_SPECIMEN_CSS_CONTROLS: readonly HtmlSpecimenCssControl[] = [
  {
    computedStyleKey: 'color',
    label: 'color',
    property: 'color',
  },
  {
    computedStyleKey: 'backgroundColor',
    label: 'background-color',
    property: 'background-color',
  },
  {
    computedStyleKey: 'borderColor',
    label: 'border-color',
    property: 'border-color',
  },
  {
    computedStyleKey: 'fontSize',
    label: 'font-size',
    property: 'font-size',
  },
  {
    computedStyleKey: 'borderRadius',
    label: 'border-radius',
    property: 'border-radius',
  },
  {
    computedStyleKey: 'padding',
    label: 'padding',
    property: 'padding',
  },
  {
    computedStyleKey: 'margin',
    label: 'margin',
    property: 'margin',
  },
]

export function isHtmlSpecimenCssComputedNoOp({
  property,
  target,
  value,
}: {
  property: string
  target: HtmlSpecimenCssInspectorTarget
  value: string
}) {
  const control = getHtmlSpecimenCssControlByProperty(property)
  const computedValue = control
    ? target.node.computedStyle?.[control.computedStyleKey]?.trim()
    : undefined

  if (!control) {
    return false
  }

  return isHtmlSpecimenCssComputedValueNoOp({
    computedValue,
    property: control.property,
    value,
  })
}

export function getHtmlSpecimenCssControlByProperty(property: string) {
  const normalizedProperty = property.trim().toLowerCase()

  return HTML_SPECIMEN_CSS_CONTROLS.find((control) =>
    control.property === normalizedProperty) ?? null
}

export function getHtmlSpecimenCssInspectorTarget(
  context: CanvasAppInspectorPanelContext,
): HtmlSpecimenCssInspectorTarget | null {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems
  const focus = context.customFocus

  if (
    !item ||
    !isHtmlSpecimenItem(item) ||
    !focus ||
    focus.ownerId !== 'html-specimen' ||
    focus.itemId !== item.id
  ) {
    return null
  }

  const focusData = readHtmlSpecimenPreviewFocusData(focus.data)

  if (!focusData || focusData.node.id !== focus.targetId) {
    return null
  }

  return {
    item,
    node: focusData.node,
    nodes: focusData.nodes,
  }
}

export function getHtmlSpecimenCssControlEntries({
  specimen,
  target,
}: {
  specimen: HtmlSpecimenData
  target: HtmlSpecimenCssInspectorTarget
}): HtmlSpecimenCssControlEntry[] {
  return HTML_SPECIMEN_CSS_CONTROLS.map((control) => ({
    control,
    model: getHtmlSpecimenCssControlModel({
      control,
      specimen,
      target,
    }),
  }))
}

export function formatHtmlSpecimenCssTargetLabel(
  node: HtmlSpecimenPreviewFocusNode,
) {
  return formatHtmlSpecimenPreviewNodeSelector(node)
}

function getHtmlSpecimenCssControlModel({
  control,
  specimen,
  target,
}: {
  control: HtmlSpecimenCssControl
  specimen: HtmlSpecimenData
  target: HtmlSpecimenCssInspectorTarget
}): HtmlSpecimenCssControlModel {
  const mediaContext = {
    viewportHeight: specimen.viewportHeight,
    viewportWidth: specimen.viewportWidth,
  }
  const source = resolveHtmlSpecimenCssDeclarationSource({
    css: specimen.css,
    mediaContext,
    nodeId: target.node.id,
    nodes: target.nodes,
    property: control.property,
  })
  const inlineSource = resolveHtmlSpecimenCssInlineStyleSource({
    css: specimen.css,
    mediaContext,
    nodeId: target.node.id,
    nodes: target.nodes,
    property: control.property,
  })
  const ruleSource = source
    ? null
    : resolveHtmlSpecimenCssRuleSource({
        css: specimen.css,
        mediaContext,
        nodeId: target.node.id,
        nodes: target.nodes,
        property: control.property,
      })
  const tokenSource = resolveHtmlSpecimenCssTokenSource({
    css: specimen.css,
    mediaContext,
    nodeId: target.node.id,
    nodes: target.nodes,
    property: control.property,
  })
  const tokenDefinitionSource = tokenSource
    ? resolveHtmlSpecimenCssTokenDefinitionSource({
        css: specimen.css,
        mediaContext,
        nodeId: target.node.id,
        nodes: target.nodes,
        property: control.property,
      })
    : null
  const conflictSource = tokenSource || tokenDefinitionSource
    ? null
    : resolveHtmlSpecimenCssShorthandConflictSource({
        css: specimen.css,
        mediaContext,
        nodeId: target.node.id,
        nodes: target.nodes,
        property: control.property,
      })
  const blockedReason = inlineSource
    ? 'inline-style'
    : tokenSource && !tokenDefinitionSource
      ? 'token-value'
      : conflictSource
        ? 'shorthand-conflict'
        : null

  return {
    blockedReason,
    conflictSource,
    editable: blockedReason === null && (
      source !== null ||
      ruleSource !== null ||
      tokenDefinitionSource !== null
    ),
    inlineSource,
    ruleSource,
    source,
    tokenDefinitionSource,
    tokenSource,
    value:
      inlineSource?.value ??
      tokenDefinitionSource?.value ??
      tokenSource?.value ??
      source?.value ??
      target.node.computedStyle?.[control.computedStyleKey] ??
      '',
  }
}

function readHtmlSpecimenPreviewFocusData(
  data: unknown,
): HtmlSpecimenPreviewFocusData | null {
  if (!isRecord(data) || !isHtmlSpecimenCssNode(data.node)) {
    return null
  }

  const nodes = Array.isArray(data.nodes)
    ? data.nodes.filter(isHtmlSpecimenCssNode)
    : []

  return nodes.length > 0
    ? {
        node: data.node,
        nodes,
      }
    : null
}

function isHtmlSpecimenCssNode(
  value: unknown,
): value is HtmlSpecimenPreviewFocusNode {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.tagName === 'string' &&
    isRecord(value.attributes) &&
    Array.isArray(value.classList)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
