import type { CanvasStampKind } from '../../../../entities'

export type CanvasStampDefinition = Readonly<{
  label: string
  stamp: CanvasStampKind
  title: string
}>

export const CANVAS_STAMP_DEFINITIONS = Object.freeze([
  Object.freeze({
    label: '+1',
    stamp: 'thumbs-up',
    title: 'Thumbs up',
  }),
  Object.freeze({
    label: '!',
    stamp: 'attention',
    title: 'Attention',
  }),
  Object.freeze({
    label: '?',
    stamp: 'question',
    title: 'Question',
  }),
  Object.freeze({
    label: '✓',
    stamp: 'check',
    title: 'Check',
  }),
  Object.freeze({
    label: '*',
    stamp: 'star',
    title: 'Star',
  }),
] satisfies CanvasStampDefinition[])
