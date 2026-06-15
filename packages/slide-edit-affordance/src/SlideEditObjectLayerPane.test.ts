import { describe, expect, it } from 'vitest'

import {
  createSlideEditLayerPaneDescriptor,
  getSlideEditLayerPaneCommandEffect,
  SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT,
  SLIDE_EDIT_LAYER_PANE_COMMANDS,
} from './SlideEditObjectLayerPane'

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
