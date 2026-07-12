import type { Bounds } from '@interactive-os/canvas/core'
import {
  parseSlideEditJSONPasteTextValue,
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES,
} from './SlideEditTextJSONPaste'

export type SlideEditTextSlideId = string
export type SlideEditTextObjectId = string

export type SlideEditTextSize = Pick<Bounds, 'h' | 'w'>

export type SlideEditTextBoxSizeMode =
  | 'fixed'
  | 'resize-to-fit'
  | 'shrink-text'

export type SlideEditTextBoxSizeModeDescriptor = {
  changesBounds: boolean
  changesTextScale: boolean
  id: SlideEditTextBoxSizeMode
  label: string
  requiredAdapterSlot: 'text-measurement'
}

export const SLIDE_EDIT_TEXT_BOX_SIZE_MODES = Object.freeze([
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
] as const satisfies readonly SlideEditTextBoxSizeModeDescriptor[])

export type SlideEditTextBoxMeasurement = {
  hasOverflow: boolean
  lineCount?: number
  measuredSize: SlideEditTextSize
}

export type SlideEditTextOverflowAxis = 'horizontal' | 'vertical'

export type SlideEditTextOverflowIndicatorState<
  TSlideId extends SlideEditTextSlideId = SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  anchor: 'bottom-right'
  bounds: Bounds
  hasOverflow: boolean
  isVisible: boolean
  lineCount?: number
  measuredSize: SlideEditTextSize | null
  objectId: TObjectId
  overflowAxis: readonly SlideEditTextOverflowAxis[]
  sizeMode: SlideEditTextBoxSizeMode
  slideId: TSlideId
}

export type SlideEditTextAutoSizeInput = {
  bounds: Bounds
  maxBounds?: Bounds
  measurement: SlideEditTextBoxMeasurement | null
  minSize?: Partial<SlideEditTextSize>
}

export type SlideEditTextResizeHandle =
  | 'e'
  | 'n'
  | 'ne'
  | 'nw'
  | 's'
  | 'se'
  | 'sw'
  | 'w'

export type SlideEditTextAutoFitGestureIntent<
  TSlideId extends SlideEditTextSlideId = SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = SlideEditTextAutoSizeInput & {
  handle: SlideEditTextResizeHandle
  objectId: TObjectId
  sizeMode: SlideEditTextBoxSizeMode
  slideId: TSlideId
  type: 'resize-handle-double-click'
}

export type SlideEditTextAutoFitCommand<
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  bounds: Bounds
  handle: SlideEditTextResizeHandle
  id: 'resize-text-box-to-fit'
  objectId: TObjectId
  sizeMode: 'resize-to-fit'
}

export type SlideEditTextAutoFitHostCommandEffect<
  TSlideId extends SlideEditTextSlideId = SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  payload: SlideEditTextAutoFitCommand<TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextAutoFitDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTextAutoFitSourceFields = {
  handle?: string
  mode: string
  wrapper?: string
}

export type SlideEditTextAutoFitJSONPasteValue = {
  handle: SlideEditTextResizeHandle
  mode: Extract<SlideEditTextBoxSizeMode, 'resize-to-fit'>
  sourceFields: SlideEditTextAutoFitSourceFields
  surface: 'text-auto-fit'
}

export type SlideEditTextAutoFitJSONPasteInput = {
  dataTransfer: SlideEditTextAutoFitDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextAutoFitJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextAutoFitJSONPasteValueOptions = {
  mode?: SlideEditTextAutoFitJSONPasteValueMode
}

export type SlideEditTextAutoFitPasteTarget<
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  bounds: Bounds
  isHidden?: boolean
  isLocked?: boolean
  maxBounds?: Bounds | null
  measurement: SlideEditTextBoxMeasurement | null
  minSize?: Partial<SlideEditTextSize> | null
  objectId: TObjectId
}

export type SlideEditTextAutoFitPasteSkipReason =
  | 'hidden-target'
  | 'locked-target'
  | 'missing-measurement'
  | 'unsupported-target'

export type SlideEditTextAutoFitPasteSkippedTarget<
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  objectId: TObjectId
  reason: SlideEditTextAutoFitPasteSkipReason
}

export type SlideEditTextAutoFitPasteAppliedTarget<
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  bounds: Bounds
  commandId: 'resize-text-box-to-fit'
  effectType: 'slide-command-effect'
  handle: SlideEditTextResizeHandle
  mode: Extract<SlideEditTextBoxSizeMode, 'resize-to-fit'>
  objectId: TObjectId
  sourceFields: SlideEditTextAutoFitSourceFields
}

export type SlideEditTextAutoFitTargetSupportInput<
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  pasteValue: SlideEditTextAutoFitJSONPasteValue
  target: SlideEditTextAutoFitPasteTarget<TObjectId>
}

export type SlideEditTextAutoFitPasteCommandEffectsInput<
  TSlideId extends SlideEditTextSlideId = SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  isTargetSupported?: (
    input: SlideEditTextAutoFitTargetSupportInput<TObjectId>,
  ) => boolean
  pasteValue: SlideEditTextAutoFitJSONPasteValue
  slideId: TSlideId
  targets: readonly SlideEditTextAutoFitPasteTarget<TObjectId>[]
}

export type SlideEditTextAutoFitPasteCommandEffectsResult<
  TSlideId extends SlideEditTextSlideId = SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId = SlideEditTextObjectId,
> = {
  appliedTargets: readonly SlideEditTextAutoFitPasteAppliedTarget<TObjectId>[]
  effects: readonly SlideEditTextAutoFitHostCommandEffect<TSlideId, TObjectId>[]
  pasteValue: SlideEditTextAutoFitJSONPasteValue
  skippedTargets: readonly SlideEditTextAutoFitPasteSkippedTarget<TObjectId>[]
}

export const SLIDE_EDIT_TEXT_AUTO_FIT_IMPORT_MODEL =
  'slide-edit-text-auto-fit-import'
export const SLIDE_EDIT_TEXT_AUTO_FIT_JSON_IMPORT_FORMAT =
  'application-json-slide-edit-text-auto-fit'
export const SLIDE_EDIT_TEXT_AUTO_FIT_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-auto-fit+json'
export const SLIDE_EDIT_TEXT_AUTO_FIT_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES
export const SLIDE_EDIT_TEXT_AUTO_FIT_JSON_WRAPPER_KEYS = Object.freeze([
  'textAutoFit',
  'autoFit',
  'textBoxAutoFit',
  'textOverflow',
] as const)
const SLIDE_EDIT_TEXT_AUTO_FIT_MODE_KEYS = Object.freeze([
  'mode',
  'value',
] as const)
const SLIDE_EDIT_TEXT_AUTO_FIT_HANDLE_KEYS = Object.freeze([
  'handle',
  'resizeHandle',
] as const)

export function getSlideEditTextAutoSizeBounds({
  bounds,
  maxBounds,
  measurement,
  minSize,
}: SlideEditTextAutoSizeInput): Bounds | null {
  if (!measurement) {
    return null
  }

  const minimumSize = normalizeSlideEditTextSize(minSize, {
    h: 1,
    w: 1,
  })
  const maximumSize = getSlideEditTextMaximumSize(bounds, maxBounds, minimumSize)

  return {
    ...bounds,
    h: clampSlideEditTextSize(
      measurement.measuredSize.h,
      minimumSize.h,
      maximumSize.h,
    ),
    w: clampSlideEditTextSize(
      measurement.measuredSize.w,
      minimumSize.w,
      maximumSize.w,
    ),
  }
}

export function getSlideEditTextOverflowIndicatorState<
  TSlideId extends SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId,
>({
  bounds,
  indicatorPadding = 4,
  indicatorSize = 18,
  measurement,
  objectId,
  sizeMode,
  slideId,
}: {
  bounds: Bounds
  indicatorPadding?: number
  indicatorSize?: number
  measurement: SlideEditTextBoxMeasurement | null
  objectId: TObjectId
  sizeMode: SlideEditTextBoxSizeMode
  slideId: TSlideId
}): SlideEditTextOverflowIndicatorState<TSlideId, TObjectId> {
  const overflowAxis = getSlideEditTextOverflowAxis(bounds, measurement)
  const hasOverflow = Boolean(measurement?.hasOverflow) || overflowAxis.length > 0

  return {
    anchor: 'bottom-right',
    bounds: getSlideEditTextOverflowIndicatorBounds({
      bounds,
      indicatorPadding,
      indicatorSize,
    }),
    hasOverflow,
    isVisible: hasOverflow,
    lineCount: measurement?.lineCount,
    measuredSize: measurement?.measuredSize ?? null,
    objectId,
    overflowAxis,
    sizeMode,
    slideId,
  }
}

export function getSlideEditTextAutoFitGestureCommandEffect<
  TSlideId extends SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId,
>(
  intent: SlideEditTextAutoFitGestureIntent<TSlideId, TObjectId>,
): SlideEditTextAutoFitHostCommandEffect<TSlideId, TObjectId> | null {
  const targetBounds = getSlideEditTextAutoSizeBounds(intent)

  if (!targetBounds) {
    return null
  }

  return {
    payload: {
      bounds: targetBounds,
      handle: intent.handle,
      id: 'resize-text-box-to-fit',
      objectId: intent.objectId,
      sizeMode: 'resize-to-fit',
    },
    selection: {
      objectIds: [intent.objectId],
      slideId: intent.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditTextAutoFitJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_AUTO_FIT_JSON_MIME_TYPE,
}: SlideEditTextAutoFitJSONPasteInput):
  SlideEditTextAutoFitJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditTextAutoFitJSONPasteValueFromText(
        customText,
        { mode: 'direct' },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_TEXT_AUTO_FIT_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditTextAutoFitJSONPasteValueFromText(text, {
      mode: 'wrapped',
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditTextAutoFitJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextAutoFitJSONPasteValueOptions,
): SlideEditTextAutoFitJSONPasteValue | null {
  return getSlideEditTextAutoFitJSONPasteValueFromValue(
    parseSlideEditTextAutoFitJSON(text),
    options,
  )
}

export function getSlideEditTextAutoFitJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditTextAutoFitJSONPasteValueOptions = {},
): SlideEditTextAutoFitJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextAutoFitWrappedPasteValue(value)
    : getSlideEditTextAutoFitDirectPasteValue(value)
}

export function getSlideEditTextAutoFitPasteCommandEffects<
  TSlideId extends SlideEditTextSlideId,
  TObjectId extends SlideEditTextObjectId,
>({
  isTargetSupported,
  pasteValue,
  slideId,
  targets,
}: SlideEditTextAutoFitPasteCommandEffectsInput<TSlideId, TObjectId>):
  SlideEditTextAutoFitPasteCommandEffectsResult<TSlideId, TObjectId> {
  const appliedTargets: SlideEditTextAutoFitPasteAppliedTarget<TObjectId>[] = []
  const effects: SlideEditTextAutoFitHostCommandEffect<TSlideId, TObjectId>[] =
    []
  const skippedTargets: SlideEditTextAutoFitPasteSkippedTarget<TObjectId>[] = []

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

    if (!target.measurement) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'missing-measurement',
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

    const effect = getSlideEditTextAutoFitGestureCommandEffect({
      bounds: target.bounds,
      handle: pasteValue.handle,
      maxBounds: target.maxBounds ?? undefined,
      measurement: target.measurement,
      minSize: target.minSize ?? undefined,
      objectId: target.objectId,
      sizeMode: pasteValue.mode,
      slideId,
      type: 'resize-handle-double-click',
    })

    if (!effect) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'missing-measurement',
      })
      continue
    }

    effects.push(effect)
    appliedTargets.push({
      bounds: effect.payload.bounds,
      commandId: effect.payload.id,
      effectType: effect.type,
      handle: effect.payload.handle,
      mode: pasteValue.mode,
      objectId: target.objectId,
      sourceFields: pasteValue.sourceFields,
    })
  }

  return {
    appliedTargets,
    effects,
    pasteValue,
    skippedTargets,
  }
}

export function normalizeSlideEditTextAutoFitMode(
  value: unknown,
): Extract<SlideEditTextBoxSizeMode, 'resize-to-fit'> | null {
  if (value === true) {
    return 'resize-to-fit'
  }

  if (typeof value !== 'string') {
    return null
  }

  switch (value.trim().toLowerCase()) {
    case 'auto':
    case 'fit':
    case 'resize':
    case 'resize-to-fit':
    case 'resizeshapetofittext':
      return 'resize-to-fit'
    default:
      return null
  }
}

export function normalizeSlideEditTextAutoFitHandle(
  value: unknown,
): SlideEditTextResizeHandle {
  if (typeof value !== 'string') {
    return 'se'
  }

  const normalizedValue = value.trim().toLowerCase()

  return isSlideEditTextResizeHandle(normalizedValue)
    ? normalizedValue
    : 'se'
}

function getSlideEditTextMaximumSize(
  bounds: Bounds,
  maxBounds: Bounds | undefined,
  minSize: SlideEditTextSize,
): SlideEditTextSize {
  if (!maxBounds) {
    return {
      h: Number.POSITIVE_INFINITY,
      w: Number.POSITIVE_INFINITY,
    }
  }

  return {
    h: Math.max(minSize.h, maxBounds.y + maxBounds.h - bounds.y),
    w: Math.max(minSize.w, maxBounds.x + maxBounds.w - bounds.x),
  }
}

function getSlideEditTextOverflowAxis(
  bounds: Bounds,
  measurement: SlideEditTextBoxMeasurement | null,
): SlideEditTextOverflowAxis[] {
  if (!measurement) {
    return []
  }

  const axes: SlideEditTextOverflowAxis[] = []

  if (measurement.measuredSize.w > bounds.w) {
    axes.push('horizontal')
  }

  if (measurement.measuredSize.h > bounds.h) {
    axes.push('vertical')
  }

  if (axes.length === 0 && measurement.hasOverflow) {
    axes.push('vertical')
  }

  return axes
}

function getSlideEditTextOverflowIndicatorBounds({
  bounds,
  indicatorPadding,
  indicatorSize,
}: {
  bounds: Bounds
  indicatorPadding: number
  indicatorSize: number
}): Bounds {
  const size = Math.max(1, Number.isFinite(indicatorSize) ? indicatorSize : 18)
  const padding = Math.max(
    0,
    Number.isFinite(indicatorPadding) ? indicatorPadding : 4,
  )

  return {
    h: size,
    w: size,
    x: bounds.x + bounds.w - size - padding,
    y: bounds.y + bounds.h - size - padding,
  }
}

function normalizeSlideEditTextSize(
  input: Partial<SlideEditTextSize> | undefined,
  fallback: SlideEditTextSize,
): SlideEditTextSize {
  return {
    h: normalizeSlideEditTextSizeValue(input?.h, fallback.h),
    w: normalizeSlideEditTextSizeValue(input?.w, fallback.w),
  }
}

function normalizeSlideEditTextSizeValue(
  value: number | undefined,
  fallback: number,
) {
  return Number.isFinite(value) && value !== undefined
    ? Math.max(0, value)
    : fallback
}

function clampSlideEditTextSize(
  value: number,
  minimum: number,
  maximum: number,
) {
  const normalizedValue = Number.isFinite(value) ? Math.max(0, value) : minimum

  return Math.max(minimum, Math.min(maximum, normalizedValue))
}

function getSlideEditTextAutoFitDirectPasteValue(
  value: unknown,
  wrapper?: string,
): SlideEditTextAutoFitJSONPasteValue | null {
  const directMode = normalizeSlideEditTextAutoFitMode(value)

  if (directMode !== null) {
    return {
      handle: 'se',
      mode: directMode,
      sourceFields: {
        mode: 'value',
        ...(wrapper ? { wrapper } : {}),
      },
      surface: 'text-auto-fit',
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const modeField = getSlideEditTextAutoFitModeField(record)

  if (!modeField) {
    return null
  }

  const handleField = getSlideEditTextAutoFitHandleField(record)

  return {
    handle: normalizeSlideEditTextAutoFitHandle(
      handleField ? record[handleField] : null,
    ),
    mode: modeField.mode,
    sourceFields: {
      ...(handleField ? { handle: handleField } : {}),
      mode: modeField.field,
      ...(wrapper ? { wrapper } : {}),
    },
    surface: 'text-auto-fit',
  }
}

function getSlideEditTextAutoFitWrappedPasteValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_AUTO_FIT_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditTextAutoFitDirectPasteValue(
      record[key],
      key,
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditTextAutoFitModeField(record: Record<string, unknown>) {
  for (const field of SLIDE_EDIT_TEXT_AUTO_FIT_MODE_KEYS) {
    if (!Object.hasOwn(record, field)) {
      continue
    }

    const mode = normalizeSlideEditTextAutoFitMode(record[field])

    if (mode !== null) {
      return {
        field,
        mode,
      }
    }
  }

  return null
}

function getSlideEditTextAutoFitHandleField(record: Record<string, unknown>) {
  for (const field of SLIDE_EDIT_TEXT_AUTO_FIT_HANDLE_KEYS) {
    if (Object.hasOwn(record, field)) {
      return field
    }
  }

  return null
}

function isSlideEditTextResizeHandle(
  value: string,
): value is SlideEditTextResizeHandle {
  return [
    'e',
    'n',
    'ne',
    'nw',
    's',
    'se',
    'sw',
    'w',
  ].includes(value)
}

function parseSlideEditTextAutoFitJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
