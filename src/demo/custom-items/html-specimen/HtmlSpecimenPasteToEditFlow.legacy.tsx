import { describe, expect, it, vi } from 'vitest'
import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'
import type {
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  HTML_SPECIMEN_CSS_INSPECTOR_PANEL,
  changeHtmlSpecimenPreviewTargetCss,
  changeHtmlSpecimenPreviewTargetText,
} from './HtmlSpecimenCssInspectorPanel'
import { createHtmlSpecimenItemFromPastedText } from './HtmlSpecimenPasteItem'
import {
  createHtmlSpecimenPreviewTarget,
} from './HtmlSpecimenPreviewTarget'
import type { HtmlSpecimenVisualCssNode } from './HtmlSpecimenVisualCssEdit'

describe('HtmlSpecimen paste-to-edit flow', () => {
  it('creates a pasted specimen, focuses a preview node, and patches stylesheet CSS', () => {
    const item = createHtmlSpecimenItemFromPastedText({
      createId: (prefix) => `${prefix}-1`,
      position: { x: 120, y: 80 },
      text: JSON.stringify({
        html: '<main><button id="primary" class="button primary">Save</button></main>',
        css: [
          '.button {',
          '  border-radius: 6px;',
          '}',
          '.primary {',
          '  color: #ffffff;',
          '  background: #2563eb;',
          '}',
        ].join('\n'),
      }),
    })

    if (!item) {
      throw new Error('Expected pasted HTML specimen item')
    }

    const nodes = [createPreviewNode()]
    const target = createHtmlSpecimenPreviewTarget({
      itemId: item.id,
      nodeId: 'dom:primary',
      nodes,
    })

    if (!target) {
      throw new Error('Expected preview target')
    }

    const patchedItems: CanvasCustomItem[] = []
    const commitItemsChange = vi.fn((change) => {
      if (change.type === 'replace-changed') {
        patchedItems.push(change.items[0] as CanvasCustomItem)
      }

      return true
    })
    const context = createInspectorContext({
      commitItemsChange,
      item,
      nodes,
      targetNode: target.node,
    })

    expect(HTML_SPECIMEN_CSS_INSPECTOR_PANEL.isVisible?.(context)).toBe(true)
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111827',
      property: 'background-color',
    })).toBe(true)

    const patchedItem = patchedItems[0]

    expect(patchedItem?.data.html).toBe(item.data.html)
    expect(JSON.stringify(patchedItem?.data.html)).not.toContain('style=')
    expect(patchedItem?.data.css).toContain('background: #111827;')
    expect(patchedItem?.data.css).not.toContain('background-color: #111827;')
    expect(commitItemsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'replace-changed',
      }),
      {
        after: [item.id],
        before: [item.id],
      },
    )
  })

  it('patches pasted specimen HTML text through the same focused node path', () => {
    const item = createHtmlSpecimenItemFromPastedText({
      createId: (prefix) => `${prefix}-1`,
      position: { x: 120, y: 80 },
      text: JSON.stringify({
        html: '<main><button id="primary" class="button primary">Save</button></main>',
        css: '.primary { color: #ffffff; }',
      }),
    })

    if (!item) {
      throw new Error('Expected pasted HTML specimen item')
    }

    const nodes = [createPreviewNode()]
    const target = createHtmlSpecimenPreviewTarget({
      itemId: item.id,
      nodeId: 'dom:primary',
      nodes,
    })

    if (!target) {
      throw new Error('Expected preview target')
    }

    const patchedItems: CanvasCustomItem[] = []
    const commitItemsChange = vi.fn((change) => {
      if (change.type === 'replace-changed') {
        patchedItems.push(change.items[0] as CanvasCustomItem)
      }

      return true
    })
    const context = createInspectorContext({
      commitItemsChange,
      item,
      nodes,
      targetNode: target.node,
    })

    expect(changeHtmlSpecimenPreviewTargetText({
      context,
      nextText: 'Launch',
    })).toBe(true)

    const patchedItem = patchedItems[0]

    expect(patchedItem?.data.html).toContain('>Launch</button>')
    expect(patchedItem?.data.html).not.toContain('>Save</button>')
    expect(patchedItem?.data.css).toBe(item.data.css)
    expect(patchedItem?.data.textChanges).toEqual([
      expect.objectContaining({
        nextText: 'Launch',
        nodeId: 'dom:primary',
        previousText: 'Save',
      }),
    ])
  })
})

function createInspectorContext({
  commitItemsChange,
  item,
  nodes,
  targetNode,
}: {
  commitItemsChange: CanvasAppInspectorPanelContext['commitItemsChange']
  item: CanvasCustomItem
  nodes: readonly HtmlSpecimenVisualCssNode[]
  targetNode: HtmlSpecimenVisualCssNode
}): CanvasAppInspectorPanelContext {
  return {
    bounds: item,
    commitItemsChange,
    customFocus: {
      data: {
        node: targetNode,
        nodes,
      },
      itemId: item.id,
      ownerId: 'html-specimen',
      targetId: targetNode.id,
    },
    disabled: false,
    items: [item],
    label: 'HTML specimen',
    selectedItems: [item],
    selection: [item.id],
  }
}

function createPreviewNode(): PreviewSurfaceNode {
  return {
    attributes: {
      class: 'button primary',
      id: 'primary',
    },
    classList: ['button', 'primary'],
    bounds: { height: 32, width: 84, x: 0, y: 0 },
    computedStyle: {
      backgroundColor: '#2563eb',
      borderColor: 'rgba(0, 0, 0, 0)',
      borderRadius: '6px',
      color: '#ffffff',
      display: 'inline-block',
      fontFamily: 'system-ui',
      fontSize: '14px',
      fontWeight: '700',
      lineHeight: '20px',
      margin: '0px',
      opacity: '1',
      padding: '0px',
      position: 'static',
      transform: 'none',
    },
    id: 'dom:primary',
    path: [0, 0],
    provenance: { kind: 'html' },
    tagName: 'button',
    text: 'Save',
  }
}
