import { describe, expect, it, vi } from 'vitest'
import {
  measureCanvasTextBlocks,
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
