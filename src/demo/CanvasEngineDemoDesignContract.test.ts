import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const HERE = fileURLToPath(new URL('.', import.meta.url))

const DEMO_CSS_FILES = [
  `${HERE}CanvasEngineDemoApp.css`,
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
})
