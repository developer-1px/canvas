import { describe, expect, it } from 'vitest'
import { isHtmlSpecimenCssComputedValueNoOp } from './HtmlSpecimenCssValueNoOp'

describe('isHtmlSpecimenCssComputedValueNoOp', () => {
  it('treats equivalent color syntaxes as no-op values', () => {
    expect(isHtmlSpecimenCssComputedValueNoOp({
      computedValue: 'rgb(37, 99, 235)',
      property: 'background-color',
      value: '#2563eb',
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
