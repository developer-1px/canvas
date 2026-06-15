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
  getSlideEditRailKeyboardCommandEffect,
  getSlideEditRailPointerCommandEffect,
  SLIDE_EDIT_RAIL_COMMANDS,
  toSlideEditRailHostCommandEffect,
  type SlideEditRailCommand,
  type SlideEditRailCommandDescriptor,
  type SlideEditRailCommandId,
  type SlideEditRailDescriptor,
  type SlideEditRailHostCommandEffect,
  type SlideEditRailKeyboardIntent,
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
  createSlideEditLayerPaneDescriptor,
  getSlideEditLayerPaneCommandEffect,
  SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT,
  SLIDE_EDIT_LAYER_PANE_COMMANDS,
  type SlideEditLayerPaneAriaContract,
  type SlideEditLayerPaneCommand,
  type SlideEditLayerPaneCommandDescriptor,
  type SlideEditLayerPaneCommandId,
  type SlideEditLayerPaneDescriptor,
  type SlideEditLayerPaneGroupId,
  type SlideEditLayerPaneHostCommandEffect,
  type SlideEditLayerPaneIntent,
  type SlideEditLayerPaneObjectId,
  type SlideEditLayerPaneObjectInput,
  type SlideEditLayerPaneRowDescriptor,
  type SlideEditLayerPaneSlideId,
} from './SlideEditObjectLayerPane'
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
  createSlideEditClipboardAdapterExample,
  createSlideEditClipboardPasteCommandEffect,
  createSlideEditClipboardPastePlan,
  createSlideEditClipboardPayload,
  getSlideEditClipboardPasteAnchor,
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
  | 'layout-theme'
  | 'object-bounds'
  | 'selection'
  | 'slide-frame'
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
    id: 'layout-theme',
    owner: 'host',
    purpose: 'Provide slide layout, master, placeholder, and theme token descriptors.',
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
  | 'object-layer-pane'
  | 'placeholder-visibility-affordance'
  | 'slide-command-effects'
  | 'slide-object-clipboard'
  | 'slide-frame-affordance'
  | 'slide-object-bounds'
  | 'slide-rail-interaction'
  | 'text-overflow-affordance'

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
    id: 'text-overflow-affordance',
    owner: 'slide-edit-affordance',
    scope: 'Bounded text measurement, overflow state, and auto-fit hints.',
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
