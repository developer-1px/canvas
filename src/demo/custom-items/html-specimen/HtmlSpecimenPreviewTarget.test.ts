import { describe, expect, it } from 'vitest'
import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'
import {
  createHtmlSpecimenPreviewTarget,
  findHtmlSpecimenPreviewNodeByPath,
} from './HtmlSpecimenPreviewTarget'

describe('HtmlSpecimenPreviewTarget', () => {
  it('creates a preview target from an indexed node id', () => {
    const node = createNode({
      id: 'dom:button:0/1',
      path: [0, 1],
      tagName: 'button',
    })

    expect(createHtmlSpecimenPreviewTarget({
      itemId: 'html-specimen-1',
      nodeId: 'dom:button:0/1',
      nodes: [node],
    })).toEqual({
      itemId: 'html-specimen-1',
      node,
      nodeId: 'dom:button:0/1',
    })
  })

  it('finds preview nodes by DOM path', () => {
    const button = createNode({
      id: 'dom:button:0/1',
      path: [0, 1],
      tagName: 'button',
    })

    expect(findHtmlSpecimenPreviewNodeByPath({
      nodes: [
        createNode({ id: 'dom:main:0', path: [0], tagName: 'main' }),
        button,
      ],
      path: [0, 1],
    })).toBe(button)
    expect(findHtmlSpecimenPreviewNodeByPath({
      nodes: [button],
      path: [1, 0],
    })).toBeNull()
  })
})

function createNode({
  id,
  path,
  tagName,
}: {
  id: string
  path: readonly number[]
  tagName: string
}): PreviewSurfaceNode {
  return {
    attributes: {},
    bounds: { height: 0, width: 0, x: 0, y: 0 },
    classList: [],
    computedStyle: {
      backgroundColor: '',
      borderColor: '',
      borderRadius: '',
      color: '',
      display: '',
      fontFamily: '',
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      margin: '',
      opacity: '',
      padding: '',
      position: '',
      transform: '',
    },
    id,
    path,
    provenance: { kind: 'html' },
    tagName,
    text: '',
  }
}
