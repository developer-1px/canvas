import { describe, expect, it } from 'vitest'

import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

describe('CanvasAppFeaturePackManifests', () => {
  it('creates first-party package contract metadata by default', () => {
    expect(createCanvasAppFeaturePackManifest({
      id: 'zoom-controls',
      label: 'Zoom controls',
    }).package).toEqual({
      name: '@interactive-os/canvas',
      subpath: undefined,
    })
  })

  it('allows feature packs to declare their package and export subpath', () => {
    expect(createCanvasAppFeaturePackManifest({
      id: 'story-canvas',
      label: 'Story Canvas',
      package: {
        name: '@interactive-os/canvas-pack-story',
        subpath: './story-canvas',
      },
    }).package).toEqual({
      name: '@interactive-os/canvas-pack-story',
      subpath: './story-canvas',
    })
  })

  it('rejects package subpaths that cannot map to package exports', () => {
    expect(() =>
      createCanvasAppFeaturePackManifest({
        id: 'story-canvas',
        label: 'Story Canvas',
        package: {
          name: '@interactive-os/canvas-pack-story',
          subpath: 'story-canvas',
        },
      }),
    ).toThrow(
      'Invalid feature pack manifest story-canvas package subpath: story-canvas',
    )
  })
})
