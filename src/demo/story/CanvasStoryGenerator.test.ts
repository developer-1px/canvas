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
    expect(itemIds.has('mission-brief')).toBe(true)
    expect(itemIds.has('generated-board')).toBe(true)
    expect(itemIds.has('publish-decision')).toBe(true)
    expect(itemIds.has('unsupported-claim-risk')).toBe(true)
    expect(itemIds.has('quality-guards-publish')).toBe(true)
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

  it('promotes key demo regions into distinct product surfaces', () => {
    const items = createCanvasStoryItems(DEMO_REPO_STORY_EVENTS)
    const byId = new Map(items.map((item) => [item.id, item]))

    expect(byId.get('operating-summary')).toMatchObject({
      component: 'command-center',
      h: 210,
      w: 560,
    })
    expect(byId.get('claim-evidence')).toMatchObject({
      component: 'evidence-map',
      items: [
        'Ticket #8142',
        'Security blocker',
        'linked',
        'AE note',
        'Upsell timing',
        'linked',
        'Call clip',
        'Admin pain',
        'linked',
      ],
    })
    expect(byId.get('review-status')).toMatchObject({
      component: 'review-board',
    })
    expect(byId.get('qa-results')).toMatchObject({
      component: 'gate-strip',
    })
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
        lane: 'intake',
        purpose: 'Renderer-free behavior',
        title: 'Engine',
      },
      {
        v: 1,
        type: 'section',
        id: 'engine',
        lane: 'review',
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
