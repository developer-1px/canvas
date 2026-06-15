import { describe, expect, it } from 'vitest'
import {
  getDomEditOverlayLayerVisibility,
  isDomEditOverlayLayerVisible,
} from './DomEditOverlayLayers'

describe('DomEditOverlayLayers', () => {
  it('defaults every overlay family to visible', () => {
    expect(getDomEditOverlayLayerVisibility()).toEqual({
      boxModel: true,
      flex: true,
      grid: true,
      guides: true,
      selection: true,
      spacing: true,
    })
  })

  it('uses user visibility as an additional gate', () => {
    const visibility = getDomEditOverlayLayerVisibility({
      boxModel: false,
      flex: false,
      grid: false,
      guides: false,
      spacing: false,
    })

    expect(visibility).toEqual({
      boxModel: false,
      flex: false,
      grid: false,
      guides: false,
      selection: true,
      spacing: false,
    })
    expect(isDomEditOverlayLayerVisible(visibility, 'flex')).toBe(false)
    expect(isDomEditOverlayLayerVisible(visibility, 'selection')).toBe(true)
  })
})
