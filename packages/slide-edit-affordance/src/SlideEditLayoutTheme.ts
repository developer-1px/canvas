import type { Bounds } from '../../../src/canvas/core'
import type {
  SlideEditPlaceholderDescriptor,
  SlideEditPlaceholderId,
  SlideEditPlaceholderRole,
  SlideEditVisibilitySlideId,
} from './SlideEditObjectVisibility'
import { createSlideEditPlaceholderDescriptor } from './SlideEditObjectVisibility'

export type SlideEditThemeId = string
export type SlideEditLayoutId = string
export type SlideEditMasterId = string
export type SlideEditThemeColorTokenId = string
export type SlideEditThemeFontTokenId = string
export type SlideEditThemeSpacingTokenId = string

export type SlideEditThemeColorRole =
  | 'accent'
  | 'background'
  | 'fill'
  | 'stroke'
  | 'text'

export type SlideEditThemeFontRole =
  | 'body'
  | 'caption'
  | 'code'
  | 'title'

export type SlideEditThemeColorToken<
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
> = {
  id: TColorTokenId
  label: string
  role: SlideEditThemeColorRole
  value: string
}

export type SlideEditThemeFontToken<
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
> = {
  family: string
  id: TFontTokenId
  label: string
  role: SlideEditThemeFontRole
  style?: 'italic' | 'normal'
  weight?: number
}

export type SlideEditThemeSpacingToken<
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  id: TSpacingTokenId
  label: string
  value: number
}

export type SlideEditThemeTokenSet<
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  colors: readonly SlideEditThemeColorToken<TColorTokenId>[]
  fonts: readonly SlideEditThemeFontToken<TFontTokenId>[]
  spacing: readonly SlideEditThemeSpacingToken<TSpacingTokenId>[]
  themeId: TThemeId
}

export type SlideEditThemeStyleTokenRefs<
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  colorTokenId?: TColorTokenId
  fontTokenId?: TFontTokenId
  spacingTokenId?: TSpacingTokenId
}

export type SlideEditResolvedThemeStyle = {
  color?: SlideEditThemeColorToken
  font?: SlideEditThemeFontToken
  spacing?: SlideEditThemeSpacingToken
}

export type SlideEditMasterDescriptor<
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
> = {
  masterId: TMasterId
  themeId: TThemeId
  title: string
}

export type SlideEditLayoutPlaceholderDescriptor<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = SlideEditPlaceholderDescriptor<TSlideId, TPlaceholderId> & {
  defaultBounds: Bounds
  inheritedStyle?: SlideEditThemeStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
}

export type SlideEditLayoutDescriptor<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultStyle?: SlideEditThemeStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  layoutId: TLayoutId
  masterId: TMasterId
  placeholders: readonly SlideEditLayoutPlaceholderDescriptor<
    TSlideId,
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >[]
  title: string
}

export type SlideEditLayoutApplyPolicy =
  | 'preserve-existing-objects'
  | 'reflow-objects-to-placeholders'

export type SlideEditLayoutApplyCommand<
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  id: 'apply-slide-layout'
  layoutId: TLayoutId
  masterId: TMasterId
  placeholderIds: readonly TPlaceholderId[]
  policy: SlideEditLayoutApplyPolicy
}

export type SlideEditLayoutApplyHostCommandEffect<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  payload: SlideEditLayoutApplyCommand<TLayoutId, TMasterId, TPlaceholderId>
  selection: {
    objectIds: readonly never[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export function createSlideEditThemeTokenSet<
  TThemeId extends SlideEditThemeId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>(
  theme: SlideEditThemeTokenSet<
    TThemeId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >,
) {
  return theme
}

export function createSlideEditLayoutDescriptor<
  TSlideId extends SlideEditVisibilitySlideId,
  TLayoutId extends SlideEditLayoutId,
  TMasterId extends SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
>({
  defaultStyle,
  layoutId,
  masterId,
  placeholders,
  title,
}: {
  defaultStyle?: SlideEditThemeStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  layoutId: TLayoutId
  masterId: TMasterId
  placeholders: ReadonlyArray<{
    bounds: Bounds
    inheritedStyle?: SlideEditThemeStyleTokenRefs<
      TColorTokenId,
      TFontTokenId,
      TSpacingTokenId
    >
    isLocked?: boolean
    isVisible?: boolean
    placeholderId: TPlaceholderId
    role: SlideEditPlaceholderRole
    slideId: TSlideId
    title: string
  }>
  title: string
}): SlideEditLayoutDescriptor<
  TSlideId,
  TLayoutId,
  TMasterId,
  TPlaceholderId,
  TColorTokenId,
  TFontTokenId,
  TSpacingTokenId
> {
  return {
    defaultStyle,
    layoutId,
    masterId,
    placeholders: placeholders.map((placeholder) => ({
      ...createSlideEditPlaceholderDescriptor({
        bounds: placeholder.bounds,
        isLocked: placeholder.isLocked,
        isVisible: placeholder.isVisible,
        placeholderId: placeholder.placeholderId,
        role: placeholder.role,
        slideId: placeholder.slideId,
        title: placeholder.title,
      }),
      defaultBounds: placeholder.bounds,
      inheritedStyle: placeholder.inheritedStyle,
    })),
    title,
  }
}

export function getSlideEditLayoutPlaceholderDescriptors<
  TSlideId extends SlideEditVisibilitySlideId,
  TPlaceholderId extends SlideEditPlaceholderId,
>(
  layout: SlideEditLayoutDescriptor<TSlideId, string, string, TPlaceholderId>,
): readonly SlideEditPlaceholderDescriptor<TSlideId, TPlaceholderId>[] {
  return layout.placeholders.map((placeholder) => ({
    bounds: placeholder.bounds,
    isLocked: placeholder.isLocked,
    isVisible: placeholder.isVisible,
    placeholderId: placeholder.placeholderId,
    role: placeholder.role,
    slideId: placeholder.slideId,
    title: placeholder.title,
  }))
}

export function resolveSlideEditLayoutPlaceholderStyle({
  layout,
  placeholderId,
  theme,
}: {
  layout: SlideEditLayoutDescriptor
  placeholderId: SlideEditPlaceholderId
  theme: SlideEditThemeTokenSet
}): SlideEditResolvedThemeStyle {
  const placeholder = layout.placeholders.find(
    (candidate) => candidate.placeholderId === placeholderId,
  )
  const style = {
    ...layout.defaultStyle,
    ...placeholder?.inheritedStyle,
  }

  return {
    color: theme.colors.find((token) => token.id === style.colorTokenId),
    font: theme.fonts.find((token) => token.id === style.fontTokenId),
    spacing: theme.spacing.find((token) => token.id === style.spacingTokenId),
  }
}

export function createSlideEditLayoutApplyCommandEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TLayoutId extends SlideEditLayoutId,
  TMasterId extends SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  layout,
  policy,
  slideId,
}: {
  layout: SlideEditLayoutDescriptor<TSlideId, TLayoutId, TMasterId, TPlaceholderId>
  policy: SlideEditLayoutApplyPolicy
  slideId: TSlideId
}): SlideEditLayoutApplyHostCommandEffect<
  TSlideId,
  TLayoutId,
  TMasterId,
  TPlaceholderId
> {
  return {
    payload: {
      id: 'apply-slide-layout',
      layoutId: layout.layoutId,
      masterId: layout.masterId,
      placeholderIds: layout.placeholders.map((placeholder) => (
        placeholder.placeholderId
      )),
      policy,
    },
    selection: {
      objectIds: [],
      slideId,
    },
    type: 'slide-command-effect',
  }
}
