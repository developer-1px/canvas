import { describe, expect, it } from 'vitest'

import {
  getSlideEditAdapterSlotIds,
  isSlideEditDomReferenceReusable,
  SLIDE_EDIT_ADAPTER_SLOTS,
  SLIDE_EDIT_DOM_AFFORDANCE_REFERENCE,
  SLIDE_EDIT_OWNED_CONTRACTS,
  SLIDE_EDIT_REUSED_CANVAS_CONTRACTS,
} from './index'

describe('slide-edit-affordance boundary', () => {
  it('defines the host adapter slots required by slide editors', () => {
    expect(getSlideEditAdapterSlotIds()).toEqual([
      'slide-frame',
      'object-bounds',
      'selection',
      'command-effect',
      'layout-theme',
      'slide-metadata',
      'text-measurement',
    ])
    expect(SLIDE_EDIT_ADAPTER_SLOTS.every((slot) => slot.owner === 'host'))
      .toBe(true)
  })

  it('keeps canvas core and foundation contracts separate from slide-owned contracts', () => {
    expect(SLIDE_EDIT_REUSED_CANVAS_CONTRACTS.map((contract) => contract.id))
      .toEqual([
        'geometry',
        'viewport',
        'selection',
        'transform',
        'snap-guides',
      ])
    expect(SLIDE_EDIT_OWNED_CONTRACTS.every(
      (contract) => contract.owner === 'slide-edit-affordance',
    )).toBe(true)
  })

  it('separates reusable DOM affordance references from DOM layout internals', () => {
    expect(SLIDE_EDIT_DOM_AFFORDANCE_REFERENCE).toEqual({
      reusable: ['guide', 'inspector', 'size-capsule'],
      notReusableAsIs: [
        'dom-layout-controls',
        'dom-computed-overflow',
        'dom-tree-selection',
        'dom-box-model-xray',
      ],
    })
    expect(isSlideEditDomReferenceReusable('guide')).toBe(true)
    expect(isSlideEditDomReferenceReusable('dom-layout-controls')).toBe(false)
  })

  it('does not expose product model names in runtime contract strings', () => {
    const blockedTerms = ['p' + 'pt', 'power' + 'point', 'fig' + 'slide']
    const publicContractStrings = JSON.stringify({
      slots: SLIDE_EDIT_ADAPTER_SLOTS,
      reused: SLIDE_EDIT_REUSED_CANVAS_CONTRACTS,
      owned: SLIDE_EDIT_OWNED_CONTRACTS,
      dom: SLIDE_EDIT_DOM_AFFORDANCE_REFERENCE,
    }).toLowerCase()

    for (const blockedTerm of blockedTerms) {
      expect(publicContractStrings).not.toContain(blockedTerm)
    }
  })
})
