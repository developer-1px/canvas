import {
  readCssNodeAttribute,
} from './HtmlSpecimenCssNodeAttributes'
import {
  getNodeAncestors,
  isNodeAncestor,
  isNodeParent,
} from './HtmlSpecimenCssNodeRelations'
import type {
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

const CSS_ENABLEABLE_FORM_CONTROL_TAGS = new Set([
  'button',
  'fieldset',
  'input',
  'optgroup',
  'option',
  'select',
  'textarea',
])

export function isEnableableCssFormControl(node: HtmlSpecimenCssSelectorNode) {
  return CSS_ENABLEABLE_FORM_CONTROL_TAGS.has(node.tagName.toLowerCase())
}

export function isCheckedCssFormControl(node: HtmlSpecimenCssSelectorNode) {
  const tagName = node.tagName.toLowerCase()

  if (tagName === 'option') {
    return readCssNodeAttribute(node, 'selected') !== undefined
  }

  if (tagName !== 'input') {
    return false
  }

  const type = readCssNodeAttribute(node, 'type')?.toLowerCase()

  return (type === 'checkbox' || type === 'radio') &&
    readCssNodeAttribute(node, 'checked') !== undefined
}

export function isDisabledCssFormControl(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  if (!isEnableableCssFormControl(node)) {
    return false
  }

  if (readCssNodeAttribute(node, 'disabled') !== undefined) {
    return true
  }

  if (node.tagName.toLowerCase() === 'option' && isInsideDisabledOptgroup(
    node,
    nodes,
  )) {
    return true
  }

  return isInsideDisabledFieldset(node, nodes)
}

function isInsideDisabledOptgroup(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  return getNodeAncestors({ node, nodes }).some((ancestor) =>
    ancestor.tagName.toLowerCase() === 'optgroup' &&
    readCssNodeAttribute(ancestor, 'disabled') !== undefined)
}

function isInsideDisabledFieldset(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  return getNodeAncestors({ node, nodes }).some((ancestor) =>
    ancestor.tagName.toLowerCase() === 'fieldset' &&
    readCssNodeAttribute(ancestor, 'disabled') !== undefined &&
    !isInsideFirstFieldsetLegend({
      fieldset: ancestor,
      node,
      nodes,
    }))
}

function isInsideFirstFieldsetLegend({
  fieldset,
  node,
  nodes,
}: {
  fieldset: HtmlSpecimenCssSelectorNode
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  const firstLegend = getFirstFieldsetLegendChild(fieldset, nodes)

  return firstLegend !== null && isNodeAncestor(firstLegend, node)
}

function getFirstFieldsetLegendChild(
  fieldset: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const legends = nodes
    .filter((candidate) =>
      candidate.tagName.toLowerCase() === 'legend' &&
      isNodeParent(fieldset, candidate))
    .sort((left, right) =>
      (left.path?.at(-1) ?? 0) - (right.path?.at(-1) ?? 0))

  return legends[0] ?? null
}
