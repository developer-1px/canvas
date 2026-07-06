import { describe, expect, it } from 'vitest'

import {
  getSlideEditObjectTransformAxisLockedMoveDelta,
  getSlideEditObjectTransformJSONPasteValueFromValue,
  getSlideEditObjectTransformMoveDragModifierState,
  getSlideEditObjectTransformPasteCommandEffects,
  SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT,
} from './SlideEditObjectTransform'
import {
  SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL as SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL_FROM_PACKAGE,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT as SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT_FROM_PACKAGE,
} from './index'

describe('SlideEditObjectTransform', () => {
  it('exports object transform import model and format metadata', () => {
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL)
      .toBe('slide-edit-object-transform-import')
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT)
      .toBe('application-json-slide-edit-object-transform')
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL)
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT)
  })

  it('keeps move modifier metadata product-neutral', () => {
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {
        metaKey: true,
        shiftKey: true,
      },
    })).toEqual({
      axisLock: true,
      axisLockModifier: 'Shift',
      duplicate: true,
      duplicateModifier: 'Alt Ctrl/Meta',
      model: 'slide-edit-object-transform-move-drag-modifiers',
    })
    expect(getSlideEditObjectTransformAxisLockedMoveDelta({
      dx: 4,
      dy: 10,
    })).toEqual({
      axis: 'y',
      dx: 0,
      dy: 10,
    })
  })

  it('parses object transform JSON paste values into update effects', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValueFromValue(
      {
        objectTransform: {
          position: {
            left: '40.125',
            top: 20,
          },
          size: {
            height: 80,
            width: 120,
          },
          transform: {
            rotation: -15,
          },
        },
      },
      {
        mode: 'wrapped',
        payloadLength: 128,
        sourceType: 'application/json',
      },
    )

    expect(pasteValue).toMatchObject({
      fields: ['x', 'y', 'w', 'h', 'rotation'],
      format: 'json',
      sourceFields: {
        h: 'size.height',
        rotation: 'transform.rotation',
        w: 'size.width',
        wrapper: 'objectTransform',
        x: 'position.left',
        y: 'position.top',
      },
      transform: {
        h: 80,
        rotation: 345,
        w: 120,
        x: 40.13,
        y: 20,
      },
    })
    expect(pasteValue && getSlideEditObjectTransformPasteCommandEffects({
      frameBounds: { h: 200, w: 300, x: 0, y: 0 },
      pasteValue,
      slideId: 'slide-a',
      targets: [
        {
          bounds: { h: 10, w: 10, x: 0, y: 0 },
          objectId: 'object-a',
        },
      ],
    }).effects[0]).toMatchObject({
      payload: {
        fields: ['x', 'y', 'w', 'h', 'rotation'],
        id: 'update-object-transform',
        objectId: 'object-a',
        transform: {
          h: 80,
          rotation: 345,
          w: 120,
          x: 40.13,
          y: 20,
        },
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
    })
  })
})
