import { parseSlideEditJSONPasteTextValue } from './SlideEditTextJSONPaste'

import type { Bounds } from '@interactive-os/canvas/core'

import {
  createSlideEditPlaceholderDescriptor,
  type SlideEditPlaceholderDescriptor,
  type SlideEditPlaceholderId,
  type SlideEditPlaceholderRole,
} from './SlideEditObjectVisibility'

export type SlideEditThemeId = string
export type SlideEditMasterId = string
export type SlideEditLayoutId = string
export type SlideEditLayoutSlideId = string
export type SlideEditLayoutObjectId = string
export type SlideEditThemeColorTokenId = string
export type SlideEditThemeFontTokenId = string
export type SlideEditThemeSpacingTokenId = string

export type SlideEditThemeColorRole =
  | 'accent'
  | 'accent-contrast'
  | 'background'
  | 'border'
  | 'custom'
  | 'surface'
  | 'text'

export type SlideEditThemeFontRole =
  | 'body'
  | 'caption'
  | 'code'
  | 'custom'
  | 'heading'

export type SlideEditThemeSpacingRole =
  | 'custom'
  | 'gutter'
  | 'object-gap'
  | 'safe-area'
  | 'slide-margin'

export type SlideEditThemeColorToken<
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
> = {
  label: string
  role: SlideEditThemeColorRole
  tokenId: TColorTokenId
  value: string
}

export type SlideEditThemeFontToken<
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
> = {
  family: string
  label: string
  lineHeight?: number
  role: SlideEditThemeFontRole
  size?: number
  tokenId: TFontTokenId
  weight?: number | string
}

export type SlideEditThemeSpacingToken<
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  label: string
  role: SlideEditThemeSpacingRole
  tokenId: TSpacingTokenId
  value: number
}

export type SlideEditStyleTokenRefs<
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  colorTokenIds?: {
    background?: TColorTokenId
    fill?: TColorTokenId
    stroke?: TColorTokenId
    text?: TColorTokenId
  }
  fontTokenIds?: {
    body?: TFontTokenId
    heading?: TFontTokenId
  }
  spacingTokenIds?: {
    gap?: TSpacingTokenId
    margin?: TSpacingTokenId
    padding?: TSpacingTokenId
  }
}

export type SlideEditThemeDescriptor<
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  colorTokens: readonly SlideEditThemeColorToken<TColorTokenId>[]
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  fontTokens: readonly SlideEditThemeFontToken<TFontTokenId>[]
  name: string
  spacingTokens: readonly SlideEditThemeSpacingToken<TSpacingTokenId>[]
  themeId: TThemeId
}

export type SlideEditMasterDescriptor<
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  layoutIds: readonly TLayoutId[]
  masterId: TMasterId
  name: string
  themeId: TThemeId
}

export type SlideEditLayoutPlaceholderDescriptor<
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultBounds: Bounds
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  isLocked: boolean
  isVisible: boolean
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  title: string
}

export type SlideEditLayoutDescriptor<
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  layoutId: TLayoutId
  masterId: TMasterId
  name: string
  placeholders: readonly SlideEditLayoutPlaceholderDescriptor<
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >[]
}

export type SlideEditResolvedLayoutPlaceholder<
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  bounds: Bounds
  inheritedStyle: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  isLocked: boolean
  isVisible: boolean
  layoutId: TLayoutId
  masterId: TMasterId
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  styleSourceIds: {
    layoutId: TLayoutId
    masterId: TMasterId
    placeholderId: TPlaceholderId
    themeId: TThemeId
  }
  title: string
}

export type SlideEditLayoutApplyExistingObjectPolicy =
  | 'map-existing-objects-to-placeholders'
  | 'preserve-existing-objects'

export type SlideEditLayoutApplyObjectMapping<
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  boundsSource: 'current-object' | 'layout-placeholder'
  objectId: TObjectId
  placeholderId: TPlaceholderId
}

export type SlideEditLayoutApplyCommand<
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  existingObjectPolicy: SlideEditLayoutApplyExistingObjectPolicy
  id: 'apply-layout'
  layoutId: TLayoutId
  objectMappings: readonly SlideEditLayoutApplyObjectMapping<
    TObjectId,
    TPlaceholderId
  >[]
}

export type SlideEditLayoutApplyHostCommandEffect<
  TSlideId extends SlideEditLayoutSlideId = SlideEditLayoutSlideId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  payload: SlideEditLayoutApplyCommand<TLayoutId, TObjectId, TPlaceholderId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditLayoutPlaceholderVisibilityCommand<
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  id: 'set-placeholder-visibility'
  isVisible: boolean
  placeholderId: TPlaceholderId
}

export type SlideEditLayoutPlaceholderVisibilityHostCommandEffect<
  TSlideId extends SlideEditLayoutSlideId = SlideEditLayoutSlideId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  payload: SlideEditLayoutPlaceholderVisibilityCommand<TPlaceholderId>
  selection: {
    placeholderIds: readonly TPlaceholderId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditLayoutPlaceholderVisibilityCommandEffectInput<
  TSlideId extends SlideEditLayoutSlideId = SlideEditLayoutSlideId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  isVisible: boolean
  placeholderId: TPlaceholderId
  slideId: TSlideId
}

export type SlideEditLayoutCommandDescriptor = {
  id: 'apply-layout' | 'set-placeholder-visibility'
  requiredAdapterSlot: 'command-effect'
}

export const SLIDE_EDIT_LAYOUT_COMMANDS = Object.freeze([
  {
    id: 'apply-layout',
    requiredAdapterSlot: 'command-effect',
  },
  {
    id: 'set-placeholder-visibility',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditLayoutCommandDescriptor[])

export type SlideEditLayoutDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditLayoutPlaceholderVisibilityPasteValue<
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  isVisible: boolean
  placeholderId: TPlaceholderId
  sourceField: string
}

export type SlideEditLayoutJSONPasteValue<
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  layoutId?: TLayoutId
  placeholderVisibility: readonly SlideEditLayoutPlaceholderVisibilityPasteValue<
    TPlaceholderId
  >[]
  surface: 'layout-placeholder'
  themeId?: TThemeId
}

export type SlideEditLayoutJSONPasteInput = {
  dataTransfer: SlideEditLayoutDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditLayoutJSONPasteValueMode =
  | 'any'
  | 'direct'
  | 'wrapped'

export type SlideEditLayoutJSONPasteValueOptions = {
  mode?: SlideEditLayoutJSONPasteValueMode
}

export type SlideEditLayoutJSONPasteCommandEffectsInput<
  TSlideId extends SlideEditLayoutSlideId = SlideEditLayoutSlideId,
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  activeLayoutId?: TLayoutId | null
  existingObjectPolicy?: SlideEditLayoutApplyExistingObjectPolicy
  layouts: readonly SlideEditLayoutDescriptor<TLayoutId, TMasterId, TPlaceholderId>[]
  objectMappings?: readonly SlideEditLayoutApplyObjectMapping<
    TObjectId,
    TPlaceholderId
  >[]
  pasteValue: SlideEditLayoutJSONPasteValue<TLayoutId, TThemeId, TPlaceholderId>
  selectedObjectIds?: readonly TObjectId[]
  slideId: TSlideId
  themes: readonly SlideEditThemeDescriptor<TThemeId>[]
}

export type SlideEditLayoutJSONPasteCommandEffects<
  TSlideId extends SlideEditLayoutSlideId = SlideEditLayoutSlideId,
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  applyLayoutEffect: SlideEditLayoutApplyHostCommandEffect<
    TSlideId,
    TLayoutId,
    TObjectId,
    TPlaceholderId
  > | null
  placeholderVisibilityEffects: readonly SlideEditLayoutPlaceholderVisibilityHostCommandEffect<
    TSlideId,
    TPlaceholderId
  >[]
  themeId: TThemeId | null
}

export const SLIDE_EDIT_LAYOUT_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.layout-placeholder+json'

export const SLIDE_EDIT_LAYOUT_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_LAYOUT_JSON_WRAPPER_KEYS = Object.freeze([
  'slideLayout',
  'layout',
  'layoutPlaceholder',
  'placeholderLayout',
] as const)

export function createSlideEditThemeDescriptor<
  TThemeId extends SlideEditThemeId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>(
  descriptor: SlideEditThemeDescriptor<
    TThemeId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >,
) {
  return descriptor
}

export function createSlideEditLayoutPlaceholderDescriptor<
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>({
  defaultBounds,
  defaultStyle,
  isLocked = false,
  isVisible = true,
  placeholderId,
  role,
  title,
}: {
  defaultBounds: Bounds
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  isLocked?: boolean
  isVisible?: boolean
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  title: string
}): SlideEditLayoutPlaceholderDescriptor<
  TPlaceholderId,
  TColorTokenId,
  TFontTokenId,
  TSpacingTokenId
> {
  return {
    defaultBounds,
    defaultStyle,
    isLocked,
    isVisible,
    placeholderId,
    role,
    title,
  }
}

export function getSlideEditResolvedLayoutPlaceholder<
  TThemeId extends SlideEditThemeId,
  TMasterId extends SlideEditMasterId,
  TLayoutId extends SlideEditLayoutId,
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>({
  layout,
  master,
  placeholder,
  theme,
}: {
  layout: SlideEditLayoutDescriptor<
    TLayoutId,
    TMasterId,
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  master: SlideEditMasterDescriptor<
    TMasterId,
    TThemeId,
    TLayoutId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  placeholder: SlideEditLayoutPlaceholderDescriptor<
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  theme: SlideEditThemeDescriptor<
    TThemeId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
}): SlideEditResolvedLayoutPlaceholder<
  TThemeId,
  TMasterId,
  TLayoutId,
  TPlaceholderId,
  TColorTokenId,
  TFontTokenId,
  TSpacingTokenId
> {
  return {
    bounds: placeholder.defaultBounds,
    inheritedStyle: mergeSlideEditStyleTokenRefs(
      theme.defaultStyle,
      master.defaultStyle,
      layout.defaultStyle,
      placeholder.defaultStyle,
    ),
    isLocked: placeholder.isLocked,
    isVisible: placeholder.isVisible,
    layoutId: layout.layoutId,
    masterId: master.masterId,
    placeholderId: placeholder.placeholderId,
    role: placeholder.role,
    styleSourceIds: {
      layoutId: layout.layoutId,
      masterId: master.masterId,
      placeholderId: placeholder.placeholderId,
      themeId: theme.themeId,
    },
    title: placeholder.title,
  }
}

export function getSlideEditLayoutPlaceholderVisibilityDescriptor<
  TSlideId extends SlideEditLayoutSlideId,
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>({
  placeholder,
  slideId,
}: {
  placeholder: SlideEditLayoutPlaceholderDescriptor<
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  slideId: TSlideId
}): SlideEditPlaceholderDescriptor<TSlideId, TPlaceholderId> {
  return createSlideEditPlaceholderDescriptor({
    bounds: placeholder.defaultBounds,
    isLocked: placeholder.isLocked,
    isVisible: placeholder.isVisible,
    placeholderId: placeholder.placeholderId,
    role: placeholder.role,
    slideId,
    title: placeholder.title,
  })
}

export function getSlideEditLayoutApplyCommandEffect<
  TSlideId extends SlideEditLayoutSlideId,
  TLayoutId extends SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  existingObjectPolicy,
  layoutId,
  objectMappings = [],
  selectedObjectIds = [],
  slideId,
}: {
  existingObjectPolicy: SlideEditLayoutApplyExistingObjectPolicy
  layoutId: TLayoutId
  objectMappings?: readonly SlideEditLayoutApplyObjectMapping<
    TObjectId,
    TPlaceholderId
  >[]
  selectedObjectIds?: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditLayoutApplyHostCommandEffect<
  TSlideId,
  TLayoutId,
  TObjectId,
  TPlaceholderId
> {
  return {
    payload: {
      existingObjectPolicy,
      id: 'apply-layout',
      layoutId,
      objectMappings,
    },
    selection: {
      objectIds: selectedObjectIds,
      slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditLayoutPlaceholderVisibilityCommandEffect<
  TSlideId extends SlideEditLayoutSlideId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  isVisible,
  placeholderId,
  slideId,
}: SlideEditLayoutPlaceholderVisibilityCommandEffectInput<
  TSlideId,
  TPlaceholderId
>): SlideEditLayoutPlaceholderVisibilityHostCommandEffect<
  TSlideId,
  TPlaceholderId
> {
  return {
    payload: {
      id: 'set-placeholder-visibility',
      isVisible,
      placeholderId,
    },
    selection: {
      placeholderIds: [placeholderId],
      slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditLayoutJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_LAYOUT_JSON_MIME_TYPE,
}: SlideEditLayoutJSONPasteInput):
  SlideEditLayoutJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditLayoutJSONPasteValueFromText(
        customText,
        { mode: 'any' },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_LAYOUT_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditLayoutJSONPasteValueFromText(
      text,
      { mode: 'any' },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditLayoutJSONPasteValueFromText(
  text: string,
  options?: SlideEditLayoutJSONPasteValueOptions,
): SlideEditLayoutJSONPasteValue | null {
  return getSlideEditLayoutJSONPasteValueFromValue(
    parseSlideEditLayoutJSON(text),
    options,
  )
}

export function getSlideEditLayoutJSONPasteValueFromValue(
  value: unknown,
  { mode = 'any' }: SlideEditLayoutJSONPasteValueOptions = {},
): SlideEditLayoutJSONPasteValue | null {
  if (mode === 'direct') {
    return getSlideEditLayoutDirectJSONPasteValue(value)
  }

  if (mode === 'wrapped') {
    return getSlideEditLayoutWrappedJSONPasteValue(value)
  }

  return getSlideEditLayoutAnyJSONPasteValue(value)
}

export function getSlideEditLayoutJSONPasteCommandEffects<
  TSlideId extends SlideEditLayoutSlideId,
  TThemeId extends SlideEditThemeId,
  TLayoutId extends SlideEditLayoutId,
  TMasterId extends SlideEditMasterId,
  TObjectId extends SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  activeLayoutId = null,
  existingObjectPolicy = 'preserve-existing-objects',
  layouts,
  objectMappings = [],
  pasteValue,
  selectedObjectIds = [],
  slideId,
  themes,
}: SlideEditLayoutJSONPasteCommandEffectsInput<
  TSlideId,
  TThemeId,
  TLayoutId,
  TMasterId,
  TObjectId,
  TPlaceholderId
>): SlideEditLayoutJSONPasteCommandEffects<
  TSlideId,
  TThemeId,
  TLayoutId,
  TObjectId,
  TPlaceholderId
> | null {
  const layout = pasteValue.layoutId
    ? findSlideEditLayoutById(layouts, pasteValue.layoutId)
    : null
  const placeholderLayout =
    layout ??
    (activeLayoutId ? findSlideEditLayoutById(layouts, activeLayoutId) : null) ??
    (layouts.length === 1 ? layouts[0]! : null)
  const applyLayoutEffect = layout
    ? getSlideEditLayoutApplyCommandEffect({
        existingObjectPolicy,
        layoutId: layout.layoutId,
        objectMappings,
        selectedObjectIds,
        slideId,
      })
    : null
  const themeId = pasteValue.themeId &&
    themes.some((theme) => theme.themeId === pasteValue.themeId)
    ? pasteValue.themeId
    : null
  const placeholderVisibilityEffects = placeholderLayout
    ? getSlideEditLayoutPlaceholderVisibilityPasteCommandEffects({
        pasteValue,
        placeholderIds: placeholderLayout.placeholders.map(
          (placeholder) => placeholder.placeholderId,
        ),
        slideId,
      })
    : []

  if (
    !applyLayoutEffect &&
    !themeId &&
    placeholderVisibilityEffects.length === 0
  ) {
    return null
  }

  return {
    applyLayoutEffect,
    placeholderVisibilityEffects,
    themeId,
  }
}

function mergeSlideEditStyleTokenRefs<
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>(
  ...styles: Array<
    SlideEditStyleTokenRefs<
      TColorTokenId,
      TFontTokenId,
      TSpacingTokenId
    > | undefined
  >
): SlideEditStyleTokenRefs<TColorTokenId, TFontTokenId, TSpacingTokenId> {
  return styles.reduce<
    SlideEditStyleTokenRefs<TColorTokenId, TFontTokenId, TSpacingTokenId>
  >((merged, style) => ({
    colorTokenIds: {
      ...merged.colorTokenIds,
      ...style?.colorTokenIds,
    },
    fontTokenIds: {
      ...merged.fontTokenIds,
      ...style?.fontTokenIds,
    },
    spacingTokenIds: {
      ...merged.spacingTokenIds,
      ...style?.spacingTokenIds,
    },
  }), {})
}

function getSlideEditLayoutAnyJSONPasteValue(
  value: unknown,
): SlideEditLayoutJSONPasteValue | null {
  return getSlideEditLayoutDirectJSONPasteValue(value) ??
    getSlideEditLayoutWrappedJSONPasteValue(value)
}

function getSlideEditLayoutDirectJSONPasteValue(
  value: unknown,
): SlideEditLayoutJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const layoutId = getSlideEditLayoutJSONText(record.layoutId)
  const themeId = getSlideEditLayoutJSONText(record.themeId)
  const placeholderVisibility = getSlideEditLayoutPlaceholderVisibilityValues(
    record,
  )

  if (!layoutId && !themeId && placeholderVisibility.length === 0) {
    return null
  }

  return {
    ...(layoutId ? { layoutId } : {}),
    placeholderVisibility,
    surface: 'layout-placeholder',
    ...(themeId ? { themeId } : {}),
  }
}

function getSlideEditLayoutWrappedJSONPasteValue(
  value: unknown,
): SlideEditLayoutJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_LAYOUT_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditLayoutDirectJSONPasteValue(record[key])

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditLayoutPlaceholderVisibilityPasteCommandEffects<
  TSlideId extends SlideEditLayoutSlideId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  pasteValue,
  placeholderIds,
  slideId,
}: {
  pasteValue: SlideEditLayoutJSONPasteValue<
    SlideEditLayoutId,
    SlideEditThemeId,
    TPlaceholderId
  >
  placeholderIds: readonly TPlaceholderId[]
  slideId: TSlideId
}) {
  const allowedPlaceholderIds = new Set<TPlaceholderId>(placeholderIds)

  return pasteValue.placeholderVisibility
    .filter((value) => allowedPlaceholderIds.has(value.placeholderId))
    .map((value) =>
      getSlideEditLayoutPlaceholderVisibilityCommandEffect({
        isVisible: value.isVisible,
        placeholderId: value.placeholderId,
        slideId,
      }))
}

function getSlideEditLayoutPlaceholderVisibilityValues(
  record: Record<string, unknown>,
): SlideEditLayoutPlaceholderVisibilityPasteValue[] {
  const visibilityById = new Map<
    SlideEditPlaceholderId,
    SlideEditLayoutPlaceholderVisibilityPasteValue
  >()

  addSlideEditLayoutPlaceholderVisibilityIds({
    isVisible: false,
    sourceField: 'hiddenPlaceholderIds',
    value: record.hiddenPlaceholderIds,
    visibilityById,
  })
  addSlideEditLayoutPlaceholderVisibilityIds({
    isVisible: true,
    sourceField: 'visiblePlaceholderIds',
    value: record.visiblePlaceholderIds,
    visibilityById,
  })
  addSlideEditLayoutPlaceholderVisibilityEntries({
    sourceField: 'placeholderVisibility',
    value: record.placeholderVisibility,
    visibilityById,
  })

  return Array.from(visibilityById.values())
}

function addSlideEditLayoutPlaceholderVisibilityIds({
  isVisible,
  sourceField,
  value,
  visibilityById,
}: {
  isVisible: boolean
  sourceField: string
  value: unknown
  visibilityById: Map<
    SlideEditPlaceholderId,
    SlideEditLayoutPlaceholderVisibilityPasteValue
  >
}) {
  if (!Array.isArray(value)) {
    return
  }

  for (const item of value) {
    const placeholderId = getSlideEditLayoutJSONText(item)

    if (!placeholderId) {
      continue
    }

    visibilityById.set(placeholderId, {
      isVisible,
      placeholderId,
      sourceField,
    })
  }
}

function addSlideEditLayoutPlaceholderVisibilityEntries({
  sourceField,
  value,
  visibilityById,
}: {
  sourceField: string
  value: unknown
  visibilityById: Map<
    SlideEditPlaceholderId,
    SlideEditLayoutPlaceholderVisibilityPasteValue
  >
}) {
  if (!value || typeof value !== 'object') {
    return
  }

  if (Array.isArray(value)) {
    addSlideEditLayoutPlaceholderVisibilityArrayEntries({
      sourceField,
      value,
      visibilityById,
    })
    return
  }

  for (const [placeholderId, isVisible] of Object.entries(value)) {
    const normalizedPlaceholderId = getSlideEditLayoutJSONText(placeholderId)

    if (!normalizedPlaceholderId || typeof isVisible !== 'boolean') {
      continue
    }

    visibilityById.set(normalizedPlaceholderId, {
      isVisible,
      placeholderId: normalizedPlaceholderId,
      sourceField: `${sourceField}.${normalizedPlaceholderId}`,
    })
  }
}

function addSlideEditLayoutPlaceholderVisibilityArrayEntries({
  sourceField,
  value,
  visibilityById,
}: {
  sourceField: string
  value: readonly unknown[]
  visibilityById: Map<
    SlideEditPlaceholderId,
    SlideEditLayoutPlaceholderVisibilityPasteValue
  >
}) {
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue
    }

    const record = item as Record<string, unknown>
    const placeholderId =
      getSlideEditLayoutJSONText(record.placeholderId) ??
      getSlideEditLayoutJSONText(record.id)
    const isVisible = typeof record.isVisible === 'boolean'
      ? record.isVisible
      : typeof record.visible === 'boolean'
      ? record.visible
      : null

    if (!placeholderId || isVisible === null) {
      continue
    }

    visibilityById.set(placeholderId, {
      isVisible,
      placeholderId,
      sourceField: `${sourceField}.${index}`,
    })
  }
}

function findSlideEditLayoutById<
  TLayoutId extends SlideEditLayoutId,
  TMasterId extends SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId,
>(
  layouts: readonly SlideEditLayoutDescriptor<TLayoutId, TMasterId, TPlaceholderId>[],
  layoutId: TLayoutId,
) {
  return layouts.find((layout) => layout.layoutId === layoutId) ?? null
}

function getSlideEditLayoutJSONText(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const text = value.trim()

  return text || null
}

function parseSlideEditLayoutJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
