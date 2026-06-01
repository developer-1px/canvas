import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  HTML_SPECIMEN_CSS_INSPECTOR_PANEL,
  changeHtmlSpecimenPreviewTargetCss,
  changeHtmlSpecimenPreviewTargetText,
} from './HtmlSpecimenCssInspectorPanel'
import { createButtonSpecimenData } from './HtmlSpecimenCustomItemModel'
import { createContext } from './HtmlSpecimenCssInspectorPanel.testSupport'

describe('HtmlSpecimenCssInspectorPanel', () => {
  it('renders compact CSS controls for the focused preview node', () => {
    const context = createContext()

    expect(HTML_SPECIMEN_CSS_INSPECTOR_PANEL.isVisible?.(context)).toBe(true)

    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('button.primary')
    expect(markup).toContain('color')
    expect(markup).toContain('#ffffff')
    expect(markup).toContain('border-color')
    expect(markup).toContain('font-size')
    expect(markup).toContain('12px')
    expect(markup).toContain('border-radius')
    expect(markup).toContain('margin')
    expect(markup).toContain('0px')
    expect(markup).toContain('.button · 3 nodes')
    expect(markup).toContain('.primary · 1 node')
    expect(markup).toContain('Target')
    expect(markup).toContain('Style')
    expect(markup).toContain('role="tree"')
    expect(markup).toContain('aria-label="button.button.primary CSS"')
    expect(markup).toContain('Patch')
    expect(markup).toContain('Patch actions')
    expect(markup).toContain('Text')
    expect(markup).toContain('Create project')
    expect(markup).toContain('leaf text')
    expect(markup).toContain('Inspect')
    expect(markup).toContain('aria-label="Export HTML"')
    expect(markup).toContain('aria-label="Export CSS"')
    expect(markup).toContain('Apply patch')
    expect(markup).toContain('.primary {')
    expect(markup).toContain('color: #ffffff;')
    expect(markup).toContain('.button {')
    expect(markup).toContain('border-radius: 5px;')
  })

  it('patches element text for the focused preview node', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeHtmlSpecimenPreviewTargetText({
      context,
      nextText: 'Launch project',
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              css: createButtonSpecimenData().css,
              html: expect.stringContaining('>Launch project</button>'),
              textChanges: [
                expect.objectContaining({
                  nextText: 'Launch project',
                  nodeId: 'dom:primary',
                  previousText: 'Create project',
                  target: 'button.button.primary',
                }),
              ],
            }),
          }),
        ],
        type: 'replace-changed',
      },
      {
        after: ['html-specimen-1'],
        before: ['html-specimen-1'],
      },
    )
  })

  it('patches stylesheet text for the focused preview node', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111111',
      property: 'color',
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              cssChanges: [
                expect.objectContaining({
                  affectedNodeCount: 1,
                  kind: 'update',
                  property: 'color',
                  selector: '.primary',
                  value: '#111111',
                }),
              ],
              css: expect.stringContaining('color: #111111;'),
              html: createButtonSpecimenData().html,
            }),
          }),
        ],
        type: 'replace-changed',
      },
      {
        after: ['html-specimen-1'],
        before: ['html-specimen-1'],
      },
    )
  })

  it('adds supported CSS declarations through the shared patch path', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '16px',
      property: 'font-size',
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              css: expect.stringContaining('font-size: 16px;'),
              html: createButtonSpecimenData().html,
            }),
          }),
        ],
        type: 'replace-changed',
      },
      {
        after: ['html-specimen-1'],
        before: ['html-specimen-1'],
      },
    )
  })

  it('skips stylesheet patches for unsupported CSS values', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: 'not-a-size',
      property: 'font-size',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })
})
