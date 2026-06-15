export type SlideEditTextFontSlideId = string
export type SlideEditTextFontObjectId = string
export type SlideEditTextFontFamily = string

export type SlideEditTextFontFamilySource =
  | 'host'
  | 'system'
  | 'theme'

export type SlideEditTextFontFamilyOption<
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
> = {
  family: TFontFamily
  isDefault?: boolean
  label: string
  source?: SlideEditTextFontFamilySource
}

export type SlideEditTextFontFamilyFieldDescriptor = {
  commandId: 'update-text-font-family'
  control: 'font-family-select'
  id: 'fontFamily'
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditTextFontFamilyDescriptor<
  TSlideId extends SlideEditTextFontSlideId = SlideEditTextFontSlideId,
  TObjectId extends SlideEditTextFontObjectId = SlideEditTextFontObjectId,
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
> = {
  fallbackFontFamily: TFontFamily
  field: SlideEditTextFontFamilyFieldDescriptor
  fontFamily: TFontFamily
  objectId: TObjectId
  options: readonly SlideEditTextFontFamilyOption<TFontFamily>[]
  slideId: TSlideId
  surface: 'text-font-family'
}

export type SlideEditTextFontFamilyUpdateCommand<
  TSlideId extends SlideEditTextFontSlideId = SlideEditTextFontSlideId,
  TObjectId extends SlideEditTextFontObjectId = SlideEditTextFontObjectId,
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
> = {
  fieldId: 'fontFamily'
  id: 'update-text-font-family'
  objectId: TObjectId
  slideId: TSlideId
  value: TFontFamily
}

export type SlideEditTextFontFamilyHostCommandEffect<
  TSlideId extends SlideEditTextFontSlideId = SlideEditTextFontSlideId,
  TObjectId extends SlideEditTextFontObjectId = SlideEditTextFontObjectId,
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
> = {
  payload: SlideEditTextFontFamilyUpdateCommand<
    TSlideId,
    TObjectId,
    TFontFamily
  >
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTextFontFamilyNormalizeInput<
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
> = {
  fallbackFontFamily?: TFontFamily | null
  fontFamily: TFontFamily | null | undefined
  options?: readonly SlideEditTextFontFamilyOption<TFontFamily>[]
}

export const SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK = 'sans-serif'

export const SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD = Object.freeze({
  commandId: 'update-text-font-family',
  control: 'font-family-select',
  id: 'fontFamily',
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditTextFontFamilyFieldDescriptor)

export function createSlideEditTextFontFamilyDescriptor<
  TSlideId extends SlideEditTextFontSlideId,
  TObjectId extends SlideEditTextFontObjectId,
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
>({
  fallbackFontFamily = SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK as TFontFamily,
  field = SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD,
  fontFamily,
  objectId,
  options = [],
  slideId,
}: {
  fallbackFontFamily?: TFontFamily | null
  field?: SlideEditTextFontFamilyFieldDescriptor
  fontFamily?: TFontFamily | null
  objectId: TObjectId
  options?: readonly SlideEditTextFontFamilyOption<TFontFamily>[]
  slideId: TSlideId
}): SlideEditTextFontFamilyDescriptor<TSlideId, TObjectId, TFontFamily> {
  const normalizedOptions = normalizeSlideEditTextFontFamilyOptions(options)
  const normalizedFallback = normalizeSlideEditTextFontFamily({
    fallbackFontFamily: SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK as TFontFamily,
    fontFamily: fallbackFontFamily,
    options: normalizedOptions,
  })

  return {
    fallbackFontFamily: normalizedFallback,
    field,
    fontFamily: normalizeSlideEditTextFontFamily({
      fallbackFontFamily: normalizedFallback,
      fontFamily,
      options: normalizedOptions,
    }),
    objectId,
    options: normalizedOptions,
    slideId,
    surface: 'text-font-family',
  }
}

export function getSlideEditTextFontFamilyCommandEffect<
  TSlideId extends SlideEditTextFontSlideId,
  TObjectId extends SlideEditTextFontObjectId,
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
>(
  command: SlideEditTextFontFamilyUpdateCommand<
    TSlideId,
    TObjectId,
    TFontFamily
  >,
  normalizeInput: Omit<
    SlideEditTextFontFamilyNormalizeInput<TFontFamily>,
    'fontFamily'
  > = {},
): SlideEditTextFontFamilyHostCommandEffect<
  TSlideId,
  TObjectId,
  TFontFamily
> {
  return {
    payload: normalizeSlideEditTextFontFamilyUpdateCommand(
      command,
      normalizeInput,
    ),
    selection: {
      objectIds: [command.objectId],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function normalizeSlideEditTextFontFamilyUpdateCommand<
  TSlideId extends SlideEditTextFontSlideId,
  TObjectId extends SlideEditTextFontObjectId,
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
>(
  command: SlideEditTextFontFamilyUpdateCommand<
    TSlideId,
    TObjectId,
    TFontFamily
  >,
  normalizeInput: Omit<
    SlideEditTextFontFamilyNormalizeInput<TFontFamily>,
    'fontFamily'
  > = {},
): SlideEditTextFontFamilyUpdateCommand<TSlideId, TObjectId, TFontFamily> {
  return {
    ...command,
    value: normalizeSlideEditTextFontFamily({
      ...normalizeInput,
      fontFamily: command.value,
    }),
  }
}

export function normalizeSlideEditTextFontFamily<
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
>({
  fallbackFontFamily = SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK as TFontFamily,
  fontFamily,
  options = [],
}: SlideEditTextFontFamilyNormalizeInput<TFontFamily>): TFontFamily {
  const normalizedOptions = normalizeSlideEditTextFontFamilyOptions(options)
  const candidate = normalizeSlideEditTextFontFamilyName(fontFamily)
  const fallback = normalizeSlideEditTextFontFamilyName(fallbackFontFamily) ??
    SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK

  if (normalizedOptions.length === 0) {
    return (candidate ?? fallback) as TFontFamily
  }

  const optionFamilies = new Set(
    normalizedOptions.map((option) => option.family),
  )

  if (candidate && optionFamilies.has(candidate as TFontFamily)) {
    return candidate as TFontFamily
  }

  if (optionFamilies.has(fallback as TFontFamily)) {
    return fallback as TFontFamily
  }

  return normalizedOptions[0]?.family ?? (fallback as TFontFamily)
}

export function normalizeSlideEditTextFontFamilyOptions<
  TFontFamily extends SlideEditTextFontFamily = SlideEditTextFontFamily,
>(
  options: readonly SlideEditTextFontFamilyOption<TFontFamily>[],
): readonly SlideEditTextFontFamilyOption<TFontFamily>[] {
  const seenFamilies = new Set<string>()

  return options.flatMap((option) => {
    const family = normalizeSlideEditTextFontFamilyName(option.family)
    const label = option.label.trim()

    if (!family || !label || seenFamilies.has(family)) {
      return []
    }

    seenFamilies.add(family)

    return [{
      ...option,
      family: family as TFontFamily,
      label,
    }]
  })
}

function normalizeSlideEditTextFontFamilyName(
  family: SlideEditTextFontFamily | null | undefined,
) {
  const normalized = family?.trim()

  return normalized ? normalized : null
}
