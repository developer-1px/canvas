import { createReactDesignWidgetPack } from '@interactive-os/canvas/react-design'

import { FIGJAM_SHAPE_DEFINITION } from './FigJamShapeDefinition'
import { FIGJAM_STICKY_NOTE_DEFINITION } from './FigJamStickyNoteDefinition'

export {
  FIGJAM_SHAPE_COLORS,
  FIGJAM_SHAPE_DEFAULT_PROPS,
  FIGJAM_SHAPE_DEFINITION,
  FIGJAM_SHAPE_DEFINITION_ID,
  FIGJAM_SHAPE_KINDS,
  FIGJAM_SHAPE_STROKES,
  type FigJamShapeColor,
  type FigJamShapeKind,
  type FigJamShapeProps,
  type FigJamShapeStroke,
} from './FigJamShapeDefinition'
export {
  FIGJAM_STICKY_NOTE_DEFAULT_PROPS,
  FIGJAM_STICKY_NOTE_DEFINITION,
  FIGJAM_STICKY_NOTE_DEFINITION_ID,
  FIGJAM_STICKY_NOTE_TONES,
  type FigJamStickyNoteProps,
  type FigJamStickyNoteTone,
} from './FigJamStickyNoteDefinition'

export const FIGJAM_WIDGET_PACK = createReactDesignWidgetPack({
  definitions: [
    FIGJAM_STICKY_NOTE_DEFINITION,
    FIGJAM_SHAPE_DEFINITION,
  ],
})
