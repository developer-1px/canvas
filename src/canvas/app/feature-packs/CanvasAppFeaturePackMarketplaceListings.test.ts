import { describe, expect, it } from 'vitest'

import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePackMarketplaceListing,
  createCanvasAppFeaturePackSuiteMarketplaceListing,
  getCanvasAppFeaturePackMarketplaceListingMap,
  getCanvasAppFeaturePackSuiteMarketplaceListingMap,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  createCanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

describe('CanvasAppFeaturePackMarketplaceListings', () => {
  it('creates a default free listing', () => {
    expect(createCanvasAppFeaturePackMarketplaceListing({
      featurePackId: 'zoom-controls',
    })).toEqual({
      access: 'free',
      distribution: 'available',
      entitlement: 'granted',
      featurePackId: 'zoom-controls',
      priceLabel: undefined,
      vendor: undefined,
    })
  })

  it('overrides manifest listings with paid marketplace metadata', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'ai-pack',
      label: 'AI pack',
    })
    const listingById = getCanvasAppFeaturePackMarketplaceListingMap({
      listings: [{
        access: 'paid',
        distribution: 'coming-soon',
        entitlement: 'granted',
        featurePackId: 'ai-pack',
        priceLabel: '$9/mo',
        vendor: 'Interactive OS',
      }],
      manifests: [manifest],
    })

    expect(listingById.get('ai-pack')).toEqual({
      access: 'paid',
      distribution: 'coming-soon',
      entitlement: 'granted',
      featurePackId: 'ai-pack',
      priceLabel: '$9/mo',
      vendor: 'Interactive OS',
    })
  })

  it('rejects unknown marketplace listing targets', () => {
    expect(() =>
      getCanvasAppFeaturePackMarketplaceListingMap({
        listings: [{
          featurePackId: 'missing-pack',
        }],
        manifests: [createCanvasAppFeaturePackManifest({
          id: 'known-pack',
          label: 'Known pack',
        })],
      }),
    ).toThrow(
      'Unknown canvas app feature pack marketplace listing: missing-pack',
    )
  })

  it('rejects duplicate marketplace listing targets', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'ai-pack',
      label: 'AI pack',
    })

    expect(() =>
      getCanvasAppFeaturePackMarketplaceListingMap({
        listings: [
          {
            access: 'paid',
            featurePackId: 'ai-pack',
          },
          {
            access: 'private',
            featurePackId: 'ai-pack',
          },
        ],
        manifests: [manifest],
      }),
    ).toThrow(
      'Duplicate canvas app feature pack marketplace listing: ai-pack',
    )
  })

  it('creates default and paid suite listings', () => {
    expect(createCanvasAppFeaturePackSuiteMarketplaceListing({
      suiteId: 'component-system',
    })).toEqual({
      access: 'free',
      distribution: 'available',
      entitlement: 'granted',
      priceLabel: undefined,
      suiteId: 'component-system',
      vendor: undefined,
    })
    expect(createCanvasAppFeaturePackSuiteMarketplaceListing({
      access: 'paid',
      priceLabel: '$19/mo',
      suiteId: 'component-system',
      vendor: 'Interactive OS',
    })).toEqual({
      access: 'paid',
      distribution: 'available',
      entitlement: 'required',
      priceLabel: '$19/mo',
      suiteId: 'component-system',
      vendor: 'Interactive OS',
    })
  })

  it('overrides suite manifests with marketplace metadata', () => {
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['component-library'],
      id: 'component-system',
      label: 'Component system',
    })
    const listingById = getCanvasAppFeaturePackSuiteMarketplaceListingMap({
      listings: [{
        access: 'private',
        distribution: 'coming-soon',
        entitlement: 'granted',
        priceLabel: 'Workspace plan',
        suiteId: 'component-system',
        vendor: 'Internal',
      }],
      suiteManifests: [suiteManifest],
    })

    expect(listingById.get('component-system')).toEqual({
      access: 'private',
      distribution: 'coming-soon',
      entitlement: 'granted',
      priceLabel: 'Workspace plan',
      suiteId: 'component-system',
      vendor: 'Internal',
    })
  })

  it('rejects unknown and duplicate suite listing targets', () => {
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['component-library'],
      id: 'component-system',
      label: 'Component system',
    })

    expect(() =>
      getCanvasAppFeaturePackSuiteMarketplaceListingMap({
        listings: [{
          suiteId: 'missing-suite',
        }],
        suiteManifests: [suiteManifest],
      }),
    ).toThrow(
      'Unknown canvas app feature pack suite marketplace listing: missing-suite',
    )
    expect(() =>
      getCanvasAppFeaturePackSuiteMarketplaceListingMap({
        listings: [
          {
            access: 'paid',
            suiteId: 'component-system',
          },
          {
            access: 'private',
            suiteId: 'component-system',
          },
        ],
        suiteManifests: [suiteManifest],
      }),
    ).toThrow(
      'Duplicate canvas app feature pack suite marketplace listing: component-system',
    )
  })
})
