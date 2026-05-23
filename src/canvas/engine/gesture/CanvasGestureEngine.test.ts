import { describe, expect, test } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import { getCanvasPointerGesture } from './CanvasGestureEngine'

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
  })

  test('honors drawing gesture feature toggles', () => {
    const disabled = createCanvasAffordanceConfig({
      gestures: {
        createArrow: false,
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
  })
})
