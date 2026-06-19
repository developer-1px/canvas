import { describe, expect, it } from 'vitest'
import {
  createCanvasShortcutHelpDialogDescriptor,
} from './CanvasShortcutHelpDialog'

describe('CanvasShortcutHelpDialog', () => {
  it('describes the shortcut help dialog with visible heading labels', () => {
    expect(createCanvasShortcutHelpDialogDescriptor({
      controlId: 'shortcut-help',
      sections: ['Tools', 'Commands'],
    })).toEqual({
      headingAttributes: {
        id: 'shortcut-help-heading',
      },
      rootAttributes: {
        'aria-labelledby': 'shortcut-help-heading',
        'aria-modal': true,
        role: 'dialog',
      },
      sectionDescriptors: [{
        headingAttributes: {
          id: 'shortcut-help-section-tools-heading',
        },
        rootAttributes: {
          'aria-labelledby': 'shortcut-help-section-tools-heading',
        },
        section: 'Tools',
      }, {
        headingAttributes: {
          id: 'shortcut-help-section-commands-heading',
        },
        rootAttributes: {
          'aria-labelledby': 'shortcut-help-section-commands-heading',
        },
        section: 'Commands',
      }],
    })
  })
})
