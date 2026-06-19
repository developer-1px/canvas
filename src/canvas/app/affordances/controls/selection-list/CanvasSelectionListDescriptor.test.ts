import { describe, expect, it } from 'vitest'
import {
  CANVAS_SELECTION_LIST_FOCUS_MODEL,
  CANVAS_SELECTION_LIST_KEYBOARD_MODEL,
  CANVAS_SELECTION_LIST_MODEL,
  createCanvasSelectionListDescriptor,
  getCanvasSelectionListOptionAttributes,
  getCanvasSelectionListRootAttributes,
} from './CanvasSelectionListDescriptor'

const items = [
  { id: 'layer-a' },
  { id: 'layer-b' },
  { id: 'layer-c' },
] as const

describe('CanvasSelectionListDescriptor', () => {
  it('exposes stable selection list model metadata', () => {
    expect(CANVAS_SELECTION_LIST_MODEL).toBe('canvas-selection-list')
    expect(CANVAS_SELECTION_LIST_FOCUS_MODEL).toBe('roving-tabindex')
    expect(CANVAS_SELECTION_LIST_KEYBOARD_MODEL)
      .toBe('aria-listbox-roving-focus')
  })

  it('creates single-select listbox and option attributes', () => {
    expect(createCanvasSelectionListDescriptor({
      focusedId: 'layer-b',
      getOptionId: (_id, index) => `layer-option-${index}`,
      items,
      listId: 'layers-list',
      selectedIds: ['layer-b'],
    })).toEqual({
      focusedId: 'layer-b',
      focusModel: CANVAS_SELECTION_LIST_FOCUS_MODEL,
      focusableOptionId: 'layer-option-1',
      keyboardModel: CANVAS_SELECTION_LIST_KEYBOARD_MODEL,
      model: CANVAS_SELECTION_LIST_MODEL,
      options: [
        {
          attributes: {
            'aria-disabled': undefined,
            'aria-selected': false,
            id: 'layer-option-0',
            role: 'option',
            tabIndex: -1,
          },
          id: 'layer-a',
          index: 0,
          isDisabled: false,
          isFocusable: false,
          isSelected: false,
          optionId: 'layer-option-0',
        },
        {
          attributes: {
            'aria-disabled': undefined,
            'aria-selected': true,
            id: 'layer-option-1',
            role: 'option',
            tabIndex: 0,
          },
          id: 'layer-b',
          index: 1,
          isDisabled: false,
          isFocusable: true,
          isSelected: true,
          optionId: 'layer-option-1',
        },
        {
          attributes: {
            'aria-disabled': undefined,
            'aria-selected': false,
            id: 'layer-option-2',
            role: 'option',
            tabIndex: -1,
          },
          id: 'layer-c',
          index: 2,
          isDisabled: false,
          isFocusable: false,
          isSelected: false,
          optionId: 'layer-option-2',
        },
      ],
      rootAttributes: {
        'aria-multiselectable': undefined,
        id: 'layers-list',
        role: 'listbox',
      },
      selectedIds: ['layer-b'],
      selectedOptionIds: ['layer-option-1'],
      selectionMode: 'single',
    })
  })

  it('normalizes multi-select state while keeping disabled selected options visible', () => {
    const descriptor = createCanvasSelectionListDescriptor({
      focusedId: 'layer-b',
      getOptionId: (_id, index) => `layer-option-${index}`,
      items: [
        { id: 'layer-a' },
        { disabled: true, id: 'layer-b' },
        { id: 'layer-c' },
        { id: 'layer-d' },
      ] as const,
      selectedIds: ['missing', 'layer-d', 'layer-b', 'layer-c', 'layer-c'],
      selectionMode: 'multiple',
    })

    expect(descriptor.rootAttributes).toEqual({
      'aria-multiselectable': true,
      id: undefined,
      role: 'listbox',
    })
    expect(descriptor.selectedIds).toEqual(['layer-b', 'layer-c', 'layer-d'])
    expect(descriptor.selectedOptionIds).toEqual([
      'layer-option-1',
      'layer-option-2',
      'layer-option-3',
    ])
    expect(descriptor.focusedId).toBe('layer-c')
    expect(descriptor.focusableOptionId).toBe('layer-option-2')
    expect(descriptor.options[1]).toMatchObject({
      attributes: {
        'aria-disabled': true,
        'aria-selected': true,
        id: 'layer-option-1',
        role: 'option',
        tabIndex: undefined,
      },
      id: 'layer-b',
      isDisabled: true,
      isFocusable: false,
      isSelected: true,
    })
    expect(descriptor.options[2]).toMatchObject({
      id: 'layer-c',
      isFocusable: true,
    })
    expect(descriptor.options[2].attributes.tabIndex).toBe(0)
  })

  it('falls back to the first enabled option when nothing selected is focusable', () => {
    expect(createCanvasSelectionListDescriptor({
      focusedId: 'missing',
      items: [
        { disabled: true, id: 'layer-a' },
        { id: 'layer-b' },
      ] as const,
      selectedIds: ['layer-a'],
    })).toMatchObject({
      focusedId: 'layer-b',
      focusableOptionId: 'canvas-selection-list-option-1',
      selectedIds: ['layer-a'],
    })

    expect(createCanvasSelectionListDescriptor({
      items: [{ disabled: true, id: 'layer-a' }] as const,
      selectedIds: ['layer-a'],
    })).toMatchObject({
      focusedId: null,
      focusableOptionId: null,
      selectedIds: ['layer-a'],
    })
  })

  it('creates root and option attributes directly', () => {
    expect(getCanvasSelectionListRootAttributes({
      listId: 'components',
      selectionMode: 'multiple',
    })).toEqual({
      'aria-multiselectable': true,
      id: 'components',
      role: 'listbox',
    })

    expect(getCanvasSelectionListOptionAttributes({
      disabled: true,
      focusable: false,
      optionId: 'component-card',
      selected: true,
    })).toEqual({
      'aria-disabled': true,
      'aria-selected': true,
      id: 'component-card',
      role: 'option',
      tabIndex: undefined,
    })
  })
})
