import type {
  CanvasItem,
  CanvasComponentKind,
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
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

type InsertCanvasComponentArgs = {
  component: CanvasComponentKind
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
  setTool: (nextTool: Tool) => void
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

type QuickCreateCanvasStickyArgs = {
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
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

const CANVAS_COMPONENT_INSERTION_FALLBACK_POINT = {
  x: 120,
  y: 120,
}

const CANVAS_STICKY_QUICK_CREATE_GAP = 24

export function insertCanvasComponent({
  component,
  componentLibrary,
  commitItemsChange,
  createId,
  selection,
  setEditing,
  setTool,
  stageElement,
  viewport,
}: InsertCanvasComponentArgs) {
  const point =
    stageElement.getViewportCenter(viewport) ??
    CANVAS_COMPONENT_INSERTION_FALLBACK_POINT
  const nextItem = componentLibrary.createItem({
    id: createId('component'),
    point,
    templateId: component,
  })

  commitItemsChange({ type: 'add', items: [nextItem] }, {
    before: selection,
    after: [nextItem.id],
  })
  setEditing(null)
  setTool('select')
}

export function quickCreateCanvasSticky({
  componentLibrary,
  commitItemsChange,
  creationAdapter,
  createId,
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
  const item = applyCanvasStickyComponentCreationDefaults(
    componentLibrary.createItem({
      id: createId('component'),
      point: {
        x: sourceBounds.x + sourceBounds.w + CANVAS_STICKY_QUICK_CREATE_GAP,
        y: sourceBounds.y,
      },
      templateId: CANVAS_STICKY_COMPONENT_KIND,
    }),
  )
  const connector = createCanvasStickyQuickCreateConnector({
    creationAdapter,
    createId,
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

export function getCanvasStickyQuickCreateControlPoint({
  itemReadModel,
  selection,
  viewport,
}: CanvasStickyQuickCreateControlPointInput): Point | null {
  const source = getCanvasStickyQuickCreateSource({
    itemReadModel,
    selection,
  })

  if (!source) {
    return null
  }

  const bounds = itemReadModel.getItemBounds(source)

  return {
    x: viewport.x + (
      bounds.x + bounds.w + CANVAS_STICKY_QUICK_CREATE_GAP / 2
    ) * viewport.scale,
    y: viewport.y + (bounds.y + bounds.h / 2) * viewport.scale,
  }
}

export function getCanvasStickyQuickCreateSource({
  itemReadModel,
  selection,
}: {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
}) {
  const stickyItems = itemReadModel
    .getSelectedItems(selection)
    .filter(isCanvasStickyComponentItem)

  return stickyItems.length === 1 ? stickyItems[0] : null
}

function createCanvasStickyQuickCreateConnector({
  creationAdapter,
  createId,
  sourceBounds,
  sourceId,
  targetBounds,
  targetId,
}: {
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  sourceBounds: { h: number; w: number; x: number; y: number }
  sourceId: string
  targetBounds: { h: number; x: number; y: number }
  targetId: string
}) {
  return createCanvasArrow({
    adapter: creationAdapter,
    createId,
    currentWorld: {
      x: targetBounds.x,
      y: targetBounds.y + targetBounds.h / 2,
    },
    endAttachedTo: targetId,
    startAttachedTo: sourceId,
    startWorld: {
      x: sourceBounds.x + sourceBounds.w,
      y: sourceBounds.y + sourceBounds.h / 2,
    },
  })
}
