import { describe, expect, it } from 'vitest'
import { isHtmlSpecimenCssComputedValueNoOp } from './HtmlSpecimenCssValueNoOp'

describe('isHtmlSpecimenCssComputedValueNoOp', () => {
  it('treats equivalent color syntaxes as no-op values', () => {
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgb(37, 99, 235)',
      property: 'background-color',
      value: '#2563eb',
    })).toBe(true)
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgb(255, 0, 0)',
      property: 'color',
      value: 'rgb(100% 0% 0%)',
    })).toBe(true)
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgba(255, 0, 0, 0.5)',
      property: 'color',
      value: 'rgba(255 0 0 / 50%)',
    })).toBe(true)
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgb(255, 0, 0)',
      property: 'color',
      value: 'red',
    })).toBe(true)
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgb(102, 51, 153)',
      property: 'color',
      value: 'rebeccapurple',
    })).toBe(true)
  })

  it('treats transparent and computed transparent rgba as no-op values', () => {
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgba(0, 0, 0, 0)',
      property: 'background-color',
      value: 'transparent',
    })).toBe(true)
  })

  it('treats zero length units as no-op values', () => {
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: '0px',
      property: 'border-radius',
      value: '0rem',
    })).toBe(true)
  })

  it('keeps non-zero unit conversion out of no-op checks', () => {
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: '16px',
      property: 'font-size',
      value: '1rem',
    })).toBe(false)
  })

  it('does not treat unsupported zero units as no-op values', () => {
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: '0px',
      property: 'border-radius',
      value: '0deg',
    })).toBe(false)
  })
})
