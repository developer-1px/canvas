import { describe, expect, it } from 'vitest'
import {
  CANVAS_FIND_REPLACE_PANEL_MODEL,
  createCanvasFindReplacePanelDescriptor,
  getCanvasFindReplaceMatchCountLabel,
} from './CanvasFindReplacePanelDescriptor'

describe('CanvasFindReplacePanelDescriptor', () => {
  it('describes the find replace panel as a search surface with result status', () => {
    expect(createCanvasFindReplacePanelDescriptor({
      controlId: 'package-find',
      matchCount: 3,
      query: 'card',
    })).toEqual({
      countStatusAttributes: {
        'aria-atomic': true,
        'aria-label': '3 matches',
        'aria-live': 'polite',
        id: 'package-find-count',
        role: 'status',
      },
      countStatusId: 'package-find-count',
      matchCountLabel: '3 matches',
      model: CANVAS_FIND_REPLACE_PANEL_MODEL,
      queryInputAttributes: {
        'aria-describedby': 'package-find-count',
        'aria-label': 'Find',
        type: 'search',
      },
      replacementInputAttributes: {
        'aria-label': 'Replace',
      },
      rootAttributes: {
        'aria-label': 'Find and replace',
        role: 'search',
      },
    })
  })

  it('formats match count labels for empty, singular, and plural results', () => {
    expect(getCanvasFindReplaceMatchCountLabel({
      matchCount: 0,
      query: '',
    })).toBe('0 matches')
    expect(getCanvasFindReplaceMatchCountLabel({
      matchCount: 1,
      query: 'card',
    })).toBe('1 match')
    expect(getCanvasFindReplaceMatchCountLabel({
      matchCount: 0,
      query: 'missing',
    })).toBe('0 matches')
  })
})
