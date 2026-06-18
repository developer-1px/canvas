export type SlideEditTextParagraphSlideId = string
export type SlideEditTextParagraphObjectId = string

export type SlideEditTextParagraphSpacingUnit =
  | 'px'
  | 'slide-unit'

export type SlideEditTextParagraphSpacingAmount = {
  unit: SlideEditTextParagraphSpacingUnit
  value: number
}

export type SlideEditTextParagraphSpacingValues = {
  lineHeightRatio: number
  paragraphAfter: SlideEditTextParagraphSpacingAmount
  paragraphBefore: SlideEditTextParagraphSpacingAmount
}

export type SlideEditTextParagraphSpacingCSSStyle = {
  lineHeight: number
  marginBottom: string
  marginTop: string
}

export type SlideEditTextParagraphSpacingCSSStyleInput = {
  lineHeightRatio?: number | null
  paragraphAfter?: Partial<SlideEditTextParagraphSpacingAmount> | null
  paragraphBefore?: Partial<SlideEditTextParagraphSpacingAmount> | null
}

export type SlideEditTextParagraphSpacingFieldId =
  | 'lineHeightRatio'
  | 'paragraphAfter'
  | 'paragraphBefore'

export type SlideEditTextParagraphSpacingCommandId =
  | 'update-text-paragraph-spacing'

export type SlideEditTextParagraphSpacingFieldControl =
  | 'line-height-ratio'
  | 'paragraph-spacing'

export type SlideEditTextParagraphSpacingFieldDescriptor = {
  commandId: SlideEditTextParagraphSpacingCommandId
  control: SlideEditTextParagraphSpacingFieldControl
  id: SlideEditTextParagraphSpacingFieldId
  max: number
  min: number
  requiredAdapterSlot: 'command-effect'
  step: number
  unit?: SlideEditTextParagraphSpacingUnit
}

export type SlideEditTextParagraphSpacingDescriptor<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> = {
  fields: readonly SlideEditTextParagraphSpacingFieldDescriptor[]
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-paragraph-spacing'
  values: SlideEditTextParagraphSpacingValues
}

export type SlideEditTextParagraphSpacingUpdateCommand<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> =
  | {
    fieldId: 'lineHeightRatio'
    id: 'update-text-paragraph-spacing'
    objectId: TObjectId
    slideId: TSlideId
    value: number
  }
  | {
    fieldId: 'paragraphAfter'
    id: 'update-text-paragraph-spacing'
    objectId: TObjectId
    slideId: TSlideId
    value: SlideEditTextParagraphSpacingAmount
  }
  | {
    fieldId: 'paragraphBefore'
    id: 'update-text-paragraph-spacing'
    objectId: TObjectId
    slideId: TSlideId
    value: SlideEditTextParagraphSpacingAmount
  }

export type SlideEditTextParagraphSpacingHostCommandEffect<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> = {
  payload: SlideEditTextParagraphSpacingUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextParagraphSpacingNumericLimits = {
  maxLineHeightRatio: number
  maxSpacing: number
  minLineHeightRatio: number
  minSpacing: number
}

export const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS = Object.freeze({
  maxLineHeightRatio: 4,
  maxSpacing: 1000,
  minLineHeightRatio: 0.5,
  minSpacing: 0,
} as const satisfies SlideEditTextParagraphSpacingNumericLimits)

export const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS = Object.freeze([
  {
    commandId: 'update-text-paragraph-spacing',
    control: 'line-height-ratio',
    id: 'lineHeightRatio',
    max: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxLineHeightRatio,
    min: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minLineHeightRatio,
    requiredAdapterSlot: 'command-effect',
    step: 0.05,
  },
  {
    commandId: 'update-text-paragraph-spacing',
    control: 'paragraph-spacing',
    id: 'paragraphBefore',
    max: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxSpacing,
    min: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minSpacing,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
  {
    commandId: 'update-text-paragraph-spacing',
    control: 'paragraph-spacing',
    id: 'paragraphAfter',
    max: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxSpacing,
    min: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minSpacing,
    requiredAdapterSlot: 'command-effect',
    step: 1,
    unit: 'px',
  },
] as const satisfies readonly SlideEditTextParagraphSpacingFieldDescriptor[])

export const SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING = Object.freeze({
  lineHeightRatio: 1,
  paragraphAfter: {
    unit: 'px',
    value: 0,
  },
  paragraphBefore: {
    unit: 'px',
    value: 0,
  },
} as const satisfies SlideEditTextParagraphSpacingValues)

export function createSlideEditTextParagraphSpacingDescriptor<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>({
  fields = SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
  lineHeightRatio = SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING.lineHeightRatio,
  objectId,
  paragraphAfter = SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING.paragraphAfter,
  paragraphBefore = SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING.paragraphBefore,
  slideId,
}: {
  fields?: readonly SlideEditTextParagraphSpacingFieldDescriptor[]
  lineHeightRatio?: number | null
  objectId: TObjectId
  paragraphAfter?: Partial<SlideEditTextParagraphSpacingAmount> | null
  paragraphBefore?: Partial<SlideEditTextParagraphSpacingAmount> | null
  slideId: TSlideId
}): SlideEditTextParagraphSpacingDescriptor<TSlideId, TObjectId> {
  return {
    fields,
    objectId,
    slideId,
    surface: 'text-paragraph-spacing',
    values: {
      lineHeightRatio: normalizeSlideEditTextLineHeightRatio(lineHeightRatio),
      paragraphAfter: normalizeSlideEditTextParagraphSpacingAmount(
        paragraphAfter,
      ),
      paragraphBefore: normalizeSlideEditTextParagraphSpacingAmount(
        paragraphBefore,
      ),
    },
  }
}

export function getSlideEditTextParagraphSpacingCommandEffect<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>(
  command: SlideEditTextParagraphSpacingUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphSpacingHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextParagraphSpacingUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextParagraphSpacingUpdateCommand<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>(
  command: SlideEditTextParagraphSpacingUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphSpacingUpdateCommand<TSlideId, TObjectId> {
  switch (command.fieldId) {
    case 'lineHeightRatio':
      return {
        ...command,
        value: normalizeSlideEditTextLineHeightRatio(command.value),
      }
    case 'paragraphAfter':
    case 'paragraphBefore':
      return {
        ...command,
        value: normalizeSlideEditTextParagraphSpacingAmount(command.value),
      }
  }
}

export function normalizeSlideEditTextLineHeightRatio(
  value: number | null | undefined,
) {
  return normalizeSlideEditTextParagraphSpacingNumber({
    fallback: SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING.lineHeightRatio,
    max: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxLineHeightRatio,
    min: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minLineHeightRatio,
    precision: 2,
    value,
  })
}

export function normalizeSlideEditTextParagraphSpacingAmount(
  amount: Partial<SlideEditTextParagraphSpacingAmount> | null | undefined,
): SlideEditTextParagraphSpacingAmount {
  return {
    unit: normalizeSlideEditTextParagraphSpacingUnit(amount?.unit),
    value: normalizeSlideEditTextParagraphSpacingNumber({
      fallback: SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING.paragraphBefore.value,
      max: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxSpacing,
      min: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minSpacing,
      precision: 2,
      value: amount?.value,
    }),
  }
}

export function normalizeSlideEditTextParagraphSpacingNumber({
  fallback,
  max,
  min,
  precision,
  value,
}: {
  fallback: number
  max: number
  min: number
  precision: number
  value: number | null | undefined
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback
  }

  const factor = 10 ** precision
  const rounded = Math.round(value * factor) / factor

  return Math.min(max, Math.max(min, rounded))
}

export function getSlideEditTextParagraphSpacingCSSStyle(
  spacing: SlideEditTextParagraphSpacingCSSStyleInput | null | undefined,
): SlideEditTextParagraphSpacingCSSStyle {
  return {
    lineHeight: normalizeSlideEditTextLineHeightRatio(spacing?.lineHeightRatio),
    marginBottom: getSlideEditTextParagraphSpacingAmountCSS(
      spacing?.paragraphAfter,
    ),
    marginTop: getSlideEditTextParagraphSpacingAmountCSS(
      spacing?.paragraphBefore,
    ),
  }
}

function getSlideEditTextParagraphSpacingAmountCSS(
  amount: Partial<SlideEditTextParagraphSpacingAmount> | null | undefined,
) {
  return `${normalizeSlideEditTextParagraphSpacingAmount(amount).value}px`
}

function normalizeSlideEditTextParagraphSpacingUnit(
  unit: SlideEditTextParagraphSpacingUnit | null | undefined,
): SlideEditTextParagraphSpacingUnit {
  return unit === 'slide-unit' ? unit : 'px'
}
