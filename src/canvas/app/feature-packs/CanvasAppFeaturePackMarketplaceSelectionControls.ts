import type {
  CanvasAppFeaturePackMarketplaceSection,
  CanvasAppFeaturePackMarketplaceSectionFacet,
} from './CanvasAppFeaturePackMarketplaceSections'
import {
  getCanvasAppFeaturePackMarketplaceFacetTargetControlsForSection,
  getCanvasAppFeaturePackMarketplaceSectionControlModel,
} from './CanvasAppFeaturePackMarketplaceSectionControls'
import {
  isCanvasAppFeaturePackMarketplaceSameTarget,
} from './CanvasAppFeaturePackMarketplaceTargetControls'
import type {
  CanvasAppFeaturePackMarketplaceFacetSelectionControl,
  CanvasAppFeaturePackMarketplaceSectionSelectionControl,
  CanvasAppFeaturePackMarketplaceSelectionControlModel,
  CanvasAppFeaturePackMarketplaceSelectionControlModelInput,
  CanvasAppFeaturePackMarketplaceSelectionExecutionModel,
  CanvasAppFeaturePackMarketplaceSelectionExecutionStatus,
  CanvasAppFeaturePackMarketplaceSelectionFallbackReason,
  CanvasAppFeaturePackMarketplaceSelectionTargetControlInput,
  CanvasAppFeaturePackMarketplaceTargetControl,
} from './CanvasAppFeaturePackMarketplaceControlContracts'

export function getCanvasAppFeaturePackMarketplaceSelectionControlModel({
  facetKind,
  model,
  sectionKind,
}: CanvasAppFeaturePackMarketplaceSelectionControlModelInput):
  CanvasAppFeaturePackMarketplaceSelectionControlModel {
  const fallbackReasons:
    CanvasAppFeaturePackMarketplaceSelectionFallbackReason[] = []
  const selectedSection =
    model.sections.find((section) => section.kind === sectionKind) ??
      model.sections[0] ??
      null

  if (sectionKind !== undefined && selectedSection?.kind !== sectionKind) {
    fallbackReasons.push('missing-section')
  }

  if (!selectedSection) {
    return Object.freeze({
      controls: Object.freeze([]),
      facetControls: Object.freeze([]),
      fallbackReasons: Object.freeze(fallbackReasons),
      requestedFacetKind: facetKind,
      requestedSectionKind: sectionKind,
      sectionControlModel: null,
      sectionControls: getCanvasAppFeaturePackMarketplaceSectionSelectionControls(
        {
          sections: model.sections,
          selectedSection: null,
        },
      ),
      selectedFacet: null,
      selectedFacetKind: null,
      selectedSection: null,
      selectedSectionKind: null,
      status: 'empty',
    })
  }

  const selectedFacet =
    selectedSection.facets.find((facet) => facet.kind === facetKind) ??
      selectedSection.facets[0] ??
      null

  if (facetKind !== undefined && selectedFacet?.kind !== facetKind) {
    fallbackReasons.push('missing-facet')
  }

  const sectionControlModel =
    getCanvasAppFeaturePackMarketplaceSectionControlModel(selectedSection)

  return Object.freeze({
    controls: selectedFacet
      ? getCanvasAppFeaturePackMarketplaceFacetTargetControlsForSection({
        facetKind: selectedFacet.kind,
        section: selectedSection,
      })
      : Object.freeze([]),
    facetControls: getCanvasAppFeaturePackMarketplaceFacetSelectionControls({
      facets: selectedSection.facets,
      selectedFacet,
    }),
    fallbackReasons: Object.freeze(fallbackReasons),
    requestedFacetKind: facetKind,
    requestedSectionKind: sectionKind,
    sectionControlModel,
    sectionControls: getCanvasAppFeaturePackMarketplaceSectionSelectionControls(
      {
        sections: model.sections,
        selectedSection,
      },
    ),
    selectedFacet,
    selectedFacetKind: selectedFacet?.kind ?? null,
    selectedSection,
    selectedSectionKind: selectedSection.kind,
    status: fallbackReasons.length > 0 ? 'fallback' : 'selected',
  })
}

export function getCanvasAppFeaturePackMarketplaceSelectionTargetControl({
  selection,
  target,
}: CanvasAppFeaturePackMarketplaceSelectionTargetControlInput):
  CanvasAppFeaturePackMarketplaceTargetControl | null {
  return selection.controls.find((control) =>
    isCanvasAppFeaturePackMarketplaceSameTarget(control.target, target)
  ) ?? null
}

export function getCanvasAppFeaturePackMarketplaceSelectionExecutionModel(
  selection: CanvasAppFeaturePackMarketplaceSelectionControlModel,
): CanvasAppFeaturePackMarketplaceSelectionExecutionModel {
  const controls = selection.controls
  const readyControls = Object.freeze(
    controls.filter((control) => control.ready),
  )
  const heldControls = Object.freeze(
    controls.filter((control) => !control.ready),
  )
  const blockedControls = Object.freeze(
    heldControls.filter((control) => control.totalBlockedReasonCount > 0),
  )
  const targets = Object.freeze(
    controls.map((control) => control.target),
  )
  const readyTargets = Object.freeze(
    readyControls.map((control) => control.target),
  )
  const heldTargets = Object.freeze(
    heldControls.map((control) => control.target),
  )
  const blockedTargets = Object.freeze(
    blockedControls.map((control) => control.target),
  )
  const summary = Object.freeze({
    blockedControlCount: blockedControls.length,
    controlCount: controls.length,
    heldControlCount: heldControls.length,
    readyControlCount: readyControls.length,
    totalBlockedReasonCount: blockedControls.reduce(
      (total, control) => total + control.totalBlockedReasonCount,
      0,
    ),
  })

  return Object.freeze({
    blockedControls,
    blockedTargets,
    controls,
    disabled: readyControls.length === 0,
    heldControls,
    heldTargets,
    ready: readyControls.length > 0,
    readyControls,
    readyTargets,
    selection,
    status: getCanvasAppFeaturePackMarketplaceSelectionExecutionStatus({
      controlCount: controls.length,
      readyControlCount: readyControls.length,
    }),
    summary,
    targets,
  })
}

function getCanvasAppFeaturePackMarketplaceSectionSelectionControls({
  sections,
  selectedSection,
}: {
  sections: readonly CanvasAppFeaturePackMarketplaceSection[]
  selectedSection: CanvasAppFeaturePackMarketplaceSection | null
}): readonly CanvasAppFeaturePackMarketplaceSectionSelectionControl[] {
  return Object.freeze(sections.map((section) =>
    Object.freeze({
      count: section.summary.itemCount,
      kind: section.kind,
      label: section.label,
      section,
      selected: selectedSection?.kind === section.kind,
    })
  ))
}

function getCanvasAppFeaturePackMarketplaceFacetSelectionControls({
  facets,
  selectedFacet,
}: {
  facets: readonly CanvasAppFeaturePackMarketplaceSectionFacet[]
  selectedFacet: CanvasAppFeaturePackMarketplaceSectionFacet | null
}): readonly CanvasAppFeaturePackMarketplaceFacetSelectionControl[] {
  return Object.freeze(facets.map((facet) =>
    Object.freeze({
      ...facet,
      selected: selectedFacet?.kind === facet.kind,
    })
  ))
}

function getCanvasAppFeaturePackMarketplaceSelectionExecutionStatus({
  controlCount,
  readyControlCount,
}: {
  controlCount: number
  readyControlCount: number
}): CanvasAppFeaturePackMarketplaceSelectionExecutionStatus {
  if (controlCount === 0) {
    return 'empty'
  }

  return readyControlCount > 0 ? 'ready' : 'held'
}
