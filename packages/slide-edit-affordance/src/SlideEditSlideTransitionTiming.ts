export type SlideEditTransitionSlideId = string

export type SlideEditBuiltInTransitionType = 'fade' | 'none' | 'push'
export type SlideEditTransitionType =
  | SlideEditBuiltInTransitionType
  | (string & {})

export type SlideEditTransitionTypeDescriptor<
  TTransitionType extends string = SlideEditTransitionType,
> = {
  id: TTransitionType
  label: string
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTransitionAdvancePolicy = {
  afterMs?: number
  onClick: boolean
}

export type SlideEditTransitionTimingLimits = {
  maxAdvanceAfterMs: number
  maxDurationMs: number
  minDurationMs: number
}

export type SlideEditSlideTransitionDescriptor<
  TSlideId extends SlideEditTransitionSlideId = SlideEditTransitionSlideId,
  TTransitionType extends string = SlideEditTransitionType,
> = {
  advance: SlideEditTransitionAdvancePolicy
  durationMs: number
  slideId: TSlideId
  type: TTransitionType
}

export type SlideEditTransitionFieldId =
  | 'advance'
  | 'durationMs'
  | 'type'

export type SlideEditTransitionUpdateCommand<
  TSlideId extends SlideEditTransitionSlideId = SlideEditTransitionSlideId,
  TTransitionType extends string = SlideEditTransitionType,
> =
  | {
    fieldId: 'advance'
    id: 'update-slide-transition'
    slideId: TSlideId
    value: SlideEditTransitionAdvancePolicy
  }
  | {
    fieldId: 'durationMs'
    id: 'update-slide-transition'
    slideId: TSlideId
    value: number
  }
  | {
    fieldId: 'type'
    id: 'update-slide-transition'
    slideId: TSlideId
    value: TTransitionType
  }

export type SlideEditTransitionHostCommandEffect<
  TSlideId extends SlideEditTransitionSlideId = SlideEditTransitionSlideId,
  TTransitionType extends string = SlideEditTransitionType,
> = {
  payload: SlideEditTransitionUpdateCommand<TSlideId, TTransitionType>
  selection: {
    objectIds: readonly never[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_TRANSITION_TIMING_LIMITS = Object.freeze({
  maxAdvanceAfterMs: 86_400_000,
  maxDurationMs: 60_000,
  minDurationMs: 0,
} as const satisfies SlideEditTransitionTimingLimits)

export const SLIDE_EDIT_TRANSITION_TYPES = Object.freeze([
  {
    id: 'none',
    label: 'None',
    requiredAdapterSlot: 'command-effect',
  },
  {
    id: 'fade',
    label: 'Fade',
    requiredAdapterSlot: 'command-effect',
  },
  {
    id: 'push',
    label: 'Push',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditTransitionTypeDescriptor<
  SlideEditBuiltInTransitionType
>[])

export const SLIDE_EDIT_DEFAULT_TRANSITION = Object.freeze({
  advance: {
    onClick: true,
  },
  durationMs: 0,
  type: 'none',
} as const satisfies Omit<
  SlideEditSlideTransitionDescriptor,
  'slideId'
>)

export function createSlideEditTransitionDescriptor<
  TSlideId extends SlideEditTransitionSlideId,
  TTransitionType extends string = SlideEditTransitionType,
>({
  advance = SLIDE_EDIT_DEFAULT_TRANSITION.advance,
  durationMs = SLIDE_EDIT_DEFAULT_TRANSITION.durationMs,
  slideId,
  type = SLIDE_EDIT_DEFAULT_TRANSITION.type as TTransitionType,
}: {
  advance?: Partial<SlideEditTransitionAdvancePolicy> | null
  durationMs?: number | null
  slideId: TSlideId
  type?: TTransitionType | null
}): SlideEditSlideTransitionDescriptor<TSlideId, TTransitionType> {
  return {
    advance: normalizeSlideEditTransitionAdvancePolicy(advance),
    durationMs: normalizeSlideEditTransitionDurationMs(durationMs),
    slideId,
    type: type ?? (SLIDE_EDIT_DEFAULT_TRANSITION.type as TTransitionType),
  }
}

export function getSlideEditTransitionUpdateCommandEffect<
  TSlideId extends SlideEditTransitionSlideId,
  TTransitionType extends string = SlideEditTransitionType,
>(
  command: SlideEditTransitionUpdateCommand<TSlideId, TTransitionType>,
): SlideEditTransitionHostCommandEffect<TSlideId, TTransitionType> {
  return {
    payload: normalizeSlideEditTransitionUpdateCommand(command),
    selection: {
      objectIds: [],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTransitionUpdateCommand<
  TSlideId extends SlideEditTransitionSlideId,
  TTransitionType extends string = SlideEditTransitionType,
>(
  command: SlideEditTransitionUpdateCommand<TSlideId, TTransitionType>,
): SlideEditTransitionUpdateCommand<TSlideId, TTransitionType> {
  switch (command.fieldId) {
    case 'advance':
      return {
        ...command,
        value: normalizeSlideEditTransitionAdvancePolicy(command.value),
      }
    case 'durationMs':
      return {
        ...command,
        value: normalizeSlideEditTransitionDurationMs(command.value),
      }
    case 'type':
      return command
  }
}

export function normalizeSlideEditTransitionAdvancePolicy(
  advance: Partial<SlideEditTransitionAdvancePolicy> | null | undefined,
): SlideEditTransitionAdvancePolicy {
  const afterMs = normalizeOptionalSlideEditTransitionAfterMs(advance?.afterMs)

  return afterMs === undefined
    ? { onClick: advance?.onClick ?? true }
    : {
      afterMs,
      onClick: advance?.onClick ?? true,
    }
}

export function normalizeSlideEditTransitionDurationMs(
  durationMs: number | null | undefined,
  limits: SlideEditTransitionTimingLimits = SLIDE_EDIT_TRANSITION_TIMING_LIMITS,
) {
  return clampIntegerTimingValue(
    durationMs,
    limits.minDurationMs,
    limits.maxDurationMs,
    SLIDE_EDIT_DEFAULT_TRANSITION.durationMs,
  )
}

function normalizeOptionalSlideEditTransitionAfterMs(
  afterMs: number | null | undefined,
) {
  if (afterMs === null || afterMs === undefined || !Number.isFinite(afterMs)) {
    return undefined
  }

  if (afterMs <= 0) {
    return undefined
  }

  return clampIntegerTimingValue(
    afterMs,
    1,
    SLIDE_EDIT_TRANSITION_TIMING_LIMITS.maxAdvanceAfterMs,
    undefined,
  )
}

function clampIntegerTimingValue(
  value: number | null | undefined,
  min: number,
  max: number,
  fallback: number,
): number
function clampIntegerTimingValue(
  value: number | null | undefined,
  min: number,
  max: number,
  fallback: undefined,
): number | undefined
function clampIntegerTimingValue(
  value: number | null | undefined,
  min: number,
  max: number,
  fallback: number | undefined,
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, Math.round(value)))
}
