import { describe, expect, it } from 'vitest'
import {
  CANVAS_STORY_EVENT_BATCH_JSON_SCHEMA,
  CANVAS_STORY_EVENT_JSON_SCHEMA,
  parseCanvasStoryEvent,
} from './CanvasStoryEvents'
import {
  CANVAS_STORY_SSE_DELTA_EVENT,
  encodeCanvasStorySseDelta,
  parseCanvasStorySseData,
} from './CanvasStoryStream'

describe('CanvasStoryEvents', () => {
  it('parses a small LLM-friendly domain event', () => {
    expect(
      parseCanvasStoryEvent({
        v: 1,
        type: 'card',
        id: 'account-context',
        sectionId: 'mission-brief',
        role: 'module',
        title: 'Account context',
        points: ['Tier-1 bank', 'EMEA rollout'],
      }),
    ).toMatchObject({
      id: 'account-context',
      type: 'card',
    })
  })

  it('rejects canvas geometry leaking into the LLM event contract', () => {
    expect(() =>
      parseCanvasStoryEvent({
        v: 1,
        type: 'section',
        id: 'mission-brief',
        lane: 'intake',
        purpose: 'Enterprise onboarding workspace',
        title: 'Mission Brief',
        x: 100,
      }),
    ).toThrow()
  })

  it('exports JSON Schema for single events and event batches', () => {
    const eventSchema = CANVAS_STORY_EVENT_JSON_SCHEMA as {
      oneOf?: unknown[]
    }
    const batchSchema = CANVAS_STORY_EVENT_BATCH_JSON_SCHEMA as {
      properties?: Record<string, unknown>
    }

    expect(eventSchema.oneOf?.length).toBeGreaterThan(1)
    expect(batchSchema.properties?.events).toBeTypeOf('object')
  })

  it('encodes each event as one SSE delta payload', () => {
    const event = parseCanvasStoryEvent({
      v: 1,
      type: 'section',
      id: 'mission-brief',
      lane: 'intake',
      purpose: 'Enterprise onboarding workspace',
      title: 'Mission Brief',
    })
    const sse = encodeCanvasStorySseDelta(event)
    const data = sse
      .split('\n')
      .find((line) => line.startsWith('data: '))
      ?.slice('data: '.length)

    expect(sse).toContain(`event: ${CANVAS_STORY_SSE_DELTA_EVENT}`)
    expect(data).toBeTypeOf('string')
    expect(parseCanvasStorySseData(data ?? '')).toEqual(event)
  })
})
