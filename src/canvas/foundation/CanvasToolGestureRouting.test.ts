import { describe, expect, it } from 'vitest'
import {
  CANVAS_TOOL_GESTURE_ROUTES,
  getCanvasToolPointerGesture,
  shouldRouteCanvasToolPointerToCanvasGesture,
  shouldStartCanvasPanGesture,
  type CanvasToolGestureConfig,
} from './CanvasToolGestureRouting'

const config = createCanvasGestureConfig()
const baseInput = {
  altKey: false,
  button: 0,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
}

describe('CanvasToolGestureRouting', () => {
  it('keeps built-in tool gesture routes in a frozen descriptor table', () => {
    expect(Object.isFrozen(CANVAS_TOOL_GESTURE_ROUTES)).toBe(true)
    expect(CANVAS_TOOL_GESTURE_ROUTES.marker).toMatchObject({
      gesture: 'draw-marker',
      routeItemPointerToCanvasGesture: true,
    })
    expect(CANVAS_TOOL_GESTURE_ROUTES.highlight).toMatchObject({
      gesture: 'draw-highlight',
      routeItemPointerToCanvasGesture: true,
    })
    expect(CANVAS_TOOL_GESTURE_ROUTES.pen).toMatchObject({
      gesture: 'draw-path',
      routeItemPointerToCanvasGesture: true,
    })
    expect(CANVAS_TOOL_GESTURE_ROUTES.eraser).toMatchObject({
      gesture: 'erase',
      routeItemPointerToCanvasGesture: true,
    })
    expect(CANVAS_TOOL_GESTURE_ROUTES.laser).toMatchObject({
      gesture: 'laser',
      routeItemPointerToCanvasGesture: true,
    })
    expect(CANVAS_TOOL_GESTURE_ROUTES.select).toMatchObject({
      routeItemPointerToCanvasGesture: false,
    })
    expect(CANVAS_TOOL_GESTURE_ROUTES).not.toHaveProperty('diamond')
    expect(CANVAS_TOOL_GESTURE_ROUTES).not.toHaveProperty('ellipse')
    expect(CANVAS_TOOL_GESTURE_ROUTES).not.toHaveProperty('rect')
    expect(Object.isFrozen(CANVAS_TOOL_GESTURE_ROUTES.marker)).toBe(true)
  })

  it('projects built-in and custom tools to pointer gestures through one route lookup', () => {
    expect(getCanvasToolPointerGesture({ config, tool: 'rect' })).toBe(
      'create-shape',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'ellipse' })).toBe(
      'create-shape',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'diamond' })).toBe(
      'create-shape',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'marker' })).toBe(
      'draw-marker',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'sticky' })).toBe(
      'create-sticky',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'section' })).toBe(
      'create-section',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'highlight' })).toBe(
      'draw-highlight',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'pen' })).toBe(
      'draw-path',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'eraser' })).toBe(
      'erase',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'laser' })).toBe(
      'laser',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'arrow' })).toBe(
      'create-arrow',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'text' })).toBe(
      'create-text',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'comment' })).toBe(
      'create-comment',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'custom:risk' })).toBe(
      'create-custom',
    )
    expect(getCanvasToolPointerGesture({ config, tool: 'select' })).toBeNull()
  })

  it('contains disabled tool gestures without changing fallback policy', () => {
    const disabled = createCanvasGestureConfig({
      gestures: {
        createArrow: false,
        createComment: false,
        createCustom: false,
        createShape: false,
        createSection: false,
        createSticky: false,
        createText: false,
        drawHighlight: false,
        drawMarker: false,
        drawPath: false,
        eraseDrawing: false,
        laserPointer: false,
      },
    })

    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'rect' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'ellipse' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'diamond' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'marker' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'pen' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'eraser' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'laser' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'comment' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'sticky' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'section' }))
      .toBeNull()
    expect(
      getCanvasToolPointerGesture({ config: disabled, tool: 'custom:risk' }),
    ).toBeNull()
  })

  it('owns pan start and item-pointer rerouting rules', () => {
    expect(
      shouldStartCanvasPanGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'pan',
      }),
    ).toBe(true)
    expect(
      shouldStartCanvasPanGesture({
        config,
        input: { ...baseInput, button: 1 },
        spaceDown: false,
        tool: 'select',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'select',
      }),
    ).toBe(false)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'diamond',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'text',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'sticky',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'section',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'laser',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasToolPointerToCanvasGesture({
        spaceDown: false,
        tool: 'custom:risk',
      }),
    ).toBe(true)
  })
})

function createCanvasGestureConfig({
  gestures = {},
}: {
  gestures?: Partial<CanvasToolGestureConfig['gestures']>
} = {}): CanvasToolGestureConfig {
  return {
    gestures: {
      createArrow: true,
      createComment: true,
      createCustom: true,
      createShape: true,
      createSection: true,
      createSticky: true,
      createText: true,
      drawHighlight: true,
      drawMarker: true,
      drawPath: true,
      eraseDrawing: true,
      laserPointer: true,
      pan: true,
      ...gestures,
    },
  }
}
