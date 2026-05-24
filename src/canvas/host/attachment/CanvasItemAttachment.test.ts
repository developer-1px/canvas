import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  getCanvasItemAttachmentId,
  isCanvasItemAttachedTo,
} from './CanvasItemAttachment'

describe('CanvasItemAttachment', () => {
  it('reads the shared attached item contract without knowing item types', () => {
    const comment: CanvasItem = {
      attachedTo: 'rect-1',
      body: 'Needs follow-up',
      h: 36,
      id: 'comment-1',
      type: 'comment',
      w: 36,
      x: 0,
      y: 0,
    }
    const rect: CanvasItem = {
      fill: '#ffffff',
      h: 80,
      id: 'rect-1',
      stroke: '#111827',
      type: 'rect',
      w: 120,
      x: 0,
      y: 0,
    }

    expect(getCanvasItemAttachmentId(comment)).toBe('rect-1')
    expect(isCanvasItemAttachedTo(comment, new Set(['rect-1']))).toBe(true)
    expect(getCanvasItemAttachmentId(rect)).toBeNull()
    expect(isCanvasItemAttachedTo(rect, new Set(['rect-1']))).toBe(false)
  })
})
