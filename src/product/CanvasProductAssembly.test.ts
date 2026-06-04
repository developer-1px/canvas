import { describe, expect, it } from 'vitest'
import { PRODUCT_CANVAS_APP_ASSEMBLY } from './CanvasProductAssembly'

describe('CanvasProductAssembly', () => {
  it('turns on the compact product workbench surfaces for /', () => {
    const productItemIds = PRODUCT_CANVAS_APP_ASSEMBLY.initialItems.map(
      (item) => item.id,
    )

    expect(PRODUCT_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([])
    expect(productItemIds).toContain('product-board-title')
    expect(productItemIds).not.toContain('engine-section')
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.initialItems.some((item) =>
      item.type === 'custom'
    )).toBe(false)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.toolbar)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.zoomControls)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.status)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.stampControls)
      .toBe(true)
    expect(
      PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.stickyQuickCreate,
    ).toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.drawingControls)
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
    expect(
      PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.quickCreateSticky,
    ).toBe(true)
    expect(typeof PRODUCT_CANVAS_APP_ASSEMBLY.workspaceStorageProvider)
      .toBe('function')
  })

  it('keeps organize and mark affordances enabled for the product board', () => {
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createSection)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createComment)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createArrow)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.drawMarker)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.drawHighlight)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.section)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.comment)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.arrow)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.marker)
      .toBe(true)
    expect(PRODUCT_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.highlight)
      .toBe(true)
  })
})
