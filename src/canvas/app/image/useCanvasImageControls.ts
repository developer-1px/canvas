import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type {
  Point,
  Viewport,
} from '../../entities'
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

  const getImageInsertCenter = useCallback(
    (event?: { clientX: number; clientY: number }): Point => {
      if (event) {
        const point = stageElement.getScreenPoint(event)

        return {
          x: (point.x - viewport.x) / viewport.scale,
          y: (point.y - viewport.y) / viewport.scale,
        }
      }

      return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
    },
    [stageElement, viewport],
  )

  const insertImageSource = useCallback(
    (source: CanvasImageImportSource, center?: Point) => {
      const item = createCanvasImportedImageItem({
        center: center ?? getImageInsertCenter(),
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
    [commitItemsChange, createId, getImageInsertCenter, selection],
  )

  const insertImageFile = useCallback(
    async (file: Blob & { name?: string }, center?: Point) => {
      const source = await readCanvasImageFileSource(file)

      return source ? insertImageSource(source, center) : false
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
      void insertImageFile(file, getImageInsertCenter(event))
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [canUploadImage, getImageInsertCenter, insertImageFile])

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
