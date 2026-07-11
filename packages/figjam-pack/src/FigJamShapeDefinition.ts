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
import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  type FigJamPlacementInput,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

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

export type CreateFigJamShapeNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly fill?: FigJamShapeProps['fill']
    readonly shape?: FigJamShapeProps['shape']
    readonly stroke?: FigJamShapeProps['stroke']
    readonly text?: string
  }

export const FIGJAM_SHAPE_DEFINITION =
  defineReactDesignWidget<FigJamShapeProps>({
    id: FIGJAM_SHAPE_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_SHAPE_DEFAULT_PROPS,
      safeParse: parseFigJamShapeProps,
    },
    create: ({ nodeId, x, y }) => createFigJamShapeNode({ nodeId, x, y }),
    capabilities: {
      textEdit: { source: 'node-text', multiline: true },
      transform: {
        move: true,
        resize: true,
      },
    },
    renderer: FigJamShape,
    fallback: FigJamShapeFallback,
    Inspector: FigJamShapeInspector,
  })

export function createFigJamShapeNode({
  fill = FIGJAM_SHAPE_DEFAULT_PROPS.fill,
  height = 120,
  nodeId,
  shape = FIGJAM_SHAPE_DEFAULT_PROPS.shape,
  stroke = FIGJAM_SHAPE_DEFAULT_PROPS.stroke,
  text = 'Shape',
  width = 160,
  x,
  y,
}: CreateFigJamShapeNodeInput) {
  const parsed = parseFigJamShapeProps({
    fill,
    position: 'absolute',
    shape,
    stroke,
  })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_SHAPE_DEFINITION_ID,
    height,
    label: 'Shape',
    nodeId,
    props: cloneDesignProps(parsed.value),
    text,
    width,
    x,
    y,
  })
}
