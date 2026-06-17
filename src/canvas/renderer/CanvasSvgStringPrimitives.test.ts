import { describe, expect, it } from 'vitest'
import {
  escapeCanvasXmlAttribute,
  escapeCanvasXmlText,
  formatCanvasSvgNumber,
} from './CanvasSvgStringPrimitives'

describe('CanvasSvgStringPrimitives', () => {
  it('formats finite SVG numbers without unnecessary trailing zeroes', () => {
    expect(formatCanvasSvgNumber(10)).toBe('10')
    expect(formatCanvasSvgNumber(10.5)).toBe('10.5')
    expect(formatCanvasSvgNumber(10.1236)).toBe('10.124')
    expect(formatCanvasSvgNumber(-0.0001)).toBe('0')
  })

  it('supports overriding maximum fraction digits', () => {
    expect(formatCanvasSvgNumber(10.129, {
      maximumFractionDigits: 2,
    })).toBe('10.13')
    expect(formatCanvasSvgNumber(10.9, {
      maximumFractionDigits: 0,
    })).toBe('11')
  })

  it('normalizes non-finite SVG numbers to zero', () => {
    expect(formatCanvasSvgNumber(Number.NaN)).toBe('0')
    expect(formatCanvasSvgNumber(Number.POSITIVE_INFINITY)).toBe('0')
  })

  it('escapes XML text and attribute values', () => {
    expect(escapeCanvasXmlText('A&B <C> "D"')).toBe('A&amp;B &lt;C&gt; "D"')
    expect(escapeCanvasXmlAttribute("A&B <C> \"D\" 'E'"))
      .toBe('A&amp;B &lt;C&gt; &quot;D&quot; &#39;E&#39;')
  })
})
