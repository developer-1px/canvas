import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isHtmlSpecimenCssSupportedValue,
  shouldValidateHtmlSpecimenCssValue,
} from './HtmlSpecimenCssValueSupport'

describe('isHtmlSpecimenCssSupportedValue', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('accepts supported fallback values for inspector controls', () => {
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'background-color',
      value: '#2563eb',
    })).toBe(true)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'red',
    })).toBe(true)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'rgb(37 99 235 / 50%)',
    })).toBe(true)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'hsl(221 83% 53%)',
    })).toBe(true)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'font-size',
      value: '16px',
    })).toBe(true)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'padding',
      value: '8px 16px',
    })).toBe(true)
  })

  it('rejects unsupported fallback values before patching CSS text', () => {
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'font-size',
      value: 'not-a-size',
    })).toBe(false)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'border-radius',
      value: '0deg',
    })).toBe(false)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'padding',
      value: 'auto',
    })).toBe(false)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'rgb(nope)',
    })).toBe(false)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'hsl(nope)',
    })).toBe(false)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'lab(nope)',
    })).toBe(false)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'color(nope)',
    })).toBe(false)
  })

  it('allows margin auto without allowing padding auto', () => {
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'margin',
      value: '0 auto',
    })).toBe(true)
    expect(isHtmlSpecimenCssSupportedValue({
      property: 'padding',
      value: '0 auto',
    })).toBe(false)
  })

  it('uses browser CSS.supports when available', () => {
    const supports = vi.fn((property: string, value: string) =>
      property === 'color' && value === 'lab(50% 0 0)')

    vi.stubGlobal('CSS', { supports })

    expect(isHtmlSpecimenCssSupportedValue({
      property: 'color',
      value: 'lab(50% 0 0)',
    })).toBe(true)
    expect(supports).toHaveBeenCalledWith('color', 'lab(50% 0 0)')
  })

  it('keeps value validation scoped to known visual edit properties', () => {
    expect(shouldValidateHtmlSpecimenCssValue('font-size')).toBe(true)
    expect(shouldValidateHtmlSpecimenCssValue('box-shadow')).toBe(false)
  })
})
