import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  isHtmlSpecimenCssSupportedValue,
  shouldValidateHtmlSpecimenCssValue,
} from './HtmlSpecimenCssValueSupport'
import {
  resolveHtmlSpecimenCssDeclarationSource,
} from './HtmlSpecimenVisualCssDeclarationSource'
import {
  resolveHtmlSpecimenCssInlineStyleSource,
} from './HtmlSpecimenVisualCssInlineStyleSource'
import {
  getHtmlSpecimenCssMediaContext,
  findNode,
} from './HtmlSpecimenVisualCssNodeLookup'
import {
  planExistingDeclarationPatch,
  planNewDeclarationPatch,
  serializeHtmlSpecimenCssPatch,
} from './HtmlSpecimenVisualCssPatch'
import {
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  resolveHtmlSpecimenCssShorthandConflictSource,
} from './HtmlSpecimenVisualCssShorthandConflict'
import {
  resolveHtmlSpecimenCssTokenDefinitionSource,
  resolveHtmlSpecimenCssTokenSource,
} from './HtmlSpecimenVisualCssTokenSource'
import type {
  HtmlSpecimenVisualCssEditIntent,
  HtmlSpecimenVisualCssEditResult,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export type {
  HtmlSpecimenCssDeclarationSource,
  HtmlSpecimenCssInlineStyleSource,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenCssPatchPlan,
  HtmlSpecimenCssRuleSource,
  HtmlSpecimenCssScopedRuleSource,
  HtmlSpecimenVisualCssEditIntent,
  HtmlSpecimenVisualCssEditResult,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'
export {
  resolveHtmlSpecimenCssDeclarationSource,
} from './HtmlSpecimenVisualCssDeclarationSource'
export {
  resolveHtmlSpecimenCssInlineStyleSource,
} from './HtmlSpecimenVisualCssInlineStyleSource'
export {
  serializeHtmlSpecimenCssPatch,
} from './HtmlSpecimenVisualCssPatch'
export {
  resolveHtmlSpecimenCssRuleSource,
} from './HtmlSpecimenVisualCssRuleSource'
export {
  resolveHtmlSpecimenCssScopedRuleSource,
} from './HtmlSpecimenVisualCssScopedRuleSource'
export {
  resolveHtmlSpecimenCssShorthandConflictSource,
} from './HtmlSpecimenVisualCssShorthandConflict'
export {
  createHtmlSpecimenShadowPreviewCss,
} from './HtmlSpecimenVisualCssCustomProperties'
export {
  isHtmlSpecimenCssTokenValue,
} from './HtmlSpecimenVisualCssTokenValue'
export {
  resolveHtmlSpecimenCssTokenDefinitionSource,
  resolveHtmlSpecimenCssTokenSource,
} from './HtmlSpecimenVisualCssTokenSource'

export function applyHtmlSpecimenVisualCssEdit({
  intent,
  nodes,
  specimen,
}: {
  intent: HtmlSpecimenVisualCssEditIntent
  nodes: readonly HtmlSpecimenVisualCssNode[]
  specimen: HtmlSpecimenData
}): HtmlSpecimenVisualCssEditResult {
  const node = findNode(nodes, intent.nodeId)
  const mediaContext = getHtmlSpecimenCssMediaContext(specimen)

  if (!node) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'node-not-found',
      specimen,
    }
  }

  if (
    shouldValidateHtmlSpecimenCssValue(intent.property) &&
    !isHtmlSpecimenCssSupportedValue({
      property: intent.property,
      value: intent.nextValue,
    })
  ) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'unsupported-value',
      specimen,
    }
  }

  const previousSource = resolveHtmlSpecimenCssDeclarationSource({
    css: specimen.css,
    mediaContext,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })
  const inlineSource = resolveHtmlSpecimenCssInlineStyleSource({
    css: specimen.css,
    mediaContext,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })

  if (inlineSource) {
    return {
      affectedNodeIds: inlineSource.affectedNodeIds,
      ok: false,
      reason: 'inline-style',
      specimen,
    }
  }

  const tokenSource = resolveHtmlSpecimenCssTokenSource({
    css: specimen.css,
    mediaContext,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })
  const tokenDefinitionSource = tokenSource
    ? resolveHtmlSpecimenCssTokenDefinitionSource({
        css: specimen.css,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })
    : null

  if (tokenSource && !tokenDefinitionSource) {
    return {
      affectedNodeIds: tokenSource.affectedNodeIds,
      ok: false,
      reason: 'token-value',
      specimen,
    }
  }

  const shorthandConflictSource = tokenDefinitionSource
    ? null
    : resolveHtmlSpecimenCssShorthandConflictSource({
        css: specimen.css,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })

  if (shorthandConflictSource) {
    return {
      affectedNodeIds: shorthandConflictSource.affectedNodeIds,
      ok: false,
      reason: 'shorthand-conflict',
      specimen,
    }
  }

  const patchSource = tokenDefinitionSource ?? previousSource
  const patch = patchSource
    ? planExistingDeclarationPatch({
        css: specimen.css,
        mediaContext,
        nextValue: intent.nextValue,
        source: patchSource,
      })
    : planNewDeclarationPatch({
        css: specimen.css,
        mediaContext,
        nextValue: intent.nextValue,
        node,
        nodes,
        property: intent.property,
      })

  if (!patch) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    }
  }

  const patchedCss = serializeHtmlSpecimenCssPatch(specimen.css, patch)
  const nextSpecimen = {
    ...specimen,
    css: patchedCss,
  }
  const source = tokenDefinitionSource
    ? resolveHtmlSpecimenCssTokenDefinitionSource({
        css: patchedCss,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })
    : resolveHtmlSpecimenCssDeclarationSource({
        css: patchedCss,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })
  const verification = {
    actualValue: source?.value ?? null,
    expectedValue: intent.nextValue,
    passed: source?.value === intent.nextValue,
    property: tokenDefinitionSource
      ? source?.property ?? normalizeProperty(intent.property)
      : normalizeProperty(intent.property),
  }

  if (!source || !verification.passed) {
    return {
      affectedNodeIds: source?.affectedNodeIds ?? [],
      ok: false,
      reason: 'verification-failed',
      specimen: nextSpecimen,
    }
  }

  return {
    affectedNodeIds: source.affectedNodeIds,
    ok: true,
    patch,
    previousSource: patchSource,
    serializedCss: patchedCss,
    source,
    specimen: nextSpecimen,
    verification,
  }
}
