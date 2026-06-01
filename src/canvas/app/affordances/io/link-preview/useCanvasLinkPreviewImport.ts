import {
  useCallback,
  useEffect,
} from 'react'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type { Viewport } from '../../../../entities'
import { isCanvasKeyboardTypingTarget } from '../../interaction/keyboard/CanvasKeyboardShortcutIntent'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  getCanvasMediaInsertPosition,
  getCanvasMediaSourceFromDataTransfer,
  insertCanvasMediaSource,
} from '../media/CanvasMediaImport'
import type {
  CanvasMediaImporter,
  CanvasMediaImportSource,
} from '../media/CanvasMediaImporters'

export type CanvasLinkPreviewImportInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  mediaImporters: readonly CanvasMediaImporter[]
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasLinkPreviewImport({
  commitItemsChange,
  config,
  createId,
  mediaImporters,
  selection,
  stageElement,
  viewport,
}: CanvasLinkPreviewImportInput) {
  const canImportMedia = config.commands.paste
  const insertMediaSource = useCallback(
    (
      source: CanvasMediaImportSource,
      event?: { clientX: number; clientY: number },
    ) =>
      insertCanvasMediaSource({
        context: {
          commitItemsChange,
          createId,
          selection,
        },
        importers: mediaImporters,
        position: getCanvasMediaInsertPosition({
          event,
          stageElement,
          viewport,
        }),
        source,
        viewport,
      }),
    [
      commitItemsChange,
      createId,
      mediaImporters,
      selection,
      stageElement,
      viewport,
    ],
  )

  useEffect(() => {
    if (!canImportMedia) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented || isCanvasKeyboardTypingTarget(event.target)) {
        return
      }

      const source = getCanvasMediaSourceFromDataTransfer(
        event.clipboardData,
      )

      if (!source) {
        return
      }

      event.preventDefault()
      insertMediaSource(source)
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [canImportMedia, insertMediaSource])

  useEffect(() => {
    if (!canImportMedia) {
      return undefined
    }

    const handleDragOver = (event: DragEvent) => {
      if (event.defaultPrevented) {
        return
      }

      if (getCanvasMediaSourceFromDataTransfer(event.dataTransfer)) {
        event.preventDefault()
      }
    }

    const handleDrop = (event: DragEvent) => {
      if (event.defaultPrevented) {
        return
      }

      const source = getCanvasMediaSourceFromDataTransfer(
        event.dataTransfer,
      )

      if (!source) {
        return
      }

      event.preventDefault()
      insertMediaSource(source, event)
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [canImportMedia, insertMediaSource])
}
