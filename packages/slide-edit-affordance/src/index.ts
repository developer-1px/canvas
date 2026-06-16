import type {
  Bounds,
  CanvasSelectionIds,
  Point,
  Viewport,
} from '../../../src/canvas/core'
import type { CanvasExtensionEffect } from '../../../src/canvas/foundation'

export {
  getSlideEditFrameGuideGeometry,
  normalizeSlideEditFrameInsets,
  type SlideEditFrameBounds,
  type SlideEditFrameColumnGuide,
  type SlideEditFrameColumnGuideConfig,
  type SlideEditFrameGuideAxis,
  type SlideEditFrameGuideConfig,
  type SlideEditFrameGuideGeometry,
  type SlideEditFrameGuideKind,
  type SlideEditFrameGuideLine,
  type SlideEditFrameGuideOrientation,
  type SlideEditFrameGuideSide,
  type SlideEditFrameInsets,
  type SlideEditFrameInsetsInput,
  type SlideEditFrameRegion,
  type SlideEditFrameRulerGuide,
} from './SlideEditFrameGuides'
export {
  createSlideEditRailDescriptor,
  createSlideEditRailListboxDescriptor,
  getSlideEditRailKeyboardCommandEffect,
  getSlideEditRailListboxKeyboardIntent,
  getSlideEditRailPointerCommandEffect,
  SLIDE_EDIT_RAIL_COMMANDS,
  toSlideEditRailHostCommandEffect,
  type SlideEditRailCommand,
  type SlideEditRailCommandDescriptor,
  type SlideEditRailCommandId,
  type SlideEditRailDescriptor,
  type SlideEditRailHostCommandEffect,
  type SlideEditRailKeyboardIntent,
  type SlideEditRailListboxDescriptor,
  type SlideEditRailListboxKeyboardKey,
  type SlideEditRailListboxOptionDescriptor,
  type SlideEditRailPointerIntent,
  type SlideEditRailSlideId,
  type SlideEditRailThumbnailDescriptor,
} from './SlideEditRailInteractions'
export {
  getSlideEditTextAutoFitGestureCommandEffect,
  getSlideEditTextAutoSizeBounds,
  getSlideEditTextOverflowIndicatorState,
  SLIDE_EDIT_TEXT_BOX_SIZE_MODES,
  type SlideEditTextAutoFitCommand,
  type SlideEditTextAutoFitGestureIntent,
  type SlideEditTextAutoFitHostCommandEffect,
  type SlideEditTextBoxMeasurement,
  type SlideEditTextBoxSizeMode,
  type SlideEditTextBoxSizeModeDescriptor,
  type SlideEditTextObjectId,
  type SlideEditTextOverflowAxis,
  type SlideEditTextOverflowIndicatorState,
  type SlideEditTextResizeHandle,
  type SlideEditTextSize,
  type SlideEditTextSlideId,
} from './SlideEditTextBoxAutoFit'
export {
  createSlideEditTextParagraphSpacingDescriptor,
  getSlideEditTextParagraphSpacingCommandEffect,
  getSlideEditTextParagraphSpacingCSSStyle,
  normalizeSlideEditTextLineHeightRatio,
  normalizeSlideEditTextParagraphSpacingAmount,
  normalizeSlideEditTextParagraphSpacingNumber,
  normalizeSlideEditTextParagraphSpacingUpdateCommand,
  SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS,
  type SlideEditTextParagraphObjectId,
  type SlideEditTextParagraphSlideId,
  type SlideEditTextParagraphSpacingAmount,
  type SlideEditTextParagraphSpacingCommandId,
  type SlideEditTextParagraphSpacingCSSStyle,
  type SlideEditTextParagraphSpacingCSSStyleInput,
  type SlideEditTextParagraphSpacingDescriptor,
  type SlideEditTextParagraphSpacingFieldControl,
  type SlideEditTextParagraphSpacingFieldDescriptor,
  type SlideEditTextParagraphSpacingFieldId,
  type SlideEditTextParagraphSpacingHostCommandEffect,
  type SlideEditTextParagraphSpacingNumericLimits,
  type SlideEditTextParagraphSpacingUnit,
  type SlideEditTextParagraphSpacingUpdateCommand,
  type SlideEditTextParagraphSpacingValues,
} from './SlideEditTextParagraphSpacing'
export {
  createSlideEditTextFontFamilyDescriptor,
  getSlideEditTextFontFamilyCSS,
  getSlideEditTextFontFamilyCommandEffect,
  normalizeSlideEditTextFontFamily,
  normalizeSlideEditTextFontFamilyOptions,
  normalizeSlideEditTextFontFamilyUpdateCommand,
  SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK,
  SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD,
  type SlideEditTextFontFamily,
  type SlideEditTextFontFamilyCSSInput,
  type SlideEditTextFontFamilyDescriptor,
  type SlideEditTextFontFamilyFieldDescriptor,
  type SlideEditTextFontFamilyHostCommandEffect,
  type SlideEditTextFontFamilyNormalizeInput,
  type SlideEditTextFontFamilyOption,
  type SlideEditTextFontFamilySource,
  type SlideEditTextFontFamilyUpdateCommand,
  type SlideEditTextFontObjectId,
  type SlideEditTextFontSlideId,
} from './SlideEditTextFontFamily'
export {
  createSlideEditTextVerticalAlignmentDescriptor,
  getSlideEditTextVerticalAlignmentCommandEffect,
  getSlideEditTextVerticalAlignmentFlexAlignItems,
  getSlideEditTextVerticalAlignmentMetadata,
  isSlideEditTextVerticalAlignmentValue,
  normalizeSlideEditTextVerticalAlignment,
  normalizeSlideEditTextVerticalAlignmentUpdateCommand,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
  type SlideEditTextVerticalAlignmentDescriptor,
  type SlideEditTextVerticalAlignmentFieldDescriptor,
  type SlideEditTextVerticalAlignmentFlexAlignItems,
  type SlideEditTextVerticalAlignmentHostCommandEffect,
  type SlideEditTextVerticalAlignmentMetadata,
  type SlideEditTextVerticalAlignmentObjectId,
  type SlideEditTextVerticalAlignmentOption,
  type SlideEditTextVerticalAlignmentSlideId,
  type SlideEditTextVerticalAlignmentUpdateCommand,
  type SlideEditTextVerticalAlignmentValue,
} from './SlideEditTextVerticalAlignment'
export {
  createSlideEditTextFrameInsetDescriptor,
  getSlideEditTextFrameInsetCommandEffect,
  getSlideEditTextFrameInsetMetadata,
  getSlideEditTextFrameInsetPaddingCSS,
  normalizeSlideEditTextFrameInset,
  normalizeSlideEditTextFrameInsetUpdateCommand,
  normalizeSlideEditTextFrameInsetValue,
  SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
  SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
  SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS,
  toSlideEditTextFrameInsetAttributeValue,
  type SlideEditTextFrameInset,
  type SlideEditTextFrameInsetDescriptor,
  type SlideEditTextFrameInsetFieldDescriptor,
  type SlideEditTextFrameInsetHostCommandEffect,
  type SlideEditTextFrameInsetMetadata,
  type SlideEditTextFrameInsetNumericLimits,
  type SlideEditTextFrameInsetObjectId,
  type SlideEditTextFrameInsetSide,
  type SlideEditTextFrameInsetSlideId,
  type SlideEditTextFrameInsetUpdateCommand,
} from './SlideEditTextFrameInset'
export {
  createSlideEditPlaceholderDescriptor,
  getSlideEditObjectVisibilityCommandAvailability,
  getSlideEditObjectVisibilityCommandEffect,
  getSlideEditObjectVisibilityState,
  type SlideEditObjectSelectionPolicy,
  type SlideEditObjectVisibilityCommand,
  type SlideEditObjectVisibilityCommandAvailability,
  type SlideEditObjectVisibilityCommandId,
  type SlideEditObjectVisibilityDescriptor,
  type SlideEditObjectVisibilityHostCommandEffect,
  type SlideEditObjectVisibilityState,
  type SlideEditPlaceholderDescriptor,
  type SlideEditPlaceholderId,
  type SlideEditPlaceholderRole,
  type SlideEditVisibilityObjectId,
  type SlideEditVisibilitySlideId,
} from './SlideEditObjectVisibility'
export {
  createSlideEditObjectOpacityDescriptor,
  getSlideEditObjectOpacityCommandEffect,
  getSlideEditObjectOpacityMetadata,
  normalizeSlideEditObjectOpacity,
  normalizeSlideEditObjectOpacityUpdateCommand,
  SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
  SLIDE_EDIT_OBJECT_OPACITY_FIELD,
  SLIDE_EDIT_OBJECT_OPACITY_LIMITS,
  toSlideEditObjectOpacityAttributeValue,
  type SlideEditObjectOpacityDescriptor,
  type SlideEditObjectOpacityFieldDescriptor,
  type SlideEditObjectOpacityHostCommandEffect,
  type SlideEditObjectOpacityMetadata,
  type SlideEditObjectOpacityNumericLimits,
  type SlideEditObjectOpacityObjectId,
  type SlideEditObjectOpacitySlideId,
  type SlideEditObjectOpacityUpdateCommand,
  type SlideEditObjectOpacityValue,
} from './SlideEditObjectOpacity'
export {
  createSlideEditObjectFillOpacityDescriptor,
  getSlideEditObjectFillOpacityCommandEffect,
  getSlideEditObjectFillOpacityMetadata,
  normalizeSlideEditObjectFillOpacity,
  normalizeSlideEditObjectFillOpacityUpdateCommand,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS,
  toSlideEditObjectFillOpacityAttributeValue,
  type SlideEditObjectFillOpacityDescriptor,
  type SlideEditObjectFillOpacityFieldDescriptor,
  type SlideEditObjectFillOpacityHostCommandEffect,
  type SlideEditObjectFillOpacityMetadata,
  type SlideEditObjectFillOpacityNumericLimits,
  type SlideEditObjectFillOpacityObjectId,
  type SlideEditObjectFillOpacitySlideId,
  type SlideEditObjectFillOpacityUnsupportedReason,
  type SlideEditObjectFillOpacityUpdateCommand,
  type SlideEditObjectFillOpacityValue,
} from './SlideEditObjectFillOpacity'
export {
  createSlideEditObjectImageCropDescriptor,
  getSlideEditObjectImageCropCommandEffect,
  getSlideEditObjectImageCropMetadata,
  getSlideEditObjectImageCropPositionCSS,
  normalizeSlideEditObjectImageCrop,
  normalizeSlideEditObjectImageCropCommand,
  normalizeSlideEditObjectImageCropFit,
  normalizeSlideEditObjectImageCropUpdateCommand,
  normalizeSlideEditObjectImageCropValue,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_DEFAULT_FIT,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_FIELDS,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_FIT_OPTIONS,
  SLIDE_EDIT_OBJECT_IMAGE_CROP_LIMITS,
  toSlideEditObjectImageCropAttributeValue,
  type SlideEditObjectImageCropCommand,
  type SlideEditObjectImageCropCommandPayload,
  type SlideEditObjectImageCropDescriptor,
  type SlideEditObjectImageCropFieldDescriptor,
  type SlideEditObjectImageCropFieldId,
  type SlideEditObjectImageCropFieldsDescriptor,
  type SlideEditObjectImageCropFit,
  type SlideEditObjectImageCropFitFieldDescriptor,
  type SlideEditObjectImageCropFitOption,
  type SlideEditObjectImageCropHostCommandEffect,
  type SlideEditObjectImageCropMetadata,
  type SlideEditObjectImageCropNumericLimits,
  type SlideEditObjectImageCropObjectId,
  type SlideEditObjectImageCropPosition,
  type SlideEditObjectImageCropPositionFieldDescriptor,
  type SlideEditObjectImageCropResetCommand,
  type SlideEditObjectImageCropResetFieldDescriptor,
  type SlideEditObjectImageCropResetPayload,
  type SlideEditObjectImageCropSlideId,
  type SlideEditObjectImageCropUnsupportedReason,
  type SlideEditObjectImageCropUpdateCommand,
} from './SlideEditObjectImageCrop'
export {
  createSlideEditObjectImageReplaceDescriptor,
  getSlideEditObjectImageReplaceCommandEffect,
  getSlideEditObjectImageReplaceMetadata,
  normalizeSlideEditObjectImageReplaceCommand,
  normalizeSlideEditObjectImageReplaceSource,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_IMAGE_REPLACE_FIELD,
  type SlideEditObjectImageReplaceCommand,
  type SlideEditObjectImageReplaceDescriptor,
  type SlideEditObjectImageReplaceFieldDescriptor,
  type SlideEditObjectImageReplaceHostCommandEffect,
  type SlideEditObjectImageReplaceMetadata,
  type SlideEditObjectImageReplaceObjectId,
  type SlideEditObjectImageReplaceSlideId,
  type SlideEditObjectImageReplaceSource,
  type SlideEditObjectImageReplaceUnsupportedReason,
} from './SlideEditObjectImageReplace'
export {
  createSlideEditObjectCornerRadiusDescriptor,
  getSlideEditObjectCornerRadiusCommandEffect,
  getSlideEditObjectCornerRadiusCSS,
  getSlideEditObjectCornerRadiusMetadata,
  getSlideEditObjectCornerRadiusPreviewCSS,
  normalizeSlideEditObjectCornerRadius,
  normalizeSlideEditObjectCornerRadiusUpdateCommand,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS,
  toSlideEditObjectCornerRadiusAttributeValue,
  type SlideEditObjectCornerRadiusDescriptor,
  type SlideEditObjectCornerRadiusFieldDescriptor,
  type SlideEditObjectCornerRadiusHostCommandEffect,
  type SlideEditObjectCornerRadiusMetadata,
  type SlideEditObjectCornerRadiusNumericLimits,
  type SlideEditObjectCornerRadiusObjectId,
  type SlideEditObjectCornerRadiusPreviewSize,
  type SlideEditObjectCornerRadiusSlideId,
  type SlideEditObjectCornerRadiusUnit,
  type SlideEditObjectCornerRadiusUnsupportedReason,
  type SlideEditObjectCornerRadiusUpdateCommand,
  type SlideEditObjectCornerRadiusValue,
} from './SlideEditObjectCornerRadius'
export {
  createSlideEditObjectHyperlinkDescriptor,
  getSlideEditObjectHyperlinkCommandEffect,
  getSlideEditObjectHyperlinkMetadata,
  getSlideEditObjectHyperlinkValidation,
  normalizeSlideEditObjectHyperlink,
  normalizeSlideEditObjectHyperlinkCommand,
  normalizeSlideEditObjectHyperlinkFieldValue,
  normalizeSlideEditObjectHyperlinkStorageUrl,
  shouldEmitSlideEditObjectHyperlinkMetadata,
  SLIDE_EDIT_OBJECT_HYPERLINK_ALLOWED_SCHEMES,
  SLIDE_EDIT_OBJECT_HYPERLINK_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_HYPERLINK_DEFAULT,
  SLIDE_EDIT_OBJECT_HYPERLINK_FIELDS,
  SLIDE_EDIT_OBJECT_HYPERLINK_TARGET_OPTIONS,
  toSlideEditObjectHyperlinkAttributeValue,
  type SlideEditObjectHyperlink,
  type SlideEditObjectHyperlinkCommand,
  type SlideEditObjectHyperlinkDescriptor,
  type SlideEditObjectHyperlinkFieldControl,
  type SlideEditObjectHyperlinkFieldDescriptor,
  type SlideEditObjectHyperlinkFieldId,
  type SlideEditObjectHyperlinkHostCommandEffect,
  type SlideEditObjectHyperlinkMetadata,
  type SlideEditObjectHyperlinkObjectId,
  type SlideEditObjectHyperlinkRemoveCommand,
  type SlideEditObjectHyperlinkSlideId,
  type SlideEditObjectHyperlinkTarget,
  type SlideEditObjectHyperlinkTargetOption,
  type SlideEditObjectHyperlinkUpdateCommand,
  type SlideEditObjectHyperlinkUrlStoragePolicy,
  type SlideEditObjectHyperlinkValidation,
} from './SlideEditObjectHyperlink'
export {
  createSlideEditObjectAccessibilityDescriptor,
  getSlideEditObjectAccessibilityCommandEffect,
  getSlideEditObjectAccessibilityMetadata,
  normalizeSlideEditObjectAccessibility,
  normalizeSlideEditObjectAccessibilityCommand,
  normalizeSlideEditObjectAccessibilityFieldValue,
  normalizeSlideEditObjectAltTextStorageValue,
  shouldEmitSlideEditObjectAccessibilityMetadata,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS,
  toSlideEditObjectAccessibilityAttributeValue,
  type SlideEditObjectAccessibility,
  type SlideEditObjectAccessibilityCommand,
  type SlideEditObjectAccessibilityDescriptor,
  type SlideEditObjectAccessibilityFieldDescriptor,
  type SlideEditObjectAccessibilityFieldId,
  type SlideEditObjectAccessibilityHostCommandEffect,
  type SlideEditObjectAccessibilityMetadata,
  type SlideEditObjectAccessibilityObjectId,
  type SlideEditObjectAccessibilitySlideId,
  type SlideEditObjectAccessibilityUpdateCommand,
  type SlideEditObjectAltTextStoragePolicy,
  type SlideEditObjectAltTextRemoveCommand,
} from './SlideEditObjectAccessibility'
export {
  createSlideEditObjectShadowDescriptor,
  getSlideEditObjectShadowCommandEffect,
  getSlideEditObjectShadowColorCSS,
  getSlideEditObjectShadowFilter,
  getSlideEditObjectShadowFilterCSS,
  getSlideEditObjectShadowMetadata,
  normalizeSlideEditObjectShadow,
  normalizeSlideEditObjectShadowFieldValue,
  normalizeSlideEditObjectShadowUpdateCommand,
  shouldEmitSlideEditObjectShadowMetadata,
  SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
  SLIDE_EDIT_OBJECT_SHADOW_FIELDS,
  SLIDE_EDIT_OBJECT_SHADOW_LIMITS,
  toSlideEditObjectShadowAttributeValue,
  type SlideEditObjectShadow,
  type SlideEditObjectShadowDescriptor,
  type SlideEditObjectShadowFieldControl,
  type SlideEditObjectShadowFieldDescriptor,
  type SlideEditObjectShadowFieldId,
  type SlideEditObjectShadowHostCommandEffect,
  type SlideEditObjectShadowLimits,
  type SlideEditObjectShadowMetadata,
  type SlideEditObjectShadowNumericLimits,
  type SlideEditObjectShadowObjectId,
  type SlideEditObjectShadowSlideId,
  type SlideEditObjectShadowUpdateCommand,
} from './SlideEditObjectShadow'
export {
  createSlideEditObjectStrokeLineStyleDescriptor,
  getSlideEditObjectStrokeLineStyleBorderStyle,
  getSlideEditObjectStrokeLineStyleCommandEffect,
  getSlideEditObjectStrokeLineStyleDashArray,
  getSlideEditObjectStrokeLineStyleMetadata,
  isSlideEditObjectStrokeLineStyleValue,
  normalizeSlideEditObjectStrokeLineStyle,
  normalizeSlideEditObjectStrokeLineStyleUpdateCommand,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_OPTIONS,
  type SlideEditObjectStrokeLineStyleBorderStyle,
  type SlideEditObjectStrokeLineStyleDescriptor,
  type SlideEditObjectStrokeLineStyleFieldDescriptor,
  type SlideEditObjectStrokeLineStyleHostCommandEffect,
  type SlideEditObjectStrokeLineStyleMetadata,
  type SlideEditObjectStrokeLineStyleObjectId,
  type SlideEditObjectStrokeLineStyleOption,
  type SlideEditObjectStrokeLineStyleSlideId,
  type SlideEditObjectStrokeLineStyleUnsupportedReason,
  type SlideEditObjectStrokeLineStyleUpdateCommand,
  type SlideEditObjectStrokeLineStyleValue,
} from './SlideEditObjectStrokeLineStyle'
export {
  createSlideEditLayerPaneDescriptor,
  getSlideEditLayerPaneCommandEffect,
  getSlideEditLayerPaneDropIndicator,
  getSlideEditLayerPaneKeyboardIntent,
  SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT,
  SLIDE_EDIT_LAYER_PANE_COMMANDS,
  SLIDE_EDIT_LAYER_PANE_DROP_INDICATOR_MODEL,
  SLIDE_EDIT_LAYER_PANE_KEYBOARD_INTENT_MODEL,
  type SlideEditLayerPaneAriaContract,
  type SlideEditLayerPaneCommand,
  type SlideEditLayerPaneCommandDescriptor,
  type SlideEditLayerPaneCommandId,
  type SlideEditLayerPaneDescriptor,
  type SlideEditLayerPaneDropIndicator,
  type SlideEditLayerPaneDropPlacement,
  type SlideEditLayerPaneGroupId,
  type SlideEditLayerPaneHostCommandEffect,
  type SlideEditLayerPaneIntent,
  type SlideEditLayerPaneKeyboardIntent,
  type SlideEditLayerPaneKeyboardKey,
  type SlideEditLayerPaneObjectId,
  type SlideEditLayerPaneObjectInput,
  type SlideEditLayerPaneRowDescriptor,
  type SlideEditLayerPaneSlideId,
} from './SlideEditObjectLayerPane'
export {
  createSlideEditObjectAnimationDescriptor,
  getSlideEditObjectAnimationBuildOrder,
  getSlideEditObjectAnimationCSSStyle,
  getSlideEditObjectAnimationUpdateCommandEffect,
  normalizeSlideEditObjectAnimationDelayMs,
  normalizeSlideEditObjectAnimationDurationMs,
  normalizeSlideEditObjectAnimationOrder,
  normalizeSlideEditObjectAnimationUpdateCommand,
  SLIDE_EDIT_DEFAULT_OBJECT_ANIMATION,
  SLIDE_EDIT_OBJECT_ANIMATION_LIMITS,
  SLIDE_EDIT_OBJECT_ANIMATION_TRIGGERS,
  SLIDE_EDIT_OBJECT_ANIMATION_TYPES,
  sortSlideEditObjectAnimationsByBuildOrder,
  type SlideEditAnimationObjectId,
  type SlideEditAnimationSlideId,
  type SlideEditAnimationTrigger,
  type SlideEditAnimationType,
  type SlideEditBuiltInAnimationTrigger,
  type SlideEditBuiltInAnimationType,
  type SlideEditObjectAnimationCSSStyle,
  type SlideEditObjectAnimationCSSStyleInput,
  type SlideEditObjectAnimationDescriptor,
  type SlideEditObjectAnimationFieldId,
  type SlideEditObjectAnimationHostCommandEffect,
  type SlideEditObjectAnimationTimingLimits,
  type SlideEditObjectAnimationTriggerDescriptor,
  type SlideEditObjectAnimationTypeDescriptor,
  type SlideEditObjectAnimationUpdateCommand,
} from './SlideEditObjectAnimationBuildOrder'
export {
  createSlideEditLayoutPlaceholderDescriptor,
  createSlideEditThemeDescriptor,
  getSlideEditLayoutApplyCommandEffect,
  getSlideEditLayoutPlaceholderVisibilityDescriptor,
  getSlideEditResolvedLayoutPlaceholder,
  SLIDE_EDIT_LAYOUT_COMMANDS,
  type SlideEditLayoutApplyCommand,
  type SlideEditLayoutApplyExistingObjectPolicy,
  type SlideEditLayoutApplyHostCommandEffect,
  type SlideEditLayoutApplyObjectMapping,
  type SlideEditLayoutCommandDescriptor,
  type SlideEditLayoutDescriptor,
  type SlideEditLayoutId,
  type SlideEditLayoutObjectId,
  type SlideEditLayoutPlaceholderDescriptor,
  type SlideEditLayoutSlideId,
  type SlideEditMasterDescriptor,
  type SlideEditMasterId,
  type SlideEditResolvedLayoutPlaceholder,
  type SlideEditStyleTokenRefs,
  type SlideEditThemeColorRole,
  type SlideEditThemeColorToken,
  type SlideEditThemeColorTokenId,
  type SlideEditThemeDescriptor,
  type SlideEditThemeFontRole,
  type SlideEditThemeFontToken,
  type SlideEditThemeFontTokenId,
  type SlideEditThemeId,
  type SlideEditThemeSpacingRole,
  type SlideEditThemeSpacingToken,
  type SlideEditThemeSpacingTokenId,
} from './SlideEditLayoutTheme'
export {
  createSlideEditColorSwatchPaletteDescriptor,
  getSlideEditColorSwatchCommandEffect,
  getSlideEditColorSwatchId,
  getSlideEditColorWithAlphaCSS,
  normalizeSlideEditColorHex,
  normalizeSlideEditColorSwatchValue,
  SLIDE_EDIT_COLOR_SWATCH_CHANNELS,
  SLIDE_EDIT_COLOR_SWATCH_FIELD,
  type SlideEditColorSwatchApplyCommand,
  type SlideEditColorSwatchBuiltInChannelId,
  type SlideEditColorSwatchChannelDescriptor,
  type SlideEditColorSwatchChannelId,
  type SlideEditColorSwatchDisabledReason,
  type SlideEditColorSwatchFieldDescriptor,
  type SlideEditColorSwatchHostCommandEffect,
  type SlideEditColorSwatchItem,
  type SlideEditColorSwatchObjectId,
  type SlideEditColorSwatchPaletteDescriptor,
  type SlideEditColorSwatchSection,
  type SlideEditColorSwatchSelection,
  type SlideEditColorSwatchSlideId,
  type SlideEditColorSwatchSource,
  type SlideEditColorSwatchState,
} from './SlideEditColorSwatchPalette'
export {
  createSlideEditClipboardAdapterExample,
  createSlideEditClipboardPasteCommandEffect,
  createSlideEditClipboardPastePlan,
  createSlideEditClipboardPayload,
  getSlideEditClipboardPasteAnchor,
  mapSlideEditClipboardPasteObjects,
  normalizeSlideEditClipboardSelectedObjectIds,
  type SlideEditClipboardGroupId,
  type SlideEditClipboardObjectId,
  type SlideEditClipboardObjectMetadata,
  type SlideEditClipboardOperation,
  type SlideEditClipboardPasteCommand,
  type SlideEditClipboardPasteHostCommandEffect,
  type SlideEditClipboardPasteObjectMapping,
  type SlideEditClipboardPastePlan,
  type SlideEditClipboardPasteTarget,
  type SlideEditClipboardPayload,
  type SlideEditClipboardPlaceholderId,
  type SlideEditClipboardRemapPolicy,
  type SlideEditClipboardSlideId,
} from './SlideEditClipboard'
export {
  createSlideEditStyleClipboardDescriptor,
  createSlideEditStyleClipboardPasteCommandEffect,
  getSlideEditStyleClipboardCategoryDescriptors,
  getSlideEditStyleClipboardCategoryIds,
  getSlideEditStyleClipboardCopyCommandEffect,
  getSlideEditStyleClipboardKeyboardIntent,
  getSlideEditStyleClipboardPasteAvailability,
  SLIDE_EDIT_STYLE_CLIPBOARD_BUILT_IN_CATEGORIES,
  SLIDE_EDIT_STYLE_CLIPBOARD_COPY_FORMATTING_SHORTCUT,
  SLIDE_EDIT_STYLE_CLIPBOARD_PASTE_FORMATTING_SHORTCUT,
  type SlideEditStyleClipboardBuiltInCategoryId,
  type SlideEditStyleClipboardCategoryApplication,
  type SlideEditStyleClipboardCategoryDescriptor,
  type SlideEditStyleClipboardCategoryId,
  type SlideEditStyleClipboardCopyFormattingCommand,
  type SlideEditStyleClipboardDescriptor,
  type SlideEditStyleClipboardDisabledReason,
  type SlideEditStyleClipboardHostCommandEffect,
  type SlideEditStyleClipboardKeyboardIntent,
  type SlideEditStyleClipboardKeyboardIntentInput,
  type SlideEditStyleClipboardKeyboardIntentKind,
  type SlideEditStyleClipboardObjectId,
  type SlideEditStyleClipboardPasteAvailability,
  type SlideEditStyleClipboardPasteFormattingCommand,
  type SlideEditStyleClipboardSlideId,
  type SlideEditStyleClipboardSource,
  type SlideEditStyleClipboardSourceKind,
  type SlideEditStyleClipboardStylePayload,
  type SlideEditStyleClipboardTargetDescriptor,
  type SlideEditStyleClipboardTargetInput,
} from './SlideEditStyleClipboard'
export {
  createSlideEditSlideMetadataInspectorDescriptor,
  getSlideEditInspectorSurface,
  getSlideEditSlideMetadataFieldDescriptors,
  SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY,
  SLIDE_EDIT_SLIDE_METADATA_FIELDS,
  toSlideEditSlideMetadataHostCommandEffect,
  type SlideEditInspectorDisplayPriority,
  type SlideEditInspectorSurfaceId,
  type SlideEditSlideBackgroundDescriptor,
  type SlideEditSlideMetadataCommandId,
  type SlideEditSlideMetadataFieldControl,
  type SlideEditSlideMetadataFieldDescriptor,
  type SlideEditSlideMetadataFieldId,
  type SlideEditSlideMetadataHostCommandEffect,
  type SlideEditSlideMetadataInspectorDescriptor,
  type SlideEditSlideMetadataOptionalFieldId,
  type SlideEditSlideMetadataReadModel,
  type SlideEditSlideMetadataSlideId,
  type SlideEditSlideMetadataUpdateCommand,
  type SlideEditSlideOrientation,
  type SlideEditSlideSizeDescriptor,
} from './SlideEditSlideMetadataInspector'
export {
  createSlideEditTransitionDescriptor,
  getSlideEditTransitionCSSStyle,
  getSlideEditTransitionUpdateCommandEffect,
  normalizeSlideEditTransitionAdvancePolicy,
  normalizeSlideEditTransitionDurationMs,
  normalizeSlideEditTransitionUpdateCommand,
  SLIDE_EDIT_DEFAULT_TRANSITION,
  SLIDE_EDIT_TRANSITION_TIMING_LIMITS,
  SLIDE_EDIT_TRANSITION_TYPES,
  type SlideEditBuiltInTransitionType,
  type SlideEditSlideTransitionDescriptor,
  type SlideEditTransitionAdvancePolicy,
  type SlideEditTransitionCSSStyle,
  type SlideEditTransitionCSSStyleInput,
  type SlideEditTransitionFieldId,
  type SlideEditTransitionHostCommandEffect,
  type SlideEditTransitionSlideId,
  type SlideEditTransitionTimingLimits,
  type SlideEditTransitionType,
  type SlideEditTransitionTypeDescriptor,
  type SlideEditTransitionUpdateCommand,
} from './SlideEditSlideTransitionTiming'

export type SlideEditSlideId = string
export type SlideEditObjectId = string

export type SlideEditPoint = Point
export type SlideEditBounds = Bounds
export type SlideEditViewport = Viewport
export type SlideEditSelectionIds = CanvasSelectionIds
export type SlideEditSize = Pick<Bounds, 'h' | 'w'>

export type SlideEditSelection<
  TSlideId extends SlideEditSlideId = SlideEditSlideId,
  TObjectId extends SlideEditObjectId = SlideEditObjectId,
> = {
  objectIds: readonly TObjectId[]
  slideId: TSlideId
}

export type SlideEditObjectRef<
  TSlideId extends SlideEditSlideId = SlideEditSlideId,
  TObjectId extends SlideEditObjectId = SlideEditObjectId,
> = {
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditCommandEffect<
  TSlideId extends SlideEditSlideId = SlideEditSlideId,
  TObjectId extends SlideEditObjectId = SlideEditObjectId,
  TCommandPayload = unknown,
  TPatch = unknown,
> =
  | CanvasExtensionEffect<TPatch>
  | {
    payload: TCommandPayload
    selection?: SlideEditSelection<TSlideId, TObjectId>
    type: 'slide-command-effect'
  }

export type SlideEditTextMeasurementRequest<
  TSlideId extends SlideEditSlideId = SlideEditSlideId,
  TObjectId extends SlideEditObjectId = SlideEditObjectId,
> = SlideEditObjectRef<TSlideId, TObjectId> & {
  bounds: SlideEditBounds
  text: string
}

export type SlideEditTextMeasurement = {
  hasOverflow: boolean
  lineCount?: number
  measuredSize: SlideEditSize
}

export type SlideEditAdapter<
  TSlideId extends SlideEditSlideId = SlideEditSlideId,
  TObjectId extends SlideEditObjectId = SlideEditObjectId,
  TCommandPayload = unknown,
  TPatch = unknown,
> = {
  dispatchCommandEffect: (
    effect: SlideEditCommandEffect<
      TSlideId,
      TObjectId,
      TCommandPayload,
      TPatch
    >,
  ) => void
  getObjectBounds: (
    ref: SlideEditObjectRef<TSlideId, TObjectId>,
  ) => SlideEditBounds | null
  getSelection: () => SlideEditSelection<TSlideId, TObjectId>
  getSlideFrame: (slideId: TSlideId) => SlideEditBounds | null
  measureText: (
    request: SlideEditTextMeasurementRequest<TSlideId, TObjectId>,
  ) => SlideEditTextMeasurement | null
}

export type SlideEditAdapterSlotId =
  | 'command-effect'
  | 'color-swatch-palette'
  | 'object-accessibility'
  | 'object-animation'
  | 'object-corner-radius'
  | 'object-fill-opacity'
  | 'object-hyperlink'
  | 'object-image-crop'
  | 'object-image-replace'
  | 'object-opacity'
  | 'object-shadow'
  | 'object-stroke-line-style'
  | 'layout-theme'
  | 'object-bounds'
  | 'selection'
  | 'slide-frame'
  | 'slide-metadata'
  | 'style-clipboard'
  | 'slide-transition'
  | 'text-font-family'
  | 'text-frame-inset'
  | 'text-vertical-alignment'
  | 'text-paragraph-spacing'
  | 'text-measurement'

export type SlideEditAdapterSlotDescriptor = {
  id: SlideEditAdapterSlotId
  owner: 'host'
  purpose: string
}

export const SLIDE_EDIT_ADAPTER_SLOTS = Object.freeze([
  {
    id: 'slide-frame',
    owner: 'host',
    purpose: 'Provide the editable page frame in canvas coordinates.',
  },
  {
    id: 'object-bounds',
    owner: 'host',
    purpose: 'Resolve selected object bounds without exposing storage shape.',
  },
  {
    id: 'selection',
    owner: 'host',
    purpose: 'Provide the active page and selected object ids.',
  },
  {
    id: 'command-effect',
    owner: 'host',
    purpose: 'Apply command effects through the host document transaction.',
  },
  {
    id: 'color-swatch-palette',
    owner: 'host',
    purpose: 'Provide theme and recent color swatches for object style channels.',
  },
  {
    id: 'object-accessibility',
    owner: 'host',
    purpose: 'Provide selected object alt text and decorative state for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'object-animation',
    owner: 'host',
    purpose: 'Provide object animation and build order values scoped to a slide.',
  },
  {
    id: 'object-corner-radius',
    owner: 'host',
    purpose: 'Provide selected object corner radius values for rounded shape affordances.',
  },
  {
    id: 'object-fill-opacity',
    owner: 'host',
    purpose: 'Provide selected object fill opacity values separate from whole-object opacity.',
  },
  {
    id: 'object-hyperlink',
    owner: 'host',
    purpose: 'Provide selected object hyperlink/action values for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'object-image-crop',
    owner: 'host',
    purpose: 'Provide selected image fit and crop position values for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'object-image-replace',
    owner: 'host',
    purpose: 'Provide selected image source replacement metadata for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'object-opacity',
    owner: 'host',
    purpose: 'Provide selected object opacity values for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'object-shadow',
    owner: 'host',
    purpose: 'Provide selected object shadow values for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'object-stroke-line-style',
    owner: 'host',
    purpose: 'Provide selected object stroke line style values for inspector, stage, thumbnail, and export.',
  },
  {
    id: 'layout-theme',
    owner: 'host',
    purpose: 'Provide slide layout, master, placeholder, and theme token descriptors.',
  },
  {
    id: 'slide-metadata',
    owner: 'host',
    purpose: 'Provide active slide metadata values for inspector descriptors.',
  },
  {
    id: 'style-clipboard',
    owner: 'host',
    purpose: 'Provide copied style categories and formatting paste availability.',
  },
  {
    id: 'slide-transition',
    owner: 'host',
    purpose: 'Provide slide transition and advance timing values for inspector, preview, and export.',
  },
  {
    id: 'text-font-family',
    owner: 'host',
    purpose: 'Provide selected text object font family values and allowed family options.',
  },
  {
    id: 'text-frame-inset',
    owner: 'host',
    purpose: 'Provide selected text object frame inset values for stage, thumbnail, and export.',
  },
  {
    id: 'text-vertical-alignment',
    owner: 'host',
    purpose: 'Provide selected text object vertical alignment values for stage, thumbnail, and export.',
  },
  {
    id: 'text-paragraph-spacing',
    owner: 'host',
    purpose: 'Provide text paragraph spacing and line height values for object inspectors.',
  },
  {
    id: 'text-measurement',
    owner: 'host',
    purpose: 'Measure text overflow and rendered text size for a bounded object.',
  },
] as const satisfies readonly SlideEditAdapterSlotDescriptor[])

export type SlideEditReusedCanvasContractId =
  | 'geometry'
  | 'selection'
  | 'snap-guides'
  | 'transform'
  | 'viewport'

export type SlideEditReusedCanvasContract = {
  id: SlideEditReusedCanvasContractId
  source: 'canvas/core' | 'canvas/foundation'
  scope: string
}

export const SLIDE_EDIT_REUSED_CANVAS_CONTRACTS = Object.freeze([
  {
    id: 'geometry',
    source: 'canvas/core',
    scope: 'Point and bounds math remain renderer- and host-neutral.',
  },
  {
    id: 'viewport',
    source: 'canvas/core',
    scope: 'World-to-screen projection and zoom state stay shared.',
  },
  {
    id: 'selection',
    source: 'canvas/core',
    scope: 'Selection identity remains an id list, not a product object.',
  },
  {
    id: 'transform',
    source: 'canvas/foundation',
    scope: 'Move and resize planning stays structural over bounds adapters.',
  },
  {
    id: 'snap-guides',
    source: 'canvas/foundation',
    scope: 'Alignment and spacing guide contracts remain reusable.',
  },
] as const satisfies readonly SlideEditReusedCanvasContract[])

export type SlideEditOwnedContractId =
  | 'layout-theme-affordance'
  | 'object-inspector'
  | 'color-swatch-palette-affordance'
  | 'object-accessibility-affordance'
  | 'object-animation-build-order'
  | 'object-corner-radius-affordance'
  | 'object-fill-opacity-affordance'
  | 'object-hyperlink-affordance'
  | 'object-image-crop-affordance'
  | 'object-image-replace-affordance'
  | 'object-layer-pane'
  | 'object-opacity-affordance'
  | 'object-shadow-affordance'
  | 'object-stroke-line-style-affordance'
  | 'placeholder-visibility-affordance'
  | 'slide-command-effects'
  | 'slide-object-clipboard'
  | 'slide-frame-affordance'
  | 'slide-metadata-inspector'
  | 'slide-object-bounds'
  | 'slide-rail-interaction'
  | 'slide-transition-timing'
  | 'style-clipboard-affordance'
  | 'text-font-family-affordance'
  | 'text-frame-inset-affordance'
  | 'text-overflow-affordance'
  | 'text-paragraph-spacing-affordance'
  | 'text-vertical-alignment-affordance'

export type SlideEditOwnedContract = {
  id: SlideEditOwnedContractId
  owner: 'slide-edit-affordance'
  scope: string
}

export const SLIDE_EDIT_OWNED_CONTRACTS = Object.freeze([
  {
    id: 'slide-frame-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Center, margin, safe-area, ruler, and column guide geometry.',
  },
  {
    id: 'slide-object-bounds',
    owner: 'slide-edit-affordance',
    scope: 'Slide object bounds adapters and multi-object page selection.',
  },
  {
    id: 'slide-command-effects',
    owner: 'slide-edit-affordance',
    scope: 'Product-neutral command effect envelopes for host transactions.',
  },
  {
    id: 'slide-rail-interaction',
    owner: 'slide-edit-affordance',
    scope: 'Slide order, active slide, thumbnail hit target, and rail command intent descriptors.',
  },
  {
    id: 'color-swatch-palette-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Theme and recent color swatch descriptors for fill, stroke, text, and line channels.',
  },
  {
    id: 'placeholder-visibility-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Slide placeholder structure and object hide/show read model.',
  },
  {
    id: 'object-layer-pane',
    owner: 'slide-edit-affordance',
    scope: 'Slide object row descriptors and layer pane command intents.',
  },
  {
    id: 'object-accessibility-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object alt text, decorative state, metadata attribute, and update command effects.',
  },
  {
    id: 'object-animation-build-order',
    owner: 'slide-edit-affordance',
    scope: 'Object animation type, trigger, timing, and slide-local build order.',
  },
  {
    id: 'object-corner-radius-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object corner radius value, bounds, support state, metadata attribute, and update command effects.',
  },
  {
    id: 'object-fill-opacity-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object fill-only opacity value, bounds, support state, metadata attribute, and update command effects.',
  },
  {
    id: 'object-hyperlink-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object hyperlink/action fields, metadata attribute, URL policy, and update command effects.',
  },
  {
    id: 'object-image-crop-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Image fit mode, crop position fields, metadata attribute, and update command effects.',
  },
  {
    id: 'object-image-replace-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Image source replacement field, support state, metadata attribute, and command effects.',
  },
  {
    id: 'object-opacity-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object opacity value, metadata attribute, and update command effects.',
  },
  {
    id: 'object-shadow-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object shadow fields, metadata attribute, and update command effects.',
  },
  {
    id: 'object-stroke-line-style-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Object stroke solid, dash, and dot line style descriptors and update command effects.',
  },
  {
    id: 'layout-theme-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Slide layout, master, placeholder mapping, and theme token descriptors.',
  },
  {
    id: 'slide-object-clipboard',
    owner: 'slide-edit-affordance',
    scope: 'Multi-slide object clipboard payloads, paste targets, and remap plans.',
  },
  {
    id: 'style-clipboard-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Style-only clipboard payloads, category applicability, and format painter command effects.',
  },
  {
    id: 'slide-metadata-inspector',
    owner: 'slide-edit-affordance',
    scope: 'Active slide metadata fields and host-routed update command effects.',
  },
  {
    id: 'slide-transition-timing',
    owner: 'slide-edit-affordance',
    scope: 'Slide transition type, duration, advance timing, and update command effects.',
  },
  {
    id: 'text-overflow-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Bounded text measurement, overflow state, and auto-fit hints.',
  },
  {
    id: 'text-font-family-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Selected text object font family options, fallback normalization, and update command effects.',
  },
  {
    id: 'text-frame-inset-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Text frame top/right/bottom/left inset metadata and update command effects.',
  },
  {
    id: 'text-vertical-alignment-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Text frame vertical alignment values, metadata attribute, and update command effects.',
  },
  {
    id: 'text-paragraph-spacing-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Text line height and paragraph before/after spacing descriptors.',
  },
  {
    id: 'object-inspector',
    owner: 'slide-edit-affordance',
    scope: 'Object-level inspector groupings that do not assume a DOM layout.',
  },
] as const satisfies readonly SlideEditOwnedContract[])

export type SlideEditDomReferenceId =
  | 'guide'
  | 'inspector'
  | 'size-capsule'

export type SlideEditDomNonReusableId =
  | 'dom-box-model-xray'
  | 'dom-computed-overflow'
  | 'dom-layout-controls'
  | 'dom-tree-selection'

export type SlideEditDomReferenceMap = {
  notReusableAsIs: readonly SlideEditDomNonReusableId[]
  reusable: readonly SlideEditDomReferenceId[]
}

export const SLIDE_EDIT_DOM_AFFORDANCE_REFERENCE = Object.freeze({
  reusable: ['guide', 'inspector', 'size-capsule'],
  notReusableAsIs: [
    'dom-layout-controls',
    'dom-computed-overflow',
    'dom-tree-selection',
    'dom-box-model-xray',
  ],
} as const satisfies SlideEditDomReferenceMap)

export function getSlideEditAdapterSlotIds() {
  return SLIDE_EDIT_ADAPTER_SLOTS.map((slot) => slot.id)
}

export function isSlideEditDomReferenceReusable(
  id: SlideEditDomReferenceId | SlideEditDomNonReusableId,
) {
  return SLIDE_EDIT_DOM_AFFORDANCE_REFERENCE.reusable.includes(
    id as SlideEditDomReferenceId,
  )
}
