import type {
  Bounds,
  CanvasCustomToolId,
  CanvasArrowEndpoint,
  CanvasItem,
  CanvasShapeKind,
  EditingText,
  Point,
  ResizeHandle,
  Viewport
} from '../../../../entities'
import type { CanvasDrawingStrokeStyle } from '../../../../host'

export type Interaction =
  | { kind: 'none' }
  | {
      kind: 'pan'
      pointerId: number
      startScreen: Point
      origin: Viewport
    }
  | {
      kind: 'move'
      pointerId: number
      startScreen: Point
      startWorld: Point
      ids: string[]
      bounds: Bounds | null
      clickSelection?: string[]
      duplicateOnDrag?: boolean
      historySelection: string[]
      startItems: CanvasItem[]
      currentItems: CanvasItem[]
      historyItems: CanvasItem[]
      edit?: EditingText
      moved: boolean
    }
  | {
      kind: 'marquee'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      additive: boolean
      baseSelection: string[]
      moved: boolean
    }
  | {
      kind: 'create-section'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      moved: boolean
    }
  | {
      kind: 'create-shape'
      pointerId: number
      shapeType: CanvasShapeKind
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      preserveAspectRatio?: boolean
      resizeFromCenter?: boolean
      moved: boolean
    }
  | {
      kind: 'draw-marker'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      style: CanvasDrawingStrokeStyle
      moved: boolean
    }
  | {
      kind: 'draw-highlight'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      style: CanvasDrawingStrokeStyle
      moved: boolean
    }
  | {
      kind: 'draw-path'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      style: CanvasDrawingStrokeStyle
      moved: boolean
    }
  | {
      kind: 'erase'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      erasedIds: string[]
      points: Point[]
      moved: boolean
    }
  | {
      kind: 'laser'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      moved: boolean
    }
  | {
      kind: 'create-arrow'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      constrainAngle?: boolean
      endAttachedTo?: string
      startAttachedTo?: string
      moved: boolean
    }
  | {
      kind: 'create-custom'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      tool: CanvasCustomToolId
      moved: boolean
    }
  | {
      kind: 'arrow-endpoint'
      pointerId: number
      arrowId: string
      endpoint: CanvasArrowEndpoint
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      startItems: CanvasItem[]
      currentItems: CanvasItem[]
      historyItems: CanvasItem[]
      moved: boolean
    }
  | {
      kind: 'resize'
      pointerId: number
      handle: ResizeHandle
      startScreen: Point
      startWorld: Point
      ids: string[]
      bounds: Bounds
      startItems: CanvasItem[]
      currentItems: CanvasItem[]
      historyItems: CanvasItem[]
      moved: boolean
    }
