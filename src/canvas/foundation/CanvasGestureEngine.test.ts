import { describe, expect, test } from 'vitest'
import {
  getCanvasPointerGesture,
  shouldRouteCanvasItemPointerToCanvasGesture,
  type CanvasPointerGestureConfig,
} from './CanvasGestureEngine'

const config = createCanvasGestureConfig()
const baseInput = {
  altKey: false,
  button: 0,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
}

describe('CanvasGestureEngine drawing tools', () => {
  test('routes marker, highlighter, eraser, laser, arrow, and shape tools to gestures', () => {
    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'marker',
      }),
    ).toBe('draw-marker')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'highlight',
      }),
    ).toBe('draw-highlight')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'pen',
      }),
    ).toBe('draw-path')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'eraser',
      }),
    ).toBe('erase')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'laser',
      }),
    ).toBe('laser')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'arrow',
      }),
    ).toBe('create-arrow')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'ellipse',
      }),
    ).toBe('create-shape')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'diamond',
      }),
    ).toBe('create-shape')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'sticky',
      }),
    ).toBe('create-sticky')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'section',
      }),
    ).toBe('create-section')

    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'comment',
      }),
    ).toBe('create-comment')
  })

  test('honors drawing gesture feature toggles', () => {
    const disabled = createCanvasGestureConfig({
      gestures: {
        createArrow: false,
        createComment: false,
        createCustom: false,
        createShape: false,
        createSection: false,
        createSticky: false,
        drawHighlight: false,
        drawMarker: false,
        drawPath: false,
        eraseDrawing: false,
        laserPointer: false,
      },
    })

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'marker',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'highlight',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'pen',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'eraser',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'laser',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'arrow',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'ellipse',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'diamond',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'sticky',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'section',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'comment',
      }),
    ).toBe('marquee')

    expect(
      getCanvasPointerGesture({
        config: disabled,
        input: baseInput,
        spaceDown: false,
        tool: 'custom:risk',
      }),
    ).toBe('marquee')
  })

  test('routes custom creation tools through the generic custom gesture', () => {
    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'custom:risk',
      }),
    ).toBe('create-custom')
  })

  test('routes item pointer events back to the stage for drawing and creation tools', () => {
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'marker',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'highlight',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'pen',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'eraser',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'laser',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'arrow',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'ellipse',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'diamond',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'sticky',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'section',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'comment',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'custom:risk',
      }),
    ).toBe(true)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: false,
        tool: 'select',
      }),
    ).toBe(false)
    expect(
      shouldRouteCanvasItemPointerToCanvasGesture({
        spaceDown: true,
        tool: 'select',
      }),
    ).toBe(true)
  })
})

function createCanvasGestureConfig({
  commands = {},
  gestures = {},
}: {
  commands?: Partial<CanvasPointerGestureConfig['commands']>
  gestures?: Partial<CanvasPointerGestureConfig['gestures']>
} = {}): CanvasPointerGestureConfig {
  return {
    commands: {
      duplicate: true,
      ...commands,
    },
    gestures: {
      altDragDuplicate: true,
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
      marquee: true,
      pan: true,
      textEdit: true,
      ...gestures,
    },
  }
}
