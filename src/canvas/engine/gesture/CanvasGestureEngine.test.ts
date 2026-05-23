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
  test('routes highlighter and arrow tools to drawing gestures', () => {
    expect(
      getCanvasPointerGesture({
        config,
        input: baseInput,
        spaceDown: false,
        tool: 'highlight',
      }),
    ).toBe('create-highlight')

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
        createHighlight: false,
      },
    })

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
