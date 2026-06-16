import { describe, expect, it } from 'vitest'

import {
  createSlideEditTransitionDescriptor,
  getSlideEditTransitionCSSStyle,
  getSlideEditTransitionUpdateCommandEffect,
  normalizeSlideEditTransitionAdvancePolicy,
  normalizeSlideEditTransitionDurationMs,
  SLIDE_EDIT_DEFAULT_TRANSITION,
  SLIDE_EDIT_TRANSITION_TIMING_LIMITS,
  SLIDE_EDIT_TRANSITION_TYPES,
  type SlideEditTransitionTypeDescriptor,
} from './SlideEditSlideTransitionTiming'

describe('SlideEditSlideTransitionTiming', () => {
  it('creates a slide transition descriptor with product-neutral defaults', () => {
    expect(createSlideEditTransitionDescriptor({
      slideId: 'slide-a',
    })).toEqual({
      ...SLIDE_EDIT_DEFAULT_TRANSITION,
      slideId: 'slide-a',
    })

    expect(SLIDE_EDIT_TRANSITION_TYPES.map((type) => type.id)).toEqual([
      'none',
      'fade',
      'push',
    ])
  })

  it('keeps transition type descriptors open for host extensions', () => {
    const customType = {
      id: 'wipe-left',
      label: 'Wipe left',
      requiredAdapterSlot: 'command-effect',
    } satisfies SlideEditTransitionTypeDescriptor<'wipe-left'>

    expect(createSlideEditTransitionDescriptor({
      slideId: 'slide-a',
      type: customType.id,
    }).type).toBe('wipe-left')
  })

  it('normalizes duration and advance timing values', () => {
    expect(normalizeSlideEditTransitionDurationMs(-120)).toBe(0)
    expect(normalizeSlideEditTransitionDurationMs(Number.NaN)).toBe(0)
    expect(normalizeSlideEditTransitionDurationMs(1499.7)).toBe(1500)
    expect(normalizeSlideEditTransitionDurationMs(
      SLIDE_EDIT_TRANSITION_TIMING_LIMITS.maxDurationMs + 1,
    )).toBe(SLIDE_EDIT_TRANSITION_TIMING_LIMITS.maxDurationMs)

    expect(normalizeSlideEditTransitionAdvancePolicy({
      afterMs: -1,
      onClick: false,
    })).toEqual({ onClick: false })
    expect(normalizeSlideEditTransitionAdvancePolicy({
      afterMs: 2500.4,
      onClick: true,
    })).toEqual({
      afterMs: 2500,
      onClick: true,
    })
  })

  it('formats normalized transition timing values for CSS rendering', () => {
    expect(getSlideEditTransitionCSSStyle({
      durationMs: 0,
    })).toEqual({
      animationDuration: '1ms',
    })

    expect(getSlideEditTransitionCSSStyle({
      durationMs: 1499.7,
    })).toEqual({
      animationDuration: '1500ms',
    })

    expect(getSlideEditTransitionCSSStyle(null)).toEqual({
      animationDuration: '1ms',
    })
  })

  it('routes field-level transition updates through host command effects', () => {
    expect(getSlideEditTransitionUpdateCommandEffect({
      fieldId: 'type',
      id: 'update-slide-transition',
      slideId: 'slide-a',
      value: 'fade',
    })).toEqual({
      payload: {
        fieldId: 'type',
        id: 'update-slide-transition',
        slideId: 'slide-a',
        value: 'fade',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditTransitionUpdateCommandEffect({
      fieldId: 'durationMs',
      id: 'update-slide-transition',
      slideId: 'slide-a',
      value: -40,
    }).payload).toEqual({
      fieldId: 'durationMs',
      id: 'update-slide-transition',
      slideId: 'slide-a',
      value: 0,
    })

    expect(getSlideEditTransitionUpdateCommandEffect({
      fieldId: 'advance',
      id: 'update-slide-transition',
      slideId: 'slide-a',
      value: {
        afterMs: Number.POSITIVE_INFINITY,
        onClick: false,
      },
    }).payload.value).toEqual({
      onClick: false,
    })
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTransitionDescriptor({
        advance: {
          afterMs: 3000,
          onClick: true,
        },
        durationMs: 500,
        slideId: 'slide-a',
        type: 'push',
      }),
      types: SLIDE_EDIT_TRANSITION_TYPES,
    }).toLowerCase()

    for (const blockedTerm of [
      'p' + 'pt',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
