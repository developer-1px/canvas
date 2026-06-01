import {
  matchHtmlSpecimenCssSelectorList,
  type HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorMatcher'

export function matches(selector: string, node: HtmlSpecimenCssSelectorNode) {
  return matchHtmlSpecimenCssSelectorList(selector, node, [node]) !== null
}

export function createNode({
  attributes = {},
  className,
  id,
  path = [0],
  tagName = 'button',
}: {
  attributes?: Readonly<Record<string, string>>
  className: string
  id: string
  path?: readonly number[]
  tagName?: string
}): HtmlSpecimenCssSelectorNode {
  return {
    attributes: {
      ...attributes,
      class: className,
      id,
    },
    classList: className.split(' '),
    path,
    tagName,
  }
}
