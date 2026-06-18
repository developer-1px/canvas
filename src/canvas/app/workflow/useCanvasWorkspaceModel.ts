import {
  useMemo,
  useState,
} from 'react'
import type { CanvasItem } from '../../entities'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  type CanvasComponentDefinitionRegistry,
} from '../../host'
import {
  readStoredCanvasWorkspace,
  type CanvasWorkspaceStorageProvider,
  useCanvasWorkspacePersistence,
} from '../workspace/document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemValidators,
} from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'
import type {
  CanvasAppItemsChangeTransformer,
} from '../extensions/items-change-transformers'
import { useCanvasDocument } from '../workspace/document/useCanvasDocument'
import { getCanvasWorkspaceConsumerModel } from './CanvasWorkspaceConsumerModel'
import {
  createCanvasWorkspaceIdGenerator,
  getCanvasWorkspaceInitialState,
  getCanvasWorkspaceRuntimeModel,
} from './CanvasWorkspaceRuntimeModel'

export function useCanvasWorkspaceModel({
  componentDefinitionRegistry = CANVAS_COMPONENT_DEFINITION_REGISTRY,
  customItemValidators,
  initialItems,
  initialSelection,
  itemsChangeTransformers = [],
  storageProvider,
}: {
  componentDefinitionRegistry?: CanvasComponentDefinitionRegistry
  customItemValidators?: CanvasAppCustomItemValidators
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  itemsChangeTransformers?: readonly CanvasAppItemsChangeTransformer[]
  storageProvider: CanvasWorkspaceStorageProvider
}) {
  const validation = useMemo(
    () => ({ customItemValidators }),
    [customItemValidators],
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
    {
      componentDefinitionRegistry,
      itemsChangeTransformers,
    },
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
