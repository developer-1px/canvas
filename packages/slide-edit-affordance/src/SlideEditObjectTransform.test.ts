import { describe, expect, it } from 'vitest'

import {
  clampSlideEditObjectTransformToFrame,
  getSlideEditObjectTransformAxisLockedMoveDelta,
  getSlideEditObjectTransformForTarget,
  getSlideEditObjectTransformJSONPasteValue,
  getSlideEditObjectTransformJSONPasteValueFromText,
  getSlideEditObjectTransformJSONPasteValueFromValue,
  getSlideEditObjectTransformMoveDragModifierState,
  getSlideEditObjectTransformPasteCommandEffects,
  hasSlideEditObjectTransformMoveDragExceededThreshold,
  normalizeSlideEditObjectTransform,
  normalizeSlideEditObjectTransformRotation,
  SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_TYPES,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_WRAPPER_KEYS,
  SLIDE_EDIT_OBJECT_TRANSFORM_MOVE_DRAG_START_THRESHOLD,
} from './SlideEditObjectTransform'
import {
  getSlideEditObjectTransformJSONPasteValue as getSlideEditObjectTransformJSONPasteValueFromPackage,
  getSlideEditObjectTransformJSONPasteValueFromText as getSlideEditObjectTransformJSONPasteValueFromTextFromPackage,
  getSlideEditObjectTransformJSONPasteValueFromValue as getSlideEditObjectTransformJSONPasteValueFromValueFromPackage,
  SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL as SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL_FROM_PACKAGE,
  SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT as SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT_FROM_PACKAGE,
} from './index'

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

describe('SlideEditObjectTransform', () => {
  it('exposes shared object transform import metadata', () => {
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL).toBe(
      'slide-edit-object-transform-import',
    )
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT).toBe(
      'application-json-slide-edit-object-transform',
    )
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL_FROM_PACKAGE).toBe(
      SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL,
    )
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT_FROM_PACKAGE).toBe(
      SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT,
    )
  })

  it('maps Shift move drag to an axis-lock modifier state', () => {
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {
        shiftKey: true,
      },
    })).toEqual({
      axisLock: true,
      axisLockModifier: 'Shift',
      duplicate: false,
      duplicateModifier: 'Alt Ctrl/Meta',
      model: 'slide-edit-object-transform-move-drag-modifiers',
    })
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {
        shiftKey: false,
      },
    }).axisLock).toBe(false)
  })

  it('maps Alt and Ctrl/Meta move drag to duplicate-drag modifier state', () => {
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {
        altKey: true,
      },
    }).duplicate).toBe(true)
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {
        ctrlKey: true,
      },
    })).toMatchObject({
      duplicate: true,
      duplicateModifier: 'Alt Ctrl/Meta',
      model: 'slide-edit-object-transform-move-drag-modifiers',
    })
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {
        metaKey: true,
      },
    }).duplicate).toBe(true)
    expect(getSlideEditObjectTransformMoveDragModifierState({
      event: {},
    }).duplicate).toBe(false)
  })

  it('separates duplicate-drag start from modifier-only click by threshold', () => {
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_MOVE_DRAG_START_THRESHOLD).toBe(4)
    expect(hasSlideEditObjectTransformMoveDragExceededThreshold({
      dx: 3,
      dy: 0,
    })).toBe(false)
    expect(hasSlideEditObjectTransformMoveDragExceededThreshold({
      dx: 4,
      dy: 0,
    })).toBe(false)
    expect(hasSlideEditObjectTransformMoveDragExceededThreshold({
      dx: 5,
      dy: 0,
    })).toBe(true)
    expect(hasSlideEditObjectTransformMoveDragExceededThreshold({
      dx: 3,
      dy: 4,
      threshold: 4,
    })).toBe(true)
  })

  it('locks move deltas to the dominant axis for Shift drag movement', () => {
    expect(getSlideEditObjectTransformAxisLockedMoveDelta({
      dx: 96,
      dy: 34,
    })).toEqual({
      axis: 'x',
      dx: 96,
      dy: 0,
    })
    expect(getSlideEditObjectTransformAxisLockedMoveDelta({
      dx: -12,
      dy: -40,
    })).toEqual({
      axis: 'y',
      dx: 0,
      dy: -40,
    })
    expect(getSlideEditObjectTransformAxisLockedMoveDelta({
      dx: 10,
      dy: -10,
    })).toEqual({
      axis: 'x',
      dx: 10,
      dy: 0,
    })
  })

  it('reads direct object transform JSON from the custom clipboard MIME type', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE]: JSON.stringify({
          rotation: 405,
          x: 24.555,
        }),
      }),
    })

    expect(pasteValue).toEqual({
      fields: ['x', 'rotation'],
      format: 'json',
      payloadLength: 27,
      sourceFields: {
        rotation: 'rotation',
        x: 'x',
      },
      sourceType: SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE,
      surface: 'object-transform',
      transform: {
        rotation: 45,
        x: 24.56,
      },
    })
  })

  it('reads wrapped object geometry JSON with bounds aliases', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          objectGeometry: {
            bounds: {
              height: 90,
              left: 12,
              top: 18,
              width: 160,
            },
            rotation: -30,
          },
        }),
      }),
    })

    expect(pasteValue).toMatchObject({
      fields: ['x', 'y', 'w', 'h', 'rotation'],
      sourceFields: {
        h: 'bounds.height',
        rotation: 'rotation',
        w: 'bounds.width',
        wrapper: 'objectGeometry',
        x: 'bounds.left',
        y: 'bounds.top',
      },
      sourceType: 'application/json',
      surface: 'object-transform',
      transform: {
        h: 90,
        rotation: 330,
        w: 160,
        x: 12,
        y: 18,
      },
      wrapper: 'objectGeometry',
    })
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_TYPES).toEqual([
      'application/json',
      'text/json',
      'text/plain',
    ])
    expect(SLIDE_EDIT_OBJECT_TRANSFORM_JSON_WRAPPER_KEYS).toContain(
      'objectTransform',
    )
  })

  it('reads object transform JSON from text and parsed values', () => {
    const wrappedText = JSON.stringify({
      objectGeometry: {
        bounds: {
          height: 90,
          left: 12,
          top: 18,
          width: 160,
        },
        rotation: -30,
      },
    })

    expect(getSlideEditObjectTransformJSONPasteValueFromText(
      wrappedText,
      {
        mode: 'wrapped',
        sourceType: 'application/json',
      },
    )).toMatchObject({
      fields: ['x', 'y', 'w', 'h', 'rotation'],
      payloadLength: wrappedText.length,
      sourceFields: {
        h: 'bounds.height',
        rotation: 'rotation',
        w: 'bounds.width',
        wrapper: 'objectGeometry',
        x: 'bounds.left',
        y: 'bounds.top',
      },
      sourceType: 'application/json',
      transform: {
        h: 90,
        rotation: 330,
        w: 160,
        x: 12,
        y: 18,
      },
      wrapper: 'objectGeometry',
    })
    expect(getSlideEditObjectTransformJSONPasteValueFromValue(
      {
        rotation: 405,
        x: 24.555,
      },
      {
        payloadLength: 27,
        sourceType: SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE,
      },
    )).toMatchObject({
      fields: ['x', 'rotation'],
      payloadLength: 27,
      sourceFields: {
        rotation: 'rotation',
        x: 'x',
      },
      sourceType: SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE,
      transform: {
        rotation: 45,
        x: 24.56,
      },
    })
    expect(getSlideEditObjectTransformJSONPasteValueFromTextFromPackage(
      JSON.stringify({
        transform: {
          h: 50,
          y: 24,
        },
      }),
      { mode: 'wrapped' },
    )).toMatchObject({
      fields: ['y', 'h'],
      wrapper: 'transform',
    })
    expect(getSlideEditObjectTransformJSONPasteValueFromValueFromPackage(
      {
        objectTransform: {
          w: '200.126',
        },
      },
      { mode: 'wrapped' },
    )).toMatchObject({
      fields: ['w'],
      transform: {
        w: 200.13,
      },
      wrapper: 'objectTransform',
    })
  })

  it('preserves missing fields and clamps bounds with frame and minimum size policy', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          objectTransform: {
            h: 500,
            rotation: 405,
            w: 3,
            x: -20,
          },
        }),
      }),
    })

    expect(pasteValue).not.toBeNull()
    if (!pasteValue) {
      return
    }

    expect(getSlideEditObjectTransformForTarget({
      frameBounds: {
        h: 200,
        w: 300,
        x: 0,
        y: 0,
      },
      minSize: {
        h: 18,
        w: 24,
      },
      pasteValue,
      target: {
        bounds: {
          h: 80,
          w: 100,
          x: 10,
          y: 20,
        },
        objectId: 'shape-a',
        rotation: 15,
      },
    })).toEqual({
      h: 200,
      rotation: 45,
      w: 24,
      x: 0,
      y: 0,
    })
  })

  it('creates object-id scoped command effects for multiple targets', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': JSON.stringify({
          transform: {
            rotation: 90,
            y: 30,
          },
        }),
      }),
    })

    expect(pasteValue).not.toBeNull()
    if (!pasteValue) {
      return
    }

    expect(getSlideEditObjectTransformPasteCommandEffects({
      pasteValue,
      slideId: 'slide-a',
      targets: [
        {
          bounds: {
            h: 40,
            w: 100,
            x: 10,
            y: 10,
          },
          objectId: 'object-a',
          rotation: 0,
        },
        {
          bounds: {
            h: 20,
            w: 50,
            x: 120,
            y: 80,
          },
          objectId: 'object-b',
          rotation: 15,
        },
      ],
    })).toMatchObject({
      appliedTargets: [
        {
          commandId: 'update-object-transform',
          effectType: 'slide-command-effect',
          fields: ['y', 'rotation'],
          objectId: 'object-a',
          transform: {
            h: 40,
            rotation: 90,
            w: 100,
            x: 10,
            y: 30,
          },
        },
        {
          commandId: 'update-object-transform',
          effectType: 'slide-command-effect',
          fields: ['y', 'rotation'],
          objectId: 'object-b',
          transform: {
            h: 20,
            rotation: 90,
            w: 50,
            x: 120,
            y: 30,
          },
        },
      ],
      effects: [
        {
          metadata: {
            fields: ['y', 'rotation'],
            format: 'json',
            targetIds: ['object-a'],
          },
          payload: {
            fields: ['y', 'rotation'],
            id: 'update-object-transform',
            objectId: 'object-a',
          },
          selection: {
            objectIds: ['object-a'],
            slideId: 'slide-a',
          },
          type: 'slide-command-effect',
        },
        {
          metadata: {
            fields: ['y', 'rotation'],
            format: 'json',
            targetIds: ['object-b'],
          },
          payload: {
            fields: ['y', 'rotation'],
            id: 'update-object-transform',
            objectId: 'object-b',
          },
          selection: {
            objectIds: ['object-b'],
            slideId: 'slide-a',
          },
          type: 'slide-command-effect',
        },
      ],
      skippedTargets: [],
    })
  })

  it('lets host adapters reject or convert transform payloads for special objects', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          objectTransform: {
            x: 30,
          },
        }),
      }),
    })

    expect(pasteValue).not.toBeNull()
    if (!pasteValue) {
      return
    }

    const result = getSlideEditObjectTransformPasteCommandEffects({
      normalizeTransform: ({ nextTransform, target }) =>
        target.objectId === 'connector'
          ? null
          : {
              bounds: nextTransform,
              kind: 'rect-transform',
            },
      pasteValue,
      targets: [
        {
          bounds: {
            h: 20,
            w: 20,
            x: 0,
            y: 0,
          },
          objectId: 'shape',
        },
        {
          bounds: {
            h: 1,
            w: 1,
            x: 10,
            y: 10,
          },
          objectId: 'connector',
        },
      ],
    })

    expect(result.appliedTargets).toEqual([
      {
        commandId: 'update-object-transform',
        effectType: 'slide-command-effect',
        fields: ['x'],
        objectId: 'shape',
        transform: {
          bounds: {
            h: 20,
            rotation: 0,
            w: 20,
            x: 30,
            y: 0,
          },
          kind: 'rect-transform',
        },
      },
    ])
    expect(result.skippedTargets).toEqual([
      {
        objectId: 'connector',
        reason: 'unsupported-target',
      },
    ])
  })

  it('skips locked hidden and explicitly non-transformable targets', () => {
    const pasteValue = getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          objectTransform: {
            y: 12,
          },
        }),
      }),
    })

    expect(pasteValue).not.toBeNull()
    if (!pasteValue) {
      return
    }

    expect(getSlideEditObjectTransformPasteCommandEffects({
      pasteValue,
      targets: [
        {
          bounds: {
            h: 10,
            w: 10,
            x: 0,
            y: 0,
          },
          isLocked: true,
          objectId: 'locked',
        },
        {
          bounds: {
            h: 10,
            w: 10,
            x: 0,
            y: 0,
          },
          isHidden: true,
          objectId: 'hidden',
        },
        {
          bounds: {
            h: 10,
            w: 10,
            x: 0,
            y: 0,
          },
          isTransformable: false,
          objectId: 'line',
        },
      ],
    }).skippedTargets).toEqual([
      {
        objectId: 'locked',
        reason: 'locked-target',
      },
      {
        objectId: 'hidden',
        reason: 'hidden-target',
      },
      {
        objectId: 'line',
        reason: 'unsupported-target',
      },
    ])
  })

  it('ignores invalid JSON and unwrapped generic transform-looking payloads', () => {
    expect(getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{',
      }),
    })).toBeNull()

    expect(getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': JSON.stringify({
          x: 10,
          y: 20,
        }),
      }),
    })).toBeNull()

    expect(getSlideEditObjectTransformJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE]: JSON.stringify({
          x: Number.NaN,
        }),
      }),
    })).toBeNull()
  })

  it('normalizes transform numbers without leaking host model names', () => {
    expect(normalizeSlideEditObjectTransform({
      h: 10.456,
      rotation: -45,
      w: 20.123,
      x: 1.237,
      y: Number.NaN,
    })).toEqual({
      h: 10.46,
      rotation: 315,
      w: 20.12,
      x: 1.24,
      y: 0,
    })
    expect(normalizeSlideEditObjectTransformRotation(720.456)).toBe(0.46)
    expect(clampSlideEditObjectTransformToFrame({
      frameBounds: {
        h: 100,
        w: 100,
        x: 10,
        y: 20,
      },
      minSize: {
        h: 8,
        w: 12,
      },
      transform: {
        h: 2,
        rotation: 0,
        w: 3,
        x: 0,
        y: 200,
      },
    })).toEqual({
      h: 8,
      rotation: 0,
      w: 12,
      x: 10,
      y: 112,
    })

    const publicStrings = JSON.stringify(
      getSlideEditObjectTransformJSONPasteValue({
        dataTransfer: createDataTransfer({
          [SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE]: JSON.stringify({
            x: 10,
          }),
        }),
      }),
    ).toLowerCase()

    for (const blockedTerm of [
      'canvasitem',
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
      'svg',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})
