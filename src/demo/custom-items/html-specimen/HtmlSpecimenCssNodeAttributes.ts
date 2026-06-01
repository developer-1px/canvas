import type {
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function readCssNodeAttribute(
  node: HtmlSpecimenCssSelectorNode,
  name: string,
) {
  return node.attributes[name] ?? node.attributes[name.toLowerCase()]
}
