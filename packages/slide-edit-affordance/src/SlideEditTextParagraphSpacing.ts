import {
  parseSlideEditJSONPasteTextValue,
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES,
} from './SlideEditTextJSONPaste'

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

export type SlideEditTextParagraphSpacingDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextParagraphSpacingPasteFieldValue =
  | {
    fieldId: 'lineHeightRatio'
    value: number
  }
  | {
    fieldId: 'paragraphAfter'
    value: SlideEditTextParagraphSpacingAmount
  }
  | {
    fieldId: 'paragraphBefore'
    value: SlideEditTextParagraphSpacingAmount
  }

export type SlideEditTextParagraphSpacingJSONPasteValues = {
  lineHeightRatio?: number
  paragraphAfter?: SlideEditTextParagraphSpacingAmount
  paragraphBefore?: SlideEditTextParagraphSpacingAmount
}

export type SlideEditTextParagraphSpacingJSONPasteValue = {
  fields: readonly SlideEditTextParagraphSpacingPasteFieldValue[]
  surface: 'text-paragraph-spacing'
  values: SlideEditTextParagraphSpacingJSONPasteValues
}

export type SlideEditTextParagraphSpacingJSONPasteInput = {
  dataTransfer: SlideEditTextParagraphSpacingDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditTextParagraphSpacingJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTextParagraphSpacingJSONPasteValueOptions = {
  mode?: SlideEditTextParagraphSpacingJSONPasteValueMode
}

export type SlideEditTextParagraphSpacingPasteCommandsInput<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> = {
  objectId: TObjectId
  pasteValue: SlideEditTextParagraphSpacingJSONPasteValue
  slideId: TSlideId
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

export const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.text-paragraph-spacing+json'

export const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_TYPES =
  SLIDE_EDIT_TEXT_JSON_PASTE_TYPES

export const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_WRAPPER_KEYS =
  Object.freeze([
    'textParagraphSpacing',
    'paragraphSpacing',
    'paragraphStyle',
    'paragraph',
    'spacing',
  ] as const)

const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LINE_HEIGHT_JSON_KEYS =
  Object.freeze([
    'lineHeight',
    'lineHeightRatio',
  ] as const)

const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_BEFORE_JSON_KEYS = Object.freeze([
  'spacingBefore',
  'paragraphBefore',
  'before',
  'marginTop',
] as const)

const SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_AFTER_JSON_KEYS = Object.freeze([
  'spacingAfter',
  'paragraphAfter',
  'after',
  'marginBottom',
] as const)

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

export function getSlideEditTextParagraphSpacingJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_MIME_TYPE,
}: SlideEditTextParagraphSpacingJSONPasteInput):
  SlideEditTextParagraphSpacingJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue =
        getSlideEditTextParagraphSpacingJSONPasteValueFromText(
          customText,
          { mode: 'direct' },
        )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue =
      getSlideEditTextParagraphSpacingJSONPasteValueFromText(
        text,
        { mode: 'wrapped' },
      )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditTextParagraphSpacingJSONPasteValueFromText(
  text: string,
  options?: SlideEditTextParagraphSpacingJSONPasteValueOptions,
): SlideEditTextParagraphSpacingJSONPasteValue | null {
  return getSlideEditTextParagraphSpacingJSONPasteValueFromValue(
    parseSlideEditTextParagraphSpacingJSON(text),
    options,
  )
}

export function getSlideEditTextParagraphSpacingJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
  }: SlideEditTextParagraphSpacingJSONPasteValueOptions = {},
): SlideEditTextParagraphSpacingJSONPasteValue | null {
  return mode === 'wrapped'
    ? getSlideEditTextParagraphSpacingWrappedPasteValue(value)
    : getSlideEditTextParagraphSpacingDirectPasteValue(value)
}

export function getSlideEditTextParagraphSpacingPasteCommands<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>({
  objectId,
  pasteValue,
  slideId,
}: SlideEditTextParagraphSpacingPasteCommandsInput<TSlideId, TObjectId>):
  readonly SlideEditTextParagraphSpacingUpdateCommand<TSlideId, TObjectId>[] {
  return pasteValue.fields.map((field) => {
    switch (field.fieldId) {
      case 'lineHeightRatio':
        return {
          fieldId: field.fieldId,
          id: 'update-text-paragraph-spacing',
          objectId,
          slideId,
          value: field.value,
        }
      case 'paragraphAfter':
      case 'paragraphBefore':
        return {
          fieldId: field.fieldId,
          id: 'update-text-paragraph-spacing',
          objectId,
          slideId,
          value: field.value,
        }
    }
  })
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

function getSlideEditTextParagraphSpacingDirectPasteValue(
  value: unknown,
): SlideEditTextParagraphSpacingJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const fields: SlideEditTextParagraphSpacingPasteFieldValue[] = []
  const values: SlideEditTextParagraphSpacingJSONPasteValues = {}
  const lineHeightRatio = getSlideEditTextParagraphSpacingLineHeightJSONValue(
    record,
  )
  const paragraphBefore = getSlideEditTextParagraphSpacingAmountJSONValue(
    record,
    SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_BEFORE_JSON_KEYS,
  )
  const paragraphAfter = getSlideEditTextParagraphSpacingAmountJSONValue(
    record,
    SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_AFTER_JSON_KEYS,
  )

  if (lineHeightRatio !== null) {
    fields.push({
      fieldId: 'lineHeightRatio',
      value: lineHeightRatio,
    })
    values.lineHeightRatio = lineHeightRatio
  }

  if (paragraphBefore !== null) {
    fields.push({
      fieldId: 'paragraphBefore',
      value: paragraphBefore,
    })
    values.paragraphBefore = paragraphBefore
  }

  if (paragraphAfter !== null) {
    fields.push({
      fieldId: 'paragraphAfter',
      value: paragraphAfter,
    })
    values.paragraphAfter = paragraphAfter
  }

  return fields.length > 0
    ? {
      fields,
      surface: 'text-paragraph-spacing',
      values,
    }
    : null
}

function getSlideEditTextParagraphSpacingWrappedPasteValue(
  value: unknown,
): SlideEditTextParagraphSpacingJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditTextParagraphSpacingDirectPasteValue(
      record[key],
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditTextParagraphSpacingLineHeightJSONValue(
  record: Record<string, unknown>,
) {
  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LINE_HEIGHT_JSON_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const numericValue = getSlideEditTextParagraphSpacingJSONNumber(
      record[key],
      {
        allowPx: false,
      },
    )

    if (numericValue !== null) {
      return normalizeSlideEditTextLineHeightRatio(numericValue)
    }
  }

  return null
}

function getSlideEditTextParagraphSpacingAmountJSONValue(
  record: Record<string, unknown>,
  keys: readonly string[],
): SlideEditTextParagraphSpacingAmount | null {
  for (const key of keys) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const amount = getSlideEditTextParagraphSpacingJSONAmount(record[key])

    if (amount !== null) {
      return amount
    }
  }

  return null
}

function getSlideEditTextParagraphSpacingJSONAmount(
  value: unknown,
): SlideEditTextParagraphSpacingAmount | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    const numericValue = getSlideEditTextParagraphSpacingJSONNumber(
      record.value,
      {
        allowPx: true,
      },
    )

    return numericValue === null
      ? null
      : normalizeSlideEditTextParagraphSpacingAmount({
        unit: record.unit === 'slide-unit' ? 'slide-unit' : 'px',
        value: numericValue,
      })
  }

  const numericValue = getSlideEditTextParagraphSpacingJSONNumber(value, {
    allowPx: true,
  })

  return numericValue === null
    ? null
    : normalizeSlideEditTextParagraphSpacingAmount({
      unit: 'px',
      value: numericValue,
    })
}

function getSlideEditTextParagraphSpacingJSONNumber(
  value: unknown,
  {
    allowPx,
  }: {
    allowPx: boolean
  },
) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const numericText = allowPx && trimmedValue.toLowerCase().endsWith('px')
    ? trimmedValue.slice(0, -2).trim()
    : trimmedValue

  if (!allowPx && trimmedValue.toLowerCase().endsWith('px')) {
    return null
  }

  const numericValue = Number(numericText)

  return Number.isFinite(numericValue) ? numericValue : null
}

function parseSlideEditTextParagraphSpacingJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}

function normalizeSlideEditTextParagraphSpacingUnit(
  unit: SlideEditTextParagraphSpacingUnit | null | undefined,
): SlideEditTextParagraphSpacingUnit {
  return unit === 'slide-unit' ? unit : 'px'
}
