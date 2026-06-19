import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const HERE = fileURLToPath(new URL('.', import.meta.url))

const DEMO_CSS_FILES = [
  `${HERE}CanvasDevToolsDemoApp.css`,
  fileURLToPath(new URL('../index.css', import.meta.url)),
]

const FORBIDDEN_DEMO_PATTERNS = [
  {
    name: 'box-shadow',
    pattern: /\bbox-shadow\s*:/i,
  },
  {
    name: '700+ font shorthand',
    pattern: /\bfont\s*:\s*(?:[789]\d{2}|bold)\b/i,
  },
  {
    name: '700+ font weight',
    pattern: /\bfont-weight\s*:\s*(?:[789]\d{2}|bold)\b/i,
  },
  {
    name: 'text-transform',
    pattern: /\btext-transform\s*:/i,
  },
  {
    name: 'negative letter spacing',
    pattern: /\bletter-spacing\s*:\s*-\d/i,
  },
]

describe('CanvasEngineDemoDesignContract', () => {
  it('keeps the active engine demo on the light, low-chrome baseline', () => {
    const violations = DEMO_CSS_FILES.flatMap((path) => {
      const source = readFileSync(path, 'utf8')
      const name = path.slice(HERE.length)

      return FORBIDDEN_DEMO_PATTERNS
        .filter(({ pattern }) => pattern.test(source))
        .map(({ name: violation }) => `${name}: ${violation}`)
    })

    expect(violations).toEqual([])
  })

  it('keeps keyboard focus visible on engine demo controls', () => {
    const source = readFileSync(`${HERE}CanvasDevToolsDemoApp.css`, 'utf8')

    expect(source).toContain('--engine-control-focus-ring')
    expect(source).toContain('.engine-demo-controls button:focus-visible')
    expect(source).toContain('.engine-selection-toolbar button:focus-visible')
    expect(source).toContain('.engine-stamp-pad button:focus-visible')
    expect(source).not.toMatch(/button:focus-visible\s*\{[^}]*outline:\s*0\b/)
  })

  it('keeps the engine selection toolbar inside narrow viewports', () => {
    const source = readFileSync(`${HERE}CanvasDevToolsDemoApp.css`, 'utf8')

    expect(source).toMatch(/\.engine-selection-toolbar\s*\{[^}]*box-sizing:\s*border-box/)
    expect(source).toMatch(/\.engine-selection-toolbar\s*\{[^}]*flex-wrap:\s*wrap/)
    expect(source).toMatch(/\.engine-selection-toolbar\s*\{[^}]*justify-content:\s*center/)
    expect(source).toContain('max-width: calc(100vw - 20px)')
  })
})
