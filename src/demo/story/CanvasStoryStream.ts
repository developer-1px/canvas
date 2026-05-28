import {
  parseCanvasStoryEvent,
  type CanvasStoryEvent,
} from './CanvasStoryEvents'

export const CANVAS_STORY_SSE_DELTA_EVENT = 'canvas.story.delta'
export const CANVAS_STORY_SSE_DONE_EVENT = 'canvas.story.done'

export function encodeCanvasStorySseDelta(event: CanvasStoryEvent) {
  const parsed = parseCanvasStoryEvent(event)

  return [
    `event: ${CANVAS_STORY_SSE_DELTA_EVENT}`,
    `data: ${JSON.stringify(parsed)}`,
    '',
    '',
  ].join('\n')
}

export function encodeCanvasStorySseDone() {
  return [
    `event: ${CANVAS_STORY_SSE_DONE_EVENT}`,
    'data: {"ok":true}',
    '',
    '',
  ].join('\n')
}

export function encodeCanvasStorySseStream(
  events: readonly CanvasStoryEvent[],
) {
  return [
    ...events.map(encodeCanvasStorySseDelta),
    encodeCanvasStorySseDone(),
  ].join('')
}

export function parseCanvasStorySseData(data: string) {
  return parseCanvasStoryEvent(JSON.parse(data))
}
