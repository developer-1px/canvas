import {
  defineReactDesignWidget,
} from '@interactive-os/canvas/react-design'

import {
  FIGJAM_SHAPE_DEFAULT_PROPS,
  parseFigJamShapeProps,
  type FigJamShapeProps,
} from './FigJamShapeContract'
import {
  FigJamShape,
  FigJamShapeFallback,
  FigJamShapeInspector,
} from './FigJamShapeViews'

export {
  FIGJAM_SHAPE_COLORS,
  FIGJAM_SHAPE_DEFAULT_PROPS,
  FIGJAM_SHAPE_KINDS,
  FIGJAM_SHAPE_STROKES,
  type FigJamShapeColor,
  type FigJamShapeKind,
  type FigJamShapeProps,
  type FigJamShapeStroke,
} from './FigJamShapeContract'

export const FIGJAM_SHAPE_DEFINITION_ID = 'figjam.shape'

export const FIGJAM_SHAPE_DEFINITION =
  defineReactDesignWidget<FigJamShapeProps>({
    id: FIGJAM_SHAPE_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_SHAPE_DEFAULT_PROPS,
      safeParse: parseFigJamShapeProps,
    },
    create: ({ nodeId, x, y }) => ({
      id: nodeId,
      label: 'Shape',
      definition: {
        id: FIGJAM_SHAPE_DEFINITION_ID,
        kind: 'widget',
      },
      children: [],
      props: FIGJAM_SHAPE_DEFAULT_PROPS,
      text: null,
      layout: {
        x,
        y,
        w: 160,
        h: 120,
        widthMode: 'fixed',
        heightMode: 'fixed',
      },
      style: {},
      frame: null,
      component: null,
    }),
    capabilities: {
      textEdit: false,
      transform: {
        move: true,
        resize: true,
      },
    },
    renderer: FigJamShape,
    fallback: FigJamShapeFallback,
    Inspector: FigJamShapeInspector,
  })
