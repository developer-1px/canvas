import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type {
  CommitCanvasItemsChange,
} from '../workflow/CanvasWorkflowContract'
import { readCanvasClipboardImageSource } from './CanvasImageClipboard'
import {
  copyCanvasSelectionImageToClipboard,
  downloadCanvasSelectionImage,
} from './CanvasImageExport'
import {
  createCanvasImportedImageItem,
  getCanvasImageFileFromDataTransfer,
  getCanvasImageFileFromList,
  readCanvasImageFileSource,
  type CanvasImageImportSource,
} from './CanvasImageImport'

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
    (source: CanvasImageImportSource) => {
      const item = createCanvasImportedImageItem({
        center: stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 },
        createId,
        source,
      })

      return commitItemsChange(
        { type: 'add', items: [item] },
        {
          before: selection,
          after: [item.id],
        },
      )
    },
    [commitItemsChange, createId, selection, stageElement, viewport],
  )

  const insertImageFile = useCallback(
    async (file: Blob & { name?: string }) => {
      const source = await readCanvasImageFileSource(file)

      return source ? insertImageSource(source) : false
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

  const onPasteImage = useCallback(() => {
    void readCanvasClipboardImageSource().then((source) => {
      if (source) {
        insertImageSource(source)
      }
    })
  }, [insertImageSource])

  const onCopyImage = useCallback(() => {
    void copyCanvasSelectionImageToClipboard({
      itemReadModel,
      selection,
    })
  }, [itemReadModel, selection])

  const onDownloadImage = useCallback(() => {
    void downloadCanvasSelectionImage({
      itemReadModel,
      selection,
    })
  }, [itemReadModel, selection])

  useEffect(() => {
    if (!canPasteImage) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      const file = getCanvasImageFileFromDataTransfer(event.clipboardData)

      if (!file) {
        return
      }

      event.preventDefault()
      void insertImageFile(file)
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [canPasteImage, insertImageFile])

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
      visible,
    ],
  )
}
