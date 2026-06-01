import {
  type HtmlSpecimenCssChange,
  type HtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import type {
  HtmlSpecimenCssDeclarationSource,
  HtmlSpecimenCssInlineStyleSource,
  HtmlSpecimenCssRuleSource,
} from './HtmlSpecimenVisualCssEdit'
import type {
  HtmlSpecimenCssControl,
  HtmlSpecimenCssControlEntry,
  HtmlSpecimenCssControlModel,
} from './HtmlSpecimenCssInspectorPanelModel'

type CssPatchPreviewDeclaration = {
  atRule?: string
  important: boolean
  property: string
  selector: string
  value: string
}

export function getHtmlSpecimenStyleRuleSummary(
  controlEntries: readonly HtmlSpecimenCssControlEntry[],
) {
  const entry = controlEntries.find(({ model }) =>
    (model.source ?? model.ruleSource) !== null) ??
    controlEntries.find(({ model }) =>
      getHtmlSpecimenCssControlSourceSelector(model).length > 0)

  if (!entry) {
    return {
      selector: 'element.style',
      source: 'No matching rule',
    }
  }

  const primarySource = entry.model.source ?? entry.model.ruleSource ?? null
  const selector = primarySource
    ? getHtmlSpecimenCssDeclarationSelector(primarySource)
    : getHtmlSpecimenCssControlSourceSelector(entry.model)
  const source = primarySource
    ? formatHtmlSpecimenAffectedNodes(primarySource.affectedNodeIds.length)
    : formatHtmlSpecimenCssControlSource(entry.model)

  return {
    selector,
    source,
  }
}

export function formatHtmlSpecimenCssControlSource(
  model: HtmlSpecimenCssControlModel,
) {
  if (model.blockedReason === 'inline-style' && model.inlineSource) {
    return formatHtmlSpecimenCssInlineSource(model.inlineSource)
  }

  if (model.tokenDefinitionSource) {
    return formatHtmlSpecimenCssSource('token', model.tokenDefinitionSource)
  }

  if (model.blockedReason === 'token-value' && model.tokenSource) {
    return formatHtmlSpecimenCssSource('token', model.tokenSource)
  }

  if (
    model.blockedReason === 'shorthand-conflict' &&
    model.conflictSource
  ) {
    return formatHtmlSpecimenCssSource('conflict', model.conflictSource)
  }

  return model.source
    ? formatHtmlSpecimenCssSource('', model.source)
    : model.ruleSource
      ? formatHtmlSpecimenCssSource('', model.ruleSource)
      : ''
}

export function getHtmlSpecimenCssControlSourceSelector(
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

export function formatHtmlSpecimenCssPatchPreview(
  controlEntries: readonly HtmlSpecimenCssControlEntry[],
) {
  const groups = new Map<string, {
    atRule?: string
    declarations: CssPatchPreviewDeclaration[]
    selector: string
  }>()

  for (const { control, model } of controlEntries) {
    const declaration = getHtmlSpecimenCssPatchPreviewDeclaration({
      control,
      model,
    })

    if (!declaration) {
      continue
    }

    const key = `${declaration.atRule ?? ''}\n${declaration.selector}`
    const group = groups.get(key) ?? {
      atRule: declaration.atRule,
      declarations: [],
      selector: declaration.selector,
    }

    group.declarations.push(declaration)
    groups.set(key, group)
  }

  const preview = [...groups.values()]
    .map(formatHtmlSpecimenCssPatchPreviewGroup)
    .join('\n\n')

  return preview.length > 0 ? preview : 'No stylesheet patch'
}

export function getHtmlSpecimenChanges(specimen: HtmlSpecimenData) {
  return [
    ...(specimen.cssChanges ?? []).map((change) => ({
      key: [
        'css',
        change.atRule ?? '',
        change.selector,
        change.property,
        change.value,
      ].join(':'),
      property: change.property,
      source: formatHtmlSpecimenCssChangeSource(change),
      value: formatHtmlSpecimenCssChangeValue(change),
    })),
    ...(specimen.textChanges ?? []).map((change) => ({
      key: [
        'text',
        change.nodeId,
        change.previousText,
        change.nextText,
      ].join(':'),
      property: 'text',
      source: change.target,
      value: change.nextText,
    })),
  ]
}

export function formatHtmlSpecimenByteCount(bytes: number) {
  return bytes >= 1000 ? `${(bytes / 1000).toFixed(1)} KB` : `${bytes} B`
}

function formatHtmlSpecimenAffectedNodes(count: number) {
  return `${count} affected ${count === 1 ? 'node' : 'nodes'}`
}

function getHtmlSpecimenCssDeclarationSelector(
  source: HtmlSpecimenCssDeclarationSource | HtmlSpecimenCssRuleSource,
) {
  return source.atRule
    ? `${source.atRule} / ${source.selector}`
    : source.selector
}

function getHtmlSpecimenCssPatchPreviewDeclaration({
  control,
  model,
}: {
  control: HtmlSpecimenCssControl
  model: HtmlSpecimenCssControlModel
}): CssPatchPreviewDeclaration | null {
  if (!model.editable) {
    return null
  }

  const source = model.tokenDefinitionSource ?? model.source

  if (source) {
    return {
      atRule: source.atRule,
      important: source.important,
      property: source.property,
      selector: source.selector,
      value: model.value,
    }
  }

  return model.ruleSource
    ? {
        atRule: model.ruleSource.atRule,
        important: false,
        property: control.property,
        selector: model.ruleSource.selector,
        value: model.value,
      }
    : null
}

function formatHtmlSpecimenCssPatchPreviewGroup({
  atRule,
  declarations,
  selector,
}: {
  atRule?: string
  declarations: CssPatchPreviewDeclaration[]
  selector: string
}) {
  const declarationLines = declarations.map((declaration) =>
    `${declaration.property}: ${declaration.value}${
      declaration.important ? ' !important' : ''
    };`)

  if (atRule) {
    return [
      `${atRule} {`,
      `  ${selector} {`,
      ...declarationLines.map((line) => `    ${line}`),
      '  }',
      '}',
    ].join('\n')
  }

  return [
    `${selector} {`,
    ...declarationLines.map((line) => `  ${line}`),
    '}',
  ].join('\n')
}

function formatHtmlSpecimenCssSource(
  prefix: '' | 'conflict' | 'token',
  source: HtmlSpecimenCssDeclarationSource | HtmlSpecimenCssRuleSource,
) {
  const count = source.affectedNodeIds.length
  const sourceLabel = source.atRule
    ? `${formatHtmlSpecimenCssSelector(source.atRule)} / ${
        formatHtmlSpecimenCssSelector(source.selector)
      }`
    : formatHtmlSpecimenCssSelector(source.selector)
  const labelPrefix = prefix ? `${prefix} ` : ''

  return `${labelPrefix}${sourceLabel} · ${count} ${
    count === 1 ? 'node' : 'nodes'
  }`
}

function formatHtmlSpecimenCssInlineSource(
  source: HtmlSpecimenCssInlineStyleSource,
) {
  const count = source.affectedNodeIds.length

  return `inline style · ${count} ${count === 1 ? 'node' : 'nodes'}`
}

function formatHtmlSpecimenCssChangeSource(change: HtmlSpecimenCssChange) {
  const selector = change.atRule
    ? `${formatHtmlSpecimenCssSelector(change.atRule)} / ${
        formatHtmlSpecimenCssSelector(change.selector)
      }`
    : formatHtmlSpecimenCssSelector(change.selector)

  return `${selector} · ${change.affectedNodeCount} ${
    change.affectedNodeCount === 1 ? 'node' : 'nodes'
  }`
}

function formatHtmlSpecimenCssChangeValue(change: HtmlSpecimenCssChange) {
  return `${change.value}${change.kind === 'insert' ? ' +new' : ''}`
}

function formatHtmlSpecimenCssSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim()
}
