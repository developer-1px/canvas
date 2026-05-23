import {
  useMemo,
  useState,
} from 'react'
import type { CanvasItem } from '../../entities'
import {
  type CanvasCustomItemValidators,
} from '../../host'
import {
  readStoredCanvasWorkspace,
  useCanvasWorkspacePersistence,
} from '../document/CanvasWorkspacePersistence'
import { useCanvasDocument } from '../document/useCanvasDocument'
import { getCanvasWorkspaceConsumerModel } from './CanvasWorkspaceConsumerModel'
import {
  createCanvasWorkspaceIdGenerator,
  getCanvasWorkspaceInitialState,
  getCanvasWorkspaceRuntimeModel,
} from './CanvasWorkspaceRuntimeModel'

export function useCanvasWorkspaceModel({
  customItemValidators,
  initialItems,
}: {
  customItemValidators?: CanvasCustomItemValidators
  initialItems: CanvasItem[]
}) {
  const validation = useMemo(
    () => ({ customItemValidators }),
    [customItemValidators],
  )
  const storedWorkspace = useMemo(
    () => readStoredCanvasWorkspace(undefined, validation),
    [validation],
  )
  const initialState = getCanvasWorkspaceInitialState({
    initialItems,
    storedWorkspace,
  })
  const [createId] = useState(() => {
    return createCanvasWorkspaceIdGenerator(initialState.items)
  })
  const document = useCanvasDocument(
    initialState.items,
    initialState.selection,
    validation,
  )
  const [viewport, setViewport] = useState(() => initialState.viewport)
  const {
    itemReadModel,
    scene,
    selected,
    selectedBounds,
  } = useMemo(
    () =>
      getCanvasWorkspaceRuntimeModel({
        items: document.items,
        selection: document.selection,
      }),
    [document.items, document.selection],
  )

  useCanvasWorkspacePersistence({
    items: document.items,
    selection: document.selection,
    validation,
    viewport,
  })

  return getCanvasWorkspaceConsumerModel({
    createId,
    document,
    itemReadModel,
    scene,
    selected,
    selectedBounds,
    setViewport,
    viewport,
  })
}
