export type CanvasEmoteDefinition = Readonly<{
  emote: string
  label: string
  title: string
}>

export const CANVAS_EMOTE_DEFINITIONS = Object.freeze([
  Object.freeze({
    emote: 'thumbs-up',
    label: '+1',
    title: 'Thumbs up emote',
  }),
  Object.freeze({
    emote: 'attention',
    label: '!',
    title: 'Attention emote',
  }),
  Object.freeze({
    emote: 'question',
    label: '?',
    title: 'Question emote',
  }),
  Object.freeze({
    emote: 'star',
    label: '*',
    title: 'Star emote',
  }),
] satisfies readonly CanvasEmoteDefinition[])

export const CANVAS_DEFAULT_EMOTE = CANVAS_EMOTE_DEFINITIONS[0]
