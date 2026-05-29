import { describe, expect, it } from 'vitest'
import {
  matchHtmlSpecimenCssSelectorList,
  type HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorMatcher'

describe('HtmlSpecimenCssSelectorMatcher', () => {
  it('matches CSS attribute selector operators against DOM attributes', () => {
    const node = createNode({
      attributes: {
        'data-flags': 'primary active',
        'data-kind': 'button-primary',
        'data-label': 'SavePrimaryNow',
        'data-locale': 'en-US',
        'data-tone': 'CRITICAL',
      },
      className: 'button',
      id: 'primary',
    })

    expect(matches('.button[data-flags~="active"]', node)).toBe(true)
    expect(matches('.button[data-locale|="en"]', node)).toBe(true)
    expect(matches('.button[data-kind^="button"]', node)).toBe(true)
    expect(matches('.button[data-kind$="primary"]', node)).toBe(true)
    expect(matches('.button[data-label*="Primary"]', node)).toBe(true)
    expect(matches('.button[data-tone="critical" i]', node)).toBe(true)
    expect(matches('.button[data-flags~="act"]', node)).toBe(false)
    expect(matches('.button[data-locale|="e"]', node)).toBe(false)
    expect(matches('.button[data-tone="critical" s]', node)).toBe(false)
  })

  it('matches escaped class and id selectors against DOM identifiers', () => {
    const node = createNode({
      className: 'button w-[12px] sm:bg-blue-500',
      id: 'primary:action',
    })

    expect(matches('.w-\\[12px\\]', node)).toBe(true)
    expect(matches('.sm\\:bg-blue-500', node)).toBe(true)
    expect(matches('#primary\\:action', node)).toBe(true)
    expect(matches('.w-\\[16px\\]', node)).toBe(false)
    expect(matches('.sm\\:bg-blue-500:hover', node)).toBe(false)
    expect(matchHtmlSpecimenCssSelectorList(
      '.sm\\:bg-blue-500',
      node,
      [node],
    )).toEqual([0, 1, 0])
  })
})

function matches(selector: string, node: HtmlSpecimenCssSelectorNode) {
  return matchHtmlSpecimenCssSelectorList(selector, node, [node]) !== null
}

function createNode({
  attributes = {},
  className,
  id,
}: {
  attributes?: Readonly<Record<string, string>>
  className: string
  id: string
}): HtmlSpecimenCssSelectorNode {
  return {
    attributes: {
      ...attributes,
      class: className,
      id,
    },
    classList: className.split(' '),
    path: [0],
    tagName: 'button',
  }
}
