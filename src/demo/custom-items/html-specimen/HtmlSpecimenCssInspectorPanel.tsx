import type { KeyboardEvent } from 'react'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  getHtmlSpecimenData,
  isHtmlSpecimenItem,
} from './HtmlSpecimenCustomItemModel'
import { isHtmlSpecimenCssComputedValueNoOp } from './HtmlSpecimenCssValueNoOp'
import {
  applyHtmlSpecimenVisualCssEdit,
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

type HtmlSpecimenCssControl = {
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

type HtmlSpecimenPreviewFocusData = {
  node: HtmlSpecimenVisualCssNode & {
    computedStyle?: Partial<Record<HtmlSpecimenCssControl['computedStyleKey'], string>>
  }
  nodes: readonly HtmlSpecimenVisualCssNode[]
}

type HtmlSpecimenCssControlModel = {
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

const HTML_SPECIMEN_CSS_CONTROLS: readonly HtmlSpecimenCssControl[] = [
  {
    computedStyleKey: 'color',
    label: 'Text',
    property: 'color',
  },
  {
    computedStyleKey: 'backgroundColor',
    label: 'Bg',
    property: 'background-color',
  },
  {
    computedStyleKey: 'borderColor',
    label: 'Stroke',
    property: 'border-color',
  },
  {
    computedStyleKey: 'fontSize',
    label: 'Font',
    property: 'font-size',
  },
  {
    computedStyleKey: 'borderRadius',
    label: 'Radius',
    property: 'border-radius',
  },
  {
    computedStyleKey: 'padding',
    label: 'Pad',
    property: 'padding',
  },
  {
    computedStyleKey: 'margin',
    label: 'Margin',
    property: 'margin',
  },
]

export const HTML_SPECIMEN_CSS_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'html-specimen-css',
  isVisible: (context) => getHtmlSpecimenCssInspectorTarget(context) !== null,
  render: (context) => {
    const target = getHtmlSpecimenCssInspectorTarget(context)

    return target
      ? renderHtmlSpecimenCssInspector({
          context,
          target,
        })
      : null
  },
}

export function changeHtmlSpecimenPreviewTargetCss({
  context,
  nextValue,
  property,
}: {
  context: CanvasAppInspectorPanelContext
  nextValue: string
  property: string
}) {
  const target = getHtmlSpecimenCssInspectorTarget(context)
  const value = nextValue.trim()

  if (
    context.disabled ||
    !target ||
    value.length === 0 ||
    !getHtmlSpecimenCssControlByProperty(property)
  ) {
    return false
  }

  if (isHtmlSpecimenCssComputedNoOp({
    property,
    target,
    value,
  })) {
    return false
  }

  const result = applyHtmlSpecimenVisualCssEdit({
    intent: {
      nextValue: value,
      nodeId: target.node.id,
      property,
    },
    nodes: target.nodes,
    specimen: getHtmlSpecimenData(target.item),
  })

  if (!result.ok) {
    return false
  }

  const nextItems = (context.items ?? context.selectedItems).map((item) =>
    item.id === target.item.id
      ? {
          ...target.item,
          data: result.specimen,
        }
      : item,
  )

  return context.commitItemsChange({
    items: nextItems,
    type: 'replace-changed',
  }, {
    after: context.selection,
    before: context.selection,
  })
}

function isHtmlSpecimenCssComputedNoOp({
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

function getHtmlSpecimenCssControlByProperty(property: string) {
  const normalizedProperty = property.trim().toLowerCase()

  return HTML_SPECIMEN_CSS_CONTROLS.find((control) =>
    control.property === normalizedProperty) ?? null
}

function renderHtmlSpecimenCssInspector({
  context,
  target,
}: {
  context: CanvasAppInspectorPanelContext
  target: HtmlSpecimenCssInspectorTarget
}) {
  return (
    <div className="html-specimen-css-inspector">
      <div className="html-specimen-css-target">
        {formatHtmlSpecimenCssTargetLabel(target.node)}
      </div>
      {HTML_SPECIMEN_CSS_CONTROLS.map((control) => {
        const model = getHtmlSpecimenCssControlModel({ control, target })
        const sourceSelector = getHtmlSpecimenCssControlSourceSelector(model)

        return (
          <label
            className="html-specimen-css-field"
            data-editable={model.editable}
            key={control.property}
          >
            <span className="html-specimen-css-field-label">
              {control.label}
            </span>
            <input
              key={`${target.node.id}:${control.property}:${model.value}`}
              defaultValue={model.value}
              disabled={context.disabled || !model.editable}
              onBlur={(event) =>
                changeHtmlSpecimenPreviewTargetCss({
                  context,
                  nextValue: event.currentTarget.value,
                  property: control.property,
                })}
              onKeyDown={(event) =>
                handleHtmlSpecimenCssFieldKeyDown(event, model.value)}
              spellCheck={false}
              type="text"
            />
            {sourceSelector ? (
              <span
                className="html-specimen-css-source"
                title={sourceSelector}
              >
                {formatHtmlSpecimenCssControlSource(model)}
              </span>
            ) : (
              <span className="html-specimen-css-source">
                No matching rule
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
}

function getHtmlSpecimenCssInspectorTarget(
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

type HtmlSpecimenCssInspectorTarget = {
  item: CanvasCustomItem
  node: HtmlSpecimenPreviewFocusData['node']
  nodes: readonly HtmlSpecimenVisualCssNode[]
}

function getHtmlSpecimenCssControlModel({
  control,
  target,
}: {
  control: HtmlSpecimenCssControl
  target: HtmlSpecimenCssInspectorTarget
}): HtmlSpecimenCssControlModel {
  const specimen = getHtmlSpecimenData(target.item)
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

function isHtmlSpecimenCssNode(value: unknown): value is HtmlSpecimenVisualCssNode {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.tagName === 'string' &&
    isRecord(value.attributes) &&
    Array.isArray(value.classList)
  )
}

function formatHtmlSpecimenCssTargetLabel(
  node: HtmlSpecimenVisualCssNode,
) {
  const classes = node.classList.length > 0
    ? `.${node.classList.join('.')}`
    : ''

  return `${node.tagName}${classes}`
}

function formatHtmlSpecimenCssControlSource(
  model: HtmlSpecimenCssControlModel,
) {
  if (model.blockedReason === 'inline-style' && model.inlineSource) {
    return formatHtmlSpecimenCssInlineSource(model.inlineSource)
  }

  if (model.tokenDefinitionSource) {
    return formatHtmlSpecimenCssSource('Token', model.tokenDefinitionSource)
  }

  if (model.blockedReason === 'token-value' && model.tokenSource) {
    return formatHtmlSpecimenCssSource('Token', model.tokenSource)
  }

  if (
    model.blockedReason === 'shorthand-conflict' &&
    model.conflictSource
  ) {
    return formatHtmlSpecimenCssSource('Conflict', model.conflictSource)
  }

  return model.source
    ? formatHtmlSpecimenCssSource('Rule', model.source)
    : model.ruleSource
      ? formatHtmlSpecimenCssSource('Add', model.ruleSource)
      : ''
}

function getHtmlSpecimenCssControlSourceSelector(
  model: HtmlSpecimenCssControlModel,
) {
  const source = (
    model.inlineSource ??
    model.tokenDefinitionSource ??
    model.source ??
    model.ruleSource ??
    model.tokenSource ??
    model.conflictSource
  )

  if (!source) {
    return ''
  }

  if (!('selector' in source)) {
    return 'style'
  }

  return source.atRule
    ? `${source.atRule} / ${source.selector}`
    : source.selector
}

function formatHtmlSpecimenCssSource(
  prefix: 'Add' | 'Conflict' | 'Rule' | 'Token',
  source: HtmlSpecimenCssDeclarationSource | HtmlSpecimenCssRuleSource,
) {
  const count = source.affectedNodeIds.length
  const sourceLabel = source.atRule
    ? `${formatHtmlSpecimenCssSelector(source.atRule)} / ${
        formatHtmlSpecimenCssSelector(source.selector)
      }`
    : formatHtmlSpecimenCssSelector(source.selector)
  const labelPrefix = prefix === 'Rule' && source.atRule ? 'Scoped' : prefix

  return `${labelPrefix} ${sourceLabel} / ${count} ${
    count === 1 ? 'node' : 'nodes'
  }`
}

function formatHtmlSpecimenCssInlineSource(
  source: HtmlSpecimenCssInlineStyleSource,
) {
  const count = source.affectedNodeIds.length

  return `Inline style / ${count} ${count === 1 ? 'node' : 'nodes'}`
}

function formatHtmlSpecimenCssSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim()
}

function handleHtmlSpecimenCssFieldKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  value: string,
) {
  if (event.key === 'Enter') {
    event.currentTarget.blur()
    return
  }

  if (event.key === 'Escape') {
    event.currentTarget.value = value
    event.currentTarget.blur()
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
