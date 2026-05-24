import type {
  CanvasComponentKind,
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
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
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
  setTool: (nextTool: Tool) => void
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
  const didCommit = commitItemsChange({ type: 'add', items: [item] }, {
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

function getCanvasStickyQuickCreateSource({
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
