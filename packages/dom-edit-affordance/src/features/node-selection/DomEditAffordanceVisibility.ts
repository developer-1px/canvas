import type { DomEditLayoutContext } from '../../shared/model/DomEditTypes'

export type DomEditAffordanceProperty =
  | 'gap'
  | 'geometry'
  | 'margin'
  | 'measurement'
  | 'padding'
  | 'size'

export type DomEditAffordanceState =
  | { mode: 'drag-property'; property: DomEditAffordanceProperty }
  | { mode: 'hover-property'; property: DomEditAffordanceProperty }
  | { mode: 'idle' }
  | { mode: 'measure' }
  | { mode: 'transform' }
  | { mode: 'xray' }

export type DomEditOverlayVisibility = {
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

export function getDomEditOverlayVisibility({
  affordanceState,
  context,
}: {
  affordanceState: DomEditAffordanceState
  context: DomEditLayoutContext
}): DomEditOverlayVisibility {
  const gapActive = isDomEditPropertyActive(affordanceState, 'gap')
  const paddingActive = isDomEditPropertyActive(affordanceState, 'padding')
  const sizeActive = isDomEditPropertyActive(affordanceState, 'size')
  const spacingActive = gapActive || paddingActive
  const geometryActive =
    affordanceState.mode === 'idle' ||
    affordanceState.mode === 'transform' ||
    isDomEditPropertyActive(affordanceState, 'geometry')

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

function isDomEditPropertyActive(
  affordanceState: DomEditAffordanceState,
  property: DomEditAffordanceProperty,
): boolean {
  return (
    affordanceState.mode === 'drag-property' ||
    affordanceState.mode === 'hover-property'
  ) && affordanceState.property === property
}
