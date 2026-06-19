import type {
  SlideEditThemeColorRole,
  SlideEditThemeColorToken,
  SlideEditThemeColorTokenId,
} from './SlideEditLayoutTheme'

export type SlideEditColorSwatchSlideId = string
export type SlideEditColorSwatchObjectId = string
export type SlideEditColorSwatchChannelId = string

export type SlideEditColorSwatchBuiltInChannelId =
  | 'fill'
  | 'line-stroke'
  | 'stroke'
  | 'text'

export type SlideEditColorSwatchDisabledReason =
  | 'locked-selection'
  | 'no-selection'
  | 'unsupported-channel'

export type SlideEditColorSwatchSource = 'recent' | 'theme'

export type SlideEditColorSwatchChannelDescriptor<
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchChannelId,
> = {
  id: TChannelId
  label: string
}

export type SlideEditColorSwatchItem<
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  id: string
  label: string
  role?: SlideEditThemeColorRole
  selected: boolean
  source: SlideEditColorSwatchSource
  tokenId?: TColorTokenId
  value: string
}

export type SlideEditColorSwatchSection<
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  id: SlideEditColorSwatchSource
  label: string
  swatches: readonly SlideEditColorSwatchItem<TColorTokenId>[]
}

export type SlideEditColorSwatchFieldDescriptor = {
  commandId: 'apply-color-swatch'
  control: 'color-swatch-palette'
  id: 'colorSwatch'
  requiredAdapterSlot: 'command-effect'
}

export type SlideEditColorSwatchState<
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchChannelId,
> = {
  channelId: TChannelId
  disabledReason?: SlideEditColorSwatchDisabledReason
  isDisabled: boolean
  isMixed: boolean
  selectedSwatchId?: string
  value: string | null
}

export type SlideEditColorSwatchPaletteDescriptor<
  TSlideId extends SlideEditColorSwatchSlideId = SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  channel: SlideEditColorSwatchChannelDescriptor<TChannelId>
  field: SlideEditColorSwatchFieldDescriptor
  objectIds: readonly TObjectId[]
  sections: readonly SlideEditColorSwatchSection<TColorTokenId>[]
  slideId: TSlideId
  state: SlideEditColorSwatchState<TChannelId>
  surface: 'color-swatch-palette'
}

export type SlideEditColorSwatchSelection<
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  source: SlideEditColorSwatchSource
  swatchId: string
  tokenId?: TColorTokenId
  value: string
}

export type SlideEditColorSwatchApplyCommand<
  TSlideId extends SlideEditColorSwatchSlideId = SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  channelId: TChannelId
  id: 'apply-color-swatch'
  objectIds: readonly TObjectId[]
  slideId: TSlideId
  swatch: SlideEditColorSwatchSelection<TColorTokenId>
}

export type SlideEditColorSwatchHostCommandEffect<
  TSlideId extends SlideEditColorSwatchSlideId = SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  payload: SlideEditColorSwatchApplyCommand<
    TSlideId,
    TObjectId,
    TChannelId,
    TColorTokenId
  >
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditColorSwatchDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditColorSwatchJSONPasteValue<
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  channelId: TChannelId | null
  source: SlideEditColorSwatchSource
  swatchId: string
  tokenId?: TColorTokenId
  value: string
}

export type SlideEditColorSwatchJSONPasteInput = {
  dataTransfer: SlideEditColorSwatchDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditColorSwatchJSONPasteValueMode =
  | 'direct'
  | 'direct-with-channel'
  | 'wrapped'

export type SlideEditColorSwatchJSONPasteValueOptions = {
  mode?: SlideEditColorSwatchJSONPasteValueMode
}

export type SlideEditColorSwatchPasteTarget<
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
> = {
  defaultChannelId?: TChannelId | null
  isHidden?: boolean
  isLocked?: boolean
  objectId: TObjectId
  supportedChannelIds?: readonly TChannelId[]
}

export type SlideEditColorSwatchPasteSkipReason =
  | 'hidden-target'
  | 'locked-target'
  | 'missing-channel'
  | 'unsupported-channel'

export type SlideEditColorSwatchPasteSkippedTarget<
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
> = {
  channelId?: TChannelId
  objectId: TObjectId
  reason: SlideEditColorSwatchPasteSkipReason
}

export type SlideEditColorSwatchPasteAppliedTarget<
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  channelId: TChannelId
  commandId: 'apply-color-swatch'
  effectType: 'slide-command-effect'
  objectId: TObjectId
  source: SlideEditColorSwatchSource
  swatchId: string
  tokenId?: TColorTokenId
  value: string
}

export type SlideEditColorSwatchChannelSupportInput<
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  channelId: TChannelId
  pasteValue: SlideEditColorSwatchJSONPasteValue<TChannelId, TColorTokenId>
  target: SlideEditColorSwatchPasteTarget<TObjectId, TChannelId>
}

export type SlideEditColorSwatchPasteCommandEffectsInput<
  TSlideId extends SlideEditColorSwatchSlideId = SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  isChannelSupported?: (
    input: SlideEditColorSwatchChannelSupportInput<
      TObjectId,
      TChannelId,
      TColorTokenId
    >,
  ) => boolean
  pasteValue: SlideEditColorSwatchJSONPasteValue<TChannelId, TColorTokenId>
  slideId: TSlideId
  targets: readonly SlideEditColorSwatchPasteTarget<TObjectId, TChannelId>[]
}

export type SlideEditColorSwatchPasteCommandEffectsResult<
  TSlideId extends SlideEditColorSwatchSlideId = SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId =
    SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId =
    SlideEditColorSwatchBuiltInChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId =
    SlideEditThemeColorTokenId,
> = {
  appliedTargets: readonly SlideEditColorSwatchPasteAppliedTarget<
    TObjectId,
    TChannelId,
    TColorTokenId
  >[]
  effects: readonly SlideEditColorSwatchHostCommandEffect<
    TSlideId,
    TObjectId,
    TChannelId,
    TColorTokenId
  >[]
  pasteValue: SlideEditColorSwatchJSONPasteValue<TChannelId, TColorTokenId>
  skippedTargets: readonly SlideEditColorSwatchPasteSkippedTarget<
    TObjectId,
    TChannelId
  >[]
}

export const SLIDE_EDIT_COLOR_SWATCH_CHANNELS = Object.freeze([
  {
    id: 'fill',
    label: 'Fill',
  },
  {
    id: 'stroke',
    label: 'Stroke',
  },
  {
    id: 'text',
    label: 'Text',
  },
  {
    id: 'line-stroke',
    label: 'Line Stroke',
  },
] as const satisfies readonly SlideEditColorSwatchChannelDescriptor<
  SlideEditColorSwatchBuiltInChannelId
>[])

export const SLIDE_EDIT_COLOR_SWATCH_FIELD = Object.freeze({
  commandId: 'apply-color-swatch',
  control: 'color-swatch-palette',
  id: 'colorSwatch',
  requiredAdapterSlot: 'command-effect',
} as const satisfies SlideEditColorSwatchFieldDescriptor)

export const SLIDE_EDIT_COLOR_SWATCH_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.color-swatch+json'

export const SLIDE_EDIT_COLOR_SWATCH_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_COLOR_SWATCH_JSON_WRAPPER_KEYS = Object.freeze([
  'colorSwatch',
  'swatch',
] as const)

const SLIDE_EDIT_COLOR_SWATCH_VALUE_KEYS = Object.freeze([
  'color',
  'value',
  'hex',
] as const)

const SLIDE_EDIT_COLOR_SWATCH_CHANNEL_KEYS = Object.freeze([
  'channel',
  'channelId',
] as const)

export function createSlideEditColorSwatchPaletteDescriptor<
  TSlideId extends SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId,
>({
  channel,
  disabledReason,
  field = SLIDE_EDIT_COLOR_SWATCH_FIELD,
  isDisabled = false,
  isMixed = false,
  objectIds,
  recentColors = [],
  selectedSwatchId,
  selectedTokenId,
  selectedValue = null,
  slideId,
  themeColorTokens = [],
}: {
  channel: SlideEditColorSwatchChannelDescriptor<TChannelId>
  disabledReason?: SlideEditColorSwatchDisabledReason
  field?: SlideEditColorSwatchFieldDescriptor
  isDisabled?: boolean
  isMixed?: boolean
  objectIds: readonly TObjectId[]
  recentColors?: readonly string[]
  selectedSwatchId?: string
  selectedTokenId?: TColorTokenId | null
  selectedValue?: string | null
  slideId: TSlideId
  themeColorTokens?: readonly SlideEditThemeColorToken<TColorTokenId>[]
}): SlideEditColorSwatchPaletteDescriptor<
  TSlideId,
  TObjectId,
  TChannelId,
  TColorTokenId
> {
  const normalizedSelectedValue = normalizeSlideEditColorSwatchValue(
    selectedValue,
  )
  const sections = [
    createSlideEditThemeColorSwatchSection({
      isMixed,
      selectedSwatchId,
      selectedTokenId,
      selectedValue: normalizedSelectedValue,
      themeColorTokens,
    }),
    createSlideEditRecentColorSwatchSection<TColorTokenId>({
      isMixed,
      recentColors,
      selectedSwatchId,
      selectedValue: normalizedSelectedValue,
    }),
  ] as const
  const resolvedSelectedSwatchId = getSelectedSlideEditColorSwatchId(sections)

  return {
    channel,
    field,
    objectIds,
    sections,
    slideId,
    state: {
      channelId: channel.id,
      disabledReason: isDisabled ? disabledReason : undefined,
      isDisabled,
      isMixed,
      selectedSwatchId: resolvedSelectedSwatchId,
      value: isMixed ? null : normalizedSelectedValue,
    },
    surface: 'color-swatch-palette',
  }
}

export function getSlideEditColorSwatchCommandEffect<
  TSlideId extends SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId,
>(
  command: SlideEditColorSwatchApplyCommand<
    TSlideId,
    TObjectId,
    TChannelId,
    TColorTokenId
  >,
): SlideEditColorSwatchHostCommandEffect<
  TSlideId,
  TObjectId,
  TChannelId,
  TColorTokenId
> {
  const normalizedSwatchValue = normalizeSlideEditColorSwatchValue(
    command.swatch.value,
  ) ?? ''

  return {
    payload: {
      ...command,
      swatch: {
        ...command.swatch,
        value: normalizedSwatchValue,
      },
    },
    selection: {
      objectIds: command.objectIds,
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditColorSwatchJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_COLOR_SWATCH_JSON_MIME_TYPE,
}: SlideEditColorSwatchJSONPasteInput):
  SlideEditColorSwatchJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditColorSwatchJSONPasteValueFromText(
        customText,
        { mode: 'direct' },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_COLOR_SWATCH_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const wrappedPasteValue = getSlideEditColorSwatchJSONPasteValueFromText(
      text,
      { mode: 'wrapped' },
    )

    if (wrappedPasteValue !== null) {
      return wrappedPasteValue
    }

    const directPasteValue = getSlideEditColorSwatchJSONPasteValueFromText(
      text,
      { mode: 'direct-with-channel' },
    )

    if (directPasteValue !== null) {
      return directPasteValue
    }
  }

  return null
}

export function getSlideEditColorSwatchJSONPasteValueFromText(
  text: string,
  options?: SlideEditColorSwatchJSONPasteValueOptions,
): SlideEditColorSwatchJSONPasteValue | null {
  return getSlideEditColorSwatchJSONPasteValueFromValue(
    parseSlideEditColorSwatchJSON(text),
    options,
  )
}

export function getSlideEditColorSwatchJSONPasteValueFromValue(
  value: unknown,
  { mode = 'direct' }: SlideEditColorSwatchJSONPasteValueOptions = {},
): SlideEditColorSwatchJSONPasteValue | null {
  switch (mode) {
    case 'direct':
      return getSlideEditColorSwatchDirectPasteValue(value, {
        requireChannel: false,
      })
    case 'direct-with-channel':
      return getSlideEditColorSwatchDirectPasteValue(value, {
        requireChannel: true,
      })
    case 'wrapped':
      return getSlideEditColorSwatchWrappedPasteValue(value)
  }
}

export function getSlideEditColorSwatchPasteCommandEffects<
  TSlideId extends SlideEditColorSwatchSlideId,
  TObjectId extends SlideEditColorSwatchObjectId,
  TChannelId extends SlideEditColorSwatchChannelId,
  TColorTokenId extends SlideEditThemeColorTokenId,
>({
  isChannelSupported,
  pasteValue,
  slideId,
  targets,
}: SlideEditColorSwatchPasteCommandEffectsInput<
  TSlideId,
  TObjectId,
  TChannelId,
  TColorTokenId
>): SlideEditColorSwatchPasteCommandEffectsResult<
  TSlideId,
  TObjectId,
  TChannelId,
  TColorTokenId
> {
  const objectIdsByChannel = new Map<TChannelId, TObjectId[]>()
  const appliedTargets: SlideEditColorSwatchPasteAppliedTarget<
    TObjectId,
    TChannelId,
    TColorTokenId
  >[] = []
  const skippedTargets: SlideEditColorSwatchPasteSkippedTarget<
    TObjectId,
    TChannelId
  >[] = []

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

    const channelId = pasteValue.channelId ?? target.defaultChannelId ?? null

    if (channelId === null) {
      skippedTargets.push({
        objectId: target.objectId,
        reason: 'missing-channel',
      })
      continue
    }

    if (
      target.supportedChannelIds &&
      !target.supportedChannelIds.includes(channelId)
    ) {
      skippedTargets.push({
        channelId,
        objectId: target.objectId,
        reason: 'unsupported-channel',
      })
      continue
    }

    if (
      isChannelSupported &&
      !isChannelSupported({
        channelId,
        pasteValue,
        target,
      })
    ) {
      skippedTargets.push({
        channelId,
        objectId: target.objectId,
        reason: 'unsupported-channel',
      })
      continue
    }

    const objectIds = objectIdsByChannel.get(channelId) ?? []

    objectIds.push(target.objectId)
    objectIdsByChannel.set(channelId, objectIds)
    appliedTargets.push({
      channelId,
      commandId: 'apply-color-swatch',
      effectType: 'slide-command-effect',
      objectId: target.objectId,
      ...getSlideEditColorSwatchTelemetryFromPasteValue(pasteValue),
    })
  }

  const effects = [...objectIdsByChannel].map(([channelId, objectIds]) =>
    getSlideEditColorSwatchCommandEffect({
      channelId,
      id: 'apply-color-swatch',
      objectIds,
      slideId,
      swatch: getSlideEditColorSwatchSelectionFromPasteValue(pasteValue),
    })
  )

  return {
    appliedTargets,
    effects,
    pasteValue,
    skippedTargets,
  }
}

export function getSlideEditColorSwatchId({
  source,
  tokenId,
  value,
}: {
  source: SlideEditColorSwatchSource
  tokenId?: string
  value: string
}) {
  return source === 'theme'
    ? `theme:${tokenId ?? value}`
    : `recent:${value}`
}

export function normalizeSlideEditColorSwatchValue(
  value: string | null | undefined,
) {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

export function normalizeSlideEditColorSwatchChannelId(
  channelId: unknown,
): SlideEditColorSwatchBuiltInChannelId | null {
  if (typeof channelId !== 'string') {
    return null
  }

  switch (channelId.trim().toLowerCase()) {
    case 'fill':
    case 'shape-fill':
      return 'fill'
    case 'line':
    case 'line-stroke':
    case 'line_stroke':
    case 'linestroke':
      return 'line-stroke'
    case 'shape-stroke':
    case 'stroke':
      return 'stroke'
    case 'text':
    case 'text-color':
    case 'text_color':
    case 'textcolor':
      return 'text'
    default:
      return null
  }
}

export function normalizeSlideEditColorHex(
  color: string | null | undefined,
) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color?.trim() ?? '')

  if (!match) {
    return null
  }

  const hex = match[1]
  const normalizedHex = hex.length === 3
    ? [...hex].map((char) => `${char}${char}`).join('')
    : hex

  return `#${normalizedHex.toLowerCase()}`
}

export function getSlideEditColorWithAlphaCSS({
  color,
  opacity,
}: {
  color: string
  opacity: number
}) {
  const normalizedHex = normalizeSlideEditColorHex(color)

  if (!normalizedHex) {
    return color
  }

  const hex = normalizedHex.slice(1)
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)

  return `rgb(${red} ${green} ${blue} / ${normalizeSlideEditColorAlpha(opacity)})`
}

function createSlideEditThemeColorSwatchSection<
  TColorTokenId extends SlideEditThemeColorTokenId,
>({
  isMixed,
  selectedSwatchId,
  selectedTokenId,
  selectedValue,
  themeColorTokens,
}: {
  isMixed: boolean
  selectedSwatchId?: string
  selectedTokenId?: TColorTokenId | null
  selectedValue: string | null
  themeColorTokens: readonly SlideEditThemeColorToken<TColorTokenId>[]
}): SlideEditColorSwatchSection<TColorTokenId> {
  return {
    id: 'theme',
    label: 'Theme',
    swatches: themeColorTokens.map((token) => {
      const swatchId = getSlideEditColorSwatchId({
        source: 'theme',
        tokenId: token.tokenId,
        value: token.value,
      })

      return {
        id: swatchId,
        label: token.label,
        role: token.role,
        selected: !isMixed && (
          selectedSwatchId === swatchId ||
          selectedTokenId === token.tokenId ||
          selectedValue === token.value
        ),
        source: 'theme',
        tokenId: token.tokenId,
        value: token.value,
      }
    }),
  }
}

function createSlideEditRecentColorSwatchSection<
  TColorTokenId extends SlideEditThemeColorTokenId,
>({
  isMixed,
  recentColors,
  selectedSwatchId,
  selectedValue,
}: {
  isMixed: boolean
  recentColors: readonly string[]
  selectedSwatchId?: string
  selectedValue: string | null
}): SlideEditColorSwatchSection<TColorTokenId> {
  return {
    id: 'recent',
    label: 'Recent',
    swatches: normalizeSlideEditRecentColorValues(recentColors).map((value) => {
      const swatchId = getSlideEditColorSwatchId({
        source: 'recent',
        value,
      })

      return {
        id: swatchId,
        label: value,
        selected: !isMixed && (
          selectedSwatchId === swatchId ||
          selectedValue === value
        ),
        source: 'recent',
        value,
      }
    }),
  }
}

function normalizeSlideEditRecentColorValues(colors: readonly string[]) {
  const seenColors = new Set<string>()
  const normalizedColors: string[] = []

  for (const color of colors) {
    const normalizedColor = normalizeSlideEditColorSwatchValue(color)
    const colorKey = normalizedColor?.toLowerCase()

    if (!normalizedColor || !colorKey || seenColors.has(colorKey)) {
      continue
    }

    seenColors.add(colorKey)
    normalizedColors.push(normalizedColor)
  }

  return normalizedColors
}

function getSelectedSlideEditColorSwatchId(
  sections: readonly SlideEditColorSwatchSection[],
) {
  return sections
    .flatMap((section) => section.swatches)
    .find((swatch) => swatch.selected)?.id
}

function normalizeSlideEditColorAlpha(value: number) {
  if (!Number.isFinite(value)) {
    return 1
  }

  const rounded = Math.round(value * 100) / 100

  return Math.min(1, Math.max(0, rounded))
}

function getSlideEditColorSwatchDirectPasteValue(
  value: unknown,
  {
    requireChannel,
  }: {
    requireChannel: boolean
  },
): SlideEditColorSwatchJSONPasteValue | null {
  if (typeof value === 'string') {
    return requireChannel
      ? null
      : createSlideEditColorSwatchPasteValue({
        channelId: null,
        source: 'recent',
        value,
      })
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const wrappedPasteValue = getSlideEditColorSwatchWrappedPasteValue(value)

  if (wrappedPasteValue !== null) {
    return wrappedPasteValue
  }

  const record = value as Record<string, unknown>
  const channelId = getSlideEditColorSwatchRecordChannelId(record)

  if (requireChannel && channelId === null) {
    return null
  }

  const colorValue = getSlideEditColorSwatchRecordColorValue(record)

  if (colorValue === null) {
    return null
  }

  const tokenId = getSlideEditColorSwatchOptionalString(record.tokenId)
  const source = getSlideEditColorSwatchSource(record.source, tokenId)
  const swatchId = getSlideEditColorSwatchOptionalString(record.swatchId) ??
    getSlideEditColorSwatchId({
      source,
      tokenId,
      value: colorValue,
    })

  return createSlideEditColorSwatchPasteValue({
    channelId,
    source,
    swatchId,
    tokenId,
    value: colorValue,
  })
}

function getSlideEditColorSwatchWrappedPasteValue(
  value: unknown,
): SlideEditColorSwatchJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_COLOR_SWATCH_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditColorSwatchDirectPasteValue(record[key], {
      requireChannel: false,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function createSlideEditColorSwatchPasteValue({
  channelId,
  source,
  swatchId,
  tokenId,
  value,
}: {
  channelId: SlideEditColorSwatchBuiltInChannelId | null
  source: SlideEditColorSwatchSource
  swatchId?: string
  tokenId?: string
  value: string
}): SlideEditColorSwatchJSONPasteValue | null {
  const normalizedValue = normalizeSlideEditColorSwatchJSONValue(value)

  if (normalizedValue === null) {
    return null
  }

  const normalizedSwatchId = swatchId ??
    getSlideEditColorSwatchId({
      source,
      tokenId,
      value: normalizedValue,
    })
  const pasteValue = {
    channelId,
    source,
    swatchId: normalizedSwatchId,
    value: normalizedValue,
  }

  return tokenId
    ? {
      ...pasteValue,
      tokenId,
    }
    : pasteValue
}

function getSlideEditColorSwatchRecordChannelId(
  record: Record<string, unknown>,
) {
  for (const key of SLIDE_EDIT_COLOR_SWATCH_CHANNEL_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const channelId = normalizeSlideEditColorSwatchChannelId(record[key])

    if (channelId !== null) {
      return channelId
    }
  }

  return null
}

function getSlideEditColorSwatchRecordColorValue(
  record: Record<string, unknown>,
) {
  for (const key of SLIDE_EDIT_COLOR_SWATCH_VALUE_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const value = record[key]
    const normalizedValue = key === 'hex'
      ? normalizeSlideEditColorSwatchJSONHexValue(value)
      : normalizeSlideEditColorSwatchJSONValue(value)

    if (normalizedValue !== null) {
      return normalizedValue
    }
  }

  return null
}

function normalizeSlideEditColorSwatchJSONHexValue(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  return normalizeSlideEditColorHex(
    trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`,
  )
}

function normalizeSlideEditColorSwatchJSONValue(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = normalizeSlideEditColorSwatchValue(value)

  if (normalizedValue === null) {
    return null
  }

  return normalizeSlideEditColorHex(normalizedValue) ?? normalizedValue
}

function getSlideEditColorSwatchOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalizedValue = value.trim()

  return normalizedValue ? normalizedValue : undefined
}

function getSlideEditColorSwatchSource(
  value: unknown,
  tokenId: string | undefined,
): SlideEditColorSwatchSource {
  return value === 'theme' || value === 'recent'
    ? value
    : tokenId
    ? 'theme'
    : 'recent'
}

function getSlideEditColorSwatchSelectionFromPasteValue<
  TColorTokenId extends SlideEditThemeColorTokenId,
>(
  pasteValue: SlideEditColorSwatchJSONPasteValue<
    SlideEditColorSwatchChannelId,
    TColorTokenId
  >,
): SlideEditColorSwatchSelection<TColorTokenId> {
  const selection = {
    source: pasteValue.source,
    swatchId: pasteValue.swatchId,
    value: pasteValue.value,
  }

  return pasteValue.tokenId
    ? {
      ...selection,
      tokenId: pasteValue.tokenId,
    }
    : selection
}

function getSlideEditColorSwatchTelemetryFromPasteValue<
  TColorTokenId extends SlideEditThemeColorTokenId,
>(
  pasteValue: SlideEditColorSwatchJSONPasteValue<
    SlideEditColorSwatchChannelId,
    TColorTokenId
  >,
) {
  const telemetry = {
    source: pasteValue.source,
    swatchId: pasteValue.swatchId,
    value: pasteValue.value,
  }

  return pasteValue.tokenId
    ? {
      ...telemetry,
      tokenId: pasteValue.tokenId,
    }
    : telemetry
}

function parseSlideEditColorSwatchJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
