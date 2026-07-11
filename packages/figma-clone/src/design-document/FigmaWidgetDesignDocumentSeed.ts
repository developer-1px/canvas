import type { DesignNode } from '../../../../src/canvas/design-document'
import {
  createFigmaDesignNodeLayout,
  createFigmaDesignNodeStyle,
  type FigmaDesignNodeState,
} from './FigmaDesignDocumentSeedTypes'

export const FIGMA_WIDGET_NODE_ID = 'figmaWidget'
export const FIGMA_WIDGET_DEFINITION_ID = 'figma-clone-react-widget'

export type FigmaWidgetDesignNodeId = typeof FIGMA_WIDGET_NODE_ID
export type FigmaWidgetDefinitionId = typeof FIGMA_WIDGET_DEFINITION_ID

const WIDGET_STATE = {
  align: 'stretch',
  alignSelf: 'auto',
  direction: 'column',
  distribution: 'packed',
  gap: 14,
  h: 176,
  heightMode: 'fixed',
  margin: 0,
  opacity: 100,
  order: 0,
  padding: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  paddingRight: 18,
  paddingTop: 18,
  radius: 12,
  rotation: 0,
  w: 280,
  widthMode: 'fixed',
  x: 0,
  y: 0,
} as const satisfies FigmaDesignNodeState

export const FIGMA_WIDGET_DESIGN_DOCUMENT_NODE = {
  id: FIGMA_WIDGET_NODE_ID,
  label: 'React widget',
  definition: {
    kind: 'widget',
    id: FIGMA_WIDGET_DEFINITION_ID,
  },
  children: [],
  props: {
    delta: '+12.4%',
    label: 'Activation',
    value: '84.2',
  },
  text: null,
  layout: createFigmaDesignNodeLayout(WIDGET_STATE),
  style: createFigmaDesignNodeStyle(WIDGET_STATE),
  frame: {
    x: -360,
    y: 128,
    width: 280,
    height: 176,
    rotation: 0,
    widthMode: 'fixed',
    heightMode: 'fixed',
    overflow: 'visible',
  },
  component: null,
} as const satisfies DesignNode
