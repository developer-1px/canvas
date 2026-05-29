import { describe, expect, it } from 'vitest'
import {
  createHtmlSpecimenItemFromPastedText,
} from './HtmlSpecimenPasteItem'

describe('HtmlSpecimenPasteItem', () => {
  it('creates a canvas custom item from pasted HTML/CSS text', () => {
    const item = createHtmlSpecimenItemFromPastedText({
      createId: (prefix) => `${prefix}-1`,
      position: { x: 120, y: 80 },
      text: JSON.stringify({
        css: '.button { background: #2563eb; }',
        html: '<button class="button">Save</button>',
      }),
    })

    expect(item).toMatchObject({
      h: 530,
      id: 'html-specimen-1',
      kind: 'html-specimen',
      presentation: 'html-specimen',
      title: 'HTML specimen',
      type: 'custom',
      w: 800,
      x: 120,
      y: 80,
    })
    expect(item?.data).toMatchObject({
      css: '.button { background: #2563eb; }',
      html: '<button class="button">Save</button>',
      viewportHeight: 486,
      viewportWidth: 760,
    })
  })

  it('uses pasted viewport dimensions to size the item shell', () => {
    const item = createHtmlSpecimenItemFromPastedText({
      createId: (prefix) => `${prefix}-1`,
      position: { x: 0, y: 0 },
      text: JSON.stringify({
        css: '',
        html: '<main></main>',
      }),
      viewport: {
        height: 240,
        width: 320,
      },
    })

    expect(item).toMatchObject({
      h: 284,
      w: 360,
    })
    expect(item?.data).toMatchObject({
      viewportHeight: 240,
      viewportWidth: 320,
    })
  })

  it('returns null when pasted text is not an HTML specimen artifact', () => {
    expect(
      createHtmlSpecimenItemFromPastedText({
        createId: (prefix) => `${prefix}-1`,
        position: { x: 0, y: 0 },
        text: 'plain text',
      }),
    ).toBeNull()
  })
})
