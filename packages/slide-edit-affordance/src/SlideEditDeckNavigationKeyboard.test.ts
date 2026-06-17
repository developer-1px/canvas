import { describe, expect, it } from 'vitest'

import {
  getSlideEditDeckNavigationKeyboardIntent,
} from './SlideEditDeckNavigationKeyboard'
import {
  getSlideEditDeckNavigationKeyboardIntent as getSlideEditDeckNavigationKeyboardIntentFromPackage,
} from './index'

describe('SlideEditDeckNavigationKeyboard', () => {
  const slideOrder = ['slide-a', 'slide-b', 'slide-c'] as const

  it('maps PageUp and PageDown to relative slide navigation intents', () => {
    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'PageUp',
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      direction: -1,
      preventDefault: true,
      targetSlideId: 'slide-a',
      type: 'select-relative-slide',
    })

    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'PageDown',
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      direction: 1,
      preventDefault: true,
      targetSlideId: 'slide-c',
      type: 'select-relative-slide',
    })
  })

  it('returns null at deck boundaries', () => {
    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-a',
      key: 'PageUp',
      slideOrder,
    })).toBeNull()

    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-c',
      key: 'PageDown',
      slideOrder,
    })).toBeNull()
  })

  it('returns null when modifiers or unsupported keys are used', () => {
    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'PageDown',
      shiftKey: true,
      slideOrder,
    })).toBeNull()

    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'ArrowDown',
      slideOrder,
    })).toBeNull()
  })

  it('returns null when the active slide is missing', () => {
    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: null,
      key: 'PageDown',
      slideOrder,
    })).toBeNull()

    expect(getSlideEditDeckNavigationKeyboardIntent({
      activeSlideId: 'slide-x',
      key: 'PageDown',
      slideOrder: ['slide-a', 'slide-b'],
    })).toBeNull()
  })

  it('is available from the package index', () => {
    expect(getSlideEditDeckNavigationKeyboardIntentFromPackage({
      activeSlideId: 'slide-a',
      key: 'PageDown',
      slideOrder,
    })).toMatchObject({
      targetSlideId: 'slide-b',
      type: 'select-relative-slide',
    })
  })
})
