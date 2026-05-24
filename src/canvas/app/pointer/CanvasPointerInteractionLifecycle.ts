import type {
  CanvasItem,
  EditingText,
  Tool,
} from '../../entities'
import {
  type CanvasCreationAdapter,
  type CanvasSceneAdapter,
} from '../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { Interaction } from './CanvasInteractionState'
import { commitCanvasPointerCreation } from './CanvasPointerCreationCommit'
import {
  cancelCanvasPointerMarqueeInteraction,
  commitCanvasPointerMarqueeInteraction,
} from './CanvasPointerMarqueeInteraction'
import { routeCanvasPointerInteraction } from './CanvasPointerInteractionRouting'
import {
  cancelCanvasPointerTransformInteraction,
  commitCanvasPointerTransformInteraction,
} from './CanvasPointerTransformInteraction'

export type CanvasPointerInteractionCommitInput = {
  componentLibrary: CanvasAppComponentLibrary
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: Interaction
  scene: CanvasSceneAdapter
  selection: string[]
  setEditing: (editing: EditingText | null) => void
  setSelection: (selection: string[]) => void
  setTool: (tool: Tool) => void
}

export function commitCanvasPointerInteraction({
  componentLibrary,
  commitItemsChange,
  commitSelection,
  creationAdapter,
  createId,
  customCreationTools,
  interaction,
  scene,
  selection,
  setEditing,
  setSelection,
  setTool,
}: CanvasPointerInteractionCommitInput) {
  routeCanvasPointerInteraction(interaction, {
    creation: (interaction) =>
      commitCanvasPointerCreation({
        componentLibrary,
        commitItemsChange,
        creationAdapter,
        createId,
        customCreationTools,
        interaction,
        scene,
        selection,
        setTool,
      }),
    fallback: () => undefined,
    marquee: (interaction) =>
      commitCanvasPointerMarqueeInteraction({
        commitSelection,
        interaction,
        scene,
        setSelection,
      }),
    transform: (interaction) =>
      commitCanvasPointerTransformInteraction({
        commitItemsChange,
        commitSelection,
        interaction,
        setEditing,
        setTool,
      }),
  })
}

export type CanvasPointerInteractionCancelInput = {
  interaction: Interaction
  setLiveItems: (items: CanvasItem[]) => void
  setSelection: (selection: string[]) => void
}

export function cancelCanvasPointerInteraction({
  interaction,
  setLiveItems,
  setSelection,
}: CanvasPointerInteractionCancelInput) {
  routeCanvasPointerInteraction(interaction, {
    fallback: () => undefined,
    marquee: (interaction) =>
      cancelCanvasPointerMarqueeInteraction({
        interaction,
        setSelection,
      }),
    transform: (interaction) =>
      cancelCanvasPointerTransformInteraction({
        interaction,
        setLiveItems,
      }),
  })
}
