import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  getImportsFrom,
  getSourceFile,
  targetsAnyLayer,
} from './CanvasArchitectureTestSources'

describe('Canvas core-only consumer boundaries', () => {
  it('keeps core source independent from concrete product layers', () => {
    const violations = getImportsFrom('src/canvas/core/')
      .filter((reference) =>
        targetsAnyLayer(reference, [
          'app',
          'entities',
          'engine',
          'host',
          'renderer',
          'ui',
        ]),
      )

    expect(violations).toEqual([])
  })

  it('keeps the core-only public facade on core modules only', () => {
    const coreEntry = getSourceFile('src/canvas/core/index.ts')
    const nonCoreTargets = getImportReferences(coreEntry)
      .filter((reference) =>
        !reference.target.startsWith('src/canvas/core/'),
      )

    expect(nonCoreTargets).toEqual([])
  })

  it('keeps core-only consumers away from feature pack implementation surfaces', () => {
    const coreEntry = getSourceFile('src/canvas/core/index.ts')

    for (const featurePackSurface of [
      'feature-pack',
      'FeaturePack',
      'Marketplace',
      'Suite',
      'Profile',
      'CanvasApp',
      'ComponentLibrary',
      'StoryCanvas',
      'CommandPalette',
      'Minimap',
      'Toolbar',
    ]) {
      expect(coreEntry.source).not.toContain(featurePackSurface)
    }
  })

  it('keeps product package facades outside the core-only entrypoint', () => {
    const coreEntry = getSourceFile('src/canvas/core/index.ts')

    for (const productFacade of [
      "from '../app'",
      "from '../entities'",
      "from '../engine'",
      "from '../host'",
      "from '../renderer'",
      "from '../ui'",
      "from './app'",
      "from './entities'",
      "from './engine'",
      "from './host'",
      "from './renderer'",
      "from './ui'",
    ]) {
      expect(coreEntry.source).not.toContain(productFacade)
    }
  })
})
