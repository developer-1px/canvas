import { parseSlideEditJSONPasteTextValue } from './SlideEditTextJSONPaste'

import type { Bounds } from '../../../src/canvas/core'

export type SlideEditObjectTransformSlideId = string
export type SlideEditObjectTransformObjectId = string
export type SlideEditObjectTransformFieldId =
  | 'h'
  | 'rotation'
  | 'w'
  | 'x'
  | 'y'

export type SlideEditObjectTransform = Bounds & {
  rotation: number
}

export type SlideEditObjectTransformPatch =
  Partial<SlideEditObjectTransform>
export type SlideEditObjectTransformSize = Pick<Bounds, 'h' | 'w'>
export type SlideEditObjectTransformDataTransfer = Pick<DataTransfer, 'getData'>
export type SlideEditObjectTransformMoveAxis = 'x' | 'y'

export type SlideEditObjectTransformMoveDelta = {
  dx: number
  dy: number
}

export type SlideEditObjectTransformAxisLockedMoveDelta =
  SlideEditObjectTransformMoveDelta & {
    axis: SlideEditObjectTransformMoveAxis
  }

export type SlideEditObjectTransformMoveDragModifierState = {
  axisLock: boolean
  axisLockModifier: 'Shift'
  duplicate: boolean
  duplicateModifier: 'Alt Ctrl/Meta'
  model: 'slide-edit-object-transform-move-drag-modifiers'
}

export type SlideEditObjectTransformMoveDragModifierInput = {
  event: {
    altKey?: boolean
    ctrlKey?: boolean
    metaKey?: boolean
    shiftKey?: boolean
  }
}

export type SlideEditObjectTransformMoveDragThresholdInput =
  SlideEditObjectTransformMoveDelta & {
    threshold?: number
  }

export type SlideEditObjectTransformSourceFields =
  Partial<Record<SlideEditObjectTransformFieldId, string>> & {
    wrapper?: string
  }

export type SlideEditObjectTransformJSONPasteValue = {
  fields: readonly SlideEditObjectTransformFieldId[]
  format: 'json'
  payloadLength: number
  sourceFields: SlideEditObjectTransformSourceFields
  sourceType: string
  surface: 'object-transform'
  transform: SlideEditObjectTransformPatch
  wrapper?: string
}

export type SlideEditObjectTransformJSONPasteInput = {
  dataTransfer: SlideEditObjectTransformDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditObjectTransformJSONPasteValueMode =
  | 'any'
  | 'direct'
  | 'wrapped'

export type SlideEditObjectTransformJSONPasteValueOptions = {
  mode?: SlideEditObjectTransformJSONPasteValueMode
  payloadLength?: number
  sourceType?: string
}

export type SlideEditObjectTransformPasteTarget<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
> = {
  bounds: Bounds
  frameBounds?: Bounds | null
  isHidden?: boolean
  isLocked?: boolean
  isTransformable?: boolean
  minSize?: Partial<SlideEditObjectTransformSize> | null
  objectId: TObjectId
  rotation?: number | null
}

export type SlideEditObjectTransformPasteSkipReason =
  | 'hidden-target'
  | 'locked-target'
  | 'unsupported-target'

export type SlideEditObjectTransformPasteSkippedTarget<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
> = {
  objectId: TObjectId
  reason: SlideEditObjectTransformPasteSkipReason
}

export type SlideEditObjectTransformPasteAppliedTarget<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
  TTransform = SlideEditObjectTransform,
> = {
  commandId: 'update-object-transform'
  effectType: 'slide-command-effect'
  fields: readonly SlideEditObjectTransformFieldId[]
  objectId: TObjectId
  transform: TTransform
}

export type SlideEditObjectTransformUpdateCommand<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
  TTransform = SlideEditObjectTransform,
> = {
  fields: readonly SlideEditObjectTransformFieldId[]
  id: 'update-object-transform'
  objectId: TObjectId
  transform: TTransform
}

export type SlideEditObjectTransformUpdateCommandMetadata<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
> = {
  fields: readonly SlideEditObjectTransformFieldId[]
  format: 'json'
  payloadLength: number
  targetIds: readonly TObjectId[]
}

export type SlideEditObjectTransformHostCommandEffect<
  TSlideId extends SlideEditObjectTransformSlideId =
    SlideEditObjectTransformSlideId,
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
  TTransform = SlideEditObjectTransform,
> = {
  metadata: SlideEditObjectTransformUpdateCommandMetadata<TObjectId>
  payload: SlideEditObjectTransformUpdateCommand<TObjectId, TTransform>
  selection: {
    objectIds: readonly TObjectId[]
    slideId?: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditObjectTransformTargetSupportInput<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
> = {
  pasteValue: SlideEditObjectTransformJSONPasteValue
  target: SlideEditObjectTransformPasteTarget<TObjectId>
}

export type SlideEditObjectTransformHostAdapterInput<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
> = SlideEditObjectTransformTargetSupportInput<TObjectId> & {
  nextTransform: SlideEditObjectTransform
}

export type SlideEditObjectTransformPasteCommandEffectsInput<
  TSlideId extends SlideEditObjectTransformSlideId =
    SlideEditObjectTransformSlideId,
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
  TTransform = SlideEditObjectTransform,
> = {
  frameBounds?: Bounds | null
  isTargetSupported?: (
    input: SlideEditObjectTransformTargetSupportInput<TObjectId>,
  ) => boolean
  minSize?: Partial<SlideEditObjectTransformSize> | null
  normalizeTransform?: (
    input: SlideEditObjectTransformHostAdapterInput<TObjectId>,
  ) => TTransform | null
  pasteValue: SlideEditObjectTransformJSONPasteValue
  slideId?: TSlideId
  targets: readonly SlideEditObjectTransformPasteTarget<TObjectId>[]
}

export type SlideEditObjectTransformPasteCommandEffectsResult<
  TSlideId extends SlideEditObjectTransformSlideId =
    SlideEditObjectTransformSlideId,
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
  TTransform = SlideEditObjectTransform,
> = {
  appliedTargets: readonly SlideEditObjectTransformPasteAppliedTarget<
    TObjectId,
    TTransform
  >[]
  effects: readonly SlideEditObjectTransformHostCommandEffect<
    TSlideId,
    TObjectId,
    TTransform
  >[]
  pasteValue: SlideEditObjectTransformJSONPasteValue
  skippedTargets: readonly SlideEditObjectTransformPasteSkippedTarget<TObjectId>[]
}

export type SlideEditObjectTransformForTargetInput<
  TObjectId extends SlideEditObjectTransformObjectId =
    SlideEditObjectTransformObjectId,
> = {
  frameBounds?: Bounds | null
  minSize?: Partial<SlideEditObjectTransformSize> | null
  pasteValue: SlideEditObjectTransformJSONPasteValue
  target: SlideEditObjectTransformPasteTarget<TObjectId>
}

export const SLIDE_EDIT_OBJECT_TRANSFORM_IMPORT_MODEL =
  'slide-edit-object-transform-import'
export const SLIDE_EDIT_OBJECT_TRANSFORM_JSON_IMPORT_FORMAT =
  'application-json-slide-edit-object-transform'
export const SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-transform+json'
export const SLIDE_EDIT_OBJECT_TRANSFORM_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)
export const SLIDE_EDIT_OBJECT_TRANSFORM_JSON_WRAPPER_KEYS = Object.freeze([
  'objectTransform',
  'objectGeometry',
  'transform',
  'geometry',
  'bounds',
  'objectBounds',
] as const)
const SLIDE_EDIT_OBJECT_TRANSFORM_FIELDS = Object.freeze([
  'x',
  'y',
  'w',
  'h',
  'rotation',
] as const)
const SLIDE_EDIT_OBJECT_TRANSFORM_FIELD_KEYS = Object.freeze({
  h: ['h', 'height'],
  rotation: ['rotation', 'rotate', 'angle'],
  w: ['w', 'width'],
  x: ['x', 'left'],
  y: ['y', 'top'],
} as const satisfies Record<SlideEditObjectTransformFieldId, readonly string[]>)

export const SLIDE_EDIT_OBJECT_TRANSFORM_MOVE_DRAG_START_THRESHOLD = 4

export function getSlideEditObjectTransformMoveDragModifierState({
  event,
}: SlideEditObjectTransformMoveDragModifierInput):
  SlideEditObjectTransformMoveDragModifierState {
  return {
    axisLock: event.shiftKey === true,
    axisLockModifier: 'Shift',
    duplicate: event.altKey === true ||
      event.ctrlKey === true ||
      event.metaKey === true,
    duplicateModifier: 'Alt Ctrl/Meta',
    model: 'slide-edit-object-transform-move-drag-modifiers',
  }
}

export function hasSlideEditObjectTransformMoveDragExceededThreshold({
  dx,
  dy,
  threshold = SLIDE_EDIT_OBJECT_TRANSFORM_MOVE_DRAG_START_THRESHOLD,
}: SlideEditObjectTransformMoveDragThresholdInput) {
  return Math.hypot(dx, dy) > threshold
}

export function getSlideEditObjectTransformAxisLockedMoveDelta({
  dx,
  dy,
}: SlideEditObjectTransformMoveDelta):
  SlideEditObjectTransformAxisLockedMoveDelta {
  return Math.abs(dx) >= Math.abs(dy)
    ? { axis: 'x', dx, dy: 0 }
    : { axis: 'y', dx: 0, dy }
}

export function getSlideEditObjectTransformJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_OBJECT_TRANSFORM_JSON_MIME_TYPE,
}: SlideEditObjectTransformJSONPasteInput):
  SlideEditObjectTransformJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditObjectTransformJSONPasteValueFromText(customText, {
          mode: 'any',
          payloadLength: customText.length,
          sourceType: jsonMimeType,
        })

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_OBJECT_TRANSFORM_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditObjectTransformJSONPasteValueFromText(text, {
      mode: 'wrapped',
      payloadLength: text.length,
      sourceType: type,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditObjectTransformJSONPasteValueFromText(
  text: string,
  options?: SlideEditObjectTransformJSONPasteValueOptions,
): SlideEditObjectTransformJSONPasteValue | null {
  return getSlideEditObjectTransformJSONPasteValueFromValue(
    parseSlideEditObjectTransformJSON(text),
    {
      ...options,
      payloadLength: options?.payloadLength ?? text.length,
    },
  )
}

export function getSlideEditObjectTransformJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
    payloadLength = 0,
    sourceType = 'value',
  }: SlideEditObjectTransformJSONPasteValueOptions = {},
): SlideEditObjectTransformJSONPasteValue | null {
  switch (mode) {
    case 'any':
      return getSlideEditObjectTransformAnyJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      })
    case 'direct':
      return getSlideEditObjectTransformDirectJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      })
    case 'wrapped':
      return getSlideEditObjectTransformWrappedJSONPasteValue({
        payloadLength,
        sourceType,
        value,
      })
  }
}

export function getSlideEditObjectTransformForTarget<
  TObjectId extends SlideEditObjectTransformObjectId,
>({
  frameBounds,
  minSize,
  pasteValue,
  target,
}: SlideEditObjectTransformForTargetInput<TObjectId>):
  SlideEditObjectTransform {
  const currentTransform = normalizeSlideEditObjectTransform({
    ...target.bounds,
    rotation: target.rotation ?? 0,
  })
  const nextTransform = normalizeSlideEditObjectTransform({
    h: pasteValue.transform.h ?? currentTransform.h,
    rotation: pasteValue.transform.rotation ?? currentTransform.rotation,
    w: pasteValue.transform.w ?? currentTransform.w,
    x: pasteValue.transform.x ?? currentTransform.x,
    y: pasteValue.transform.y ?? currentTransform.y,
  })

  return clampSlideEditObjectTransformToFrame({
    frameBounds: target.frameBounds ?? frameBounds,
    minSize: target.minSize ?? minSize,
    transform: nextTransform,
  })
}

export function getSlideEditObjectTransformPasteCommandEffects<
  TSlideId extends SlideEditObjectTransformSlideId,
  TObjectId extends SlideEditObjectTransformObjectId,
  TTransform = SlideEditObjectTransform,
>({
  frameBounds,
  isTargetSupported,
  minSize,
  normalizeTransform = ({ nextTransform }) => nextTransform as TTransform,
  pasteValue,
  slideId,
  targets,
}: SlideEditObjectTransformPasteCommandEffectsInput<
  TSlideId,
  TObjectId,
  TTransform
>): SlideEditObjectTransformPasteCommandEffectsResult<
  TSlideId,
  TObjectId,
  TTransform
> {
  const appliedTargets: SlideEditObjectTransformPasteAppliedTarget<
    TObjectId,
    TTransform
  >[] = []
  const effects: SlideEditObjectTransformHostCommandEffect<
    TSlideId,
    TObjectId,
    TTransform
  >[] = []
  const skippedTargets: SlideEditObjectTransformPasteSkippedTarget<TObjectId>[] =
    []

  for (const target of targets) {
    if (target.isLocked) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'locked-target',
      })
      continue
    }

    if (target.isHidden) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'hidden-target',
      })
      continue
    }

    if (target.isTransformable === false) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'unsupported-target',
      })
      continue
    }

    if (
      isTargetSupported &&
      !isTargetSupported({
        pasteValue,
        target,
      })
    ) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'unsupported-target',
      })
      continue
    }

    const nextTransform = getSlideEditObjectTransformForTarget({
      frameBounds,
      minSize,
      pasteValue,
      target,
    })
    const hostTransform = normalizeTransform({
      nextTransform,
      pasteValue,
      target,
    })

    if (hostTransform === null) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'unsupported-target',
      })
      continue
    }

    const effect: SlideEditObjectTransformHostCommandEffect<
      TSlideId,
      TObjectId,
      TTransform
    > = {
      metadata: {
        fields: pasteValue.fields,
        format: pasteValue.format,
        payloadLength: pasteValue.payloadLength,
        targetIds: [target.objectId],
      },
      payload: {
        fields: pasteValue.fields,
        id: 'update-object-transform',
        objectId: target.objectId,
        transform: hostTransform,
      },
      selection: {
        objectIds: [target.objectId],
        ...(slideId === undefined ? {} : { slideId }),
      },
      type: 'slide-command-effect',
    }

    effects.push(effect)
    appliedTargets.push({
      commandId: effect.payload.id,
      effectType: effect.type,
      fields: effect.payload.fields,
      objectId: target.objectId,
      transform: hostTransform,
    })
  }

  return {
    appliedTargets,
    effects,
    pasteValue,
    skippedTargets,
  }
}

export function normalizeSlideEditObjectTransform(
  transform: Partial<SlideEditObjectTransform>,
): SlideEditObjectTransform {
  return {
    h: normalizeSlideEditObjectTransformSizeValue(transform.h, 1),
    rotation: normalizeSlideEditObjectTransformRotation(transform.rotation, 0),
    w: normalizeSlideEditObjectTransformSizeValue(transform.w, 1),
    x: normalizeSlideEditObjectTransformNumber(transform.x, 0),
    y: normalizeSlideEditObjectTransformNumber(transform.y, 0),
  }
}

export function normalizeSlideEditObjectTransformRotation(
  value: unknown,
  fallback = 0,
) {
  const numberValue = toSlideEditObjectTransformFiniteNumber(value)

  if (numberValue === null) {
    return fallback
  }

  const rounded = roundSlideEditObjectTransformNumber(numberValue)
  const normalized = rounded % 360

  return normalized < 0
    ? roundSlideEditObjectTransformNumber(normalized + 360)
    : roundSlideEditObjectTransformNumber(normalized)
}

export function clampSlideEditObjectTransformToFrame({
  frameBounds,
  minSize,
  transform,
}: {
  frameBounds?: Bounds | null
  minSize?: Partial<SlideEditObjectTransformSize> | null
  transform: SlideEditObjectTransform
}) {
  const minimumSize = normalizeSlideEditObjectTransformMinSize(minSize)
  const sizedTransform = {
    ...transform,
    h: Math.max(minimumSize.h, transform.h),
    w: Math.max(minimumSize.w, transform.w),
  }

  if (!frameBounds || frameBounds.w <= 0 || frameBounds.h <= 0) {
    return sizedTransform
  }

  const frame = normalizeSlideEditObjectTransformBounds(frameBounds)
  const w = Math.min(Math.max(minimumSize.w, sizedTransform.w), frame.w)
  const h = Math.min(Math.max(minimumSize.h, sizedTransform.h), frame.h)
  const maxX = frame.x + frame.w - w
  const maxY = frame.y + frame.h - h

  return {
    ...sizedTransform,
    h,
    w,
    x: clampSlideEditObjectTransformNumber(sizedTransform.x, frame.x, maxX),
    y: clampSlideEditObjectTransformNumber(sizedTransform.y, frame.y, maxY),
  }
}

function getSlideEditObjectTransformAnyJSONPasteValue({
  payloadLength,
  sourceType,
  value,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
}) {
  return getSlideEditObjectTransformDirectJSONPasteValue({
    payloadLength,
    sourceType,
    value,
  }) ?? getSlideEditObjectTransformWrappedJSONPasteValue({
    payloadLength,
    sourceType,
    value,
  })
}

function getSlideEditObjectTransformWrappedJSONPasteValue({
  payloadLength,
  sourceType,
  value,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
}): SlideEditObjectTransformJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_OBJECT_TRANSFORM_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditObjectTransformDirectJSONPasteValue({
      payloadLength,
      sourceType,
      value: record[key],
      wrapper: key,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditObjectTransformDirectJSONPasteValue({
  payloadLength,
  sourceType,
  value,
  wrapper,
}: {
  payloadLength: number
  sourceType: string
  value: unknown
  wrapper?: string
}): SlideEditObjectTransformJSONPasteValue | null {
  const sourceFields: SlideEditObjectTransformSourceFields = wrapper
    ? { wrapper }
    : {}
  const transform = getSlideEditObjectTransformPatch(value, sourceFields)
  const fields = SLIDE_EDIT_OBJECT_TRANSFORM_FIELDS.filter((field) =>
    transform[field] !== undefined
  )

  if (fields.length === 0) {
    return null
  }

  return {
    fields,
    format: 'json',
    payloadLength,
    sourceFields,
    sourceType,
    surface: 'object-transform',
    transform,
    ...(wrapper ? { wrapper } : {}),
  }
}

function getSlideEditObjectTransformPatch(
  value: unknown,
  sourceFields: SlideEditObjectTransformSourceFields,
): SlideEditObjectTransformPatch {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const record = value as Record<string, unknown>
  const transform: SlideEditObjectTransformPatch = {}

  readSlideEditObjectTransformFields({
    record: getRecordValue(record.bounds),
    sourceFields,
    sourcePrefix: 'bounds',
    transform,
  })
  readSlideEditObjectTransformFields({
    record: getRecordValue(record.position),
    sourceFields,
    sourcePrefix: 'position',
    transform,
  })
  readSlideEditObjectTransformFields({
    record: getRecordValue(record.size),
    sourceFields,
    sourcePrefix: 'size',
    transform,
  })
  readSlideEditObjectTransformFields({
    record: getRecordValue(record.transform),
    sourceFields,
    sourcePrefix: 'transform',
    transform,
  })
  readSlideEditObjectTransformFields({
    record,
    sourceFields,
    sourcePrefix: '',
    transform,
  })

  return transform
}

function readSlideEditObjectTransformFields({
  record,
  sourceFields,
  sourcePrefix,
  transform,
}: {
  record: Record<string, unknown> | null
  sourceFields: SlideEditObjectTransformSourceFields
  sourcePrefix: string
  transform: SlideEditObjectTransformPatch
}) {
  if (!record) {
    return
  }

  for (const field of SLIDE_EDIT_OBJECT_TRANSFORM_FIELDS) {
    const fieldValue = getSlideEditObjectTransformFieldValue(record, field)

    if (!fieldValue) {
      continue
    }

    transform[field] = field === 'rotation'
      ? normalizeSlideEditObjectTransformRotation(fieldValue.value)
      : roundSlideEditObjectTransformNumber(fieldValue.value)
    sourceFields[field] = sourcePrefix
      ? `${sourcePrefix}.${fieldValue.key}`
      : fieldValue.key
  }
}

function getSlideEditObjectTransformFieldValue(
  record: Record<string, unknown>,
  field: SlideEditObjectTransformFieldId,
) {
  for (const key of SLIDE_EDIT_OBJECT_TRANSFORM_FIELD_KEYS[field]) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const value = toSlideEditObjectTransformFiniteNumber(record[key])

    if (value !== null) {
      return {
        key,
        value,
      }
    }
  }

  return null
}

function normalizeSlideEditObjectTransformBounds(bounds: Partial<Bounds>) {
  return {
    h: normalizeSlideEditObjectTransformSizeValue(bounds.h, 1),
    w: normalizeSlideEditObjectTransformSizeValue(bounds.w, 1),
    x: normalizeSlideEditObjectTransformNumber(bounds.x, 0),
    y: normalizeSlideEditObjectTransformNumber(bounds.y, 0),
  }
}

function normalizeSlideEditObjectTransformMinSize(
  minSize: Partial<SlideEditObjectTransformSize> | null | undefined,
) {
  return {
    h: normalizeSlideEditObjectTransformSizeValue(minSize?.h, 1),
    w: normalizeSlideEditObjectTransformSizeValue(minSize?.w, 1),
  }
}

function normalizeSlideEditObjectTransformSizeValue(
  value: unknown,
  fallback: number,
) {
  const numberValue = toSlideEditObjectTransformFiniteNumber(value)

  return numberValue === null
    ? fallback
    : Math.max(1, roundSlideEditObjectTransformNumber(numberValue))
}

function normalizeSlideEditObjectTransformNumber(
  value: unknown,
  fallback: number,
) {
  const numberValue = toSlideEditObjectTransformFiniteNumber(value)

  return numberValue === null
    ? fallback
    : roundSlideEditObjectTransformNumber(numberValue)
}

function clampSlideEditObjectTransformNumber(
  value: number,
  min: number,
  max: number,
) {
  if (max < min) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function roundSlideEditObjectTransformNumber(value: number) {
  return Math.round(value * 100) / 100
}

function toSlideEditObjectTransformFiniteNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

function getRecordValue(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function parseSlideEditObjectTransformJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
