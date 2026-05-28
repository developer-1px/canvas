import { describe, expect, it } from 'vitest'
import {
  CanvasHost,
  type CanvasItem,
} from '../../canvas'
import { DEMO_REPO_STORY_EVENTS } from './CanvasRepoStoryEvents'
import { createCanvasStoryItems } from './CanvasStoryGenerator'
import type { CanvasStoryEvent } from './CanvasStoryEvents'

describe('CanvasStoryGenerator', () => {
  it('generates a valid canvas board from sparse story events', () => {
    const items = createCanvasStoryItems(DEMO_REPO_STORY_EVENTS)
    const normalizedItems = CanvasHost.normalizeCanvasItems(items)
    const itemIds = new Set(normalizedItems.map((item) => item.id))

    expect(normalizedItems.length).toBe(DEMO_REPO_STORY_EVENTS.length)
    expect(itemIds.has('engine')).toBe(true)
    expect(itemIds.has('event-not-item')).toBe(true)
    expect(itemIds.has('decision-module')).toBe(true)
    expect(itemIds.has('partial-json-risk')).toBe(true)
    expect(itemIds.has('stream-feeds-generator')).toBe(true)
  })

  it('keeps LLM events free from generated geometry details', () => {
    const serializableEvent = JSON.stringify(DEMO_REPO_STORY_EVENTS[0])

    expect(serializableEvent).not.toMatch(/"x"|"y"|"w"|"h"|"fill"|"stroke"/)
  })

  it('uses the infinite canvas by spreading sections across lanes', () => {
    const items = createCanvasStoryItems(DEMO_REPO_STORY_EVENTS)
    const bounds = getItemsBounds(items)

    expect(bounds.w).toBeGreaterThan(1800)
    expect(bounds.h).toBeGreaterThan(900)
  })

  it('fails when a content event references an unknown section', () => {
    expect(() =>
      createCanvasStoryItems([
        {
          v: 1,
          type: 'card',
          id: 'orphan-card',
          sectionId: 'missing-section',
          role: 'module',
          title: 'Orphan',
          points: ['missing parent'],
        },
      ]),
    ).toThrow('references unknown section missing-section')
  })

  it('fails when streamed event ids collide', () => {
    const duplicateEvents: CanvasStoryEvent[] = [
      {
        v: 1,
        type: 'section',
        id: 'engine',
        lane: 'architecture',
        purpose: 'Renderer-free behavior',
        title: 'Engine',
      },
      {
        v: 1,
        type: 'section',
        id: 'engine',
        lane: 'generation',
        purpose: 'Duplicate id',
        title: 'Engine again',
      },
    ]

    expect(() => createCanvasStoryItems(duplicateEvents)).toThrow(
      'Duplicate canvas story event id: engine',
    )
  })
})

function getItemsBounds(items: CanvasItem[]) {
  const x1 = Math.min(...items.map((item) => item.x))
  const y1 = Math.min(...items.map((item) => item.y))
  const x2 = Math.max(...items.map((item) => item.x + item.w))
  const y2 = Math.max(...items.map((item) => item.y + item.h))

  return {
    h: y2 - y1,
    w: x2 - x1,
  }
}
