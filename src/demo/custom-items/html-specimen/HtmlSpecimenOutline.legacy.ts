import { describe, expect, it } from 'vitest'
import {
  deleteHtmlSpecimenOutlineNode,
  demoteHtmlSpecimenOutlineNode,
  duplicateHtmlSpecimenOutlineNode,
  moveHtmlSpecimenOutlineNode,
  pasteHtmlSpecimenOutlineNodes,
  promoteHtmlSpecimenOutlineNode,
  replaceHtmlSpecimenOutlineText,
  serializeHtmlSpecimenOutline,
  type HtmlSpecimenOutline,
  type HtmlSpecimenOutlineElement,
} from './HtmlSpecimenOutline'

describe('HtmlSpecimenOutline', () => {
  it('edits leaf element text and serializes html', () => {
    const result = replaceHtmlSpecimenOutlineText({
      nextText: 'Launch',
      nodeId: 'dom:a',
      outline: createOutline(),
    })

    expect(result.ok).toBe(true)
    expect(result.ok ? result.previousText : '').toBe('Alpha')
    expect(result.ok ? serializeHtmlSpecimenOutline(result.outline) : '')
      .toContain('<section id="a">Launch</section>')
  })

  it('moves, demotes, and promotes outline nodes', () => {
    const moved = moveHtmlSpecimenOutlineNode({
      direction: 'down',
      nodeId: 'dom:a',
      outline: createOutline(),
    })

    expect(moved.ok ? serializeHtmlSpecimenOutline(moved.outline) : '')
      .toContain('<section id="b">Beta</section><section id="a">Alpha</section>')

    const demoted = demoteHtmlSpecimenOutlineNode({
      nodeId: 'dom:b',
      outline: createOutline(),
    })

    expect(demoted.ok ? serializeHtmlSpecimenOutline(demoted.outline) : '')
      .toContain('<section id="a">Alpha<section id="b">Beta</section></section>')

    const promoted = demoted.ok
      ? promoteHtmlSpecimenOutlineNode({
          nodeId: 'dom:b',
          outline: demoted.outline,
        })
      : demoted

    expect(promoted.ok ? serializeHtmlSpecimenOutline(promoted.outline) : '')
      .toContain('<section id="a">Alpha</section><section id="b">Beta</section>')
  })

  it('duplicates and pastes without carrying duplicate id attributes', () => {
    const duplicated = duplicateHtmlSpecimenOutlineNode({
      nodeId: 'dom:a',
      outline: createOutline(),
    })

    expect(duplicated.ok ? serializeHtmlSpecimenOutline(duplicated.outline) : '')
      .toContain('<section id="a">Alpha</section><section>Alpha</section>')

    const pasted = pasteHtmlSpecimenOutlineNodes({
      mode: 'sibling',
      nodeId: 'dom:b',
      outline: createOutline(),
      payload: [createElement({
        attributes: { id: 'copy' },
        id: 'dom:copy',
        path: [0, 2],
        text: 'Copy',
      })],
    })

    expect(pasted.ok ? serializeHtmlSpecimenOutline(pasted.outline) : '')
      .toContain('<section id="b">Beta</section><section>Copy</section>')
  })

  it('deletes a focused node', () => {
    const result = deleteHtmlSpecimenOutlineNode({
      nodeId: 'dom:a',
      outline: createOutline(),
    })

    expect(result.ok ? serializeHtmlSpecimenOutline(result.outline) : '')
      .not.toContain('id="a"')
  })
})

function createOutline(): HtmlSpecimenOutline {
  return {
    content: [
      createElement({
        attributes: { class: 'specimen' },
        content: [
          createElement({
            attributes: { id: 'a' },
            id: 'dom:a',
            path: [0, 0],
            text: 'Alpha',
          }),
          createElement({
            attributes: { id: 'b' },
            id: 'dom:b',
            path: [0, 1],
            text: 'Beta',
          }),
        ],
        id: 'dom:main:0',
        path: [0],
        tagName: 'main',
      }),
    ],
  }
}

function createElement({
  attributes = {},
  content,
  id,
  path,
  tagName = 'section',
  text,
}: {
  attributes?: Record<string, string>
  content?: HtmlSpecimenOutlineElement['content']
  id: string
  path: number[]
  tagName?: string
  text?: string
}): HtmlSpecimenOutlineElement {
  return {
    attributes,
    content: content ?? (text ? [{ kind: 'text', text }] : []),
    id,
    kind: 'element',
    path,
    tagName,
    voidElement: false,
  }
}
