import type {
  CanvasWorkspaceConsumerModel,
  CanvasWorkspaceConsumerModelInput,
} from './CanvasWorkspaceConsumerContracts'
import { canCanvasAppEditTextItem } from '../affordances/editing/text-editor/CanvasTextEditingModel'

export function getCanvasWorkspaceConsumerModel({
  authority,
  createId,
  document,
  itemReadModel,
  scene,
  selected,
  selectedBounds,
  setViewport,
  viewport,
}: CanvasWorkspaceConsumerModelInput): CanvasWorkspaceConsumerModel {
  const commitItemsChange: typeof document.commitItemsChange = (
    change,
    selection,
  ) => authority.commit({ change, selection }).ok
  const canEditText = (item: Parameters<
    typeof itemReadModel.textTarget.canEdit
  >[0]) => itemReadModel.textTarget.canEdit(item) &&
    canCanvasAppEditTextItem({
      canComment: authority.can('comment'),
      canEditDocument: authority.can('editDocument'),
      item,
    })
  const redo: typeof document.redo = () =>
    authority.can('editDocument') ? document.redo() : undefined
  const replaceDocumentText: typeof document.replaceDocumentText = (
    searchText,
    replacement,
    options,
  ) => authority.can('editDocument') &&
    document.replaceDocumentText(searchText, replacement, options)
  const undo: typeof document.undo = () =>
    authority.can('editDocument') ? document.undo() : undefined
  const commandDocument = {
    commitItemsChange,
    commitSelection: document.commitSelection,
    copyItemsToClipboard: document.copyItemsToClipboard,
    getClipboardItems: document.getClipboardItems,
    redo,
    setClipboardItems: document.setClipboardItems,
    undo,
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
        commitItemsChange,
      },
      createId,
      workspace: {
        itemReadModel,
        ...selectionContext,
      },
    },
    control: {
      canRedo: document.canRedo,
      canUndo: document.canUndo,
      itemReadModel,
      scene,
      ...selectionContext,
    },
    extension: {
      commitSelection: document.commitSelection,
      createId,
      document: authority,
      items: document.items,
      ...selectionContext,
    },
    inspector: {
      document: authority,
      items: document.items,
      itemReadModel,
      selected,
      selection: document.selection,
    },
    image: {
      commitItemsChange,
      createId,
      itemReadModel,
      ...selectionContext,
    },
    linkPreview: {
      commitItemsChange,
      createId,
      ...selectionContext,
    },
    stamp: {
      commitItemsChange,
      createId,
      itemReadModel,
      ...selectionContext,
    },
    table: {
      commitItemsChange,
      createId,
      ...selectionContext,
    },
    textPaste: {
      commitItemsChange,
      createId,
      ...selectionContext,
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
      canEditText,
      command: {
        commitSelection: document.commitSelection,
      },
      itemReadModel,
      selection: document.selection,
    },
    pointer: {
      canEditText,
      command: {
        commitItemsChange,
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
    selection: {
      commitItemsChange,
      commitSelection: document.commitSelection,
      createId,
      itemReadModel,
      items: document.items,
      selection: document.selection,
    },
    stage: {
      viewport,
    },
    text: {
      document: {
        can: authority.can,
        commitItemsChange,
        findDocumentText: document.findDocumentText,
        replaceDocumentText,
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
