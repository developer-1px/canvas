import { describe, expect, it } from 'vitest'
import { matchHtmlSpecimenCssSelectorList } from './HtmlSpecimenCssSelectorMatcher'
import { createNode } from './HtmlSpecimenCssSelectorMatcher.testSupport'

describe('HtmlSpecimenCssSelectorMatcher structural selectors', () => {
  it('matches structural child pseudo classes against indexed DOM paths', () => {
    const nodes = [
      createNode({
        className: 'item first',
        id: 'first',
        path: [0, 0],
      }),
      createNode({
        className: 'item middle',
        id: 'middle',
        path: [0, 1],
        tagName: 'a',
      }),
      createNode({
        className: 'item last',
        id: 'last',
        path: [0, 2],
      }),
      createNode({
        className: 'item only',
        id: 'only',
        path: [1, 0],
      }),
    ]

    expect(matchHtmlSpecimenCssSelectorList(
      '.item:first-child',
      nodes[0]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:first-child',
      nodes[1]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:last-child',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:only-child',
      nodes[3]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:only-child',
      nodes[0]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-child(2)',
      nodes[1]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-child(odd)',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-child(2n + 1)',
      nodes[0]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-child(-n + 2)',
      nodes[1]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-last-child(1)',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:first-of-type',
      nodes[0]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:first-of-type',
      nodes[2]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:last-of-type',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:only-of-type',
      nodes[1]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-of-type(2)',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-last-of-type(1)',
      nodes[2]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-child(2)',
      nodes[0]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.item:nth-child(foo)',
      nodes[0]!,
      nodes,
    )).toBeNull()
  })

  it('matches has pseudo function selectors against indexed relations', () => {
    const nodes = [
      createNode({
        className: 'card',
        id: 'card',
        path: [0],
        tagName: 'article',
      }),
      createNode({
        className: 'content',
        id: 'content',
        path: [0, 0],
        tagName: 'section',
      }),
      createNode({
        className: 'badge',
        id: 'badge',
        path: [0, 0, 0],
        tagName: 'span',
      }),
      createNode({
        className: 'empty',
        id: 'empty',
        path: [1],
        tagName: 'article',
      }),
      createNode({
        className: 'next',
        id: 'next',
        path: [2],
        tagName: 'article',
      }),
      createNode({
        className: 'content',
        id: 'outer-content',
        path: [3],
        tagName: 'section',
      }),
      createNode({
        className: 'card',
        id: 'nested-card',
        path: [3, 0],
        tagName: 'article',
      }),
      createNode({
        className: 'badge',
        id: 'nested-card-badge',
        path: [3, 0, 0],
        tagName: 'span',
      }),
    ]

    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(.badge)',
      nodes[0]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(> .content)',
      nodes[0]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(.content .badge)',
      nodes[0]!,
      nodes,
    )).toEqual([0, 3, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(> .content .badge)',
      nodes[0]!,
      nodes,
    )).toEqual([0, 3, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(> .badge)',
      nodes[0]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.empty:has(+ .next)',
      nodes[3]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.empty:has(~ .next)',
      nodes[3]!,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(.content .badge)',
      nodes[6]!,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.card:has(:hover)',
      nodes[0]!,
      nodes,
    )).toBeNull()
  })
})
