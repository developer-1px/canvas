import { describe, expect, it } from 'vitest'
import {
  CanvasDevtoolsOverlay,
  CANVAS_DEVTOOLS_FEATURE_PACK_ID,
  CANVAS_DEVTOOLS_TOGGLE_INSPECT_COMMAND_ID,
  CANVAS_DEVTOOLS_TOGGLE_MEASURE_COMMAND_ID,
  CANVAS_DEVTOOLS_TOGGLE_NOTES_COMMAND_ID,
  createCanvasDevtoolsFeaturePackManifest,
  createCanvasDevtoolsInspectSnapshot,
  createCanvasDevtoolsMeasureSnapshot,
} from './index'

describe('CanvasDevtoolsFeaturePack', () => {
  it('creates a devtools feature pack manifest', () => {
    const manifest = createCanvasDevtoolsFeaturePackManifest()

    expect(manifest.id).toBe(CANVAS_DEVTOOLS_FEATURE_PACK_ID)
    expect(manifest.label).toBe('Devtools')
    expect(manifest.extensionFeaturePack?.id).toBe('devtools')
  })

  it('contributes discoverable devtools mode commands', () => {
    const manifest = createCanvasDevtoolsFeaturePackManifest()

    expect(
      manifest.extensionFeaturePack?.extensionBundle.customCommands
        .map((command) => command.id),
    ).toEqual([
      CANVAS_DEVTOOLS_TOGGLE_MEASURE_COMMAND_ID,
      CANVAS_DEVTOOLS_TOGGLE_INSPECT_COMMAND_ID,
      CANVAS_DEVTOOLS_TOGGLE_NOTES_COMMAND_ID,
    ])
  })

  it('exports the affordance overlay and inspection models', () => {
    expect(CanvasDevtoolsOverlay).toBeTypeOf('function')
    expect(createCanvasDevtoolsMeasureSnapshot).toBeTypeOf('function')
    expect(createCanvasDevtoolsInspectSnapshot).toBeTypeOf('function')
  })
})
