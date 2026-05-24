import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  CANVAS_TOOL_GESTURE_ROUTES,
  getCanvasToolPointerGesture,
  shouldRouteCanvasToolPointerToCanvasGesture,
  shouldStartCanvasPanGesture,
} from './CanvasToolGestureRouting'

const config = createCanvasAffordanceConfig()
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
    expect(CANVAS_TOOL_GESTURE_ROUTES.select).toMatchObject({
      routeItemPointerToCanvasGesture: false,
    })
    expect(Object.isFrozen(CANVAS_TOOL_GESTURE_ROUTES.marker)).toBe(true)
  })

  it('projects built-in and custom tools to pointer gestures through one route lookup', () => {
    expect(getCanvasToolPointerGesture({ config, tool: 'rect' })).toBe(
      'create-rect',
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
    const disabled = createCanvasAffordanceConfig({
      gestures: {
        createArrow: false,
        createComment: false,
        createCustom: false,
        createSection: false,
        createRect: false,
        createSticky: false,
        createText: false,
        drawHighlight: false,
        drawMarker: false,
      },
    })

    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'rect' }))
      .toBeNull()
    expect(getCanvasToolPointerGesture({ config: disabled, tool: 'marker' }))
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
        tool: 'custom:risk',
      }),
    ).toBe(true)
  })
})
