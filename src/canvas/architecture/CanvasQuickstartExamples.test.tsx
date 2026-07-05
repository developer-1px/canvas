import { readFileSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import basicCanvasSource from './quickstart-examples/BasicCanvasQuickstart.tsx?raw'
import featurePacksSource from './quickstart-examples/FeaturePacksQuickstart.tsx?raw'
import customFeaturePackSource from './quickstart-examples/CustomFeaturePackQuickstart.tsx?raw'
import {
  BasicCanvas,
} from './quickstart-examples/BasicCanvasQuickstart'
import {
  CanvasWithFeaturePacks,
} from './quickstart-examples/FeaturePacksQuickstart'
import {
  CanvasWithCustomFeaturePack,
} from './quickstart-examples/CustomFeaturePackQuickstart'

const QUICKSTART_SOURCES = [
  basicCanvasSource,
  featurePacksSource,
  customFeaturePackSource,
].map((source) => source.trimEnd())

describe('Canvas quickstart examples', () => {
  it('keeps README quickstart snippets identical to tested sources', () => {
    const readme = readFileSync('README.md', 'utf8')

    for (const source of QUICKSTART_SOURCES) {
      expect(readme).toContain(`\`\`\`tsx\n${source}\n\`\`\``)
    }
  })

  it('renders the basic top-level CanvasApp quickstart', () => {
    expect(renderToString(<BasicCanvas />)).toEqual(expect.any(String))
  })

  it('renders the feature pack IDs and custom item module quickstart', () => {
    expect(renderToString(<CanvasWithFeaturePacks />)).toEqual(
      expect.any(String),
    )
  })

  it('renders the custom feature pack quickstart', () => {
    expect(renderToString(<CanvasWithCustomFeaturePack />)).toEqual(
      expect.any(String),
    )
  })
})
