import { describe, expect, it } from 'vitest'

import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePackMarketplaceListing,
  getCanvasAppFeaturePackMarketplaceListingMap,
} from './CanvasAppFeaturePackMarketplaceListings'

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
})
