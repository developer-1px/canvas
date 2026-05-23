import type {
  CanvasItem,
  Tool,
} from '../../entities'
import {
  createCanvasArrow,
  createCanvasHighlight,
  createCanvasMarker,
  createCanvasRect,
  type CanvasCreationAdapter,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import { commitCanvasCustomCreation } from './CanvasCustomCreationCommit'
import type { Interaction } from './CanvasInteractionState'

type CanvasPointerCreationInteraction = Extract<
  Interaction,
  | { kind: 'create-arrow' }
  | { kind: 'create-custom' }
  | { kind: 'create-rect' }
  | { kind: 'draw-highlight' }
  | { kind: 'draw-marker' }
>

export type CanvasPointerCreationCommitInput = {
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: CanvasPointerCreationInteraction
  selection: string[]
  setTool: (tool: Tool) => void
}

export function commitCanvasPointerCreation({
  commitItemsChange,
  creationAdapter,
  createId,
  customCreationTools,
  interaction,
  selection,
  setTool,
}: CanvasPointerCreationCommitInput) {
  if (interaction.kind === 'create-rect') {
    const nextItem = createCanvasRect({
      adapter: creationAdapter,
      createId,
      currentWorld: interaction.currentWorld,
      startWorld: interaction.startWorld,
    })

    commitCanvasCreatedItem({ commitItemsChange, item: nextItem, selection })
    setTool('select')
    return
  }

  if (interaction.kind === 'draw-marker') {
    const nextItem = createCanvasMarker({
      adapter: creationAdapter,
      createId,
      points: interaction.points,
      startWorld: interaction.startWorld,
    })

    commitCanvasCreatedItem({ commitItemsChange, item: nextItem, selection })
    return
  }

  if (interaction.kind === 'draw-highlight') {
    const nextItem = createCanvasHighlight({
      adapter: creationAdapter,
      createId,
      points: interaction.points,
      startWorld: interaction.startWorld,
    })

    commitCanvasCreatedItem({ commitItemsChange, item: nextItem, selection })
    return
  }

  if (interaction.kind === 'create-arrow') {
    const nextItem = createCanvasArrow({
      adapter: creationAdapter,
      createId,
      currentWorld: interaction.currentWorld,
      startWorld: interaction.startWorld,
    })

    commitCanvasCreatedItem({ commitItemsChange, item: nextItem, selection })
    return
  }

  commitCanvasCustomCreation({
    commitItemsChange,
    createId,
    customCreationTools,
    currentWorld: interaction.currentWorld,
    moved: interaction.moved,
    selection,
    startWorld: interaction.startWorld,
    tool: interaction.tool,
  })
}

function commitCanvasCreatedItem({
  commitItemsChange,
  item,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  item: CanvasItem
  selection: string[]
}) {
  commitItemsChange({ type: 'add', items: [item] }, {
    before: selection,
    after: [item.id],
  })
}
