import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import { createCanvasItemsChangePatch } from './CanvasDocumentChangePatch'

describe('CanvasDocumentChangePatch', () => {
  it('maps remove-selection changes to item removal patches', () => {
    expect(
      createCanvasItemsChangePatch(createItems(), {
        selection: ['rect-2'],
        type: 'remove-selection',
      }),
    ).toEqual([{ op: 'remove', path: '/1' }])
  })

  it('maps set-text changes to text patches', () => {
    expect(
      createCanvasItemsChangePatch(createItems(), {
        id: 'rect-1',
        text: 'Updated',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/0/text',
        value: 'Updated',
      },
    ])
  })

  it('maps sticky set-text changes to body patches', () => {
    expect(
      createCanvasItemsChangePatch(createItems(), {
        id: 'component-sticky',
        text: 'New idea',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/2/body',
        value: 'New idea',
      },
    ])
  })

  it('maps long sticky set-text changes to body and auto-height patches', () => {
    const longText = 'x'.repeat(180)

    expect(
      createCanvasItemsChangePatch(createItems(), {
        id: 'component-sticky',
        text: longText,
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/2/body',
        value: longText,
      },
      {
        op: 'replace',
        path: '/2/h',
        value: 302,
      },
    ])
  })

  it('maps section set-text changes to title patches', () => {
    expect(
      createCanvasItemsChangePatch([
        ...createItems(),
        createStickyItem('component-section', {
          body: 'Workspace',
          component: 'section',
          title: 'Section',
        }),
      ], {
        id: 'component-section',
        text: 'Workshop plan',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/4/title',
        value: 'Workshop plan',
      },
    ])
  })

  it('maps connector set-text changes to label patches', () => {
    expect(
      createCanvasItemsChangePatch(createItems(), {
        id: 'arrow-1',
        text: 'Next',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/3/text',
        value: 'Next',
      },
    ])

    expect(
      createCanvasItemsChangePatch([
        ...createItems().slice(0, 3),
        createArrowItem('arrow-1', { text: undefined }),
      ], {
        id: 'arrow-1',
        text: 'Next',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'add',
        path: '/3/text',
        value: 'Next',
      },
    ])
  })

  it('maps comment set-text changes to body patches', () => {
    expect(
      createCanvasItemsChangePatch([
        ...createItems(),
        createCommentItem('comment-1'),
      ], {
        id: 'comment-1',
        text: 'Looks good',
        type: 'set-text',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/4/body',
        value: 'Looks good',
      },
      {
        op: 'add',
        path: '/4/thread',
        value: [{
          authorName: 'You',
          body: 'Looks good',
          createdAt: 'Just now',
          id: 'comment-1:message-1',
        }],
      },
    ])
  })

  it('maps transform changes to changed item replacements and root additions', () => {
    const beforeItems = createItems()
    const added = createRectItem('rect-3', { x: 240 })
    const afterItems = [
      { ...beforeItems[0], x: 24 },
      beforeItems[1],
      beforeItems[2],
      beforeItems[3],
      added,
    ]

    expect(
      createCanvasItemsChangePatch(beforeItems, {
        afterItems,
        beforeItems,
        type: 'transform',
      }),
    ).toEqual([
      {
        op: 'replace',
        path: '/0',
        value: afterItems[0],
      },
      {
        op: 'add',
        path: '/-',
        value: added,
      },
    ])
  })
})

function createItems(): CanvasItem[] {
  return [
    createRectItem('rect-1', { text: 'Start' }),
    createRectItem('rect-2', { x: 120 }),
    createStickyItem('component-sticky'),
    createArrowItem('arrow-1'),
  ]
}

function createRectItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 60,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
    ...overrides,
  }
}

function createStickyItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'component' }>> = {},
): Extract<CanvasItem, { type: 'component' }> {
  return {
    accent: '#ca8a04',
    body: 'Decision note',
    component: 'sticky',
    fill: '#fef3c7',
    h: 148,
    id,
    stroke: '#eab308',
    title: 'Sticky',
    type: 'component',
    w: 188,
    x: 220,
    y: 0,
    ...overrides,
  }
}

function createArrowItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'arrow' }>> = {},
): Extract<CanvasItem, { type: 'arrow' }> {
  return {
    end: { x: 360, y: 40 },
    h: 24,
    id,
    start: { x: 260, y: 40 },
    stroke: '#334155',
    strokeWidth: 3,
    text: 'Flow',
    type: 'arrow',
    w: 124,
    x: 248,
    y: 28,
    ...overrides,
  }
}

function createCommentItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'comment' }>> = {},
): Extract<CanvasItem, { type: 'comment' }> {
  return {
    body: 'Comment',
    h: 36,
    id,
    type: 'comment',
    w: 36,
    x: 80,
    y: 80,
    ...overrides,
  }
}
