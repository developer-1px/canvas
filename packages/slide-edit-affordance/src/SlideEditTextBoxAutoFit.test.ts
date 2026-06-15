import { describe, expect, it } from 'vitest'

import {
  getSlideEditTextAutoFitGestureCommandEffect,
  getSlideEditTextAutoSizeBounds,
  getSlideEditTextOverflowIndicatorState,
  SLIDE_EDIT_TEXT_BOX_SIZE_MODES,
} from './SlideEditTextBoxAutoFit'

describe('SlideEditTextBoxAutoFit', () => {
  it('defines product-neutral text box size modes', () => {
    expect(SLIDE_EDIT_TEXT_BOX_SIZE_MODES).toEqual([
      {
        changesBounds: false,
        changesTextScale: false,
        id: 'fixed',
        label: 'Fixed',
        requiredAdapterSlot: 'text-measurement',
      },
      {
        changesBounds: true,
        changesTextScale: false,
        id: 'resize-to-fit',
        label: 'Resize to fit',
        requiredAdapterSlot: 'text-measurement',
      },
      {
        changesBounds: false,
        changesTextScale: true,
        id: 'shrink-text',
        label: 'Shrink text',
        requiredAdapterSlot: 'text-measurement',
      },
    ])
  })

  it('computes auto-size target bounds from host text measurement', () => {
    expect(getSlideEditTextAutoSizeBounds({
      bounds: { h: 40, w: 100, x: 10, y: 20 },
      maxBounds: { h: 100, w: 200, x: 0, y: 0 },
      measurement: {
        hasOverflow: true,
        measuredSize: { h: 90, w: 220 },
      },
      minSize: { h: 30, w: 80 },
    })).toEqual({
      h: 80,
      w: 190,
      x: 10,
      y: 20,
    })

    expect(getSlideEditTextAutoSizeBounds({
      bounds: { h: 40, w: 100, x: 10, y: 20 },
      measurement: {
        hasOverflow: false,
        measuredSize: { h: 12, w: 20 },
      },
      minSize: { h: 30, w: 80 },
    })).toEqual({
      h: 30,
      w: 80,
      x: 10,
      y: 20,
    })
  })

  it('returns null auto-size bounds when host measurement is unavailable', () => {
    expect(getSlideEditTextAutoSizeBounds({
      bounds: { h: 40, w: 100, x: 10, y: 20 },
      measurement: null,
    })).toBeNull()
  })

  it('derives headless overflow indicator state', () => {
    expect(getSlideEditTextOverflowIndicatorState({
      bounds: { h: 50, w: 100, x: 10, y: 20 },
      measurement: {
        hasOverflow: false,
        lineCount: 4,
        measuredSize: { h: 52, w: 110 },
      },
      objectId: 'title',
      sizeMode: 'fixed',
      slideId: 'slide-a',
    })).toEqual({
      anchor: 'bottom-right',
      bounds: {
        h: 18,
        w: 18,
        x: 88,
        y: 48,
      },
      hasOverflow: true,
      isVisible: true,
      lineCount: 4,
      measuredSize: { h: 52, w: 110 },
      objectId: 'title',
      overflowAxis: ['horizontal', 'vertical'],
      sizeMode: 'fixed',
      slideId: 'slide-a',
    })

    expect(getSlideEditTextOverflowIndicatorState({
      bounds: { h: 80, w: 200, x: 0, y: 0 },
      measurement: {
        hasOverflow: false,
        measuredSize: { h: 60, w: 180 },
      },
      objectId: 'body',
      sizeMode: 'resize-to-fit',
      slideId: 'slide-a',
    })).toMatchObject({
      hasOverflow: false,
      isVisible: false,
      overflowAxis: [],
    })
  })

  it('converts resize handle double-click into an auto-fit host command effect', () => {
    expect(getSlideEditTextAutoFitGestureCommandEffect({
      bounds: { h: 40, w: 100, x: 10, y: 20 },
      handle: 'se',
      maxBounds: { h: 100, w: 200, x: 0, y: 0 },
      measurement: {
        hasOverflow: true,
        measuredSize: { h: 90, w: 220 },
      },
      objectId: 'title',
      sizeMode: 'fixed',
      slideId: 'slide-a',
      type: 'resize-handle-double-click',
    })).toEqual({
      payload: {
        bounds: {
          h: 80,
          w: 190,
          x: 10,
          y: 20,
        },
        handle: 'se',
        id: 'resize-text-box-to-fit',
        objectId: 'title',
        sizeMode: 'resize-to-fit',
      },
      selection: {
        objectIds: ['title'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })
})
