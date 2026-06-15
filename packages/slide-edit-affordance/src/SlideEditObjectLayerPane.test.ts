import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectLayerPaneDescriptor,
  getSlideEditObjectLayerPaneCommandEffect,
  SLIDE_EDIT_OBJECT_LAYER_PANE_ARIA_CONTRACT,
  type SlideEditObjectLayerPaneSourceObject,
} from './SlideEditObjectLayerPane'

describe('SlideEditObjectLayerPane', () => {
  const objects: SlideEditObjectLayerPaneSourceObject<'slide-a'>[] = [
    {
      depth: 1,
      displayName: 'Body copy',
      groupId: 'group-a',
      isHidden: false,
      isLocked: false,
      isSelectable: true,
      kindLabel: 'Text',
      objectId: 'body',
      order: 2,
      parentGroupId: 'group-a',
      slideId: 'slide-a',
    },
    {
      displayName: 'Logo',
      isHidden: true,
      isLocked: false,
      isSelectable: true,
      kindLabel: 'Image',
      objectId: 'logo',
      order: 1,
      slideId: 'slide-a',
    },
    {
      displayName: 'Header group',
      groupId: 'group-a',
      isGroup: true,
      isGroupExpanded: false,
      isHidden: false,
      isLocked: false,
      isSelectable: true,
      kindLabel: 'Group',
      objectId: 'group-row',
      order: 0,
      slideId: 'slide-a',
    },
    {
      displayName: 'Footer',
      isHidden: false,
      isLocked: true,
      isSelectable: false,
      kindLabel: 'Text',
      objectId: 'footer',
      order: 3,
      slideId: 'slide-a',
    },
  ]

  it('creates ordered object rows with selection, visibility, lock, and group state', () => {
    const descriptor = createSlideEditObjectLayerPaneDescriptor({
      objects,
      selectedObjectIds: ['body'],
      slideId: 'slide-a',
    })

    expect(descriptor.aria).toBe(SLIDE_EDIT_OBJECT_LAYER_PANE_ARIA_CONTRACT)
    expect(descriptor.rows.map((row) => row.objectId)).toEqual([
      'group-row',
      'logo',
      'body',
      'footer',
    ])
    expect(descriptor.rows[0]).toMatchObject({
      aria: {
        expanded: false,
        level: 1,
        posInSet: 1,
        role: 'treeitem',
        selected: false,
        setSize: 4,
      },
      displayName: 'Header group',
      isGroup: true,
      isGrouped: true,
      kindLabel: 'Group',
      objectId: 'group-row',
    })
    expect(descriptor.rows[1]).toMatchObject({
      isHidden: true,
      isSelectable: true,
      kindLabel: 'Image',
      objectId: 'logo',
    })
    expect(descriptor.rows[2]).toMatchObject({
      depth: 1,
      isGrouped: true,
      isSelected: true,
      parentGroupId: 'group-a',
    })
    expect(descriptor.rows[3]).toMatchObject({
      isLocked: true,
      isSelectable: false,
    })
  })

  it('defines ARIA tree as the selection pane interaction contract', () => {
    expect(SLIDE_EDIT_OBJECT_LAYER_PANE_ARIA_CONTRACT).toEqual({
      rowRole: 'treeitem',
      selectionMode: 'multi',
      surfaceRole: 'tree',
    })
  })

  it('converts select, additive select, rename, and reorder intents to host effects', () => {
    const descriptor = createSlideEditObjectLayerPaneDescriptor({
      objects,
      selectedObjectIds: ['body'],
      slideId: 'slide-a',
    })

    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectId: 'logo',
        type: 'select',
      },
    })).toEqual({
      payload: {
        id: 'select-object',
        objectIds: ['logo'],
      },
      selection: {
        objectIds: ['logo'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectId: 'logo',
        type: 'additive-select',
      },
    })).toEqual({
      payload: {
        id: 'additive-select-object',
        objectId: 'logo',
      },
      selection: {
        objectIds: ['body'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        displayName: '  Hero logo  ',
        objectId: 'logo',
        type: 'rename',
      },
    })).toEqual({
      payload: {
        displayName: 'Hero logo',
        id: 'rename-object',
        objectId: 'logo',
      },
      selection: {
        objectIds: ['body'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectId: 'body',
        toIndex: 0,
        type: 'reorder',
      },
    })).toEqual({
      payload: {
        fromIndex: 2,
        id: 'reorder-object',
        objectId: 'body',
        toIndex: 0,
      },
      selection: {
        objectIds: ['body'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('converts hide/show and lock/unlock intents without duplicating visibility rules', () => {
    const descriptor = createSlideEditObjectLayerPaneDescriptor({
      objects,
      selectedObjectIds: ['body', 'logo'],
      slideId: 'slide-a',
    })

    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectIds: ['body', 'logo'],
        type: 'hide',
      },
    })).toEqual({
      payload: {
        id: 'hide-objects',
        objectIds: ['body'],
      },
      selection: {
        objectIds: ['body', 'logo'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectIds: ['body', 'logo'],
        type: 'show',
      },
    })).toEqual({
      payload: {
        id: 'show-objects',
        objectIds: ['logo'],
      },
      selection: {
        objectIds: ['body', 'logo'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectIds: ['body', 'footer'],
        type: 'lock',
      },
    })).toEqual({
      payload: {
        id: 'lock-objects',
        objectIds: ['body'],
      },
      selection: {
        objectIds: ['body', 'footer'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectIds: ['footer'],
        type: 'unlock',
      },
    })).toEqual({
      payload: {
        id: 'unlock-objects',
        objectIds: ['footer'],
      },
      selection: {
        objectIds: ['footer'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('blocks unsafe row intents and keeps public contract product-neutral', () => {
    const descriptor = createSlideEditObjectLayerPaneDescriptor({
      objects,
      selectedObjectIds: ['body'],
      slideId: 'slide-a',
    })

    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectId: 'footer',
        type: 'select',
      },
    })).toBeNull()
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        displayName: '',
        objectId: 'logo',
        type: 'rename',
      },
    })).toBeNull()
    expect(getSlideEditObjectLayerPaneCommandEffect({
      descriptor,
      intent: {
        objectId: 'footer',
        toIndex: 0,
        type: 'reorder',
      },
    })).toBeNull()

    const publicStrings = JSON.stringify({
      aria: SLIDE_EDIT_OBJECT_LAYER_PANE_ARIA_CONTRACT,
      descriptor,
    }).toLowerCase()

    expect(publicStrings).not.toContain('ppt')
    expect(publicStrings).not.toContain('powerpoint')
    expect(publicStrings).not.toContain('figslide')
  })
})
