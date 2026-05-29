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

  it('matches sibling combinators against indexed DOM paths', () => {
    const nodes = [
      createNode({
        className: 'item first',
        id: 'first',
        path: [0, 0],
      }),
      createNode({
        className: 'item second',
        id: 'second',
        path: [0, 1],
      }),
      createNode({
        className: 'item third',
        id: 'third',
        path: [0, 2],
      }),
      createNode({
        className: 'item loose',
        id: 'loose',
        path: [1, 0],
      }),
    ]

    expect(matchHtmlSpecimenCssSelectorList(
      '.first + .second',
      nodes[1]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.first + .third',
      nodes[2]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.first ~ .third',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.first ~ .loose',
      nodes[3]!,
      nodes,
    )).toBeNull()
  })

  it('matches supported pseudo function selectors', () => {
    const node = createNode({
      attributes: {
        'data-state': 'active',
      },
      className: 'button primary',
      id: 'primary',
    })

    expect(matches(':where(.button)', node)).toBe(true)
    expect(matches('.button:where([data-state="active"])', node)).toBe(true)
    expect(matches(':is(button, a).primary', node)).toBe(true)
    expect(matches(':is(a, .secondary).primary', node)).toBe(false)
    expect(matches('.primary:not(.disabled)', node)).toBe(true)
    expect(matches('.primary:not(.button)', node)).toBe(false)
    expect(matches('.primary:not(:hover)', node)).toBe(false)
    expect(matches('.primary:hover', node)).toBe(false)
    expect(matchHtmlSpecimenCssSelectorList(
      ':where(.button).primary',
      node,
      [node],
    )).toEqual([0, 1, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      ':is(button, .button).primary',
      node,
      [node],
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:not(.disabled)',
      node,
      [node],
    )).toEqual([0, 2, 0])
  })
})

function matches(selector: string, node: HtmlSpecimenCssSelectorNode) {
  return matchHtmlSpecimenCssSelectorList(selector, node, [node]) !== null
}

function createNode({
  attributes = {},
  className,
  id,
  path = [0],
}: {
  attributes?: Readonly<Record<string, string>>
  className: string
  id: string
  path?: readonly number[]
}): HtmlSpecimenCssSelectorNode {
  return {
    attributes: {
      ...attributes,
      class: className,
      id,
    },
    classList: className.split(' '),
    path,
    tagName: 'button',
  }
}
