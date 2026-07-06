import { describe, expect, it } from 'vitest'

import {
  getSlideEditTextAutoFitGestureCommandEffect,
  getSlideEditTextAutoFitJSONPasteValue,
  getSlideEditTextAutoFitJSONPasteValueFromText,
  getSlideEditTextAutoFitJSONPasteValueFromValue,
  getSlideEditTextAutoFitPasteCommandEffects,
  getSlideEditTextAutoSizeBounds,
  getSlideEditTextOverflowIndicatorState,
  SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL,
  SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT,
  SLIDE_EDIT_TEXT_AUTO_FIT_JSON_MIME_TYPE,
  SLIDE_EDIT_TEXT_BOX_SIZE_MODES,
} from './SlideEditTextBoxAutoFit'
import {
  getSlideEditTextAutoFitJSONPasteValueFromText as getSlideEditTextAutoFitJSONPasteValueFromTextFromPackage,
  getSlideEditTextAutoFitJSONPasteValueFromValue as getSlideEditTextAutoFitJSONPasteValueFromValueFromPackage,
  SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL as SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL_FROM_PACKAGE,
  SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT as SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT_FROM_PACKAGE,
} from './index'

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

  it('exports text auto-fit import model and format metadata', () => {
    expect(SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL)
      .toBe('slide-edit-text-auto-fit-import')
    expect(SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT)
      .toBe('application-json-slide-edit-text-auto-fit')
    expect(SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL)
    expect(SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT)
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

  it('parses auto-fit JSON paste values into resize command effects', () => {
    const pasteValue = getSlideEditTextAutoFitJSONPasteValueFromValue(
      {
        textAutoFit: {
          handle: 's',
          mode: 'resize-to-fit',
        },
      },
      { mode: 'wrapped' },
    )

    expect(pasteValue).toEqual({
      handle: 's',
      mode: 'resize-to-fit',
      sourceFields: {
        handle: 'handle',
        mode: 'mode',
        wrapper: 'textAutoFit',
      },
      surface: 'text-auto-fit',
    })
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"autoFit":{"value":"fit","handle":"n"}}',
      }),
    })).toEqual({
      handle: 'n',
      mode: 'resize-to-fit',
      sourceFields: {
        handle: 'handle',
        mode: 'value',
        wrapper: 'autoFit',
      },
      surface: 'text-auto-fit',
    })
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain':
          '{"textOverflow":{"mode":"auto","resizeHandle":"e"}}',
      }),
    })).toEqual({
      handle: 'e',
      mode: 'resize-to-fit',
      sourceFields: {
        handle: 'resizeHandle',
        mode: 'mode',
        wrapper: 'textOverflow',
      },
      surface: 'text-auto-fit',
    })
  })

  it('reads text auto-fit JSON from text and parsed values', () => {
    expect(getSlideEditTextAutoFitJSONPasteValueFromText(
      '{"mode":"resize-to-fit","handle":"sw"}',
    )).toEqual({
      handle: 'sw',
      mode: 'resize-to-fit',
      sourceFields: {
        handle: 'handle',
        mode: 'mode',
      },
      surface: 'text-auto-fit',
    })
    expect(getSlideEditTextAutoFitJSONPasteValueFromValue({
      textAutoFit: {
        mode: 'fit',
        resizeHandle: 'e',
      },
    }, { mode: 'wrapped' })).toEqual({
      handle: 'e',
      mode: 'resize-to-fit',
      sourceFields: {
        handle: 'resizeHandle',
        mode: 'mode',
        wrapper: 'textAutoFit',
      },
      surface: 'text-auto-fit',
    })
    expect(getSlideEditTextAutoFitJSONPasteValueFromTextFromPackage(
      '{"autoFit":true}',
      { mode: 'wrapped' },
    )).toEqual({
      handle: 'se',
      mode: 'resize-to-fit',
      sourceFields: {
        mode: 'value',
        wrapper: 'autoFit',
      },
      surface: 'text-auto-fit',
    })
    expect(getSlideEditTextAutoFitJSONPasteValueFromValueFromPackage({
      mode: 'auto',
      resizeHandle: 'n',
    })).toEqual({
      handle: 'n',
      mode: 'resize-to-fit',
      sourceFields: {
        handle: 'resizeHandle',
        mode: 'mode',
      },
      surface: 'text-auto-fit',
    })
    expect(getSlideEditTextAutoFitJSONPasteValueFromText(
      '{"mode":"fit"}',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('converts text auto-fit paste values into host command effects', () => {
    const pasteValue = getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"textAutoFit":{"mode":"resize","handle":"se"}}',
      }),
    })
    const result = getSlideEditTextAutoFitPasteCommandEffects({
      isTargetSupported: ({ target }) => target.objectId !== 'policy-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
      targets: [
        {
          bounds: { h: 40, w: 100, x: 10, y: 20 },
          maxBounds: { h: 100, w: 200, x: 0, y: 0 },
          measurement: {
            hasOverflow: true,
            measuredSize: { h: 90, w: 220 },
          },
          objectId: 'title',
        },
        {
          bounds: { h: 30, w: 80, x: 30, y: 40 },
          measurement: {
            hasOverflow: true,
            measuredSize: { h: 50, w: 120 },
          },
          objectId: 'body',
        },
        {
          bounds: { h: 30, w: 80, x: 0, y: 0 },
          isLocked: true,
          measurement: {
            hasOverflow: true,
            measuredSize: { h: 50, w: 120 },
          },
          objectId: 'locked-a',
        },
        {
          bounds: { h: 30, w: 80, x: 0, y: 0 },
          isHidden: true,
          measurement: {
            hasOverflow: true,
            measuredSize: { h: 50, w: 120 },
          },
          objectId: 'hidden-a',
        },
        {
          bounds: { h: 30, w: 80, x: 0, y: 0 },
          measurement: null,
          objectId: 'missing-measurement-a',
        },
        {
          bounds: { h: 30, w: 80, x: 0, y: 0 },
          measurement: {
            hasOverflow: true,
            measuredSize: { h: 50, w: 120 },
          },
          objectId: 'policy-a',
        },
      ],
    })

    expect(result.effects).toEqual([
      {
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
      },
      {
        payload: {
          bounds: {
            h: 50,
            w: 120,
            x: 30,
            y: 40,
          },
          handle: 'se',
          id: 'resize-text-box-to-fit',
          objectId: 'body',
          sizeMode: 'resize-to-fit',
        },
        selection: {
          objectIds: ['body'],
          slideId: 'slide-a',
        },
        type: 'slide-command-effect',
      },
    ])
    expect(result.appliedTargets).toEqual([
      {
        bounds: {
          h: 80,
          w: 190,
          x: 10,
          y: 20,
        },
        commandId: 'resize-text-box-to-fit',
        effectType: 'slide-command-effect',
        handle: 'se',
        mode: 'resize-to-fit',
        objectId: 'title',
        sourceFields: {
          handle: 'handle',
          mode: 'mode',
          wrapper: 'textAutoFit',
        },
      },
      {
        bounds: {
          h: 50,
          w: 120,
          x: 30,
          y: 40,
        },
        commandId: 'resize-text-box-to-fit',
        effectType: 'slide-command-effect',
        handle: 'se',
        mode: 'resize-to-fit',
        objectId: 'body',
        sourceFields: {
          handle: 'handle',
          mode: 'mode',
          wrapper: 'textAutoFit',
        },
      },
    ])
    expect(result.skippedTargets).toEqual([
      {
        objectId: 'locked-a',
        reason: 'locked-target',
      },
      {
        objectId: 'hidden-a',
        reason: 'hidden-target',
      },
      {
        objectId: 'missing-measurement-a',
        reason: 'missing-measurement',
      },
      {
        objectId: 'policy-a',
        reason: 'unsupported-target',
      },
    ])
  })

  it('ignores invalid, unrelated, and unsafe text auto-fit JSON candidates', () => {
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'resize',
      }),
    })).toBeNull()
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"mode":"fit"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"textAutoFit":"fixed"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"textAutoFit":false}',
      }),
    })).toBeNull()
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":"resize"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextAutoFitJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_AUTO_FIT_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData(type: string) {
      return values[type] ?? ''
    },
  }
}
