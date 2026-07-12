import { describe, expect, it, vi } from 'vitest'

import type { CanvasItem } from '../../entities'
import { createCanvasAffordanceConfig } from '../../engine'
import { createCanvasDocumentController } from '../../host'
import { CANVAS_APP_READ_ONLY_CAPABILITIES } from './CanvasAppCapabilityAssembly'
import { CANVAS_APP_COMMENT_ONLY_CAPABILITIES } from './CanvasAppCapabilityAssembly'
import {
  createCanvasAppDocumentAuthority,
  createCanvasAppDocumentAuthorityAffordanceConfigInput,
  createCanvasAppDocumentAuthorityRead,
} from './CanvasAppDocumentAuthority'

describe('CanvasAppDocumentAuthority', () => {
  it('denies a view-only document mutation without changing items, selection, or history', () => {
    const initialItem = createRectItem('rect-1')
    const document = createCanvasDocumentController(
      [initialItem],
      [initialItem.id],
    )
    const commitItemsChange = vi.fn((change, selection) =>
        document.commitItemsChange(
          change,
          document.readItems(),
          selection,
        ))
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange,
      readItems: document.readItems,
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_READ_ONLY_CAPABILITIES,
      ),
    })
    const beforeItems = document.readItems()
    const beforeSelection = document.readSelection()
    const beforeHistory = document.readHistoryAvailability()

    expect(authority.commit({
      change: {
        items: [createRectItem('rect-2')],
        type: 'add',
      },
      selection: {
        after: ['rect-2'],
        before: [initialItem.id],
      },
    })).toEqual({
      code: 'capability-denied',
      ok: false,
      requiredCapability: 'editDocument',
    })
    expect(document.readItems()).toBe(beforeItems)
    expect(document.readSelection()).toEqual(beforeSelection)
    expect(document.readHistoryAvailability()).toEqual(beforeHistory)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('allows a comment-only mutation while preserving non-comment content', () => {
    const rect = createRectItem('rect-1')
    const comment: CanvasItem = {
      body: 'Review this',
      h: 80,
      id: 'comment-1',
      type: 'comment',
      w: 180,
      x: 160,
      y: 0,
    }
    const document = createCanvasDocumentController(
      [rect, comment],
      [comment.id],
    )
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange: (change, selection) =>
        document.commitItemsChange(
          change,
          document.readItems(),
          selection,
        ),
      readItems: document.readItems,
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
      ),
    })

    expect(authority.commit({
      change: {
        items: [rect, { ...comment, resolved: true }],
        type: 'replace-changed',
      },
      selection: {
        after: [comment.id],
        before: [comment.id],
      },
    })).toEqual({ ok: true })
    expect(document.readItems()).toEqual([
      rect,
      { ...comment, resolved: true },
    ])
    expect(document.readSelection()).toEqual([comment.id])
    expect(document.readHistoryAvailability()).toEqual({
      canRedo: false,
      canUndo: true,
    })
  })

  it('does not let comment-only replace-changed convert document content into a comment', () => {
    const rect = createRectItem('shared-id')
    const document = createCanvasDocumentController([rect], [rect.id])
    const commitItemsChange = vi.fn((change, selection) =>
      document.commitItemsChange(change, document.readItems(), selection))
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange,
      readItems: document.readItems,
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
      ),
    })
    const beforeItems = document.readItems()
    const beforeSelection = document.readSelection()

    expect(authority.commit({
      change: {
        items: [{
          body: 'Replaced content',
          h: rect.h,
          id: rect.id,
          type: 'comment',
          w: rect.w,
          x: rect.x,
          y: rect.y,
        }],
        type: 'replace-changed',
      },
    })).toEqual({
      code: 'capability-denied',
      ok: false,
      requiredCapability: 'editDocument',
    })
    expect(commitItemsChange).not.toHaveBeenCalled()
    expect(document.readItems()).toBe(beforeItems)
    expect(document.readSelection()).toEqual(beforeSelection)
    expect(document.readHistoryAvailability()).toEqual({
      canRedo: false,
      canUndo: false,
    })
  })

  it('allows a nested comment update without granting edits to its group', () => {
    const comment: CanvasItem = {
      body: 'Nested review',
      h: 80,
      id: 'comment-1',
      type: 'comment',
      w: 180,
      x: 16,
      y: 16,
    }
    const group: CanvasItem = {
      children: [createRectItem('rect-1'), comment],
      h: 160,
      id: 'group-1',
      type: 'group',
      w: 240,
      x: 0,
      y: 0,
    }
    const document = createCanvasDocumentController([group], [comment.id])
    const currentGroup = document.readItems()[0]

    if (!currentGroup || currentGroup.type !== 'group') {
      throw new Error('Expected a group fixture')
    }

    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange: (change, selection) =>
        document.commitItemsChange(change, document.readItems(), selection),
      readItems: document.readItems,
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
      ),
    })

    expect(authority.commit({
      change: {
        items: [{
          ...currentGroup,
          children: [createRectItem('rect-1'), { ...comment, resolved: true }],
        }],
        type: 'replace-changed',
      },
    })).toEqual({ ok: true })
    expect(document.readItems()).toMatchObject([{
      children: [createRectItem('rect-1'), { ...comment, resolved: true }],
      id: currentGroup.id,
    }])
  })

  it('denies a nested document edit disguised alongside a comment update', () => {
    const rect = createRectItem('rect-1')
    const comment: CanvasItem = {
      body: 'Nested review',
      h: 80,
      id: 'comment-1',
      type: 'comment',
      w: 180,
      x: 16,
      y: 16,
    }
    const group: CanvasItem = {
      children: [rect, comment],
      h: 160,
      id: 'group-1',
      type: 'group',
      w: 240,
      x: 0,
      y: 0,
    }
    const commitItemsChange = vi.fn(() => true)
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange,
      readItems: () => [group],
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
      ),
    })

    expect(authority.commit({
      change: {
        items: [{
          ...group,
          children: [
            { ...rect, x: rect.x + 20 },
            { ...comment, resolved: true },
          ],
        }],
        type: 'replace-changed',
      },
    })).toEqual({
      code: 'capability-denied',
      ok: false,
      requiredCapability: 'editDocument',
    })
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('limits comment-only text mutation to comment targets', () => {
    const rect = createRectItem('rect-1')
    const comment: CanvasItem = {
      body: 'Review this',
      h: 80,
      id: 'comment-1',
      type: 'comment',
      w: 180,
      x: 160,
      y: 0,
    }
    const document = createCanvasDocumentController(
      [rect, comment],
      [comment.id],
    )
    const commitItemsChange = (change: Parameters<
      typeof document.commitItemsChange
    >[0], selection?: Parameters<typeof document.commitItemsChange>[2]) =>
      document.commitItemsChange(
        change,
        document.readItems(),
        selection,
      )
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange,
      readItems: document.readItems,
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
      ),
    })

    expect(authority.commit({
      change: { id: comment.id, text: 'Resolved', type: 'set-text' },
      selection: { after: [comment.id], before: [comment.id] },
    })).toEqual({ ok: true })
    expect(authority.commit({
      change: { id: rect.id, text: 'Renamed', type: 'set-text' },
    })).toEqual({
      code: 'capability-denied',
      ok: false,
      requiredCapability: 'editDocument',
    })
    expect(document.readItems()).toMatchObject([
      rect,
      { ...comment, body: 'Resolved' },
    ])
    expect(document.readSelection()).toEqual([comment.id])
  })

  it('projects UI affordances from the same read-only authority', () => {
    const read = createCanvasAppDocumentAuthorityRead(
      CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
    )

    expect(createCanvasAffordanceConfig(
      createCanvasAppDocumentAuthorityAffordanceConfigInput(read),
    ))
      .toMatchObject({
        commands: { delete: false },
        gestures: { createComment: true, move: false },
        tools: { comment: true, rect: false },
      })
  })

  it('contains document commit failures behind a structured result', () => {
    const read = createCanvasAppDocumentAuthorityRead({
      comment: true,
      editDocument: true,
      export: true,
      follow: true,
      present: true,
      view: true,
    })
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange: () => {
        throw new Error('persistence unavailable')
      },
      readItems: () => [],
      read,
    })

    expect(() => authority.commit({
      change: { items: [createRectItem('rect-1')], type: 'add' },
    })).not.toThrow()
    expect(authority.commit({
      change: { items: [createRectItem('rect-2')], type: 'add' },
    })).toEqual({
      code: 'mutation-rejected',
      ok: false,
    })
    expect(createCanvasAppDocumentAuthority({
      commitItemsChange: () => true,
      read,
      readItems: () => {
        throw new Error('document unavailable')
      },
    }).commit({
      change: { items: [createRectItem('rect-3')], type: 'add' },
    })).toEqual({
      code: 'mutation-rejected',
      ok: false,
    })
  })
})

function createRectItem(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 80,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 120,
    x: 0,
    y: 0,
  }
}
