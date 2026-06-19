import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const CANVAS_APP_CSS = fileURLToPath(
  new URL('../app/shell/CanvasApp.css', import.meta.url),
)

describe('Canvas control state styles', () => {
  it('keeps shared canvas controls keyboard focus and active states distinct', () => {
    const source = readFileSync(CANVAS_APP_CSS, 'utf8')

    expect(source).toContain('--canvas-control-focus-ring')
    expect(source).toContain('--canvas-control-active-bg')
    expect(source).toContain(".tool-button[aria-pressed='true']")
    expect(source).toContain(".tool-button[aria-checked='true']")
    expect(source).toContain(".tool-button[data-active='true']:focus-visible")
    expect(source).toContain('.zoom-value:disabled')
    expect(source).not.toMatch(/\.tool-button:focus-visible\s*\{[^}]*outline:\s*0\b/)
  })
})
