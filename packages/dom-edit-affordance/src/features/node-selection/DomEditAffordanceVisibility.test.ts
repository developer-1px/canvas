import { describe, expect, it } from 'vitest'
import type { DomEditLayoutContext } from '../../shared/model/DomEditTypes'
import {
  getDomEditOverlayVisibility,
  type DomEditAffordanceState,
} from './DomEditAffordanceVisibility'

describe('DomEditAffordanceVisibility', () => {
  it('keeps idle ownership to selection identity, parent reference, and size modes', () => {
    const visibility = getVisibility({ mode: 'idle' })

    expect(visibility.selection).toBe(true)
    expect(visibility.parentReference).toBe(true)
    expect(visibility.directionControls).toBe(true)
    expect(visibility.sizeModes).toBe(true)
    expect(visibility.geometry).toBe(false)
    expect(visibility.measurements).toBe(false)
    expect(visibility.gapVisuals).toBe(false)
    expect(visibility.paddingVisuals).toBe(false)
    expect(visibility.xray).toBe(false)
  })

  it('hides unrelated overlays while editing gap or padding', () => {
    const gapDrag = getVisibility({
      mode: 'drag-property',
      property: 'gap',
    })
    const paddingDrag = getVisibility({
      mode: 'drag-property',
      property: 'padding',
    })

    expect(gapDrag.gapVisuals).toBe(true)
    expect(gapDrag.paddingHitTargets).toBe(false)
    expect(gapDrag.geometry).toBe(false)
    expect(gapDrag.measurements).toBe(false)
    expect(gapDrag.directionControls).toBe(false)
    expect(gapDrag.sizeModes).toBe(false)

    expect(paddingDrag.paddingVisuals).toBe(true)
    expect(paddingDrag.gapHitTargets).toBe(false)
    expect(paddingDrag.gridGapHitTargets).toBe(false)
    expect(paddingDrag.geometry).toBe(false)
    expect(paddingDrag.measurements).toBe(false)
    expect(paddingDrag.directionControls).toBe(false)
    expect(paddingDrag.sizeModes).toBe(false)
  })

  it('uses measure and xray as exclusive inspection modes', () => {
    const measure = getVisibility({ mode: 'measure' })
    const xray = getVisibility({ mode: 'xray' })

    expect(measure.measurements).toBe(true)
    expect(measure.parentReference).toBe(false)
    expect(measure.geometry).toBe(false)
    expect(measure.directionControls).toBe(false)
    expect(measure.sizeModes).toBe(false)
    expect(measure.xray).toBe(false)

    expect(xray.xray).toBe(true)
    expect(xray.measurements).toBe(false)
    expect(xray.parentReference).toBe(false)
    expect(xray.directionControls).toBe(false)
    expect(xray.gapHitTargets).toBe(false)
    expect(xray.paddingHitTargets).toBe(false)
    expect(xray.sizeModes).toBe(false)
  })

  it('shows transform geometry only for out-of-flow nodes', () => {
    expect(getVisibility({ mode: 'transform' }).geometry).toBe(false)
    expect(getVisibility(
      { mode: 'transform' },
      { position: 'absolute' },
    ).geometry).toBe(true)
  })

  it('keeps size mode badges only for idle or active size state', () => {
    expect(getVisibility({ mode: 'idle' }).sizeModes).toBe(true)
    expect(getVisibility({
      mode: 'hover-property',
      property: 'size',
    }).sizeModes).toBe(true)
    expect(getVisibility({
      mode: 'hover-property',
      property: 'gap',
    }).sizeModes).toBe(false)
    expect(getVisibility({ mode: 'transform' }).sizeModes).toBe(false)
  })

  it('shows direction controls only for idle flex or gap hover states', () => {
    expect(getVisibility({ mode: 'idle' }).directionControls).toBe(true)
    expect(getVisibility({
      mode: 'hover-property',
      property: 'gap',
    }).directionControls).toBe(true)
    expect(getVisibility({
      mode: 'drag-property',
      property: 'gap',
    }).directionControls).toBe(false)
    expect(getVisibility({
      mode: 'hover-property',
      property: 'padding',
    }).directionControls).toBe(false)
    expect(getVisibility(
      { mode: 'idle' },
      { showSelfLayout: false },
    ).directionControls).toBe(false)
  })
})

function getVisibility(
  affordanceState: DomEditAffordanceState,
  contextOverrides: Partial<DomEditLayoutContext> = {},
) {
  return getDomEditOverlayVisibility({
    affordanceState,
    context: {
      ...BASE_CONTEXT,
      ...contextOverrides,
    },
  })
}

const BASE_CONTEXT = {
  contentType: 'container',
  display: 'flex',
  hasChildren: true,
  label: 'Panel',
  nodeId: 'panel',
  parentDisplay: 'flex',
  parentId: 'parent',
  position: 'static',
  showBox: true,
  showContent: false,
  showFlexLayout: true,
  showGeometry: true,
  showGridLayout: true,
  showParentParticipation: true,
  showSelfLayout: true,
} satisfies DomEditLayoutContext
