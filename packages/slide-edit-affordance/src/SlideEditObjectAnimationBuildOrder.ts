export type SlideEditAnimationSlideId = string
export type SlideEditAnimationObjectId = string

export type SlideEditBuiltInAnimationType = 'fade-in' | 'fly-in' | 'none'
export type SlideEditAnimationType =
  | SlideEditBuiltInAnimationType
  | (string & {})

export type SlideEditBuiltInAnimationTrigger =
  | 'on-click'
  | 'with-previous'
export type SlideEditAnimationTrigger =
  | SlideEditBuiltInAnimationTrigger
  | (string & {})

export type SlideEditObjectAnimationTypeDescriptor<
  TAnimationType extends string = SlideEditAnimationType,
> = {
  id: TAnimationType
  label: string
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectAnimationTriggerDescriptor<
  TTrigger extends string = SlideEditAnimationTrigger,
> = {
  id: TTrigger
  label: string
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditObjectAnimationTimingLimits = {
  maxBuildOrder: number
  maxDelayMs: number
  maxDurationMs: number
  minBuildOrder: number
  minDelayMs: number
  minDurationMs: number
}

export type SlideEditObjectAnimationDescriptor<
  TSlideId extends SlideEditAnimationSlideId = SlideEditAnimationSlideId,
  TObjectId extends SlideEditAnimationObjectId = SlideEditAnimationObjectId,
  TAnimationType extends string = SlideEditAnimationType,
  TTrigger extends string = SlideEditAnimationTrigger,
> = {
  delayMs: number
  durationMs: number
  objectId: TObjectId
  order: number
  slideId: TSlideId
  trigger: TTrigger
  type: TAnimationType
}

export type SlideEditObjectAnimationCSSStyle = {
  animationDelay: string
  animationDuration: string
}

export type SlideEditObjectAnimationCSSStyleInput = {
  delayMs?: number | null
  durationMs?: number | null
}

export type SlideEditObjectAnimationFieldId =
  | 'delayMs'
  | 'durationMs'
  | 'order'
  | 'trigger'
  | 'type'

export type SlideEditObjectAnimationUpdateCommand<
  TSlideId extends SlideEditAnimationSlideId = SlideEditAnimationSlideId,
  TObjectId extends SlideEditAnimationObjectId = SlideEditAnimationObjectId,
  TAnimationType extends string = SlideEditAnimationType,
  TTrigger extends string = SlideEditAnimationTrigger,
> =
  | {
    fieldId: 'delayMs'
    id: 'update-object-animation'
    objectId: TObjectId
    slideId: TSlideId
    value: number
  }
  | {
    fieldId: 'durationMs'
    id: 'update-object-animation'
    objectId: TObjectId
    slideId: TSlideId
    value: number
  }
  | {
    fieldId: 'order'
    id: 'update-object-animation'
    objectId: TObjectId
    slideId: TSlideId
    value: number
  }
  | {
    fieldId: 'trigger'
    id: 'update-object-animation'
    objectId: TObjectId
    slideId: TSlideId
    value: TTrigger
  }
  | {
    fieldId: 'type'
    id: 'update-object-animation'
    objectId: TObjectId
    slideId: TSlideId
    value: TAnimationType
  }

export type SlideEditObjectAnimationHostCommandEffect<
  TSlideId extends SlideEditAnimationSlideId = SlideEditAnimationSlideId,
  TObjectId extends SlideEditAnimationObjectId = SlideEditAnimationObjectId,
  TAnimationType extends string = SlideEditAnimationType,
  TTrigger extends string = SlideEditAnimationTrigger,
> = {
  payload: SlideEditObjectAnimationUpdateCommand<
    TSlideId,
    TObjectId,
    TAnimationType,
    TTrigger
  >
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_OBJECT_ANIMATION_LIMITS = Object.freeze({
  maxBuildOrder: 10_000,
  maxDelayMs: 60_000,
  maxDurationMs: 60_000,
  minBuildOrder: 0,
  minDelayMs: 0,
  minDurationMs: 0,
} as const satisfies SlideEditObjectAnimationTimingLimits)

export const SLIDE_EDIT_OBJECT_ANIMATION_TYPES = Object.freeze([
  {
    id: 'none',
    label: 'None',
    requiredAdapterSlot: 'command-effect',
  },
  {
    id: 'fade-in',
    label: 'Fade in',
    requiredAdapterSlot: 'command-effect',
  },
  {
    id: 'fly-in',
    label: 'Fly in',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditObjectAnimationTypeDescriptor<
  SlideEditBuiltInAnimationType
>[])

export const SLIDE_EDIT_OBJECT_ANIMATION_TRIGGERS = Object.freeze([
  {
    id: 'on-click',
    label: 'On click',
    requiredAdapterSlot: 'command-effect',
  },
  {
    id: 'with-previous',
    label: 'With previous',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditObjectAnimationTriggerDescriptor<
  SlideEditBuiltInAnimationTrigger
>[])

export const SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION = Object.freeze({
  delayMs: 0,
  durationMs: 0,
  order: 0,
  trigger: 'on-click',
  type: 'none',
} as const satisfies Omit<
  SlideEditObjectAnimationDescriptor,
  'objectId' | 'slideId'
>)

export function createSlideEditObjectAnimationDescriptor<
  TSlideId extends SlideEditAnimationSlideId,
  TObjectId extends SlideEditAnimationObjectId,
  TAnimationType extends string = SlideEditAnimationType,
  TTrigger extends string = SlideEditAnimationTrigger,
>({
  delayMs = SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.delayMs,
  durationMs = SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.durationMs,
  objectId,
  order = SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.order,
  slideId,
  trigger = SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.trigger as TTrigger,
  type = SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.type as TAnimationType,
}: {
  delayMs?: number | null
  durationMs?: number | null
  objectId: TObjectId
  order?: number | null
  slideId: TSlideId
  trigger?: TTrigger | null
  type?: TAnimationType | null
}): SlideEditObjectAnimationDescriptor<
  TSlideId,
  TObjectId,
  TAnimationType,
  TTrigger
> {
  return {
    delayMs: normalizeSlideEditObjectAnimationDelayMs(delayMs),
    durationMs: normalizeSlideEditObjectAnimationDurationMs(durationMs),
    objectId,
    order: normalizeSlideEditObjectAnimationOrder(order),
    slideId,
    trigger: trigger ??
      (SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.trigger as TTrigger),
    type: type ?? (SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION.type as TAnimationType),
  }
}

export function getSlideEditObjectAnimationUpdateCommandEffect<
  TSlideId extends SlideEditAnimationSlideId,
  TObjectId extends SlideEditAnimationObjectId,
  TAnimationType extends string = SlideEditAnimationType,
  TTrigger extends string = SlideEditAnimationTrigger,
>(
  command: SlideEditObjectAnimationUpdateCommand<
    TSlideId,
    TObjectId,
    TAnimationType,
    TTrigger
  >,
): SlideEditObjectAnimationHostCommandEffect<
  TSlideId,
  TObjectId,
  TAnimationType,
  TTrigger
> {
  return {
    payload: normalizeSlideEditObjectAnimationUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditObjectAnimationUpdateCommand<
  TSlideId extends SlideEditAnimationSlideId,
  TObjectId extends SlideEditAnimationObjectId,
  TAnimationType extends string = SlideEditAnimationType,
  TTrigger extends string = SlideEditAnimationTrigger,
>(
  command: SlideEditObjectAnimationUpdateCommand<
    TSlideId,
    TObjectId,
    TAnimationType,
    TTrigger
  >,
): SlideEditObjectAnimationUpdateCommand<
  TSlideId,
  TObjectId,
  TAnimationType,
  TTrigger
> {
  switch (command.fieldId) {
    case 'delayMs':
      return {
        ...command,
        value: normalizeSlideEditObjectAnimationDelayMs(command.value),
      }
    case 'durationMs':
      return {
        ...command,
        value: normalizeSlideEditObjectAnimationDurationMs(command.value),
      }
    case 'order':
      return {
        ...command,
        value: normalizeSlideEditObjectAnimationOrder(command.value),
      }
    case 'trigger':
    case 'type':
      return command
  }
}

export function getSlideEditObjectAnimationBuildOrder<
  TObjectId extends SlideEditAnimationObjectId,
>(
  animations: readonly Pick<
    SlideEditObjectAnimationDescriptor<
      SlideEditAnimationSlideId,
      TObjectId
    >,
    'objectId' | 'order'
  >[],
): TObjectId[] {
  return sortSlideEditObjectAnimationsByBuildOrder(animations)
    .map((animation) => animation.objectId)
}

export function sortSlideEditObjectAnimationsByBuildOrder<
  TAnimation extends Pick<
    SlideEditObjectAnimationDescriptor,
    'objectId' | 'order'
  >,
>(
  animations: readonly TAnimation[],
): TAnimation[] {
  return animations
    .map((animation, index) => ({ animation, index }))
    .sort((left, right) =>
      left.animation.order - right.animation.order ||
      left.index - right.index
    )
    .map(({ animation }) => animation)
}

export function normalizeSlideEditObjectAnimationDurationMs(
  durationMs: number | null | undefined,
) {
  return clampIntegerAnimationValue(
    durationMs,
    SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.minDurationMs,
    SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxDurationMs,
  )
}

export function normalizeSlideEditObjectAnimationDelayMs(
  delayMs: number | null | undefined,
) {
  return clampIntegerAnimationValue(
    delayMs,
    SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.minDelayMs,
    SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxDelayMs,
  )
}

export function normalizeSlideEditObjectAnimationOrder(
  order: number | null | undefined,
) {
  return clampIntegerAnimationValue(
    order,
    SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.minBuildOrder,
    SLIDE_EDIT_OBJECT_ANIMATION_LIMITS.maxBuildOrder,
  )
}

export function getSlideEditObjectAnimationCSSStyle(
  animation: SlideEditObjectAnimationCSSStyleInput | null | undefined,
): SlideEditObjectAnimationCSSStyle {
  return {
    animationDelay: `${normalizeSlideEditObjectAnimationDelayMs(
      animation?.delayMs,
    )}ms`,
    animationDuration: `${Math.max(
      1,
      normalizeSlideEditObjectAnimationDurationMs(animation?.durationMs),
    )}ms`,
  }
}

function clampIntegerAnimationValue(
  value: number | null | undefined,
  min: number,
  max: number,
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, Math.round(value)))
}
