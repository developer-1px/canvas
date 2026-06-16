import type {
  ComponentProps,
  ReactNode,
} from 'react'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackInstallOptions,
} from './CanvasAppFeaturePacks'
import type { CanvasCommandPalette } from './command-palette'
import type {
  CanvasComponentPalette,
  CanvasStickyQuickCreateControl,
} from './component-authoring'
import type { CanvasCursorChat } from './cursor-chat'
import type { CanvasDrawingControls } from './drawing-tools'
import type {
  CanvasEmoteControls,
  CanvasSessionTimer,
  CanvasSpotlight,
  CanvasVotingSession,
} from './facilitation'
import type { CanvasFindReplacePanel } from './find-replace'
import type { CanvasImageControls } from './image-io'
import type { CanvasMinimap } from './minimap'
import type { CanvasShortcutHelpOverlay } from './shortcut-help'
import type { CanvasStampControls } from './stamp-authoring'
import type { CanvasStatus } from './status-bar'
import type {
  CanvasContextCommandMenu,
  CanvasContextCommandMenuState as ToolbarContextCommandMenuState,
  CanvasSelectionFloatingBar,
  CanvasToolbar,
} from './toolbar'
import type { ZoomControls } from './zoom-controls'

export type CanvasAppCommandPaletteProps =
  ComponentProps<typeof CanvasCommandPalette>
export type CanvasAppComponentPaletteProps =
  ComponentProps<typeof CanvasComponentPalette>
export type CanvasAppContextCommandMenuProps =
  ComponentProps<typeof CanvasContextCommandMenu>
export type CanvasAppContextCommandMenuState =
  ToolbarContextCommandMenuState
export type CanvasAppCursorChatProps =
  ComponentProps<typeof CanvasCursorChat>
export type CanvasAppDrawingControlsProps =
  ComponentProps<typeof CanvasDrawingControls>
export type CanvasAppEmoteControlsProps =
  ComponentProps<typeof CanvasEmoteControls>
export type CanvasAppFindReplacePanelProps =
  ComponentProps<typeof CanvasFindReplacePanel>
export type CanvasAppImageControlsProps =
  ComponentProps<typeof CanvasImageControls>
export type CanvasAppMinimapProps = ComponentProps<typeof CanvasMinimap>
export type CanvasAppSelectionFloatingBarProps =
  ComponentProps<typeof CanvasSelectionFloatingBar>
export type CanvasAppSessionTimerProps =
  ComponentProps<typeof CanvasSessionTimer>
export type CanvasAppShortcutHelpOverlayProps =
  ComponentProps<typeof CanvasShortcutHelpOverlay>
export type CanvasAppSpotlightProps = ComponentProps<typeof CanvasSpotlight>
export type CanvasAppStampControlsProps =
  ComponentProps<typeof CanvasStampControls>
export type CanvasAppStatusProps = ComponentProps<typeof CanvasStatus>
export type CanvasAppStickyQuickCreateControlProps =
  ComponentProps<typeof CanvasStickyQuickCreateControl>
export type CanvasAppToolbarProps = ComponentProps<typeof CanvasToolbar>
export type CanvasAppVotingSessionProps =
  ComponentProps<typeof CanvasVotingSession>
export type CanvasAppZoomControlsProps = ComponentProps<typeof ZoomControls>

export type CanvasAppFeaturePackViewRenderers = Readonly<{
  commandPalette?: (props: CanvasAppCommandPaletteProps) => ReactNode
  componentPalette?: (props: CanvasAppComponentPaletteProps) => ReactNode
  contextCommandMenu?: (props: CanvasAppContextCommandMenuProps) => ReactNode
  cursorChat?: (props: CanvasAppCursorChatProps) => ReactNode
  drawingControls?: (props: CanvasAppDrawingControlsProps) => ReactNode
  emoteControls?: (props: CanvasAppEmoteControlsProps) => ReactNode
  findReplacePanel?: (props: CanvasAppFindReplacePanelProps) => ReactNode
  imageControls?: (props: CanvasAppImageControlsProps) => ReactNode
  minimap?: (props: CanvasAppMinimapProps) => ReactNode
  selectionFloatingBar?: (
    props: CanvasAppSelectionFloatingBarProps,
  ) => ReactNode
  sessionTimer?: (props: CanvasAppSessionTimerProps) => ReactNode
  shortcutHelp?: (props: CanvasAppShortcutHelpOverlayProps) => ReactNode
  spotlight?: (props: CanvasAppSpotlightProps) => ReactNode
  stampControls?: (props: CanvasAppStampControlsProps) => ReactNode
  status?: (props: CanvasAppStatusProps) => ReactNode
  stickyQuickCreate?: (
    props: CanvasAppStickyQuickCreateControlProps,
  ) => ReactNode
  toolbar?: (props: CanvasAppToolbarProps) => ReactNode
  votingSession?: (props: CanvasAppVotingSessionProps) => ReactNode
  zoomControls?: (props: CanvasAppZoomControlsProps) => ReactNode
}>

type CanvasAppFeaturePackViewRendererId =
  keyof CanvasAppFeaturePackViewRenderers
type CanvasAppFeaturePackViewRenderer = NonNullable<
  CanvasAppFeaturePackViewRenderers[CanvasAppFeaturePackViewRendererId]
>

export type CanvasAppViewFeaturePack = Readonly<{
  id: CanvasAppFeaturePackId
  label: string
  viewRenderers: CanvasAppFeaturePackViewRenderers
}>

export type CanvasAppViewFeaturePackInput = Readonly<{
  id: CanvasAppFeaturePackId
  label: string
  viewRenderers: CanvasAppFeaturePackViewRenderers
}>

export function createCanvasAppViewFeaturePack(
  input: CanvasAppViewFeaturePackInput,
): CanvasAppViewFeaturePack {
  assertCanvasAppViewFeaturePack(input)

  return Object.freeze({
    id: input.id,
    label: input.label,
    viewRenderers: Object.freeze({ ...input.viewRenderers }),
  })
}

export function getCanvasAppInstalledViewFeaturePacks(
  featurePacks: readonly CanvasAppViewFeaturePack[],
  options: CanvasAppFeaturePackInstallOptions = {},
) {
  assertCanvasAppViewFeaturePacks(featurePacks)
  const disabledIds = getCanvasAppDisabledViewFeaturePackIdSet(
    options.disabledFeaturePackIds ?? [],
  )

  return Object.freeze(
    featurePacks.filter((featurePack) => !disabledIds.has(featurePack.id)),
  ) as readonly CanvasAppViewFeaturePack[]
}

export function createCanvasAppFeaturePackViewRenderers(
  featurePacks: readonly CanvasAppViewFeaturePack[],
  options: CanvasAppFeaturePackInstallOptions = {},
): CanvasAppFeaturePackViewRenderers {
  const renderers: Partial<
    Record<CanvasAppFeaturePackViewRendererId, CanvasAppFeaturePackViewRenderer>
  > = {}

  for (const featurePack of getCanvasAppInstalledViewFeaturePacks(
    featurePacks,
    options,
  )) {
    const entries = Object.entries(featurePack.viewRenderers) as [
      CanvasAppFeaturePackViewRendererId,
      CanvasAppFeaturePackViewRenderer | undefined,
    ][]

    for (const [rendererId, renderer] of entries) {
      if (renderer === undefined) {
        continue
      }

      if (renderers[rendererId] !== undefined) {
        throw new Error(
          `Duplicate canvas app view feature renderer: ${rendererId}`,
        )
      }

      renderers[rendererId] = renderer
    }
  }

  return Object.freeze(renderers) as CanvasAppFeaturePackViewRenderers
}

export function assertCanvasAppViewFeaturePacks(
  featurePacks: unknown,
): asserts featurePacks is readonly CanvasAppViewFeaturePack[] {
  assertCanvasAppArray(featurePacks, 'view feature pack descriptors')

  const ids = new Set<string>()

  for (const featurePack of featurePacks) {
    assertCanvasAppViewFeaturePack(featurePack)

    if (ids.has(featurePack.id)) {
      throw new Error(`Duplicate canvas app view feature pack: ${featurePack.id}`)
    }

    ids.add(featurePack.id)
  }
}

export function assertCanvasAppViewFeaturePack(
  featurePack: unknown,
): asserts featurePack is CanvasAppViewFeaturePack {
  assertCanvasAppDescriptorObject(featurePack, 'view feature pack')
  assertCanvasAppExtensionId({
    id: featurePack.id,
    label: 'view feature pack',
  })
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `view feature pack ${featurePack.id}`,
    value: featurePack.label,
  })
  assertCanvasAppDescriptorObject(
    featurePack.viewRenderers,
    `view feature pack ${featurePack.id} renderers`,
  )
  assertCanvasAppFeaturePackViewRenderers(featurePack.viewRenderers)
}

export function assertCanvasAppFeaturePackViewRenderers(
  renderers: unknown,
): asserts renderers is CanvasAppFeaturePackViewRenderers {
  assertCanvasAppDescriptorObject(renderers, 'feature pack view renderers')
}

function getCanvasAppDisabledViewFeaturePackIdSet(
  disabledFeaturePackIds: readonly CanvasAppFeaturePackId[],
) {
  for (const id of disabledFeaturePackIds) {
    assertCanvasAppExtensionId({
      id,
      label: 'disabled view feature pack',
    })
  }

  return new Set(disabledFeaturePackIds)
}
