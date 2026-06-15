import type { Bounds } from '../../../src/canvas/core'

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
