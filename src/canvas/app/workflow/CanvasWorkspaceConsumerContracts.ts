import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { CanvasSceneAdapter } from '../../engine'
import type {
  Bounds,
  CanvasItem,
  Viewport,
} from '../../entities'
import type {
  CanvasDocumentClipboard,
  CanvasDocumentTextSearch,
} from '../../host'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'
import type { CanvasAppDocumentAuthority } from '../workspace/document/CanvasAppDocumentContracts'

export type CanvasWorkspaceDocumentModel = {
  canRedo: boolean
  canUndo: boolean
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  findDocumentText: CanvasDocumentTextSearch['findDocumentText']
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  redo: () => string[] | undefined
  replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText']
  selection: string[]
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setSelection: Dispatch<SetStateAction<string[]>>
  undo: () => string[] | undefined
}

export type CanvasWorkspaceConsumerModelInput = {
  authority: CanvasAppDocumentAuthority
  createId: (prefix: string) => string
  document: CanvasWorkspaceDocumentModel
  itemReadModel: CanvasAppItemReadModel
  scene: CanvasSceneAdapter
  selected: Set<string>
  selectedBounds: Bounds | null
  setViewport: Dispatch<SetStateAction<Viewport>>
  viewport: Viewport
}

export type CanvasWorkspaceSelectionContext = {
  selection: string[]
  viewport: Viewport
}

export type CanvasWorkspaceCommandDocumentContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  redo: () => string[] | undefined
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  undo: () => string[] | undefined
}

export type CanvasWorkspaceCommandWorkspaceContext =
  CanvasWorkspaceSelectionContext & {
    items: CanvasItem[]
    setSelection: Dispatch<SetStateAction<string[]>>
  }

export type CanvasWorkspaceComponentContext = {
  command: {
    commitItemsChange: CommitCanvasItemsChange
  }
  createId: (prefix: string) => string
  workspace: CanvasWorkspaceSelectionContext & {
    itemReadModel: CanvasAppItemReadModel
  }
}

export type CanvasWorkspaceControlContext =
  CanvasWorkspaceSelectionContext & {
    canRedo: boolean
    canUndo: boolean
    itemReadModel: CanvasAppItemReadModel
    scene: CanvasSceneAdapter
  }

export type CanvasWorkspaceExtensionContext =
  CanvasWorkspaceSelectionContext & {
    commitSelection: CommitCanvasSelection
    createId: (prefix: string) => string
    document: CanvasAppDocumentAuthority
    items: CanvasItem[]
  }

export type CanvasWorkspaceInspectorContext = {
  document: CanvasAppDocumentAuthority
  items: CanvasItem[]
  itemReadModel: CanvasAppItemReadModel
  selected: Set<string>
  selection: string[]
}

export type CanvasWorkspaceSelectionModelContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  items: CanvasItem[]
  selection: string[]
}

export type CanvasWorkspaceImageContext =
  CanvasWorkspaceSelectionContext & {
    commitItemsChange: CommitCanvasItemsChange
    createId: (prefix: string) => string
    itemReadModel: CanvasAppItemReadModel
  }

export type CanvasWorkspaceLinkPreviewContext =
  CanvasWorkspaceSelectionContext & {
    commitItemsChange: CommitCanvasItemsChange
    createId: (prefix: string) => string
  }

export type CanvasWorkspaceTableContext =
  CanvasWorkspaceSelectionContext & {
    commitItemsChange: CommitCanvasItemsChange
    createId: (prefix: string) => string
  }

export type CanvasWorkspaceTextPasteContext =
  CanvasWorkspaceSelectionContext & {
    commitItemsChange: CommitCanvasItemsChange
    createId: (prefix: string) => string
  }

export type CanvasWorkspaceStampContext =
  CanvasWorkspaceSelectionContext & {
    commitItemsChange: CommitCanvasItemsChange
    createId: (prefix: string) => string
    itemReadModel: CanvasAppItemReadModel
  }

export type CanvasWorkspaceInteractionContext =
  CanvasWorkspaceSelectionContext & {
    scene: CanvasSceneAdapter
  }

export type CanvasWorkspaceItemLayerContext = {
  items: CanvasItem[]
  selected: Set<string>
}

export type CanvasWorkspaceKeyboardContext = {
  canEditText: (item: CanvasItem) => boolean
  command: {
    commitSelection: CommitCanvasSelection
  }
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
}

export type CanvasWorkspacePointerContext = {
  canEditText: (item: CanvasItem) => boolean
  command: {
    commitItemsChange: CommitCanvasItemsChange
    commitSelection: CommitCanvasSelection
  }
  createId: (prefix: string) => string
  workspace: CanvasWorkspaceSelectionContext & {
    itemReadModel: CanvasAppItemReadModel
    items: CanvasItem[]
    scene: CanvasSceneAdapter
    selectedBounds: Bounds | null
    setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
    setSelection: Dispatch<SetStateAction<string[]>>
    setViewport: Dispatch<SetStateAction<Viewport>>
  }
}

export type CanvasWorkspaceStageContext = {
  viewport: Viewport
}

export type CanvasWorkspaceTextContext =
  CanvasWorkspaceSelectionContext & {
    document: {
      can: CanvasAppDocumentAuthority['can']
      commitItemsChange: CommitCanvasItemsChange
      findDocumentText: CanvasDocumentTextSearch['findDocumentText']
      replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText']
    }
    itemReadModel: CanvasAppItemReadModel
  }

export type CanvasWorkspaceViewportContext = {
  itemReadModel: CanvasAppItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
}

export type CanvasWorkspaceConsumerModel = {
  command: {
    createId: (prefix: string) => string
    document: CanvasWorkspaceCommandDocumentContext
    workspace: CanvasWorkspaceCommandWorkspaceContext
  }
  component: CanvasWorkspaceComponentContext
  control: CanvasWorkspaceControlContext
  extension: CanvasWorkspaceExtensionContext
  image: CanvasWorkspaceImageContext
  inspector: CanvasWorkspaceInspectorContext
  interaction: CanvasWorkspaceInteractionContext
  itemLayer: CanvasWorkspaceItemLayerContext
  keyboard: CanvasWorkspaceKeyboardContext
  linkPreview: CanvasWorkspaceLinkPreviewContext
  pointer: CanvasWorkspacePointerContext
  selection: CanvasWorkspaceSelectionModelContext
  stage: CanvasWorkspaceStageContext
  stamp: CanvasWorkspaceStampContext
  table: CanvasWorkspaceTableContext
  text: CanvasWorkspaceTextContext
  textPaste: CanvasWorkspaceTextPasteContext
  viewport: CanvasWorkspaceViewportContext
}
