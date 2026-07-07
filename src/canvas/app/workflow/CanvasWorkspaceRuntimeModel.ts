import { INITIAL_VIEWPORT } from '../../core'
import type {
  CanvasItem,
  Viewport,
} from '../../entities'
import { createCanvasItemReadModel } from '../../host'
import {
  CANVAS_APP_TEXT_TARGET,
  type CanvasAppTextTarget,
} from '../affordances/editing/text-editor/CanvasAppTextTarget'
import {
  getCanvasItemIdSeed,
  type CanvasWorkspaceSnapshot,
} from '../workspace/document/CanvasWorkspaceSnapshot'

type CanvasWorkspaceInitialStateArgs = {
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  storedWorkspace: CanvasWorkspaceSnapshot | null
}

type CanvasWorkspaceRuntimeModelArgs = {
  items: CanvasItem[]
  selection: string[]
  textTarget?: CanvasAppTextTarget
}

export function getCanvasWorkspaceInitialState({
  initialItems,
  initialSelection,
  storedWorkspace,
}: CanvasWorkspaceInitialStateArgs): {
  items: CanvasItem[]
  selection: string[]
  viewport: Viewport
} {
  const items = storedWorkspace?.items ?? initialItems

  return {
    items,
    selection: storedWorkspace?.selection ??
      createCanvasItemReadModel(items).getSelection([...initialSelection]),
    viewport: storedWorkspace?.viewport ?? INITIAL_VIEWPORT,
  }
}

export function createCanvasWorkspaceIdGenerator(items: CanvasItem[]) {
  let idSeed = getCanvasItemIdSeed(items)

  return (prefix: string) => {
    idSeed += 1
    return `${prefix}-${idSeed}`
  }
}

export function getCanvasWorkspaceRuntimeModel({
  items,
  selection,
  textTarget = CANVAS_APP_TEXT_TARGET,
}: CanvasWorkspaceRuntimeModelArgs) {
  const selected = new Set<string>(selection)
  const hostItemReadModel = createCanvasItemReadModel(items)
  const itemReadModel = {
    ...hostItemReadModel,
    findTextEditTarget: (id: string) => {
      const item = hostItemReadModel.findItem(id)

      return item && textTarget.canEdit(item) ? item : null
    },
    textTarget,
  }
  const scene = itemReadModel.scene
  const selectedBounds = scene.getBounds(selection)

  return {
    itemReadModel,
    scene,
    selected,
    selectedBounds,
  }
}
