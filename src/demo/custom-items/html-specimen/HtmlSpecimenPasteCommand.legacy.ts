import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasAppCustomCommandContext,
} from '../../../canvas'
import {
  createHtmlSpecimenPasteCommand,
  runHtmlSpecimenPasteCommand,
} from './HtmlSpecimenPasteCommand'

describe('HtmlSpecimenPasteCommand', () => {
  it('creates an HTML specimen item from clipboard text', async () => {
    const context = createCommandContext()

    await runHtmlSpecimenPasteCommand({
      context,
      readText: async () => JSON.stringify({
        css: '.button { color: red; }',
        html: '<button class="button">Save</button>',
      }),
    })

    expect(context.commitItemsChange).toHaveBeenCalledWith({
      items: [
        expect.objectContaining({
          data: expect.objectContaining({
            css: '.button { color: red; }',
            html: '<button class="button">Save</button>',
          }),
          id: 'html-specimen-1',
          kind: 'html-specimen',
          type: 'custom',
          x: 0,
          y: 72,
        }),
      ],
      type: 'add',
    }, {
      after: ['html-specimen-1'],
      before: [],
    })
  })

  it('skips non-renderable clipboard text', async () => {
    const context = createCommandContext()

    await runHtmlSpecimenPasteCommand({
      context,
      readText: async () => 'plain text',
    })

    expect(context.commitItemsChange).not.toHaveBeenCalled()
  })

  it('exposes a custom command descriptor for the command palette', () => {
    const command = createHtmlSpecimenPasteCommand({
      readText: async () => null,
    })

    expect(command).toMatchObject({
      id: 'paste-html-specimen',
      label: 'Paste HTML',
      title: 'Paste HTML specimen',
    })
    expect(command.isEnabled?.(createCommandContext())).toBe(true)
  })
})

function createCommandContext(): CanvasAppCustomCommandContext {
  return {
    commitItemsChange: vi.fn(),
    commitSelection: vi.fn(),
    createId: (prefix) => `${prefix}-1`,
    items: [],
    selection: [],
    setEditing: vi.fn(),
    viewport: {
      scale: 1,
      x: 80,
      y: 8,
    },
  }
}
