import { describe, expect, it } from 'vitest'

import {
  createSlideEditLayerPaneDescriptor,
  getSlideEditLayerPaneCommandEffect,
  getSlideEditLayerPaneDropIndicator,
  getSlideEditLayerPaneKeyboardIntent,
  getSlideEditLayerPaneRenameJSONPasteValue,
  getSlideEditLayerPaneRenamePasteCommandEffect,
  getSlideEditLayerPaneResolvedFocusObjectId,
  SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT,
  SLIDE_EDIT_LAYER_PANE_COMMANDS,
  SLIDE_EDIT_LAYER_PANE_DROP_INDICATOR_MODEL,
  SLIDE_EDIT_LAYER_PANE_KEYBOARD_INTENT_MODEL,
  SLIDE_EDIT_LAYER_PANE_KEYBOARD_KEYS,
  SLIDE_EDIT_LAYER_PANE_OBJECT_METADATA_JSON_MIME_TYPE,
  SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE,
} from './SlideEditObjectLayerPane'
import {
  getSlideEditLayerPaneRenameJSONPasteValue as getSlideEditLayerPaneRenameJSONPasteValueFromPackage,
} from './index'

function createGroupedLayerPaneDescriptor() {
  return createSlideEditLayerPaneDescriptor({
    activeObjectId: 'child-a',
    slideId: 'slide-tree',
    selectedObjectIds: ['child-a'],
    objects: [
      {
        displayName: 'Group A',
        isExpanded: true,
        isGroup: true,
        kindLabel: 'Group',
        objectId: 'group-a',
        order: 0,
      },
      {
        displayName: 'Child A',
        groupId: 'group-a',
        kindLabel: 'Text',
        objectId: 'child-a',
        order: 1,
        parentObjectId: 'group-a',
      },
      {
        displayName: 'Child B',
        groupId: 'group-a',
        isSelectable: false,
        kindLabel: 'Shape',
        objectId: 'child-b',
        order: 2,
        parentObjectId: 'group-a',
      },
      {
        displayName: 'Group B',
        isExpanded: false,
        isGroup: true,
        kindLabel: 'Group',
        objectId: 'group-b',
        order: 3,
      },
      {
        displayName: 'Loose object',
        kindLabel: 'Image',
        objectId: 'loose',
        order: 4,
      },
    ],
  })
}

describe('SlideEditObjectLayerPane', () => {
  const descriptor = createSlideEditLayerPaneDescriptor({
    activeObjectId: 'title',
    slideId: 'slide-a',
    selectedObjectIds: ['title'],
    objects: [
      {
        displayName: 'Hero image',
        groupId: 'cover',
        isHidden: true,
        kindLabel: 'Image',
        objectId: 'image',
        order: 2,
      },
      {
        displayName: 'Title',
        kindLabel: 'Text',
        objectId: 'title',
        order: 0,
      },
      {
        displayName: 'Locked note',
        isLocked: true,
        kindLabel: 'Comment',
        objectId: 'note',
        order: 1,
      },
    ],
  })

  it('describes selection pane rows with order, kind, selection, visibility, lock, and group state', () => {
    expect(descriptor.rows.map((row) => row.objectId)).toEqual([
      'title',
      'note',
      'image',
    ])
    expect(descriptor.rows[0]).toMatchObject({
      ariaLevel: 1,
      ariaPosInSet: 1,
      ariaSetSize: 3,
      displayName: 'Title',
      isGrouped: false,
      isHidden: false,
      isLocked: false,
      isSelected: true,
      kindLabel: 'Text',
      order: 0,
      slideId: 'slide-a',
    })
    expect(descriptor.rows[2]).toMatchObject({
      groupId: 'cover',
      isGrouped: true,
      isHidden: true,
      isSelectable: true,
      objectId: 'image',
    })
  })

  it('defines a tree aria interaction contract for layer pane renderers', () => {
    expect(descriptor.aria).toEqual(SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT)
    expect(SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT).toEqual({
      containerRole: 'tree',
      keyboardModel: 'roving-tabindex',
      rowRole: 'treeitem',
      selectionModel: 'host-controlled-multi-select',
    })
    expect(SLIDE_EDIT_LAYER_PANE_KEYBOARD_INTENT_MODEL).toBe(
      'slide-edit-layer-pane-keyboard-intent',
    )
    expect(SLIDE_EDIT_LAYER_PANE_KEYBOARD_KEYS).toBe(
      'arrow-left-right-up-down-home-end-enter-space-shift-range-alt-reorder-f2-rename',
    )
  })

  it('resolves layer pane focus from preferred and default rows', () => {
    expect(getSlideEditLayerPaneResolvedFocusObjectId(descriptor, {
      preferredObjectId: 'note',
    })).toBe('note')

    expect(getSlideEditLayerPaneResolvedFocusObjectId(descriptor, {
      defaultObjectId: 'image',
      preferredObjectId: 'missing',
    })).toBe('image')
  })

  it('falls back from layer pane focus to selected row, first row, and null', () => {
    expect(getSlideEditLayerPaneResolvedFocusObjectId(descriptor, {
      defaultObjectId: 'missing',
      preferredObjectId: 'also-missing',
    })).toBe('title')

    expect(getSlideEditLayerPaneResolvedFocusObjectId(
      createSlideEditLayerPaneDescriptor({
        objects: [
          {
            displayName: 'Loose object',
            kindLabel: 'Image',
            objectId: 'loose',
          },
        ],
        selectedObjectIds: [],
        slideId: 'slide-empty-selection',
      }),
    )).toBe('loose')

    expect(getSlideEditLayerPaneResolvedFocusObjectId(
      createSlideEditLayerPaneDescriptor({
        objects: [],
        selectedObjectIds: [],
        slideId: 'slide-empty',
      }),
    )).toBeNull()
  })

  it('calculates tree row aria state for grouped layer panes', () => {
    const groupedDescriptor = createGroupedLayerPaneDescriptor()

    expect(groupedDescriptor.rows.map((row) => ({
      ariaExpanded: row.ariaExpanded,
      ariaLevel: row.ariaLevel,
      ariaPosInSet: row.ariaPosInSet,
      ariaSetSize: row.ariaSetSize,
      isSelected: row.isSelected,
      objectId: row.objectId,
    }))).toEqual([
      {
        ariaExpanded: true,
        ariaLevel: 1,
        ariaPosInSet: 1,
        ariaSetSize: 3,
        isSelected: false,
        objectId: 'group-a',
      },
      {
        ariaExpanded: undefined,
        ariaLevel: 2,
        ariaPosInSet: 1,
        ariaSetSize: 2,
        isSelected: true,
        objectId: 'child-a',
      },
      {
        ariaExpanded: undefined,
        ariaLevel: 2,
        ariaPosInSet: 2,
        ariaSetSize: 2,
        isSelected: false,
        objectId: 'child-b',
      },
      {
        ariaExpanded: false,
        ariaLevel: 1,
        ariaPosInSet: 2,
        ariaSetSize: 3,
        isSelected: false,
        objectId: 'group-b',
      },
      {
        ariaExpanded: undefined,
        ariaLevel: 1,
        ariaPosInSet: 3,
        ariaSetSize: 3,
        isSelected: false,
        objectId: 'loose',
      },
    ])
  })

  it('maps layer pane tree keyboard events to host-owned intents', () => {
    const groupedDescriptor = createGroupedLayerPaneDescriptor()

    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: 'ArrowDown',
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-a',
      key: 'ArrowDown',
    })).toEqual({
      objectId: 'group-b',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-b',
      key: 'ArrowUp',
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-b',
      key: 'Home',
    })).toEqual({
      objectId: 'group-a',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: 'End',
    })).toEqual({
      objectId: 'loose',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'loose',
      key: 'ArrowDown',
    })).toEqual({
      objectId: 'loose',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-a',
      key: 'Enter',
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      type: 'select-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: ' ',
    })).toEqual({
      objectId: 'group-a',
      preventDefault: true,
      type: 'select-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-a',
      key: 'F2',
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      type: 'rename-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-b',
      key: 'ArrowRight',
    })).toEqual({
      objectId: 'group-b',
      preventDefault: true,
      type: 'expand-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: 'ArrowRight',
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      type: 'focus-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: 'ArrowLeft',
    })).toEqual({
      objectId: 'group-a',
      preventDefault: true,
      type: 'collapse-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-a',
      key: 'ArrowLeft',
    })).toEqual({
      objectId: 'group-a',
      preventDefault: true,
      type: 'focus-parent-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'loose',
      key: 'ArrowLeft',
    })).toEqual({ preventDefault: false, type: 'none' })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-b',
      key: 'ArrowDown',
    })).toEqual({ preventDefault: false, type: 'none' })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: 'Delete',
    })).toEqual({ preventDefault: false, type: 'none' })
  })

  it('maps F2 only for renamable layer pane rows', () => {
    const descriptor = createSlideEditLayerPaneDescriptor({
      activeObjectId: 'renamable',
      slideId: 'slide-rename',
      selectedObjectIds: ['renamable'],
      objects: [
        {
          displayName: 'Renamable',
          kindLabel: 'Text',
          objectId: 'renamable',
        },
        {
          displayName: 'Fixed',
          isRenamable: false,
          kindLabel: 'Placeholder',
          objectId: 'fixed',
        },
      ],
    })

    expect(getSlideEditLayerPaneKeyboardIntent(descriptor, {
      currentObjectId: 'renamable',
      key: 'F2',
    })).toEqual({
      objectId: 'renamable',
      preventDefault: true,
      type: 'rename-row',
    })

    expect(getSlideEditLayerPaneKeyboardIntent(descriptor, {
      currentObjectId: 'fixed',
      key: 'F2',
    })).toEqual({ preventDefault: false, type: 'none' })

    expect(getSlideEditLayerPaneKeyboardIntent(descriptor, {
      altKey: true,
      currentObjectId: 'renamable',
      key: 'F2',
    })).toEqual({ preventDefault: false, type: 'none' })

    expect(getSlideEditLayerPaneKeyboardIntent(descriptor, {
      currentObjectId: 'renamable',
      key: 'F2',
      shiftKey: true,
    })).toEqual({ preventDefault: false, type: 'none' })
  })

  it('maps Shift keyboard range selection to host-owned intents', () => {
    const groupedDescriptor = createGroupedLayerPaneDescriptor()

    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-a',
      key: 'ArrowDown',
      rangeAnchorObjectId: 'group-a',
      shiftKey: true,
    })).toEqual({
      objectId: 'group-b',
      preventDefault: true,
      rangeAnchorObjectId: 'group-a',
      type: 'range-select-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-b',
      key: 'ArrowUp',
      rangeAnchorObjectId: 'child-a',
      shiftKey: true,
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      rangeAnchorObjectId: 'child-a',
      type: 'range-select-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'child-a',
      key: 'ArrowDown',
      shiftKey: true,
    })).toEqual({
      objectId: 'group-b',
      preventDefault: true,
      rangeAnchorObjectId: 'child-a',
      type: 'range-select-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-b',
      key: 'Home',
      rangeAnchorObjectId: 'child-a',
      shiftKey: true,
    })).toEqual({
      objectId: 'group-a',
      preventDefault: true,
      rangeAnchorObjectId: 'child-a',
      type: 'range-select-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      currentObjectId: 'group-a',
      key: 'End',
      rangeAnchorObjectId: 'group-a',
      shiftKey: true,
    })).toEqual({
      objectId: 'loose',
      preventDefault: true,
      rangeAnchorObjectId: 'group-a',
      type: 'range-select-row',
    })
  })

  it('maps Alt keyboard row reorder to host-owned intents', () => {
    const groupedDescriptor = createGroupedLayerPaneDescriptor()

    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      altKey: true,
      currentObjectId: 'child-a',
      key: 'ArrowDown',
    })).toEqual({
      objectId: 'child-a',
      preventDefault: true,
      toIndex: 4,
      type: 'reorder-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      altKey: true,
      currentObjectId: 'loose',
      key: 'ArrowUp',
    })).toEqual({
      objectId: 'loose',
      preventDefault: true,
      toIndex: 3,
      type: 'reorder-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      altKey: true,
      currentObjectId: 'group-a',
      key: 'ArrowDown',
    })).toEqual({
      objectId: 'group-a',
      preventDefault: true,
      toIndex: 4,
      type: 'reorder-row',
    })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      altKey: true,
      currentObjectId: 'group-a',
      key: 'ArrowUp',
    })).toEqual({ preventDefault: false, type: 'none' })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      altKey: true,
      currentObjectId: 'loose',
      key: 'ArrowDown',
    })).toEqual({ preventDefault: false, type: 'none' })
    expect(getSlideEditLayerPaneKeyboardIntent(groupedDescriptor, {
      altKey: true,
      currentObjectId: 'child-b',
      key: 'ArrowDown',
    })).toEqual({ preventDefault: false, type: 'none' })
  })

  it('defines pane command descriptors as host command effects', () => {
    expect(SLIDE_EDIT_LAYER_PANE_COMMANDS.map((command) => command.id)).toEqual([
      'select-objects',
      'rename-object',
      'hide-objects',
      'show-objects',
      'lock-objects',
      'unlock-objects',
      'reorder-object',
    ])
    expect(SLIDE_EDIT_LAYER_PANE_COMMANDS.every(
      (command) => command.requiredAdapterSlot === 'command-effect',
    )).toBe(true)
  })

  it('calculates drag drop placement indicators for reorderable layer pane rows', () => {
    const dragDescriptor = createSlideEditLayerPaneDescriptor({
      activeObjectId: 'a',
      slideId: 'slide-drag',
      selectedObjectIds: ['a'],
      objects: [
        {
          displayName: 'A',
          kindLabel: 'Text',
          objectId: 'a',
          order: 0,
        },
        {
          displayName: 'B',
          kindLabel: 'Shape',
          objectId: 'b',
          order: 1,
        },
        {
          displayName: 'C',
          kindLabel: 'Image',
          objectId: 'c',
          order: 2,
        },
        {
          displayName: 'Locked',
          isLocked: true,
          kindLabel: 'Shape',
          objectId: 'locked',
          order: 3,
        },
        {
          displayName: 'Group',
          isExpanded: true,
          isGroup: true,
          kindLabel: 'Group',
          objectId: 'group',
          order: 4,
        },
        {
          displayName: 'Group child',
          groupId: 'group',
          kindLabel: 'Text',
          objectId: 'group-child',
          order: 5,
          parentObjectId: 'group',
        },
      ],
    })

    expect(SLIDE_EDIT_LAYER_PANE_DROP_INDICATOR_MODEL).toBe(
      'slide-edit-layer-pane-drop-indicator',
    )
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'c',
      pointerOffsetY: 2,
      rowHeight: 20,
      targetObjectId: 'a',
    })).toEqual({
      draggedObjectId: 'c',
      indicator: 'before',
      placement: 'before',
      targetObjectId: 'a',
      toIndex: 0,
    })
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'a',
      pointerOffsetY: 18,
      rowHeight: 20,
      targetObjectId: 'c',
    })).toEqual({
      draggedObjectId: 'a',
      indicator: 'after',
      placement: 'after',
      targetObjectId: 'c',
      toIndex: 3,
    })
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'a',
      pointerOffsetY: 2,
      rowHeight: 20,
      targetObjectId: 'b',
    })).toMatchObject({
      indicator: '',
      placement: 'none',
      targetObjectId: null,
      toIndex: null,
    })
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'a',
      pointerOffsetY: 18,
      rowHeight: 20,
      targetObjectId: 'locked',
    })).toMatchObject({
      placement: 'none',
      toIndex: null,
    })
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'a',
      pointerOffsetY: 18,
      rowHeight: 20,
      targetObjectId: 'group',
    })).toEqual({
      draggedObjectId: 'a',
      indicator: 'after',
      placement: 'after',
      targetObjectId: 'group',
      toIndex: 5,
    })
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'group',
      pointerOffsetY: 2,
      rowHeight: 20,
      targetObjectId: 'a',
    })).toEqual({
      draggedObjectId: 'group',
      indicator: 'before',
      placement: 'before',
      targetObjectId: 'a',
      toIndex: 0,
    })
    expect(getSlideEditLayerPaneDropIndicator(dragDescriptor, {
      draggedObjectId: 'group',
      pointerOffsetY: 18,
      rowHeight: 20,
      targetObjectId: 'group-child',
    })).toMatchObject({
      placement: 'none',
      toIndex: null,
    })
  })

  it('converts replace, additive, and range selection intents to host command effects', () => {
    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'image',
      type: 'row-press',
    })).toEqual({
      payload: {
        id: 'select-objects',
        mode: 'replace',
        objectIds: ['image'],
      },
      selection: {
        objectIds: ['image'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      additive: true,
      objectId: 'image',
      type: 'row-press',
    })?.payload).toEqual({
      id: 'select-objects',
      mode: 'additive',
      objectIds: ['title', 'image'],
    })

    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'image',
      rangeAnchorObjectId: 'title',
      type: 'row-press',
    })?.payload).toEqual({
      id: 'select-objects',
      mode: 'range',
      objectIds: ['title', 'note', 'image'],
    })
  })

  it('converts rename, visibility, lock, and reorder intents to host command effects', () => {
    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      name: 'Main title',
      objectId: 'title',
      type: 'rename-submit',
    })?.payload).toEqual({
      id: 'rename-object',
      name: 'Main title',
      objectId: 'title',
    })

    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'image',
      type: 'visibility-toggle',
    })?.payload).toEqual({
      id: 'show-objects',
      objectIds: ['image'],
    })

    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'title',
      type: 'lock-toggle',
    })?.payload).toEqual({
      id: 'lock-objects',
      objectIds: ['title'],
    })

    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'title',
      toIndex: 3,
      type: 'row-drop',
    })?.payload).toEqual({
      fromIndex: 0,
      id: 'reorder-object',
      objectId: 'title',
      toIndex: 3,
    })

    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'image',
      toIndex: 0,
      type: 'row-drop',
    })?.payload).toEqual({
      fromIndex: 2,
      id: 'reorder-object',
      objectId: 'image',
      toIndex: 0,
    })
  })

  it('reads object-name custom MIME direct rename JSON first', () => {
    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYER_PANE_OBJECT_METADATA_JSON_MIME_TYPE]:
          '{"name":"Metadata name"}',
        [SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE]:
          '{"name":"  Hero layer  "}',
        'application/json':
          '{"objectName":"Generic name"}',
      }),
    })).toEqual({
      name: 'Hero layer',
      nameField: 'name',
      surface: 'object-layer-pane-rename',
    })

    expect(getSlideEditLayerPaneRenameJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE]:
          '{"name":"Package export"}',
      }),
    })).toEqual({
      name: 'Package export',
      nameField: 'name',
      surface: 'object-layer-pane-rename',
    })
  })

  it('reads wrapped object metadata, object name, and layer name JSON', () => {
    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json':
          '{"objectMetadata":{"name":"  AI renamed layer  "}}',
      }),
    })).toEqual({
      name: 'AI renamed layer',
      nameField: 'objectMetadata.name',
      surface: 'object-layer-pane-rename',
    })

    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"objectName":"Object wrapper"}',
      }),
    })).toMatchObject({
      name: 'Object wrapper',
      nameField: 'objectName',
    })

    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"layerName":"Layer wrapper"}',
      }),
    })).toMatchObject({
      name: 'Layer wrapper',
      nameField: 'layerName',
    })
  })

  it('converts rename paste values to layer pane rename command effects', () => {
    const pasteValue = getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"objectName":{"name":"  Pasted layer  "}}',
      }),
    })!

    expect(getSlideEditLayerPaneRenamePasteCommandEffect({
      descriptor,
      pasteValue,
    })).toEqual({
      payload: {
        id: 'rename-object',
        name: 'Pasted layer',
        objectId: 'title',
      },
      selection: {
        objectIds: ['title'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditLayerPaneRenamePasteCommandEffect({
      descriptor,
      objectId: 'image',
      pasteValue,
    })?.payload).toEqual({
      id: 'rename-object',
      name: 'Pasted layer',
      objectId: 'image',
    })
  })

  it('ignores unavailable object rename paste routes', () => {
    const pasteValue = getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE]:
          '{"name":"Name"}',
      }),
    })!
    const multiSelectionDescriptor = createSlideEditLayerPaneDescriptor({
      activeObjectId: null,
      slideId: 'slide-multi',
      selectedObjectIds: ['a', 'b'],
      objects: [
        {
          displayName: 'A',
          kindLabel: 'Text',
          objectId: 'a',
        },
        {
          displayName: 'B',
          kindLabel: 'Text',
          objectId: 'b',
        },
      ],
    })
    const nonRenamableDescriptor = createSlideEditLayerPaneDescriptor({
      activeObjectId: 'fixed',
      slideId: 'slide-fixed',
      selectedObjectIds: ['fixed'],
      objects: [
        {
          displayName: 'Fixed',
          isRenamable: false,
          kindLabel: 'Placeholder',
          objectId: 'fixed',
        },
      ],
    })

    expect(getSlideEditLayerPaneRenamePasteCommandEffect({
      descriptor: multiSelectionDescriptor,
      pasteValue,
    })).toBeNull()
    expect(getSlideEditLayerPaneRenamePasteCommandEffect({
      descriptor: nonRenamableDescriptor,
      pasteValue,
    })).toBeNull()
    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"name":"Direct generic name"}',
      }),
    })).toBeNull()
    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE]:
          '{"name":"   "}',
      }),
    })).toBeNull()
    expect(getSlideEditLayerPaneRenameJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('guards unavailable row commands without mutating host state', () => {
    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'note',
      type: 'visibility-toggle',
    })).toBeNull()
    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      objectId: 'note',
      toIndex: 0,
      type: 'row-drop',
    })).toBeNull()
    expect(getSlideEditLayerPaneCommandEffect(descriptor, {
      name: ' ',
      objectId: 'title',
      type: 'rename-submit',
    })).toBeNull()
  })

  it('keeps the layer pane contract product-neutral and separate from placeholder semantics', () => {
    const blockedTerms = ['p' + 'pt', 'power' + 'point', 'fig' + 'slide']
    const contractStrings = JSON.stringify({
      commands: SLIDE_EDIT_LAYER_PANE_COMMANDS,
      descriptor,
    }).toLowerCase()

    for (const blockedTerm of blockedTerms) {
      expect(contractStrings).not.toContain(blockedTerm)
    }
    expect(contractStrings).not.toContain('placeholder')
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
