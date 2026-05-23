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
  readStoredCanvasWorkspace,
  useCanvasWorkspacePersistence,
} from '../document/CanvasWorkspacePersistence'
import { getCanvasItemIdSeed } from '../document/CanvasWorkspaceSnapshot'
import { useCanvasDocument } from '../document/useCanvasDocument'

const DEFAULT_INITIAL_SELECTION = ['component-sticky', 'component-card']

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
  const workspaceInitialItems = storedWorkspace?.items ?? initialItems
  const idSeed = useRef(getCanvasItemIdSeed(workspaceInitialItems))
  const document = useCanvasDocument(
    workspaceInitialItems,
    storedWorkspace?.selection ?? [...DEFAULT_INITIAL_SELECTION],
    validation,
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
    validation,
    viewport,
  })

  const createId = useCallback((prefix: string) => {
    idSeed.current += 1
    return `${prefix}-${idSeed.current}`
  }, [])

  const commandDocument = {
    commitItemsChange: document.commitItemsChange,
    commitSelection: document.commitSelection,
    copyItemsToClipboard: document.copyItemsToClipboard,
    getClipboardItems: document.getClipboardItems,
    redo: document.redo,
    setClipboardItems: document.setClipboardItems,
    undo: document.undo,
  }
  const selectionContext = {
    selection: document.selection,
    viewport,
  }

  return {
    command: {
      createId,
      document: commandDocument,
      workspace: {
        items: document.items,
        setSelection: document.setSelection,
        ...selectionContext,
      },
    },
    component: {
      command: {
        commitItemsChange: document.commitItemsChange,
      },
      createId,
      workspace: selectionContext,
    },
    control: {
      canRedo: document.canRedo,
      canUndo: document.canUndo,
      scene,
      ...selectionContext,
    },
    extension: {
      commitItemsChange: document.commitItemsChange,
      commitSelection: document.commitSelection,
      createId,
      items: document.items,
      ...selectionContext,
    },
    inspector: {
      commitItemsChange: document.commitItemsChange,
      itemReadModel,
      selected,
      selection: document.selection,
    },
    interaction: {
      scene,
      ...selectionContext,
    },
    itemLayer: {
      items: document.items,
      selected,
    },
    keyboard: {
      command: {
        commitSelection: document.commitSelection,
      },
      selection: document.selection,
    },
    pointer: {
      command: {
        commitItemsChange: document.commitItemsChange,
        commitSelection: document.commitSelection,
      },
      createId,
      workspace: {
        itemReadModel,
        items: document.items,
        scene,
        selectedBounds,
        setLiveItems: document.setLiveItems,
        setSelection: document.setSelection,
        setViewport,
        ...selectionContext,
      },
    },
    stage: {
      viewport,
    },
    text: {
      document: {
        commitItemsChange: document.commitItemsChange,
        findDocumentText: document.findDocumentText,
        replaceDocumentText: document.replaceDocumentText,
      },
      itemReadModel,
      ...selectionContext,
    },
    viewport: {
      itemReadModel,
      setViewport,
    },
  }
}
