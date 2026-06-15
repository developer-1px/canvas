import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectAnimationDescriptor,
  getSlideEditObjectAnimationBuildOrder,
  getSlideEditObjectAnimationUpdateCommandEffect,
  normalizeSlideEditObjectAnimationDelayMs,
  normalizeSlideEditObjectAnimationDurationMs,
  normalizeSlideEditObjectAnimationOrder,
  SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION,
  SLIDE_EDIT_OBJECT_ANIMATION_LIMITS,
  SLIDE_EDIT_OBJECT_ANIMATION_TRIGGERS,
  SLIDE_EDIT_OBJECT_ANIMATION_TYPES,
  type SlideEditObjectAnimationTriggerDescriptor,
  type SlideEditObjectAnimationTypeDescriptor,
} from './SlideEditObjectAnimationBuildOrder'

describe('SlideEditObjectAnimationBuildOrder', () => {
  it('creates an object animation descriptor with product-neutral defaults', () => {
    expect(createSlideEditObjectAnimationDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      ...SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION,
      objectId: 'object-a',
      slideId: 'slide-a',
    })

    expect(SLIDE_EDIT_OBJECT_ANIMATION_TYPES.map((type) => type.id)).toEqual([
      'none',
      'fade-in',
      'fly-in',
    ])
    expect(SLIDE_EDIT_OBJECT_ANIMATION_TRIGGERS.map((trigger) =>
      trigger.id
    )).toEqual([
      'on-click',
      'with-previous',
    ])
  })

  it('keeps animation type and trigger descriptors open for host extensions', () => {
    const customType = {
      id: 'spin-in',
      label: 'Spin in',
      requiredAdapterSlot: 'command-effect',
    } satisfies SlideEditObjectAnimationTypeDescriptor<'spin-in'>
    const customTrigger = {
      id: 'after-previous',
      label: 'After previous',
      requiredAdapterSlot: 'command-effect',
    } satisfies SlideEditObjectAnimationTriggerDescriptor<'after-previous'>

    const descriptor = createSlideEditObjectAnimationDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      trigger: customTrigger.id,
      type: customType.id,
    })

    expect(descriptor.type).toBe('spin-in')
    expect(descriptor.trigger).toBe('after-previous')
  })

  it('normalizes duration, delay, and build order values', () => {
    expect(normalizeSlideEditObjectAnimationDurationMs(-10)).toBe(0)
    expect(normalizeSlideEditObjectAnimationDurationMs(Number.NaN)).toBe(0)
    expect(normalizeSlideEditObjectAnimationDurationMs(1250.6)).toBe(1251)
    expect(normalizeSlideEditObjectAnimationDurationMs(
      SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxDurationMs + 1,
    )).toBe(SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxDurationMs)

    expect(normalizeSlideEditObjectAnimationDelayMs(-100)).toBe(0)
    expect(normalizeSlideEditObjectAnimationDelayMs(500.2)).toBe(500)
    expect(normalizeSlideEditObjectAnimationOrder(-1)).toBe(0)
    expect(normalizeSlideEditObjectAnimationOrder(2.7)).toBe(3)
    expect(normalizeSlideEditObjectAnimationOrder(
      SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxBuildOrder + 1,
    )).toBe(SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxBuildOrder)
  })

  it('keeps build order stable inside one slide', () => {
    const animations = [
      createSlideEditObjectAnimationDescriptor({
        objectId: 'object-a',
        order: 2,
        slideId: 'slide-a',
      }),
      createSlideEditObjectAnimationDescriptor({
        objectId: 'object-b',
        order: 1,
        slideId: 'slide-a',
      }),
      createSlideEditObjectAnimationDescriptor({
        objectId: 'object-c',
        order: 1,
        slideId: 'slide-a',
      }),
    ]

    expect(getSlideEditObjectAnimationBuildOrder(animations)).toEqual([
      'object-b',
      'object-c',
      'object-a',
    ])
  })

  it('routes field-level animation updates through host command effects', () => {
    expect(getSlideEditObjectAnimationUpdateCommandEffect({
      fieldId: 'type',
      id: 'update-object-animation',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'fade-in',
    })).toEqual({
      payload: {
        fieldId: 'type',
        id: 'update-object-animation',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'fade-in',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditObjectAnimationUpdateCommandEffect({
      fieldId: 'durationMs',
      id: 'update-object-animation',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: -10,
    }).payload.value).toBe(0)
    expect(getSlideEditObjectAnimationUpdateCommandEffect({
      fieldId: 'delayMs',
      id: 'update-object-animation',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: Number.POSITIVE_INFINITY,
    }).payload.value).toBe(0)
    expect(getSlideEditObjectAnimationUpdateCommandEffect({
      fieldId: 'order',
      id: 'update-object-animation',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 4.7,
    }).payload.value).toBe(5)
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectAnimationDescriptor({
        delayMs: 120,
        durationMs: 500,
        objectId: 'object-a',
        order: 2,
        slideId: 'slide-a',
        trigger: 'with-previous',
        type: 'fly-in',
      }),
      triggers: SLIDE_EDIT_OBJECT_ANIMATION_TRIGGERS,
      types: SLIDE_EDIT_OBJECT_ANIMATION_TYPES,
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
