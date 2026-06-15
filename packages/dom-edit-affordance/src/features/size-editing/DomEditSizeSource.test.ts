import { describe, expect, it } from 'vitest'

import {
  getDomEditSizeSourceDescriptor,
  getDomEditSizeSourceLabel,
} from './DomEditSizeSource'

describe('DomEditSizeSource', () => {
  it('describes fixed, hug, and fill source labels per axis', () => {
    expect(getDomEditSizeSourceDescriptor({
      axis: 'width',
      mode: 'fixed',
      parentDisplay: null,
      value: 104.4,
    })).toMatchObject({
      ariaLabel: 'W 104 Fixed',
      axisLabel: 'W',
      kind: 'fixed',
      label: 'Fixed',
      valueLabel: '104',
    })
    expect(getDomEditSizeSourceDescriptor({
      axis: 'height',
      mode: 'hug',
      parentDisplay: 'flex',
      value: 33.6,
    })).toMatchObject({
      ariaLabel: 'H 34 Hug',
      axisLabel: 'H',
      kind: 'hug',
      label: 'Hug',
      valueLabel: '34',
    })
    expect(getDomEditSizeSourceLabel('fill')).toBe('Fill')
  })

  it('marks fill as parent-relative only for flex or grid parents', () => {
    expect(getDomEditSizeSourceDescriptor({
      axis: 'width',
      mode: 'fill',
      parentDisplay: 'flex',
      value: 320,
    })).toMatchObject({
      isParentRelative: true,
      kind: 'fill',
      label: 'Fill',
    })
    expect(getDomEditSizeSourceDescriptor({
      axis: 'width',
      mode: 'fill',
      parentDisplay: 'grid',
      value: 320,
    }).isParentRelative).toBe(true)
    expect(getDomEditSizeSourceDescriptor({
      axis: 'width',
      mode: 'fill',
      parentDisplay: null,
      value: 320,
    }).isParentRelative).toBe(false)
  })
})
