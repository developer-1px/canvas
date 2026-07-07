import {
  useMemo,
  useState,
} from 'react'
import type { CanvasItem } from '../../entities'
import {
  readStoredCanvasWorkspace,
  type CanvasWorkspaceStorageProvider,
  useCanvasWorkspacePersistence,
} from '../workspace/document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemTextTargets,
} from '../extensions/custom-item-modules/CanvasAppCustomItemTextTargetContracts'
import type {
  CanvasAppCustomItemValidators,
} from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'
import { createCanvasAppTextTarget } from '../affordances/editing/text-editor/CanvasAppTextTarget'
import { useCanvasDocument } from '../workspace/document/useCanvasDocument'
import { getCanvasWorkspaceConsumerModel } from './CanvasWorkspaceConsumerModel'
import {
  createCanvasWorkspaceIdGenerator,
  getCanvasWorkspaceInitialState,
  getCanvasWorkspaceRuntimeModel,
} from './CanvasWorkspaceRuntimeModel'

export function useCanvasWorkspaceModel({
  customItemTextTargets,
  customItemValidators,
  initialItems,
  initialSelection,
  storageProvider,
}: {
  customItemTextTargets?: CanvasAppCustomItemTextTargets
  customItemValidators?: CanvasAppCustomItemValidators
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  storageProvider: CanvasWorkspaceStorageProvider
}) {
  const validation = useMemo(
    () => ({ customItemValidators }),
    [customItemValidators],
  )
  const textTarget = useMemo(
    () => createCanvasAppTextTarget(customItemTextTargets),
    [customItemTextTargets],
  )
  const storedWorkspace = useMemo(
    () => readStoredCanvasWorkspace(storageProvider(), validation),
    [storageProvider, validation],
  )
  const initialState = getCanvasWorkspaceInitialState({
    initialItems,
    initialSelection,
    storedWorkspace,
  })
  const [createId] = useState(() => {
    return createCanvasWorkspaceIdGenerator(initialState.items)
  })
  const document = useCanvasDocument(
    initialState.items,
    initialState.selection,
    validation,
    textTarget,
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
        textTarget,
      }),
    [document.items, document.selection, textTarget],
  )

  useCanvasWorkspacePersistence({
    items: document.items,
    selection: document.selection,
    storageProvider,
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
