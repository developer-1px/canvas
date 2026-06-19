import { describe, expect, it } from 'vitest'

import {
  createSlideEditRailDescriptor,
  createSlideEditRailListboxDescriptor,
  getSlideEditRailKeyboardCommandEffect,
  getSlideEditRailListboxKeyboardIntent,
  getSlideEditRailPointerCommandEffect,
  getSlideEditRailReorderKeyboardShortcutIntent,
  SLIDE_EDIT_RAIL_COMMANDS,
  SLIDE_EDIT_RAIL_KEYBOARD_KEYS,
  SLIDE_EDIT_RAIL_REORDER_KEYBOARD_ROUTING_PRIORITY,
  SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_INTENT,
  SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_KEYS,
  SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_MODEL,
  SLIDE_EDIT_RAIL_REORDER_MOVE_DOWN_SHORTCUT,
  SLIDE_EDIT_RAIL_REORDER_MOVE_TO_END_SHORTCUT,
  SLIDE_EDIT_RAIL_REORDER_MOVE_TO_START_SHORTCUT,
  SLIDE_EDIT_RAIL_REORDER_MOVE_UP_SHORTCUT,
} from './SlideEditRailInteractions'
import {
  SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_MODEL as SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_MODEL_FROM_PACKAGE,
  SLIDE_EDIT_RAIL_REORDER_MOVE_UP_SHORTCUT as SLIDE_EDIT_RAIL_REORDER_MOVE_UP_SHORTCUT_FROM_PACKAGE,
} from './index'

describe('SlideEditRailInteractions', () => {
  const slideOrder = ['slide-a', 'slide-b', 'slide-c'] as const

  it('describes active slide, slide order, and thumbnail hit targets', () => {
    const descriptor = createSlideEditRailDescriptor({
      activeSlideId: 'slide-b',
      hitTargetPadding: 6,
      slideOrder,
      getThumbnailBounds: (_slideId, index) => ({
        h: 72,
        w: 128,
        x: 16,
        y: 20 + index * 88,
      }),
    })

    expect(descriptor.activeSlideId).toBe('slide-b')
    expect(descriptor.slideOrder).toEqual(slideOrder)
    expect(descriptor.listbox).toMatchObject({
      activeOptionId: 'slide-rail-option-1',
      focusableOptionId: 'slide-rail-option-1',
      keyboardModel: 'aria-listbox-roving-focus',
      role: 'listbox',
      selectionMode: 'single',
    })
    expect(descriptor.thumbnails[1]).toEqual({
      bounds: {
        h: 72,
        w: 128,
        x: 16,
        y: 108,
      },
      hitTarget: {
        h: 84,
        w: 140,
        x: 10,
        y: 102,
      },
      index: 1,
      isActive: true,
      slideId: 'slide-b',
    })
  })

  it('derives APG listbox option selected and roving focus state', () => {
    expect(createSlideEditRailListboxDescriptor({
      activeSlideId: 'slide-b',
      slideOrder,
    })).toEqual({
      activeOptionId: 'slide-rail-option-1',
      focusableOptionId: 'slide-rail-option-1',
      keyboardModel: 'aria-listbox-roving-focus',
      options: [
        {
          id: 'slide-rail-option-0',
          index: 0,
          isActive: false,
          isFocusable: false,
          isSelected: false,
          slideId: 'slide-a',
          tabIndex: -1,
        },
        {
          id: 'slide-rail-option-1',
          index: 1,
          isActive: true,
          isFocusable: true,
          isSelected: true,
          slideId: 'slide-b',
          tabIndex: 0,
        },
        {
          id: 'slide-rail-option-2',
          index: 2,
          isActive: false,
          isFocusable: false,
          isSelected: false,
          slideId: 'slide-c',
          tabIndex: -1,
        },
      ],
      role: 'listbox',
      selectionMode: 'single',
    })
    expect(createSlideEditRailListboxDescriptor({
      activeSlideId: null,
      slideOrder,
    }).focusableOptionId).toBe('slide-rail-option-0')
  })

  it('defines rail command descriptors without slide model fields', () => {
    expect(SLIDE_EDIT_RAIL_COMMANDS.map((command) => command.id)).toEqual([
      'add-slide',
      'duplicate-slide',
      'delete-slide',
      'reorder-slide',
      'select-active-slide',
    ])
    expect(SLIDE_EDIT_RAIL_COMMANDS.every(
      (command) => command.requiredAdapterSlot === 'command-effect',
    )).toBe(true)
    expect(SLIDE_EDIT_RAIL_KEYBOARD_KEYS).toBe(
      'ArrowUp ArrowDown Home End Enter Space',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_MOVE_UP_SHORTCUT).toBe('Cmd/Ctrl+Up')
    expect(SLIDE_EDIT_RAIL_REORDER_MOVE_DOWN_SHORTCUT).toBe('Cmd/Ctrl+Down')
    expect(SLIDE_EDIT_RAIL_REORDER_MOVE_TO_START_SHORTCUT).toBe(
      'Cmd/Ctrl+Shift+Up',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_MOVE_TO_END_SHORTCUT).toBe(
      'Cmd/Ctrl+Shift+Down',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_KEYS).toBe(
      'Cmd/Ctrl+Up Cmd/Ctrl+Down Cmd/Ctrl+Shift+Up Cmd/Ctrl+Shift+Down',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_MODEL).toBe(
      'slide-edit-rail-reorder-keyboard-shortcuts',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_INTENT).toBe(
      'slide-edit-rail-reorder-keyboard-intent',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_KEYBOARD_ROUTING_PRIORITY).toBe(
      'rail-focus-before-host-command',
    )
    expect(SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_MODEL_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_RAIL_REORDER_KEYBOARD_SHORTCUT_MODEL)
    expect(SLIDE_EDIT_RAIL_REORDER_MOVE_UP_SHORTCUT_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_RAIL_REORDER_MOVE_UP_SHORTCUT)
  })

  it('converts keyboard intents to host command effects', () => {
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-b',
      direction: 'next',
      slideOrder,
      type: 'select-relative',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-c',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-c',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      boundary: 'first',
      slideOrder,
      type: 'select-boundary',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-a',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-a',
      direction: 'next',
      slideOrder,
      type: 'move-active',
    })).toEqual({
      payload: {
        fromIndex: 0,
        id: 'reorder-slide',
        slideId: 'slide-a',
        toIndex: 1,
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-c',
      boundary: 'first',
      slideOrder,
      type: 'move-active-to-boundary',
    })).toEqual({
      payload: {
        fromIndex: 2,
        id: 'reorder-slide',
        slideId: 'slide-c',
        toIndex: 0,
      },
      selection: {
        objectIds: [],
        slideId: 'slide-c',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-a',
      type: 'delete-active',
    })).toEqual({
      payload: {
        id: 'delete-slide',
        slideId: 'slide-a',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('maps listbox keys to relative, boundary, and activation intents', () => {
    expect(getSlideEditRailListboxKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'ArrowDown',
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      direction: 'next',
      slideOrder,
      type: 'select-relative',
    })
    expect(getSlideEditRailListboxKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'Home',
      slideOrder,
    })).toEqual({
      boundary: 'first',
      slideOrder,
      type: 'select-boundary',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      boundary: 'last',
      slideOrder,
      type: 'select-boundary',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-c',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-c',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailListboxKeyboardIntent({
      activeSlideId: 'slide-b',
      key: ' ',
      slideOrder,
    })).toEqual({
      slideId: 'slide-b',
      type: 'activate-focused-option',
    })
    expect(getSlideEditRailKeyboardCommandEffect({
      slideId: 'slide-b',
      type: 'activate-focused-option',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-b',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailListboxKeyboardIntent({
      activeSlideId: 'slide-b',
      key: 'Enter',
      slideOrder,
    })).not.toEqual({
      slideId: 'slide-b',
      type: 'thumbnail-press',
    })
  })

  it('maps reorder keyboard shortcuts to move intents', () => {
    expect(getSlideEditRailReorderKeyboardShortcutIntent({
      activeSlideId: 'slide-b',
      altKey: false,
      key: 'ArrowUp',
      mod: true,
      shiftKey: false,
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      direction: 'previous',
      slideOrder,
      type: 'move-active',
    })
    expect(getSlideEditRailReorderKeyboardShortcutIntent({
      activeSlideId: 'slide-b',
      altKey: false,
      key: 'ArrowDown',
      mod: true,
      shiftKey: false,
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      direction: 'next',
      slideOrder,
      type: 'move-active',
    })
    expect(getSlideEditRailReorderKeyboardShortcutIntent({
      activeSlideId: 'slide-b',
      altKey: false,
      key: 'ArrowUp',
      mod: true,
      shiftKey: true,
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      boundary: 'first',
      slideOrder,
      type: 'move-active-to-boundary',
    })
    expect(getSlideEditRailReorderKeyboardShortcutIntent({
      activeSlideId: 'slide-b',
      altKey: false,
      key: 'ArrowDown',
      mod: true,
      shiftKey: true,
      slideOrder,
    })).toEqual({
      activeSlideId: 'slide-b',
      boundary: 'last',
      slideOrder,
      type: 'move-active-to-boundary',
    })
    expect(getSlideEditRailReorderKeyboardShortcutIntent({
      activeSlideId: 'slide-b',
      altKey: true,
      key: 'ArrowDown',
      mod: true,
      shiftKey: true,
      slideOrder,
    })).toBeNull()
    expect(getSlideEditRailReorderKeyboardShortcutIntent({
      activeSlideId: 'slide-b',
      altKey: false,
      key: 'ArrowDown',
      mod: false,
      shiftKey: true,
      slideOrder,
    })).toBeNull()
  })

  it('keeps reorder shortcuts within rail boundaries', () => {
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-a',
      direction: 'previous',
      slideOrder,
      type: 'move-active',
    })).toBeNull()
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-c',
      direction: 'next',
      slideOrder,
      type: 'move-active',
    })).toBeNull()
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-a',
      boundary: 'first',
      slideOrder,
      type: 'move-active-to-boundary',
    })).toBeNull()
    expect(getSlideEditRailKeyboardCommandEffect({
      activeSlideId: 'slide-c',
      boundary: 'last',
      slideOrder,
      type: 'move-active-to-boundary',
    })).toBeNull()
  })

  it('converts pointer intents to host command effects', () => {
    expect(getSlideEditRailPointerCommandEffect({
      slideId: 'slide-b',
      type: 'thumbnail-press',
    })).toEqual({
      payload: {
        id: 'select-active-slide',
        slideId: 'slide-b',
      },
      selection: {
        objectIds: [],
        slideId: 'slide-b',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailPointerCommandEffect({
      slideId: 'slide-c',
      slideOrder,
      toIndex: 0,
      type: 'thumbnail-drop',
    })).toEqual({
      payload: {
        fromIndex: 2,
        id: 'reorder-slide',
        slideId: 'slide-c',
        toIndex: 0,
      },
      selection: {
        objectIds: [],
        slideId: 'slide-c',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditRailPointerCommandEffect({
      afterSlideId: 'slide-b',
      type: 'add-button-press',
    })).toEqual({
      payload: {
        afterSlideId: 'slide-b',
        id: 'add-slide',
      },
      selection: undefined,
      type: 'slide-command-effect',
    })
  })

  it('keeps interaction contracts product-neutral and separate from object z-order', () => {
    const contractStrings = JSON.stringify({
      commands: SLIDE_EDIT_RAIL_COMMANDS,
      descriptor: createSlideEditRailDescriptor({
        activeSlideId: 'slide-a',
        getThumbnailBounds: () => ({ h: 72, w: 128, x: 0, y: 0 }),
        slideOrder,
      }),
    }).toLowerCase()

    expect(contractStrings).not.toContain('z-order')
    expect(contractStrings).not.toContain('layer')
    expect(contractStrings).not.toContain('object-model')
  })
})
