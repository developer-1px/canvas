import { describe, expect, it } from 'vitest'
import {
  CANVAS_APP_SURFACE_DEFINITIONS,
  CANVAS_APP_SURFACE_IDS,
  getCanvasAppSurfaceVisibility,
  type CanvasAppSurfaceId,
} from './CanvasAppSurfaceModel'

describe('CanvasAppSurfaceModel', () => {
  it('defines every app surface once', () => {
    const definitionIds = CANVAS_APP_SURFACE_DEFINITIONS.map(({ id }) => id)

    expect(definitionIds).toEqual(CANVAS_APP_SURFACE_IDS)
    expect(new Set(definitionIds).size).toBe(definitionIds.length)
  })

  it('keeps contextual command surfaces mutually exclusive', () => {
    const visibility = getCanvasAppSurfaceVisibility({
      'context-command-menu': true,
      'selection-floating-bar': true,
    })

    expect(visibility['context-command-menu']).toBe(true)
    expect(visibility['selection-floating-bar']).toBe(false)
  })

  it('keeps bottom-center transient surfaces mutually exclusive', () => {
    const visibility = getCanvasAppSurfaceVisibility({
      'emote-controls': true,
      'find-replace-panel': true,
    })

    expect(visibility['find-replace-panel']).toBe(true)
    expect(visibility['emote-controls']).toBe(false)
  })

  it('keeps right-rail panels mutually exclusive', () => {
    const visibility = getCanvasAppSurfaceVisibility({
      'component-palette': true,
      'object-inspector': true,
    })

    expect(visibility['object-inspector']).toBe(true)
    expect(visibility['component-palette']).toBe(false)
  })

  it('does not suppress independent regions', () => {
    const requested = Object.fromEntries(
      CANVAS_APP_SURFACE_IDS.map((id) => [id, true]),
    ) as Record<CanvasAppSurfaceId, boolean>
    const visibility = getCanvasAppSurfaceVisibility(requested)

    expect(visibility.toolbar).toBe(true)
    expect(visibility['object-inspector']).toBe(true)
    expect(visibility['zoom-controls']).toBe(true)
    expect(visibility['canvas-status']).toBe(true)
  })
})
