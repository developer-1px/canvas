import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  INITIAL_VIEWPORT,
} from '../../core'
import type {
  CanvasItem,
  Viewport,
} from '../../entities'
import {
  createCanvasItemReadModel,
  type CanvasCustomItemValidators,
} from '../../host'
import {
  getCanvasItemIdSeed,
  readStoredCanvasWorkspace,
  useCanvasWorkspacePersistence,
} from '../document/CanvasWorkspacePersistence'
import { useCanvasDocument } from '../document/useCanvasDocument'

const DEFAULT_INITIAL_SELECTION = ['component-sticky', 'component-card']

export function useCanvasWorkspaceModel({
  customItemValidators,
  initialItems,
}: {
  customItemValidators?: CanvasCustomItemValidators
  initialItems: CanvasItem[]
}) {
  const storedWorkspace = useMemo(() => readStoredCanvasWorkspace(), [])
  const workspaceInitialItems = storedWorkspace?.items ?? initialItems
  const idSeed = useRef(getCanvasItemIdSeed(workspaceInitialItems))
  const document = useCanvasDocument(
    workspaceInitialItems,
    storedWorkspace?.selection ?? [...DEFAULT_INITIAL_SELECTION],
    { customItemValidators },
  )
  const [viewport, setViewport] = useState<Viewport>(
    () => storedWorkspace?.viewport ?? INITIAL_VIEWPORT,
  )
  const selected = useMemo(
    () => new Set<string>(document.selection),
    [document.selection],
  )
  const itemReadModel = useMemo(
    () => createCanvasItemReadModel(document.items),
    [document.items],
  )
  const scene = itemReadModel.scene
  const selectedBounds = useMemo(
    () => scene.getBounds(document.selection),
    [document.selection, scene],
  )

  useCanvasWorkspacePersistence({
    items: document.items,
    selection: document.selection,
    viewport,
  })

  const createId = useCallback((prefix: string) => {
    idSeed.current += 1
    return `${prefix}-${idSeed.current}`
  }, [])

  return {
    ...document,
    createId,
    itemReadModel,
    scene,
    selected,
    selectedBounds,
    setViewport,
    viewport,
  }
}
