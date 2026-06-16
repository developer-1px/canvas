import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import type { CanvasAffordanceConfig } from '../../../engine'
import type { Viewport } from '../../../entities'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import type {
  CommitCanvasItemsChange,
} from '../../workflow/CanvasWorkflowContract'
import { readCanvasClipboardImageSource } from './CanvasImageClipboard'
import {
  copyCanvasSelectionImageToClipboard,
  downloadCanvasSelectionImage,
} from './CanvasImageExport'
import {
  getCanvasImageFileFromDataTransfer,
  getCanvasImageFileFromList,
  getCanvasImageSourceFromDataTransfer,
  readCanvasImageFileSource,
  resolveCanvasImageSourceNaturalSize,
  type CanvasImageImportSource,
} from './CanvasImageImport'
import {
  getCanvasImageInsertCenter,
  insertCanvasImageSource,
} from './CanvasImageInsertion'

export type CanvasImageControlsModel = {
  canCopyImage: boolean
  canDownloadImage: boolean
  canPasteImage: boolean
  canUploadImage: boolean
  visible: boolean
  onCopyImage: () => void
  onDownloadImage: () => void
  onPasteImage: () => void
  onUploadFiles: (files: FileList | null) => void
  pasteClipboardImage: () => Promise<boolean>
}

export type CanvasImageControlsInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasImageControls({
  commitItemsChange,
  config,
  createId,
  itemReadModel,
  selection,
  stageElement,
  viewport,
}: CanvasImageControlsInput): CanvasImageControlsModel {
  const visible = config.overlays.imageControls
  const canCopyImage = visible && config.commands.copy && selection.length > 0
  const canDownloadImage = visible && selection.length > 0
  const canPasteImage = visible && config.commands.paste
  const canUploadImage = visible

  const insertImageSource = useCallback(
    (
      source: CanvasImageImportSource,
      event?: { clientX: number; clientY: number },
    ) =>
      insertCanvasImageSource({
        center: getCanvasImageInsertCenter({
          event,
          stageElement,
          viewport,
        }),
        context: {
          commitItemsChange,
          createId,
          selection,
        },
        source,
      }),
    [commitItemsChange, createId, selection, stageElement, viewport],
  )

  const insertImageFile = useCallback(
    async (
      file: Blob & { name?: string },
      event?: { clientX: number; clientY: number },
    ) => {
      const source = await readCanvasImageFileSource(file)

      return source ? insertImageSource(source, event) : false
    },
    [insertImageSource],
  )

  const onUploadFiles = useCallback(
    (files: FileList | null) => {
      const file = getCanvasImageFileFromList(files)

      if (file) {
        void insertImageFile(file)
      }
    },
    [insertImageFile],
  )

  const pasteClipboardImage = useCallback(async () => {
    if (!canPasteImage) {
      return false
    }

    const source = await readCanvasClipboardImageSource()

    return source ? insertImageSource(source) : false
  }, [canPasteImage, insertImageSource])

  const onPasteImage = useCallback(() => {
    void pasteClipboardImage()
  }, [pasteClipboardImage])

  const onCopyImage = useCallback(() => {
    void copyCanvasSelectionImageToClipboard({
      itemReadModel,
      selection,
      stageElement,
    })
  }, [itemReadModel, selection, stageElement])

  const onDownloadImage = useCallback(() => {
    void downloadCanvasSelectionImage({
      itemReadModel,
      selection,
      stageElement,
    })
  }, [itemReadModel, selection, stageElement])

  useEffect(() => {
    if (!canPasteImage) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      const file = getCanvasImageFileFromDataTransfer(event.clipboardData)

      if (file) {
        event.preventDefault()
        void insertImageFile(file)
        return
      }

      const source = getCanvasImageSourceFromDataTransfer(event.clipboardData)

      if (source) {
        event.preventDefault()
        void resolveCanvasImageSourceNaturalSize(source)
          .then((resolvedSource) => insertImageSource(resolvedSource))
      }
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [canPasteImage, insertImageFile, insertImageSource])

  useEffect(() => {
    if (!canUploadImage) {
      return undefined
    }

    const handleDragOver = (event: DragEvent) => {
      if (getCanvasImageFileFromDataTransfer(event.dataTransfer)) {
        event.preventDefault()
      }
    }

    const handleDrop = (event: DragEvent) => {
      const file = getCanvasImageFileFromDataTransfer(event.dataTransfer)

      if (!file) {
        return
      }

      event.preventDefault()
      void insertImageFile(file, event)
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [canUploadImage, insertImageFile])

  return useMemo(
    () => ({
      canCopyImage,
      canDownloadImage,
      canPasteImage,
      canUploadImage,
      visible,
      onCopyImage,
      onDownloadImage,
      onPasteImage,
      onUploadFiles,
      pasteClipboardImage,
    }),
    [
      canCopyImage,
      canDownloadImage,
      canPasteImage,
      canUploadImage,
      onCopyImage,
      onDownloadImage,
      onPasteImage,
      onUploadFiles,
      pasteClipboardImage,
      visible,
    ],
  )
}
