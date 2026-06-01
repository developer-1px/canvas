import type {
  CanvasWorkspaceConsumerModel,
  CanvasWorkspaceConsumerModelInput,
} from './CanvasWorkspaceConsumerContracts'

export function getCanvasWorkspaceConsumerModel({
  createId,
  document,
  itemReadModel,
  scene,
  selected,
  selectedBounds,
  setViewport,
  viewport,
}: CanvasWorkspaceConsumerModelInput): CanvasWorkspaceConsumerModel {
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
      workspace: {
        itemReadModel,
        ...selectionContext,
      },
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
    image: {
      commitItemsChange: document.commitItemsChange,
      createId,
      itemReadModel,
      ...selectionContext,
    },
    linkPreview: {
      commitItemsChange: document.commitItemsChange,
      createId,
      ...selectionContext,
    },
    stamp: {
      commitItemsChange: document.commitItemsChange,
      createId,
      itemReadModel,
      ...selectionContext,
    },
    table: {
      commitItemsChange: document.commitItemsChange,
      createId,
      ...selectionContext,
    },
    textPaste: {
      commitItemsChange: document.commitItemsChange,
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
      command: {
        commitSelection: document.commitSelection,
      },
      itemReadModel,
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
    selection: {
      commitItemsChange: document.commitItemsChange,
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
