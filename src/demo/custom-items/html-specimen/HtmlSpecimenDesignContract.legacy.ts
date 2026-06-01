import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createButtonSpecimenData } from './ButtonSpecimenData'
import { DESIGN_SYSTEM_SAMPLE_CSS } from './DesignSystemSampleCss'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const PROJECT_ROOT = fileURLToPath(new URL('../../../../..', import.meta.url))

const ACTIVE_DEMO_CSS_FILES = [
  `${HERE}HtmlSpecimenCustomItemModule.css`,
  `${PROJECT_ROOT}/src/demo/CanvasDevToolsDemoApp.css`,
]

const CONTRACT_FORBIDDEN_PATTERNS = [
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

describe('HtmlSpecimenDesignContract', () => {
  it('keeps the active demo shell light and unornamented', () => {
    const violations = collectCssViolations(
      ACTIVE_DEMO_CSS_FILES.map((path) => ({
        name: path.slice(PROJECT_ROOT.length + 1),
        source: readFileSync(path, 'utf8'),
      })),
      CONTRACT_FORBIDDEN_PATTERNS,
    )

    expect(violations).toEqual([])
  })

  it('keeps the generated release queue sample content-first', () => {
    const violations = collectCssViolations([
      {
        name: 'DesignSystemSampleCss.ts',
        source: DESIGN_SYSTEM_SAMPLE_CSS,
      },
    ], [
      ...CONTRACT_FORBIDDEN_PATTERNS,
      {
        name: 'sample structural border',
        pattern: /\bborder\s*:\s*1px\b/i,
      },
      {
        name: 'filled warning badge',
        pattern: /#fff1d8/i,
      },
      {
        name: 'filled danger badge',
        pattern: /#ffe6e3/i,
      },
      {
        name: 'filled success badge',
        pattern: /#e3f6ec/i,
      },
    ])

    expect(violations).toEqual([])
  })

  it('keeps the fallback button specimen on the same material baseline', () => {
    const specimen = createButtonSpecimenData()
    const violations = collectCssViolations([
      {
        name: 'ButtonSpecimenData.ts',
        source: specimen.css,
      },
    ], [
      ...CONTRACT_FORBIDDEN_PATTERNS,
      {
        name: 'button specimen structural border',
        pattern: /\bborder\s*:\s*1px\b/i,
      },
    ])

    expect(violations).toEqual([])
  })
})

function collectCssViolations(
  files: Array<{
    name: string
    source: string
  }>,
  patterns: Array<{
    name: string
    pattern: RegExp
  }>,
) {
  return files.flatMap((file) =>
    patterns
      .filter(({ pattern }) => pattern.test(file.source))
      .map(({ name }) => `${file.name}: ${name}`),
  )
}
