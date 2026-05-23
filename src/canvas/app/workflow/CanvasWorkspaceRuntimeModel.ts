import { INITIAL_VIEWPORT } from '../../core'
import type {
  CanvasItem,
  Viewport,
} from '../../entities'
import { createCanvasItemReadModel } from '../../host'
import {
  getCanvasItemIdSeed,
  type CanvasWorkspaceSnapshot,
} from '../document/CanvasWorkspaceSnapshot'

export const DEFAULT_CANVAS_WORKSPACE_SELECTION = [
  'component-sticky',
  'component-card',
]

type CanvasWorkspaceInitialStateArgs = {
  initialItems: CanvasItem[]
  storedWorkspace: CanvasWorkspaceSnapshot | null
}

type CanvasWorkspaceRuntimeModelArgs = {
  items: CanvasItem[]
  selection: string[]
}

export function getCanvasWorkspaceInitialState({
  initialItems,
  storedWorkspace,
}: CanvasWorkspaceInitialStateArgs): {
  items: CanvasItem[]
  selection: string[]
  viewport: Viewport
} {
  return {
    items: storedWorkspace?.items ?? initialItems,
    selection: storedWorkspace?.selection ?? [
      ...DEFAULT_CANVAS_WORKSPACE_SELECTION,
    ],
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
}: CanvasWorkspaceRuntimeModelArgs) {
  const selected = new Set<string>(selection)
  const itemReadModel = createCanvasItemReadModel(items)
  const scene = itemReadModel.scene
  const selectedBounds = scene.getBounds(selection)

  return {
    itemReadModel,
    scene,
    selected,
    selectedBounds,
  }
}
