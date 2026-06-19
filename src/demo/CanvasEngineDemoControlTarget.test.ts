import { describe, expect, it, vi } from 'vitest'
import {
  ENGINE_DEMO_CONTROL_TARGET_SELECTORS,
  isCanvasEngineDemoControlTarget,
} from './CanvasEngineDemoControlTarget'

describe('CanvasEngineDemoControlTarget', () => {
  it('detects engine demo chrome as canvas control targets', () => {
    withFakeDom(() => {
      expect(isCanvasEngineDemoControlTarget(
        new FakeElement('.engine-demo-viewport-controls'),
      )).toBe(true)
      expect(ENGINE_DEMO_CONTROL_TARGET_SELECTORS)
        .toContain('.engine-demo-viewport-controls')
    })
  })

  it('reuses the shared canvas semantic control target selector', () => {
    withFakeDom(() => {
      expect(isCanvasEngineDemoControlTarget(
        new FakeElement('[role="slider"]'),
      )).toBe(true)
      expect(isCanvasEngineDemoControlTarget(
        new FakeElement('[contenteditable="true"]'),
      )).toBe(true)
    })
  })

  it('allows plain canvas targets through', () => {
    withFakeDom(() => {
      expect(isCanvasEngineDemoControlTarget(null)).toBe(false)
      expect(isCanvasEngineDemoControlTarget(
        new FakeElement('[data-canvas-item]'),
      )).toBe(false)
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

  closest = vi.fn((selector: string) =>
    selector.split(',').includes(this.matchingSelector) ? this : null)
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
