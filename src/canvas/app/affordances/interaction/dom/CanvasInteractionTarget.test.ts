import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_WHEEL_PASSTHROUGH_SELECTOR,
  isCanvasControlTarget,
  isCanvasTargetWithinSelector,
  isCanvasWheelPassthroughTarget,
} from './CanvasInteractionTarget'

describe('CanvasInteractionTarget', () => {
  it('detects default control targets through closest selectors', () => {
    withFakeDom(() => {
      const button = new FakeElement('button')

      expect(isCanvasControlTarget({ target: button })).toBe(true)
      expect(button.closest).toHaveBeenCalledWith(
        expect.stringContaining('button'),
      )
    })
  })

  it('allows consumers to add overlay selectors', () => {
    withFakeDom(() => {
      expect(isCanvasControlTarget({
        extraSelectors: ['[data-app-menu]', '[data-app-popover]'],
        target: new FakeElement('[data-app-popover]'),
      })).toBe(true)
    })
  })

  it('detects wheel passthrough targets with the canvas data attribute', () => {
    withFakeDom(() => {
      expect(isCanvasWheelPassthroughTarget(
        new FakeElement(CANVAS_WHEEL_PASSTHROUGH_SELECTOR),
      )).toBe(true)
    })
  })

  it('uses a child node parent element when the event target is not an element', () => {
    withFakeDom(() => {
      const parent = new FakeElement('button')
      const child = new FakeNode()

      child.parentElement = parent

      expect(isCanvasControlTarget({ target: child })).toBe(true)
    })
  })

  it('returns false for unavailable or invalid targets', () => {
    withFakeDom(() => {
      expect(isCanvasControlTarget({ target: null })).toBe(false)
      expect(isCanvasTargetWithinSelector({
        selectors: '',
        target: new FakeElement('button'),
      })).toBe(false)
      expect(isCanvasTargetWithinSelector({
        selectors: '[',
        target: new FakeElement('button'),
      })).toBe(false)
      expect(isCanvasControlTarget({
        target: new FakeElement('[data-unrelated]'),
      })).toBe(false)
    })
  })
})

class FakeNode extends EventTarget {
  parentElement: FakeElement | null = null
}

class FakeElement extends FakeNode {
  constructor(private readonly matchingSelector: string) {
    super()
  }

  closest = vi.fn((selector: string) => {
    if (selector === '[') {
      throw new Error('Invalid selector')
    }

    return selector.split(',').includes(this.matchingSelector) ? this : null
  })
}

function withFakeDom(run: () => void) {
  const previousNode = globalThis.Node
  const previousElement = globalThis.Element

  vi.stubGlobal('Node', FakeNode)
  vi.stubGlobal('Element', FakeElement)

  try {
    run()
  } finally {
    vi.stubGlobal('Node', previousNode)
    vi.stubGlobal('Element', previousElement)
  }
}
