import { describe, expect, it, vi } from 'vitest'
import {
  measureCanvasElementOverflow,
  measureCanvasTextBlocks,
  type CanvasElementOverflowRect,
  type CanvasElementOverflowTarget,
  type CanvasTextMeasurementElement,
} from './CanvasTextMeasurementDom'

describe('CanvasTextMeasurementDom', () => {
  it('measures offscreen text blocks and removes the measurer', () => {
    const elements: CanvasTextMeasurementElement[] = []
    const appendBodyChild = vi.fn()
    const document = {
      body: {
        appendChild: appendBodyChild,
      },
      createElement: vi.fn((tagName: 'div' | 'span') => {
        const element = createElement(tagName)
        elements.push(element)

        return element
      }),
    }

    expect(measureCanvasTextBlocks({
      blocks: [{
        lineHeight: 1.2,
        marginBottom: 4,
        marginTop: 2,
        text: 'Title',
      }, {
        text: '',
      }],
      document,
      style: {
        fontFamily: 'Inter',
        fontSize: '24px',
        fontWeight: 700,
        whiteSpace: 'pre',
        width: 'max-content',
      },
    })).toEqual({ h: 24, w: 120 })

    const [measurer, firstLine, secondLine] = elements

    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(document.createElement).toHaveBeenCalledWith('span')
    expect(appendBodyChild).toHaveBeenCalledWith(measurer)
    expect(measurer?.style.position).toBe('fixed')
    expect(measurer?.style.left).toBe('-10000px')
    expect(measurer?.style.whiteSpace).toBe('pre')
    expect(measurer?.style.fontFamily).toBe('Inter')
    expect(measurer?.style.fontWeight).toBe('700')
    expect(firstLine?.style.display).toBe('block')
    expect(firstLine?.style.lineHeight).toBe('1.2')
    expect(firstLine?.style.marginBottom).toBe('4')
    expect(firstLine?.style.marginTop).toBe('2')
    expect(firstLine?.textContent).toBe('Title')
    expect(secondLine?.textContent).toBe(' ')
    expect(measurer?.remove).toHaveBeenCalledTimes(1)
  })

  it('returns null when document body is unavailable', () => {
    expect(measureCanvasTextBlocks({
      blocks: [{ text: 'Title' }],
      document: null,
    })).toBeNull()
    expect(measureCanvasTextBlocks({
      blocks: [{ text: 'Title' }],
      document: {
        body: null,
        createElement: createElement,
      },
    })).toBeNull()
  })

  it('removes the measurer when measuring throws', () => {
    const measurer = createElement('div')
    const error = new Error('measure failed')

    measurer.getBoundingClientRect = vi.fn(() => {
      throw error
    })

    expect(() => measureCanvasTextBlocks({
      blocks: [{ text: 'Title' }],
      document: {
        body: {
          appendChild: vi.fn(),
        },
        createElement: vi.fn((tagName: 'div' | 'span') =>
          tagName === 'div' ? measurer : createElement(tagName)),
      },
    })).toThrow(error)
    expect(measurer.remove).toHaveBeenCalledTimes(1)
  })
})

describe('measureCanvasElementOverflow', () => {
  it('detects scroll overflow on both axes', () => {
    expect(measureCanvasElementOverflow({
      element: createOverflowTarget({
        clientHeight: 80,
        clientWidth: 100,
        rect: createRect({ height: 80, width: 100 }),
        scrollHeight: 84,
        scrollWidth: 112,
      }),
      epsilon: 1,
    })).toEqual({
      clientSize: { h: 80, w: 100 },
      containerSize: null,
      elementSize: { h: 80, w: 100 },
      hasOverflow: true,
      overflowAxis: ['horizontal', 'vertical'],
      scrollSize: { h: 84, w: 112 },
    })
  })

  it('detects rendered element overflow against a container rect', () => {
    expect(measureCanvasElementOverflow({
      container: createOverflowTarget({
        rect: createRect({
          height: 100,
          left: 20,
          top: 40,
          width: 120,
        }),
      }),
      element: createOverflowTarget({
        rect: createRect({
          height: 104,
          left: 18,
          top: 42,
          width: 124,
        }),
      }),
      epsilon: 1,
    })).toMatchObject({
      containerSize: { h: 100, w: 120 },
      elementSize: { h: 104, w: 124 },
      hasOverflow: true,
      overflowAxis: ['horizontal', 'vertical'],
    })
  })

  it('ignores overflow within epsilon and returns null for missing targets', () => {
    expect(measureCanvasElementOverflow({
      container: createOverflowTarget({
        rect: createRect({ height: 100, width: 100 }),
      }),
      element: createOverflowTarget({
        clientHeight: 100,
        clientWidth: 100,
        rect: createRect({ height: 100.4, width: 100.4 }),
        scrollHeight: 100.4,
        scrollWidth: 100.4,
      }),
      epsilon: 0.5,
    })).toMatchObject({
      hasOverflow: false,
      overflowAxis: [],
    })

    expect(measureCanvasElementOverflow({ element: null })).toBeNull()
    expect(measureCanvasElementOverflow({
      element: {
        clientHeight: 100,
        clientWidth: 100,
        scrollHeight: 100,
        scrollWidth: 100,
      },
    })).toBeNull()
  })
})

function createElement(
  tagName: 'div' | 'span',
): CanvasTextMeasurementElement & {
  children: CanvasTextMeasurementElement[]
  remove: ReturnType<typeof vi.fn>
} {
  void tagName

  const element = {
    appendChild: vi.fn((child: CanvasTextMeasurementElement) => {
      element.children.push(child)
    }),
    children: [] as CanvasTextMeasurementElement[],
    getBoundingClientRect: vi.fn(() => ({
      height: 24,
      width: 120,
    })),
    remove: vi.fn(),
    style: {},
    textContent: null,
  }

  return element
}

function createOverflowTarget({
  clientHeight = 100,
  clientWidth = 100,
  rect = createRect({ height: clientHeight, width: clientWidth }),
  scrollHeight = clientHeight,
  scrollWidth = clientWidth,
}: {
  clientHeight?: number
  clientWidth?: number
  rect?: CanvasElementOverflowRect
  scrollHeight?: number
  scrollWidth?: number
}): CanvasElementOverflowTarget {
  return {
    clientHeight,
    clientWidth,
    getBoundingClientRect: vi.fn(() => rect),
    scrollHeight,
    scrollWidth,
  }
}

function createRect({
  height,
  left = 0,
  top = 0,
  width,
}: {
  height: number
  left?: number
  top?: number
  width: number
}): CanvasElementOverflowRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
  }
}
