import type {
  CanvasComponentItem,
  CanvasItem,
  CanvasSide,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../../entities'
import {
  createCanvasArrow,
  type CanvasCreationAdapter,
} from '../../../engine'
import {
  getCanvasViewportScreenPoint,
} from '../../../core'
import {
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
  isCanvasStickyComponentItem,
} from '../../../host'
import {
  CANVAS_STICKY_QUICK_CREATE_DIRECTIONS,
  getCanvasStickyQuickCreateAvailableTargetPoint,
  getCanvasStickyQuickCreateControlWorldPoint,
  getCanvasStickyQuickCreateSourceAnchor,
  getCanvasStickyQuickCreateTargetAnchor,
} from './CanvasStickyQuickCreateGeometry'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'

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
  const targetSize = { h: source.h, w: source.w }
  const targetPoint = getCanvasStickyQuickCreateAvailableTargetPoint({
    direction,
    itemReadModel,
    sourceBounds,
    sourceId: source.id,
    targetSize,
  })
  const item = applyCanvasStickyQuickCreateSourceStyle(
    applyCanvasStickyComponentCreationDefaults(
      componentLibrary.createItem({
        id: createId('component'),
        point: targetPoint,
        templateId: CANVAS_STICKY_COMPONENT_KIND,
      }),
    ),
    source,
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

function applyCanvasStickyQuickCreateSourceStyle(
  item: CanvasComponentItem,
  source: CanvasComponentItem,
): CanvasComponentItem {
  if (!isCanvasStickyComponentItem(item) || !isCanvasStickyComponentItem(source)) {
    return item
  }

  return {
    ...item,
    accent: source.accent,
    fill: source.fill,
    h: source.h,
    stroke: source.stroke,
    w: source.w,
  }
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
  const screenPoint = getCanvasViewportScreenPoint(viewport, worldPoint)

  return {
    direction,
    x: screenPoint.x,
    y: screenPoint.y,
  }
}
