import type {
  CanvasItem,
  CanvasSide,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import {
  createCanvasArrow,
  type CanvasCreationAdapter,
} from '../../engine'
import {
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
  isCanvasStickyComponentItem,
} from '../../host'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

type QuickCreateCanvasStickyArgs = {
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  direction?: CanvasSide
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
  setTool: (nextTool: Tool) => void
}

export type CanvasStickyQuickCreateControlPointInput = {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  viewport: Viewport
}

export type CanvasStickyQuickCreateControlPoint = Point & {
  direction: CanvasSide
}

const CANVAS_STICKY_QUICK_CREATE_GAP = 24
const CANVAS_STICKY_QUICK_CREATE_DIRECTIONS = [
  'right',
  'bottom',
  'left',
  'top',
] as const satisfies readonly CanvasSide[]

export function quickCreateCanvasSticky({
  componentLibrary,
  commitItemsChange,
  creationAdapter,
  createId,
  direction = 'right',
  itemReadModel,
  selection,
  setEditing,
  setTool,
}: QuickCreateCanvasStickyArgs) {
  const source = getCanvasStickyQuickCreateSource({
    itemReadModel,
    selection,
  })

  if (!source) {
    return false
  }

  const sourceBounds = itemReadModel.getItemBounds(source)
  const template = componentLibrary.getTemplate(CANVAS_STICKY_COMPONENT_KIND)
  const item = applyCanvasStickyComponentCreationDefaults(
    componentLibrary.createItem({
      id: createId('component'),
      point: getCanvasStickyQuickCreateTargetPoint({
        direction,
        sourceBounds,
        targetSize: template,
      }),
      templateId: CANVAS_STICKY_COMPONENT_KIND,
    }),
  )
  const connector = createCanvasStickyQuickCreateConnector({
    creationAdapter,
    createId,
    direction,
    sourceId: source.id,
    sourceBounds,
    targetId: item.id,
    targetBounds: item,
  })
  const didCommit = commitItemsChange({ type: 'add', items: [connector, item] }, {
    before: selection,
    after: [item.id],
  })

  if (!didCommit) {
    return false
  }

  setEditing({ id: item.id, value: item.body ?? '' })
  setTool('select')

  return true
}

export function getCanvasStickyQuickCreateControlPoints({
  itemReadModel,
  selection,
  viewport,
}: CanvasStickyQuickCreateControlPointInput): readonly CanvasStickyQuickCreateControlPoint[] {
  const source = getCanvasStickyQuickCreateSource({
    itemReadModel,
    selection,
  })

  if (!source) {
    return []
  }

  const bounds = itemReadModel.getItemBounds(source)

  return CANVAS_STICKY_QUICK_CREATE_DIRECTIONS.map((direction) =>
    getCanvasStickyQuickCreateControlPoint({
      bounds,
      direction,
      viewport,
    }),
  )
}

export function getCanvasStickyQuickCreateSource({
  itemReadModel,
  selection,
}: {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
}) {
  if (selection.length !== 1) {
    return null
  }

  const [item] = itemReadModel.getSelectedItems(selection)

  return item && isCanvasStickyComponentItem(item) ? item : null
}

function createCanvasStickyQuickCreateConnector({
  creationAdapter,
  createId,
  direction,
  sourceBounds,
  sourceId,
  targetBounds,
  targetId,
}: {
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  direction: CanvasSide
  sourceBounds: { h: number; w: number; x: number; y: number }
  sourceId: string
  targetBounds: { h: number; w: number; x: number; y: number }
  targetId: string
}) {
  return createCanvasArrow({
    adapter: creationAdapter,
    createId,
    currentWorld: getCanvasStickyQuickCreateTargetAnchor({
      direction,
      targetBounds,
    }),
    endAttachedTo: targetId,
    startAttachedTo: sourceId,
    startWorld: getCanvasStickyQuickCreateSourceAnchor({
      direction,
      sourceBounds,
    }),
  })
}

function getCanvasStickyQuickCreateControlPoint({
  bounds,
  direction,
  viewport,
}: {
  bounds: { h: number; w: number; x: number; y: number }
  direction: CanvasSide
  viewport: Viewport
}): CanvasStickyQuickCreateControlPoint {
  const worldPoint = getCanvasStickyQuickCreateControlWorldPoint({
    bounds,
    direction,
  })

  return {
    direction,
    x: viewport.x + worldPoint.x * viewport.scale,
    y: viewport.y + worldPoint.y * viewport.scale,
  }
}

function getCanvasStickyQuickCreateControlWorldPoint({
  bounds,
  direction,
}: {
  bounds: { h: number; w: number; x: number; y: number }
  direction: CanvasSide
}): Point {
  const centerX = bounds.x + bounds.w / 2
  const centerY = bounds.y + bounds.h / 2
  const gap = CANVAS_STICKY_QUICK_CREATE_GAP / 2

  if (direction === 'left') {
    return { x: bounds.x - gap, y: centerY }
  }

  if (direction === 'right') {
    return { x: bounds.x + bounds.w + gap, y: centerY }
  }

  if (direction === 'top') {
    return { x: centerX, y: bounds.y - gap }
  }

  return { x: centerX, y: bounds.y + bounds.h + gap }
}

function getCanvasStickyQuickCreateTargetPoint({
  direction,
  sourceBounds,
  targetSize,
}: {
  direction: CanvasSide
  sourceBounds: { h: number; w: number; x: number; y: number }
  targetSize: { h: number; w: number }
}): Point {
  if (direction === 'left') {
    return {
      x: sourceBounds.x - targetSize.w - CANVAS_STICKY_QUICK_CREATE_GAP,
      y: sourceBounds.y,
    }
  }

  if (direction === 'right') {
    return {
      x: sourceBounds.x + sourceBounds.w + CANVAS_STICKY_QUICK_CREATE_GAP,
      y: sourceBounds.y,
    }
  }

  if (direction === 'top') {
    return {
      x: sourceBounds.x,
      y: sourceBounds.y - targetSize.h - CANVAS_STICKY_QUICK_CREATE_GAP,
    }
  }

  return {
    x: sourceBounds.x,
    y: sourceBounds.y + sourceBounds.h + CANVAS_STICKY_QUICK_CREATE_GAP,
  }
}

function getCanvasStickyQuickCreateSourceAnchor({
  direction,
  sourceBounds,
}: {
  direction: CanvasSide
  sourceBounds: { h: number; w: number; x: number; y: number }
}): Point {
  const centerX = sourceBounds.x + sourceBounds.w / 2
  const centerY = sourceBounds.y + sourceBounds.h / 2

  if (direction === 'left') {
    return { x: sourceBounds.x, y: centerY }
  }

  if (direction === 'right') {
    return { x: sourceBounds.x + sourceBounds.w, y: centerY }
  }

  if (direction === 'top') {
    return { x: centerX, y: sourceBounds.y }
  }

  return { x: centerX, y: sourceBounds.y + sourceBounds.h }
}

function getCanvasStickyQuickCreateTargetAnchor({
  direction,
  targetBounds,
}: {
  direction: CanvasSide
  targetBounds: { h: number; w: number; x: number; y: number }
}): Point {
  const centerX = targetBounds.x + targetBounds.w / 2
  const centerY = targetBounds.y + targetBounds.h / 2

  if (direction === 'left') {
    return { x: targetBounds.x + targetBounds.w, y: centerY }
  }

  if (direction === 'right') {
    return { x: targetBounds.x, y: centerY }
  }

  if (direction === 'top') {
    return { x: centerX, y: targetBounds.y + targetBounds.h }
  }

  return { x: centerX, y: targetBounds.y }
}
