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
