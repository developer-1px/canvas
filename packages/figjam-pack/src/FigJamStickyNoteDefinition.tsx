import {
  defineReactDesignWidget,
} from '@interactive-os/canvas/react-design'

import {
  FigJamStickyNote,
  FigJamStickyNoteFallback,
} from './FigJamStickyNoteViews'

export const FIGJAM_STICKY_NOTE_DEFINITION_ID = 'figjam.sticky-note'

export const FIGJAM_STICKY_NOTE_TONES = [
  'yellow',
  'pink',
  'blue',
  'green',
] as const

export type FigJamStickyNoteTone =
  typeof FIGJAM_STICKY_NOTE_TONES[number]

export type FigJamStickyNoteProps = {
  readonly position: 'absolute'
  readonly tone: FigJamStickyNoteTone
}

export const FIGJAM_STICKY_NOTE_DEFAULT_PROPS = Object.freeze({
  position: 'absolute',
  tone: 'yellow',
} as const satisfies FigJamStickyNoteProps)

export const FIGJAM_STICKY_NOTE_DEFINITION =
  defineReactDesignWidget<FigJamStickyNoteProps>({
    id: FIGJAM_STICKY_NOTE_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_STICKY_NOTE_DEFAULT_PROPS,
      safeParse: parseFigJamStickyNoteProps,
    },
    create: ({ nodeId, x, y }) => ({
      id: nodeId,
      label: 'Sticky note',
      definition: {
        id: FIGJAM_STICKY_NOTE_DEFINITION_ID,
        kind: 'widget',
      },
      children: [],
      props: FIGJAM_STICKY_NOTE_DEFAULT_PROPS,
      text: 'Write something…',
      layout: {
        x,
        y,
        w: 180,
        h: 140,
        widthMode: 'fixed',
        heightMode: 'fixed',
      },
      style: {},
      frame: null,
      component: null,
    }),
    capabilities: {
      textEdit: {
        source: 'node-text',
        multiline: true,
      },
      transform: {
        move: true,
        resize: true,
      },
    },
    renderer: FigJamStickyNote,
    fallback: FigJamStickyNoteFallback,
  })

function parseFigJamStickyNoteProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isStickyNoteTone(value.tone)
  ) {
    return {
      ok: true as const,
      value: {
        position: value.position,
        tone: value.tone,
      } satisfies FigJamStickyNoteProps,
    }
  }

  return {
    ok: false as const,
    reason: 'Sticky note props require absolute position and a supported tone',
  }
}

function isStickyNoteTone(value: unknown): value is FigJamStickyNoteTone {
  return typeof value === 'string' &&
    (FIGJAM_STICKY_NOTE_TONES as readonly string[]).includes(value)
}

function isJSONObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
