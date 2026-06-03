import { describe, expect, it } from 'vitest'
import { PRODUCT_CANVAS_APP_ASSEMBLY } from './CanvasProductAssembly'

describe('CanvasProductAssembly', () => {
  it('turns on the compact product workbench surfaces for /', () => {
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([
      'engine-shape',
    ])
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.toolbar)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.zoomControls)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.status)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.stampControls)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.inspector)
      .toBe(false)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.componentPalette)
      .toBe(false)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.cursorChat)
      .toBe(false)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.emoteControls)
      .toBe(false)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.laser).toBe(false)
  })
})
