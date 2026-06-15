import type { DomEditLayoutContext } from '../../shared/model/DomEditTypes'

export type DomEditAffordanceProperty =
  | 'align'
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
  alignGuides: boolean
  axisGuides: boolean
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
  const alignActive = isDomEditPropertyActive(affordanceState, 'align')
  const spacingActive = gapActive || paddingActive
  const canShowGeometry = context.showGeometry && context.position !== 'static'
  const canShowSizeModes =
    context.showSelfLayout ||
    context.showGridLayout ||
    context.showParentParticipation
  const geometryActive =
    affordanceState.mode === 'transform' ||
    isDomEditPropertyActive(affordanceState, 'geometry')
  const sizeModesActive =
    affordanceState.mode === 'idle' ||
    sizeActive

  return {
    alignGuides: context.showSelfLayout &&
      (affordanceState.mode === 'idle' || alignActive) &&
      affordanceState.mode !== 'measure' &&
      affordanceState.mode !== 'xray' &&
      !spacingActive &&
      !sizeActive,
    axisGuides: context.showSelfLayout &&
      (
        affordanceState.mode === 'idle' ||
        affordanceState.mode === 'measure' ||
        gapActive
      ) &&
      affordanceState.mode !== 'xray' &&
      !paddingActive &&
      !sizeActive,
    gapHitTargets: context.showSelfLayout &&
      affordanceState.mode !== 'xray' &&
      !paddingActive,
    gapVisuals: context.showSelfLayout && gapActive,
    geometry: canShowGeometry &&
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
      affordanceState.mode === 'idle',
    selection: true,
    sizeModes: canShowSizeModes && sizeModesActive,
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
