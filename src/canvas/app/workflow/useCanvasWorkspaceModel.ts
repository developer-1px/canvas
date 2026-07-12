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
import type { CanvasAppDocumentAuthorityRead } from '../workspace/document/CanvasAppDocumentContracts'
import { createCanvasAppDocumentAuthority } from './CanvasAppDocumentAuthority'
import type {
  CanvasAppFoundationExtensionRuntime,
} from '../extensions/foundation-extensions'

export function useCanvasWorkspaceModel({
  customItemTextTargets,
  customItemValidators,
  documentAuthority,
  foundationExtensionRuntime,
  initialItems,
  initialSelection,
  storageProvider,
}: {
  customItemTextTargets?: CanvasAppCustomItemTextTargets
  customItemValidators?: CanvasAppCustomItemValidators
  documentAuthority: CanvasAppDocumentAuthorityRead
  foundationExtensionRuntime: CanvasAppFoundationExtensionRuntime
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  storageProvider: CanvasWorkspaceStorageProvider
}) {
  const validation = useMemo(
    () => ({ customItemValidators }),
    [customItemValidators],
  )
  const textTarget = useMemo(
    () => createCanvasAppTextTarget(
      customItemTextTargets,
      foundationExtensionRuntime.textTargets,
    ),
    [customItemTextTargets, foundationExtensionRuntime.textTargets],
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
  const authority = useMemo(
    () => createCanvasAppDocumentAuthority({
      commitItemsChange: document.commitItemsChange,
      read: documentAuthority,
      readItems: document.readItems,
    }),
    [document.commitItemsChange, document.readItems, documentAuthority],
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
    items: document.committedItems,
    selection: document.committedSelection,
    storageProvider,
    validation,
    viewport,
  })

  return getCanvasWorkspaceConsumerModel({
    authority,
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
