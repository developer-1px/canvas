export type SlideEditTextParagraphSlideId = string
export type SlideEditTextParagraphObjectId = string

export type SlideEditTextParagraphBulletValue =
  | 'bullet'
  | 'none'
  | 'numbered'

export type SlideEditTextParagraphBulletOption = {
  id: SlideEditTextParagraphBulletValue
  label: string
}

export type SlideEditTextParagraphBulletFieldDescriptor = {
  commandId: 'update-text-paragraph-bullet'
  control: 'paragraph-bullet-segmented-control'
  id: 'paragraphBullet'
  jsonKeys: readonly string[]
  jsonMimeType: string
  options: readonly SlideEditTextParagraphBulletOption[]
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextParagraphBulletDescriptor<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> = {
  field: SlideEditTextParagraphBulletFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  surface: 'text-paragraph-bullet'
  value: SlideEditTextParagraphBulletValue
}

export type SlideEditTextParagraphBulletUpdateCommand<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> = {
  fieldId: 'paragraphBullet'
  id: 'update-text-paragraph-bullet'
  objectId: TObjectId
  slideId: TSlideId
  value: SlideEditTextParagraphBulletValue
}

export type SlideEditTextParagraphBulletHostCommandEffect<
  TSlideId extends SlideEditTextParagraphSlideId =
    SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId =
    SlideEditTextParagraphObjectId,
> = {
  payload: SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextParagraphBulletDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditTextParagraphBulletJSONPasteInput = {
  dataTransfer: SlideEditTextParagraphBulletDataTransfer | null
  jsonMimeType?: string
}

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

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT = 'none'

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_VALUES = Object.freeze([
  'none',
  'bullet',
  'numbered',
] as const satisfies readonly SlideEditTextParagraphBulletValue[])

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_OPTIONS = Object.freeze([
  {
    id: 'none',
    label: 'None',
  },
  {
    id: 'bullet',
    label: 'Bullet',
  },
  {
    id: 'numbered',
    label: 'Numbered',
  },
] as const satisfies readonly SlideEditTextParagraphBulletOption[])

export const SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD = Object.freeze({
  commandId: 'update-text-paragraph-bullet',
  control: 'paragraph-bullet-segmented-control',
  id: 'paragraphBullet',
  jsonKeys: ['paragraphBullet', 'textParagraphBullet', 'bullet', 'list', 'value'],
  jsonMimeType:
    'application/vnd.interactive-os.slide-edit.text-paragraph-bullet+json',
  options: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_OPTIONS,
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextParagraphBulletFieldDescriptor)

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

export function createSlideEditTextParagraphBulletDescriptor<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>({
  field = SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD,
  objectId,
  slideId,
  value = SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
}: {
  field?: SlideEditTextParagraphBulletFieldDescriptor
  objectId: TObjectId
  slideId: TSlideId
  value?: unknown
}): SlideEditTextParagraphBulletDescriptor<TSlideId, TObjectId> {
  return {
    field,
    objectId,
    slideId,
    surface: 'text-paragraph-bullet',
    value: normalizeSlideEditTextParagraphBulletValue(value) ??
      SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
  }
}

export function getSlideEditTextParagraphBulletCommandEffect<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>(
  command: SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphBulletHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload: normalizeSlideEditTextParagraphBulletUpdateCommand(command),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextParagraphBulletUpdateCommand<
  TSlideId extends SlideEditTextParagraphSlideId,
  TObjectId extends SlideEditTextParagraphObjectId,
>(
  command: SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId>,
): SlideEditTextParagraphBulletUpdateCommand<TSlideId, TObjectId> {
  return {
    ...command,
    value: normalizeSlideEditTextParagraphBulletValue(command.value) ??
      SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
  }
}

export function getSlideEditTextParagraphBulletJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD.jsonMimeType,
}: SlideEditTextParagraphBulletJSONPasteInput): SlideEditTextParagraphBulletValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customValue = parseSlideEditTextParagraphBulletJSON(
      dataTransfer.getData(jsonMimeType),
    )
    const normalizedCustomValue =
      normalizeSlideEditTextParagraphBulletValue(customValue)

    if (normalizedCustomValue !== null) {
      return normalizedCustomValue
    }
  }

  for (const type of ['application/json', 'text/plain']) {
    const value = parseSlideEditTextParagraphBulletJSON(
      dataTransfer.getData(type),
    )
    const explicitValue =
      getSlideEditTextParagraphBulletExplicitJSONValue(value)

    if (explicitValue !== null) {
      return explicitValue
    }
  }

  return null
}

export function normalizeSlideEditTextParagraphBulletValue(
  value: unknown,
): SlideEditTextParagraphBulletValue | null {
  return isSlideEditTextParagraphBulletValue(value) ? value : null
}

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

function isSlideEditTextParagraphBulletValue(
  value: unknown,
): value is SlideEditTextParagraphBulletValue {
  return typeof value === 'string' &&
    SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_VALUES.includes(
      value as SlideEditTextParagraphBulletValue,
    )
}

function getSlideEditTextParagraphBulletExplicitJSONValue(
  value: unknown,
): SlideEditTextParagraphBulletValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD.jsonKeys) {
    if (Object.hasOwn(record, key)) {
      return normalizeSlideEditTextParagraphBulletValue(record[key])
    }
  }

  return null
}

function parseSlideEditTextParagraphBulletJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
