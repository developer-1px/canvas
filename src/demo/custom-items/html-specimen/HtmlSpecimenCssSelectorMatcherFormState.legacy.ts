import { describe, expect, it } from 'vitest'
import { matchHtmlSpecimenCssSelectorList } from './HtmlSpecimenCssSelectorMatcher'
import { createNode } from './HtmlSpecimenCssSelectorMatcher.testSupport'

describe('HtmlSpecimenCssSelectorMatcher form state selectors', () => {
  it('matches form state pseudo classes against DOM attributes', () => {
    const enabledButton = createNode({
      className: 'primary',
      id: 'enabled',
      tagName: 'button',
    })
    const disabledButton = createNode({
      attributes: { disabled: '' },
      className: 'primary',
      id: 'disabled',
      tagName: 'button',
    })
    const plainDiv = createNode({
      className: 'primary',
      id: 'plain',
      tagName: 'div',
    })

    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:enabled',
      enabledButton,
      [enabledButton],
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:enabled',
      disabledButton,
      [disabledButton],
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:disabled',
      disabledButton,
      [disabledButton],
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:disabled',
      enabledButton,
      [enabledButton],
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:enabled',
      plainDiv,
      [plainDiv],
    )).toBeNull()
  })

  it('matches checked form state pseudo classes against DOM attributes', () => {
    const checkedInput = createNode({
      attributes: { checked: '', type: 'checkbox' },
      className: 'control',
      id: 'checked',
      path: [0, 0],
      tagName: 'input',
    })
    const checkedLabel = createNode({
      className: 'label',
      id: 'checked-label',
      path: [0, 1],
      tagName: 'span',
    })
    const uncheckedInput = createNode({
      attributes: { type: 'checkbox' },
      className: 'control',
      id: 'unchecked',
      path: [0, 2],
      tagName: 'input',
    })
    const uncheckedLabel = createNode({
      className: 'label',
      id: 'unchecked-label',
      path: [0, 3],
      tagName: 'span',
    })
    const selectedOption = createNode({
      attributes: { selected: '' },
      className: 'choice',
      id: 'selected',
      path: [1, 0],
      tagName: 'option',
    })
    const checkedDiv = createNode({
      attributes: { checked: '' },
      className: 'control',
      id: 'div',
      path: [2],
      tagName: 'div',
    })
    const nodes = [
      checkedInput,
      checkedLabel,
      uncheckedInput,
      uncheckedLabel,
      selectedOption,
      checkedDiv,
    ]

    expect(matchHtmlSpecimenCssSelectorList(
      '.control:checked',
      checkedInput,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.control:checked + .label',
      checkedLabel,
      nodes,
    )).toEqual([0, 3, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.control:checked + .label',
      uncheckedLabel,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.choice:checked',
      selectedOption,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.control:checked',
      checkedDiv,
      nodes,
    )).toBeNull()
  })

  it('matches inherited disabled form state against DOM ancestry', () => {
    const disabledFieldset = createNode({
      attributes: { disabled: '' },
      className: 'group',
      id: 'group',
      path: [0],
      tagName: 'fieldset',
    })
    const disabledButton = createNode({
      className: 'primary',
      id: 'disabled',
      path: [0, 1],
      tagName: 'button',
    })
    const legend = createNode({
      className: 'label',
      id: 'legend',
      path: [0, 0],
      tagName: 'legend',
    })
    const legendInput = createNode({
      className: 'primary',
      id: 'legend-input',
      path: [0, 0, 0],
      tagName: 'input',
    })
    const optgroup = createNode({
      attributes: { disabled: '' },
      className: 'group',
      id: 'options',
      path: [1],
      tagName: 'optgroup',
    })
    const option = createNode({
      className: 'primary',
      id: 'option',
      path: [1, 0],
      tagName: 'option',
    })
    const nodes = [
      disabledFieldset,
      disabledButton,
      legend,
      legendInput,
      optgroup,
      option,
    ]

    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:disabled',
      disabledButton,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:enabled',
      disabledButton,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:enabled',
      legendInput,
      nodes,
    )).toEqual([0, 2, 0])
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:disabled',
      legendInput,
      nodes,
    )).toBeNull()
    expect(matchHtmlSpecimenCssSelectorList(
      '.primary:disabled',
      option,
      nodes,
    )).toEqual([0, 2, 0])
  })
})
