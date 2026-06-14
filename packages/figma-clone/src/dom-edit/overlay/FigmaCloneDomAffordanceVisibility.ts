import type { FigmaCloneDomLayoutContext } from '../FigmaCloneDomEditModel'

export type FigmaCloneDomAffordanceProperty =
  | 'gap'
  | 'geometry'
  | 'margin'
  | 'measurement'
  | 'padding'
  | 'size'

export type FigmaCloneDomAffordanceState =
  | { mode: 'drag-property'; property: FigmaCloneDomAffordanceProperty }
  | { mode: 'hover-property'; property: FigmaCloneDomAffordanceProperty }
  | { mode: 'idle' }
  | { mode: 'measure' }
  | { mode: 'transform' }
  | { mode: 'xray' }

export type FigmaCloneDomOverlayVisibility = {
  gapHitTargets: boolean
  gapVisuals: boolean
  geometry: boolean
  gridGapHitTargets: boolean
  gridGapVisuals: boolean
  measurements: boolean
  paddingHitTargets: boolean
  paddingVisuals: boolean
  parentReference: boolean
  selection: boolean
  sizeModes: boolean
  xray: boolean
}

export function getFigmaCloneDomOverlayVisibility({
  affordanceState,
  context,
}: {
  affordanceState: FigmaCloneDomAffordanceState
  context: FigmaCloneDomLayoutContext
}): FigmaCloneDomOverlayVisibility {
  const gapActive = isFigmaCloneDomPropertyActive(affordanceState, 'gap')
  const paddingActive = isFigmaCloneDomPropertyActive(affordanceState, 'padding')
  const sizeActive = isFigmaCloneDomPropertyActive(affordanceState, 'size')
  const spacingActive = gapActive || paddingActive
  const geometryActive =
    affordanceState.mode === 'idle' ||
    affordanceState.mode === 'transform' ||
    isFigmaCloneDomPropertyActive(affordanceState, 'geometry')

  return {
    gapHitTargets: context.showSelfLayout &&
      affordanceState.mode !== 'xray' &&
      !paddingActive,
    gapVisuals: context.showSelfLayout && gapActive,
    geometry: context.showGeometry &&
      geometryActive &&
      affordanceState.mode !== 'measure' &&
      affordanceState.mode !== 'xray' &&
      !spacingActive,
    gridGapHitTargets: context.showGridLayout &&
      affordanceState.mode !== 'xray' &&
      !paddingActive,
    gridGapVisuals: context.showGridLayout && gapActive,
    measurements: affordanceState.mode === 'measure',
    paddingHitTargets: (context.showSelfLayout || context.showGridLayout) &&
      affordanceState.mode !== 'xray' &&
      !gapActive,
    paddingVisuals: (context.showSelfLayout || context.showGridLayout) &&
      paddingActive,
    parentReference: Boolean(context.parentId) &&
      affordanceState.mode !== 'drag-property',
    selection: true,
    sizeModes: (
      context.showSelfLayout ||
      context.showGridLayout ||
      context.showParentParticipation
    ) &&
      sizeActive,
    xray: affordanceState.mode === 'xray',
  }
}

function isFigmaCloneDomPropertyActive(
  affordanceState: FigmaCloneDomAffordanceState,
  property: FigmaCloneDomAffordanceProperty,
): boolean {
  return (
    affordanceState.mode === 'drag-property' ||
    affordanceState.mode === 'hover-property'
  ) && affordanceState.property === property
}
