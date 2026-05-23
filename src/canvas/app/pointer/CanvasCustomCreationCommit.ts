import type {
  CanvasCustomItem,
  CanvasCustomToolId,
  Point,
} from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import { getCanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationToolRuntime'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'

export type CanvasCustomCreationCommitInput = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  currentWorld: Point
  moved: boolean
  selection: string[]
  startWorld: Point
  tool: CanvasCustomToolId
}

export function commitCanvasCustomCreation({
  commitItemsChange,
  createId,
  customCreationTools,
  currentWorld,
  moved,
  selection,
  startWorld,
  tool,
}: CanvasCustomCreationCommitInput) {
  const customTool = getCanvasAppCustomCreationTool(
    customCreationTools,
    tool,
  )

  if (!customTool) {
    return false
  }

  try {
    const nextItem = customTool.createItem({
      createId,
      currentWorld,
      moved,
      startWorld,
    })

    return nextItem && isCanvasCustomCreationItem(nextItem)
      ? commitCanvasCustomItem({
          commitItemsChange,
          item: nextItem,
          selection,
        })
      : false
  } catch {
    // External creation tools must not strand the pointer lifecycle.
    return false
  }
}

function commitCanvasCustomItem({
  commitItemsChange,
  item,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  item: CanvasCustomItem
  selection: string[]
}) {
  return commitItemsChange({ type: 'add', items: [item] }, {
    before: selection,
    after: [item.id],
  })
}

function isCanvasCustomCreationItem(item: unknown): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom'
  )
}
