import {
  createDesignDocument,
  restoreDesignDocument,
  type DesignDocument,
  type DesignDocumentSnapshot,
  type DesignNode,
} from '@interactive-os/canvas/react-design'
import {
  createFigJamBoardNode,
  createFigJamConnectorNode,
  createFigJamDrawingNode,
  createFigJamImageNode,
  createFigJamSectionNode,
  createFigJamShapeNode,
  createFigJamStampNode,
  createFigJamStickyNoteNode,
  createFigJamTextNode,
} from '@interactive-os/figjam-pack'

export const FIGJAM_BOARD_NODE_ID = 'figjam-board'

const FIGJAM_IMAGE_SOURCE = [
  'data:image/svg+xml;base64,',
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAi',
  'IGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjQwIDE1MCI+PHJlY3Qgd2lkdGg9',
  'IjI0MCIgaGVpZ2h0PSIxNTAiIHJ4PSIxNiIgZmlsbD0iI2VlZjJmNyIvPjxyZWN0',
  'IHg9IjIyIiB5PSIyMiIgd2lkdGg9IjE5NiIgaGVpZ2h0PSIxMDYiIHJ4PSIxMCIg',
  'ZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjIi',
  'Lz48Y2lyY2xlIGN4PSI1OCIgY3k9IjU4IiByPSIxNiIgZmlsbD0iIzM4YmRmOCIv',
  'PjxwYXRoIGQ9Ik0zOCAxMTIgTDkyIDc4IEwxMjYgMTAyIEwxNjAgNzAgTDIwNiAx',
  'MTIgWiIgZmlsbD0iIzY0NzQ4YiIgb3BhY2l0eT0iMC44NSIvPjwvc3ZnPg==',
].join('')

const section = createFigJamSectionNode({
  height: 510,
  label: 'Canvas affordance loop',
  nodeId: 'figjam-section',
  width: 878,
  x: 72,
  y: 72,
})
const rectangle = createFigJamShapeNode({
  fill: 'blue',
  height: 104,
  nodeId: 'figjam-shape',
  shape: 'rectangle',
  stroke: 'ink',
  text: 'Shape',
  width: 148,
  x: 126,
  y: 344,
})
const sticky = createFigJamStickyNoteNode({
  height: 132,
  nodeId: 'figjam-sticky',
  text: 'Post-it',
  tone: 'yellow',
  width: 164,
  x: 126,
  y: 142,
})
const stickyNext = createFigJamStickyNoteNode({
  height: 132,
  nodeId: 'figjam-sticky-next',
  text: 'Quick create',
  tone: 'green',
  width: 164,
  x: 360,
  y: 142,
})
const stickyNote = createFigJamStickyNoteNode({
  height: 132,
  nodeId: 'figjam-sticky-note',
  text: 'Note',
  tone: 'blue',
  width: 164,
  x: 594,
  y: 142,
})
const ellipse = createFigJamShapeNode({
  fill: 'jade',
  height: 104,
  nodeId: 'figjam-ellipse',
  shape: 'ellipse',
  stroke: 'jade',
  text: 'Variant',
  width: 148,
  x: 328,
  y: 344,
})
const diamond = createFigJamShapeNode({
  fill: 'coral',
  height: 104,
  nodeId: 'figjam-diamond',
  shape: 'diamond',
  stroke: 'coral',
  text: 'Decision',
  width: 148,
  x: 530,
  y: 344,
})
const text = createFigJamTextNode({
  height: 72,
  nodeId: 'figjam-text',
  text: 'Text editing',
  width: 164,
  x: 762,
  y: 148,
})
const connector = createFigJamConnectorNode({
  end: {
    anchor: 'left',
    attachedNodeId: stickyNext.id,
    point: { x: 360, y: 208 },
  },
  height: 32,
  nodeId: 'figjam-connector',
  routing: 'elbow',
  start: {
    anchor: 'right',
    attachedNodeId: sticky.id,
    point: { x: 290, y: 208 },
  },
  text: 'Flow',
  width: 70,
  x: 290,
  y: 192,
})
const connectorNote = createFigJamConnectorNode({
  end: {
    anchor: 'left',
    attachedNodeId: stickyNote.id,
    point: { x: 594, y: 208 },
  },
  height: 32,
  nodeId: 'figjam-connector-note',
  routing: 'straight',
  start: {
    anchor: 'right',
    attachedNodeId: stickyNext.id,
    point: { x: 524, y: 208 },
  },
  width: 70,
  x: 524,
  y: 192,
})
const marker = createFigJamDrawingNode({
  geometry: {
    kind: 'points',
    points: [
      { x: 0, y: 52 },
      { x: 92, y: 0 },
      { x: 188, y: 52 },
      { x: 284, y: 0 },
      { x: 404, y: 42 },
    ],
  },
  height: 74,
  nodeId: 'figjam-drawing',
  variant: 'marker',
  width: 404,
  x: 126,
  y: 468,
})
const highlight = createFigJamDrawingNode({
  geometry: {
    kind: 'points',
    points: [
      { x: 0, y: 35 },
      { x: 124, y: 9 },
      { x: 250, y: 33 },
      { x: 386, y: 9 },
    ],
  },
  height: 54,
  nodeId: 'figjam-highlight',
  variant: 'highlight',
  width: 386,
  x: 126,
  y: 459,
})
const image = createFigJamImageNode({
  alt: 'Canvas image object',
  height: 110,
  mimeType: 'image/svg+xml',
  name: 'asset.svg',
  naturalHeight: 150,
  naturalWidth: 240,
  nodeId: 'figjam-image',
  src: FIGJAM_IMAGE_SOURCE,
  width: 176,
  x: 748,
  y: 336,
})
const stampYes = createFigJamStampNode({
  height: 32,
  label: '+1',
  nodeId: 'figjam-stamp-yes',
  stamp: 'thumbs-up',
  width: 32,
  x: 732,
  y: 124,
})
const stampQuestion = createFigJamStampNode({
  height: 32,
  label: '?',
  nodeId: 'figjam-stamp-question',
  stamp: 'question',
  width: 32,
  x: 770,
  y: 124,
})

const boardChildren = [
  section,
  rectangle,
  sticky,
  stickyNext,
  stickyNote,
  ellipse,
  diamond,
  text,
  connector,
  connectorNote,
  marker,
  highlight,
  image,
  stampYes,
  stampQuestion,
] as const

const board = withChildren(
  createFigJamBoardNode({
    height: 720,
    nodeId: FIGJAM_BOARD_NODE_ID,
    width: 1100,
    x: 0,
    y: 0,
  }),
  boardChildren.map(({ id }) => id),
)

export const FIGJAM_DESIGN_DOCUMENT_SNAPSHOT = deepFreeze({
  schemaVersion: 1,
  roots: [FIGJAM_BOARD_NODE_ID],
  nodes: [board, ...boardChildren],
} satisfies DesignDocumentSnapshot)

export function createFigJamDesignDocument(): DesignDocument {
  return createDesignDocument(FIGJAM_DESIGN_DOCUMENT_SNAPSHOT)
}

export function restoreFigJamDesignDocument(
  serialized: string | null | undefined,
): DesignDocument {
  if (!serialized) {
    return createFigJamDesignDocument()
  }

  try {
    return restoreDesignDocument(serialized)
  } catch {
    return createFigJamDesignDocument()
  }
}

function withChildren(
  node: DesignNode,
  children: readonly string[],
): DesignNode {
  return { ...node, children }
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}
