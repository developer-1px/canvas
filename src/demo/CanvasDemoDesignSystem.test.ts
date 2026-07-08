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
    /^\s*(gap|row-gap|column-gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?)\s*:\s*([^;]+);/gm

  for (const match of css.matchAll(spacingDeclaration)) {
    const property = match[1]
    const value = match[2].trim()

    if (/\d+(?:\.\d+)?px/.test(value)) {
      violations.push(`${property}: ${value}`)
    }
  }

  return violations
}
