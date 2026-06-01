import { describe, expect, it } from 'vitest'
import {
  createHtmlSpecimenDataFromPastedText,
} from './HtmlSpecimenPasteArtifact'

describe('HtmlSpecimenPasteArtifact', () => {
  it('reads JSON html/css artifacts from pasted text', () => {
    const result = createHtmlSpecimenDataFromPastedText(JSON.stringify({
      css: '.button { color: red; }',
      html: '<button class="button">Save</button>',
    }))

    expect(result).toMatchObject({
      data: {
        css: '.button { color: red; }',
        html: '<button class="button">Save</button>',
        viewportHeight: 486,
        viewportWidth: 760,
      },
      source: 'json',
    })
  })

  it('reads separate markdown html and css fences', () => {
    const result = createHtmlSpecimenDataFromPastedText(`
\`\`\`html
<main><button class="button">Save</button></main>
\`\`\`

\`\`\`css
.button { border-radius: 6px; }
\`\`\`
`)

    expect(result?.source).toBe('markdown-fences')
    expect(result?.data.html).toBe(
      '<main><button class="button">Save</button></main>',
    )
    expect(result?.data.css).toBe('.button { border-radius: 6px; }')
  })

  it('extracts style tags from pasted HTML documents', () => {
    const result = createHtmlSpecimenDataFromPastedText(`<!doctype html>
<html>
  <head>
    <style>.card { padding: 16px; }</style>
  </head>
  <body>
    <article class="card">Hello</article>
  </body>
</html>`)

    expect(result?.source).toBe('html-style')
    expect(result?.data.css).toBe('.card { padding: 16px; }')
    expect(result?.data.html).toBe('<article class="card">Hello</article>')
  })

  it('returns null for pasted text without renderable HTML', () => {
    expect(createHtmlSpecimenDataFromPastedText('plain text only')).toBeNull()
  })
})
