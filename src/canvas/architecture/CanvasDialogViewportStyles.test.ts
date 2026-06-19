import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const CANVAS_APP_CSS = fileURLToPath(
  new URL('../app/shell/CanvasApp.css', import.meta.url),
)

describe('Canvas dialog viewport styles', () => {
  it('keeps modal command surfaces inside short and narrow viewports', () => {
    const source = readFileSync(CANVAS_APP_CSS, 'utf8')

    expect(source).toContain('--canvas-dialog-inset: 14px')
    expect(source).toContain('--canvas-dialog-top: clamp(10px, 10vh, 72px)')
    expect(source).toMatch(/\.command-palette\s*\{[^}]*box-sizing:\s*border-box/)
    expect(source).toMatch(/\.command-palette\s*\{[^}]*grid-template-rows:\s*auto minmax\(0,\s*1fr\)/)
    expect(source).toMatch(/\.command-palette\s*\{[^}]*max-height:\s*calc\(/)
    expect(source).toMatch(/\.command-palette-list\s*\{[^}]*min-height:\s*0/)
    expect(source).toMatch(/\.shortcut-help\s*\{[^}]*box-sizing:\s*border-box/)
    expect(source).toMatch(/\.shortcut-help\s*\{[^}]*grid-template-rows:\s*auto minmax\(0,\s*1fr\)/)
    expect(source).toMatch(/\.shortcut-help\s*\{[^}]*max-height:\s*min\(/)
    expect(source).toMatch(/\.shortcut-help-sections\s*\{[^}]*min-height:\s*0/)
  })
})
