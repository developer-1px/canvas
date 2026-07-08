import {
  createCanvasAppExtensionBundle,
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackManifest,
} from '@interactive-os/canvas/app/authoring'
import type {
  CanvasDevtoolsMode,
} from '@interactive-os/canvas-devtools-affordance'

export {
  CanvasDevtoolsOverlay,
  createCanvasDevtoolsInspectSnapshot,
  createCanvasDevtoolsMeasureSnapshot,
  type CanvasDevtoolsDistance,
  type CanvasDevtoolsDistanceAxis,
  type CanvasDevtoolsCommentSummary,
  type CanvasDevtoolsInspectField,
  type CanvasDevtoolsInspectSnapshot,
  type CanvasDevtoolsMeasuredItem,
  type CanvasDevtoolsMeasureSnapshot,
  type CanvasDevtoolsItemSummary,
  type CanvasDevtoolsMode,
  type CanvasDevtoolsNoteSummary,
  type CanvasDevtoolsOverlayProps,
  type CanvasDevtoolsTypeCount,
  type CreateCanvasDevtoolsInspectSnapshotInput,
  type CreateCanvasDevtoolsMeasureSnapshotInput,
} from '@interactive-os/canvas-devtools-affordance'

export type CanvasDevtoolsFeaturePackManifestInput = Readonly<{
  initialMode?: CanvasDevtoolsMode
}>

export const CANVAS_DEVTOOLS_FEATURE_PACK_ID = 'devtools'
export const CANVAS_DEVTOOLS_TOGGLE_INSPECT_COMMAND_ID =
  'devtools-toggle-inspect'
export const CANVAS_DEVTOOLS_TOGGLE_MEASURE_COMMAND_ID =
  'devtools-toggle-measure'
export const CANVAS_DEVTOOLS_TOGGLE_NOTES_COMMAND_ID =
  'devtools-toggle-notes'

export function createCanvasDevtoolsFeaturePackManifest(
  _input: CanvasDevtoolsFeaturePackManifestInput = {},
) {
  const id = CANVAS_DEVTOOLS_FEATURE_PACK_ID
  const label = 'Devtools'

  return createCanvasAppFeaturePackManifest({
    extensionFeaturePack: createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        customCommands: [
          {
            id: CANVAS_DEVTOOLS_TOGGLE_MEASURE_COMMAND_ID,
            isEnabled: () => true,
            label: 'Measure',
            run: () => undefined,
            title: 'Toggle measurement devtools',
          },
          {
            id: CANVAS_DEVTOOLS_TOGGLE_INSPECT_COMMAND_ID,
            isEnabled: () => true,
            label: 'Inspect',
            run: () => undefined,
            title: 'Toggle canvas item inspector',
          },
          {
            id: CANVAS_DEVTOOLS_TOGGLE_NOTES_COMMAND_ID,
            isEnabled: () => true,
            label: 'Notes',
            run: () => undefined,
            title: 'Toggle canvas comment notes',
          },
        ],
      }),
      id,
      label,
    }),
    id,
    label,
    runtimeFeaturePacks: Object.freeze({
      initialMode: _input.initialMode ?? 'measure',
    }),
  })
}
