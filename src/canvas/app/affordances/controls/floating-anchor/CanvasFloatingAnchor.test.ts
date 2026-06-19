import { describe, expect, it } from 'vitest'
import {
  getCanvasFloatingAnchorForBounds,
  getCanvasFloatingAnchorSurfaceCoordinateStyle,
  getCanvasFloatingAnchorSurfaceDescriptor,
  getCanvasFloatingAnchorSurfaceStyle,
} from './CanvasFloatingAnchor'

describe('CanvasFloatingAnchor', () => {
  it('returns null when bounds are missing', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: null,
      floatingSize: { height: 40, width: 320 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toBeNull()
  })

  it('places the anchor below when the floating surface does not fit above', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: { h: 30, w: 80, x: 100, y: 20 },
      floatingSize: { height: 40, width: 160 },
      stageRect: { height: 400, width: 600 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      placement: 'below',
      x: 140,
      y: 60,
    })
  })

  it('places the anchor above when there is enough screen space', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: { h: 60, w: 100, x: 300, y: 180 },
      floatingSize: { height: 40, width: 200 },
      stageRect: { height: 500, width: 800 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      placement: 'above',
      x: 350,
      y: 170,
    })
  })

  it('clamps x to the visible frame when the stage rect is available', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: { h: 40, w: 120, x: 560, y: 200 },
      floatingSize: { height: 40, width: 300 },
      frameBounds: { h: 720, w: 1280, x: 0, y: 0 },
      stageRect: { height: 500, width: 400 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      placement: 'above',
      x: 242,
      y: 190,
    })
  })

  it('falls back to frame clamping when stage rect is missing', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: { h: 40, w: 80, x: 0, y: 200 },
      floatingSize: { height: 40, width: 400 },
      frameBounds: { h: 720, w: 1280, x: 0, y: 0 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      placement: 'above',
      x: 200,
      y: 190,
    })
  })

  it('converts screen gap and surface width through viewport scale', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: { h: 50, w: 100, x: 590, y: 300 },
      floatingSize: { height: 40, width: 500 },
      frameBounds: { h: 720, w: 1280, x: 0, y: 0 },
      stageRect: { height: 900, width: 1280 },
      viewport: { scale: 0.5, x: 0, y: 100 },
    })).toEqual({
      placement: 'above',
      x: 640,
      y: 280,
    })
  })

  it('caps an oversized floating surface to the available stage width', () => {
    expect(getCanvasFloatingAnchorForBounds({
      bounds: { h: 40, w: 80, x: 20, y: 120 },
      floatingSize: { height: 40, width: 500 },
      stageRect: { height: 400, width: 300 },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      placement: 'above',
      x: 150,
      y: 110,
    })
  })

  it('returns null surface descriptors when anchor is missing', () => {
    expect(getCanvasFloatingAnchorSurfaceDescriptor({
      anchor: null,
    })).toBeNull()
  })

  it('creates a reusable above surface descriptor from an anchor', () => {
    expect(getCanvasFloatingAnchorSurfaceDescriptor({
      anchor: { placement: 'above', x: 140, y: 60 },
    })).toEqual({
      anchor: { placement: 'above', x: 140, y: 60 },
      attributes: {
        'data-placement': 'above',
      },
      placement: 'above',
      style: {
        '--canvas-floating-anchor-x': '140px',
        '--canvas-floating-anchor-y': '60px',
        left: 'var(--canvas-floating-anchor-x)',
        top: 'var(--canvas-floating-anchor-y)',
        transform: 'translate(-50%, calc(-100% - 10px))',
        transformOrigin: '50% 100%',
      },
    })
  })

  it('creates below surface styles with custom variables and offset', () => {
    expect(getCanvasFloatingAnchorSurfaceStyle({
      anchor: { placement: 'below', x: 174, y: 50 },
      offset: 6,
      xProperty: '--canvas-selection-command-x',
      yProperty: '--canvas-selection-command-y',
    })).toEqual({
      '--canvas-selection-command-x': '174px',
      '--canvas-selection-command-y': '50px',
      left: 'var(--canvas-selection-command-x)',
      top: 'var(--canvas-selection-command-y)',
      transform: 'translate(-50%, 6px)',
      transformOrigin: '50% 0',
    })
  })

  it('creates coordinate-only styles for surfaces with their own CSS placement', () => {
    expect(getCanvasFloatingAnchorSurfaceCoordinateStyle({
      anchor: { placement: 'above', x: 92, y: 42 },
      xProperty: '--surface-anchor-x',
      yProperty: '--surface-anchor-y',
    })).toEqual({
      '--surface-anchor-x': '92px',
      '--surface-anchor-y': '42px',
    })
  })
})
