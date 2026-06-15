import { describe, expect, it } from 'vitest'

import {
  getDomEditFlexParticipationDescriptor,
} from './DomEditFlexParticipation'

describe('DomEditFlexParticipation', () => {
  it('shows width fill participation for a row flex parent', () => {
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'hug',
      parentDirection: 'row',
      parentDisplay: 'flex',
      widthMode: 'fill',
    })).toEqual({
      axis: 'width',
      detail: 'grow 1 / shrink 1',
      direction: 'row',
      kind: 'fill',
      label: 'W Fill',
      mode: 'fill',
    })
  })

  it('shows height fill participation for a column flex parent', () => {
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'fill',
      parentDirection: 'column',
      parentDisplay: 'flex',
      widthMode: 'hug',
    })).toMatchObject({
      axis: 'height',
      label: 'H Fill',
    })
  })

  it('uses the parent main axis when both axes can fill', () => {
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'fill',
      parentDirection: 'row',
      parentDisplay: 'flex',
      widthMode: 'fill',
    })).toMatchObject({
      axis: 'width',
      label: 'W Fill',
    })
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'fill',
      parentDirection: 'column',
      parentDisplay: 'flex',
      widthMode: 'fill',
    })).toMatchObject({
      axis: 'height',
      label: 'H Fill',
    })
  })

  it('does not show grow glyphs for hug children or non-flex parents', () => {
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'hug',
      parentDirection: 'row',
      parentDisplay: 'flex',
      widthMode: 'hug',
    })).toBeNull()
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'fill',
      parentDirection: 'column',
      parentDisplay: 'grid',
      widthMode: 'fill',
    })).toBeNull()
    expect(getDomEditFlexParticipationDescriptor({
      heightMode: 'fill',
      parentDirection: null,
      parentDisplay: null,
      widthMode: 'fill',
    })).toBeNull()
  })
})
