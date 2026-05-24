import { describe, expect, test } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  getCanvasPointerGesture,
  shouldRouteCanvasItemPointerToCanvasGesture,
} from './CanvasGestureEngine'

const config = createCanvasAffordanceConfig()
const baseInput = {
  altKey: false,
  button: 0,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
}

describe('CanvasGestureEngine drawing tools', () => {
  test('routes marker, highlighter, and arrow tools to drawing gestures', () => {
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
        tool: 'arrow',
      }),
    ).toBe('create-arrow')

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
        tool: 'comment',
      }),
    ).toBe('create-comment')
  })

  test('honors drawing gesture feature toggles', () => {
    const disabled = createCanvasAffordanceConfig({
      gestures: {
        createArrow: false,
        createComment: false,
        createCustom: false,
        createSticky: false,
        drawHighlight: false,
        drawMarker: false,
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
        tool: 'arrow',
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
        tool: 'arrow',
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
