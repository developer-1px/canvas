import { describe, expect, it } from 'vitest'
import {
  createCanvasCommandPaletteListboxDescriptor,
} from './CanvasCommandPaletteListbox'

describe('CanvasCommandPaletteListbox', () => {
  it('describes active option attributes for command results', () => {
    expect(createCanvasCommandPaletteListboxDescriptor({
      activeIndex: 1,
      controlId: 'palette',
      items: [{
        disabled: false,
        id: 'tool:select',
      }, {
        disabled: true,
        id: 'command:delete',
      }],
    })).toEqual({
      activeOptionId: 'palette-option-command-delete',
      emptyMessageId: 'palette-empty',
      isEmpty: false,
      rootAttributes: {
        'aria-label': 'Command results',
        role: 'listbox',
      },
      options: [{
        attributes: {
          'aria-posinset': 1,
          'aria-selected': false,
          'aria-setsize': 2,
          id: 'palette-option-tool-select',
          role: 'option',
        },
        index: 0,
        isActive: false,
        itemId: 'tool:select',
      }, {
        attributes: {
          'aria-disabled': 'true',
          'aria-posinset': 2,
          'aria-selected': true,
          'aria-setsize': 2,
          id: 'palette-option-command-delete',
          role: 'option',
        },
        index: 1,
        isActive: true,
        itemId: 'command:delete',
      }],
    })
  })

  it('describes empty command results as a status message', () => {
    expect(createCanvasCommandPaletteListboxDescriptor({
      activeIndex: 0,
      controlId: 'palette',
      items: [],
    })).toEqual({
      activeOptionId: null,
      emptyAttributes: {
        'aria-live': 'polite',
        id: 'palette-empty',
        role: 'status',
      },
      emptyMessageId: 'palette-empty',
      isEmpty: true,
      rootAttributes: {
        'aria-describedby': 'palette-empty',
        'aria-label': 'Command results',
        role: 'listbox',
      },
      options: [],
    })
  })
})
