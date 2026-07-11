import type {
  DesignDocumentRead,
  DesignNode,
} from '@interactive-os/canvas/react-design'

import { isFiniteNumber } from './FigJamWidgetPrimitives'

export type FigJamNodeWorldBounds = {
  readonly height: number
  readonly width: number
  readonly x: number
  readonly y: number
}

export type FigJamNodeAnchor =
  | 'bottom'
  | 'center'
  | 'left'
  | 'right'
  | 'top'

export function getFigJamNodeWorldBounds(
  read: DesignDocumentRead,
  nodeId: string,
): FigJamNodeWorldBounds | null {
  const node = read.node(nodeId)

  if (!node) {
    return null
  }

  const ancestry = read.ancestry(nodeId)
  let x = 0
  let y = 0

  for (const ancestor of ancestry) {
    const offset = getFigJamNodeOffset(ancestor)
    x += offset.x
    y += offset.y
  }

  return {
    height: readNodeSize(node, 'height'),
    width: readNodeSize(node, 'width'),
    x,
    y,
  }
}

export function getFigJamNodeAnchorPoint(
  bounds: FigJamNodeWorldBounds,
  anchor: FigJamNodeAnchor,
) {
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }

  switch (anchor) {
    case 'top':
      return { x: center.x, y: bounds.y }
    case 'right':
      return { x: bounds.x + bounds.width, y: center.y }
    case 'bottom':
      return { x: center.x, y: bounds.y + bounds.height }
    case 'left':
      return { x: bounds.x, y: center.y }
    case 'center':
      return center
  }
}

function getFigJamNodeOffset(node: DesignNode) {
  if (node.frame) {
    return { x: node.frame.x, y: node.frame.y }
  }

  return {
    x: readFiniteLayoutNumber(node.layout.x),
    y: readFiniteLayoutNumber(node.layout.y),
  }
}

function readNodeSize(node: DesignNode, axis: 'height' | 'width') {
  if (node.frame) {
    return axis === 'width' ? node.frame.width : node.frame.height
  }

  return readFiniteLayoutNumber(axis === 'width' ? node.layout.w : node.layout.h)
}

function readFiniteLayoutNumber(value: unknown) {
  return isFiniteNumber(value) ? value : 0
}
