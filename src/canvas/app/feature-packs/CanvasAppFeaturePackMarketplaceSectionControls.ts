import {
  getCanvasAppFeaturePackMarketplaceSectionFacetItems,
  isCanvasAppFeaturePackMarketplacePackSectionFacetKind,
  isCanvasAppFeaturePackMarketplaceProfileSectionFacetKind,
  isCanvasAppFeaturePackMarketplaceSuiteSectionFacetKind,
  type CanvasAppFeaturePackMarketplaceItem,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackMarketplaceSection,
  type CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
  type CanvasAppFeaturePackMarketplaceSectionFacetKind,
} from './CanvasAppFeaturePackMarketplaceSections'
import type {
  CanvasAppFeaturePackMarketplaceSectionControlModel,
  CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel,
  CanvasAppFeaturePackMarketplaceTargetControl,
} from './CanvasAppFeaturePackMarketplaceControlContracts'
import {
  getCanvasAppFeaturePackMarketplaceItemTargetControl,
  getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
  isCanvasAppFeaturePackMarketplaceBlockedPrimaryActionDiagnostic,
} from './CanvasAppFeaturePackMarketplaceTargetControls'

export function getCanvasAppFeaturePackMarketplaceSectionControlModels(
  model: CanvasAppFeaturePackMarketplaceModel,
): readonly CanvasAppFeaturePackMarketplaceSectionControlModel[] {
  return Object.freeze(
    model.sections.map(getCanvasAppFeaturePackMarketplaceSectionControlModel),
  )
}

export function getCanvasAppFeaturePackMarketplaceSectionControlModel(
  section: CanvasAppFeaturePackMarketplaceSection,
): CanvasAppFeaturePackMarketplaceSectionControlModel {
  return Object.freeze({
    controls: getCanvasAppFeaturePackMarketplaceSectionTargetControls(section),
    diagnostics:
      getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel(
        section,
      ),
    facets: section.facets,
    kind: section.kind,
    label: section.label,
    section,
    summary: section.summary,
  })
}

export function getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): readonly CanvasAppFeaturePackMarketplaceTargetControl[] {
  return Object.freeze(
    getCanvasAppFeaturePackMarketplaceSectionFacetItems(input)
      .map(getCanvasAppFeaturePackMarketplaceItemTargetControl),
  )
}

export function getCanvasAppFeaturePackMarketplaceSectionTargetControls(
  section: CanvasAppFeaturePackMarketplaceSection,
): readonly CanvasAppFeaturePackMarketplaceTargetControl[] {
  return Object.freeze(
    section.items.map(getCanvasAppFeaturePackMarketplaceItemTargetControl),
  )
}

export function getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel(
  section: CanvasAppFeaturePackMarketplaceSection,
): CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel {
  const items: readonly CanvasAppFeaturePackMarketplaceItem[] = section.items
  const all = Object.freeze(items.map((item) =>
    getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(item)
  ))

  return Object.freeze({
    all,
    blocked: Object.freeze(all.filter(
      isCanvasAppFeaturePackMarketplaceBlockedPrimaryActionDiagnostic,
    )),
    ready: Object.freeze(all.filter((diagnostic) => diagnostic.ready)),
  })
}

export function getCanvasAppFeaturePackMarketplaceFacetTargetControlsForSection({
  facetKind,
  section,
}: {
  facetKind: CanvasAppFeaturePackMarketplaceSectionFacetKind
  section: CanvasAppFeaturePackMarketplaceSection
}): readonly CanvasAppFeaturePackMarketplaceTargetControl[] {
  if (
    section.kind === 'profiles' &&
    isCanvasAppFeaturePackMarketplaceProfileSectionFacetKind(facetKind)
  ) {
    return getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls({
      facetKind,
      section,
    })
  }

  if (
    section.kind === 'suites' &&
    isCanvasAppFeaturePackMarketplaceSuiteSectionFacetKind(facetKind)
  ) {
    return getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls({
      facetKind,
      section,
    })
  }

  if (
    section.kind === 'packs' &&
    isCanvasAppFeaturePackMarketplacePackSectionFacetKind(facetKind)
  ) {
    return getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls({
      facetKind,
      section,
    })
  }

  return Object.freeze([])
}
