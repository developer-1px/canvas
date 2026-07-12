import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))

const DEMO_SYSTEM_SOURCE = readFixture('src/index.css')
const DEMO_SURFACE_STYLESHEETS = [
  'src/demo/CanvasEngineDemoApp.css',
  'packages/figma-clone/src/FigmaCloneApp.css',
  'packages/canvas-devtools-affordance/src/style.css',
] as const

describe('Canvas demo design system', () => {
  it('keeps the shared demo token budget intentionally small', () => {
    expect(listTokenDefinitions(DEMO_SYSTEM_SOURCE, 'demo-type')).toEqual([
      '--demo-type-1',
      '--demo-type-2',
      '--demo-type-3',
      '--demo-type-4',
      '--demo-type-5',
    ])
    expect(listTokenDefinitions(DEMO_SYSTEM_SOURCE, 'demo-space')).toEqual([
      '--demo-space-1',
      '--demo-space-2',
      '--demo-space-3',
    ])
  })

  it('forces Figma and FigJam demo surfaces onto shared type tokens', () => {
    for (const file of DEMO_SURFACE_STYLESHEETS) {
      const css = readFixture(file)

      expect(findRawFontSizes(css), file).toEqual([])
    }
  })

  it('forces Figma and FigJam chrome spacing through the three space tokens', () => {
    for (const file of DEMO_SURFACE_STYLESHEETS) {
      const css = readFixture(file)

      expect(findRawSpacingValues(css), file).toEqual([])
    }
  })

  it('allows the accessibility spacing required by a complete visually-hidden rule only', () => {
    expect(
      findRawSpacingValues(`
        .announcement {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }
      `),
    ).toEqual([])

    expect(findRawSpacingValues('.chrome { margin: -1px; }')).toEqual([
      'margin: -1px',
    ])
  })
})

function readFixture(path: string) {
  return readFileSync(`${root}/${path}`, 'utf8')
}

function listTokenDefinitions(source: string, namespace: string) {
  return [...source.matchAll(new RegExp(`--${namespace}-\\d+\\s*:`, 'g'))]
    .map((match) => match[0].slice(0, -1).trim())
}

function findRawFontSizes(css: string) {
  const violations: string[] = []

  for (const match of css.matchAll(/font-size:\s*([^;]+);/g)) {
    const value = match[1].trim()

    if (value.includes('var(--demo-type-')) {
      continue
    }

    violations.push(`font-size: ${value}`)
  }

  for (const match of css.matchAll(/font:\s*([^;]+);/g)) {
    const value = match[1].trim()

    if (!/\d+(?:\.\d+)?px/.test(value)) {
      continue
    }

    violations.push(`font: ${value}`)
  }

  return violations
}

function findRawSpacingValues(css: string) {
  const violations: string[] = []
  const spacingDeclaration =
    /(?:^|[;{])\s*(gap|row-gap|column-gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?)\s*:\s*([^;]+);/gm
  const cssWithoutVisuallyHiddenOffsets = css.replace(
    /\{([^{}]*)\}/g,
    (rule, declarations: string) => {
      if (!isCompleteVisuallyHiddenRule(declarations)) {
        return rule
      }

      return rule.replace(
        /(^|;)\s*margin\s*:\s*-1px\s*;/gm,
        (_declaration: string, boundary: string) => `${boundary} margin: 0;`,
      )
    },
  )

  for (const match of cssWithoutVisuallyHiddenOffsets.matchAll(spacingDeclaration)) {
    const property = match[1]
    const value = match[2].trim()

    if (/\d+(?:\.\d+)?px/.test(value)) {
      violations.push(`${property}: ${value}`)
    }
  }

  return violations
}

function isCompleteVisuallyHiddenRule(declarations: string) {
  const hasDeclaration = (property: string, value: string) =>
    new RegExp(
      `(?:^|;)\\s*${property}\\s*:\\s*${value}\\s*(?:;|$)`,
      'i',
    ).test(declarations)

  return (
    hasDeclaration('position', 'absolute') &&
    hasDeclaration('width', '1px') &&
    hasDeclaration('height', '1px') &&
    hasDeclaration('overflow', 'hidden') &&
    (hasDeclaration('clip', 'rect\\([^;]+\\)') ||
      hasDeclaration('clip-path', 'inset\\([^;]+\\)'))
  )
}
