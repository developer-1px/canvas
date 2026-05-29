import { describe, expect, it } from 'vitest'
import { htmlSpecimenTextPasteImporter } from './HtmlSpecimenTextPasteImporter'

describe('HtmlSpecimenTextPasteImporter', () => {
  it('creates a centered HTML specimen item from pasted HTML/CSS text', () => {
    const items = htmlSpecimenTextPasteImporter.createItems({
      createId: (prefix) => `${prefix}-1`,
      position: { x: 400, y: 300 },
      text: [
        '```html',
        '<button class="primary">Save</button>',
        '```',
        '```css',
        '.primary { color: white; background: black; }',
        '```',
      ].join('\n'),
      viewport: { scale: 1, x: 0, y: 0 },
    })

    expect(items).toEqual([
      expect.objectContaining({
        id: 'html-specimen-1',
        kind: 'html-specimen',
        presentation: 'html-specimen',
        title: 'HTML specimen',
      }),
    ])
    expect(items?.[0]?.x).toBeLessThan(400)
    expect(items?.[0]?.y).toBeLessThan(300)
    expect(items?.[0]).toMatchObject({
      data: {
        css: '.primary { color: white; background: black; }',
        html: '<button class="primary">Save</button>',
      },
    })
  })

  it('ignores text that is not an HTML specimen artifact', () => {
    expect(htmlSpecimenTextPasteImporter.createItems({
      createId: (prefix) => `${prefix}-1`,
      position: { x: 400, y: 300 },
      text: 'https://example.com',
      viewport: { scale: 1, x: 0, y: 0 },
    })).toBeNull()
  })
})
