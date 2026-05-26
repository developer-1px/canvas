import {
  useCallback,
  useEffect,
} from 'react'
import type { CanvasAffordanceConfig } from '../../../engine'
import type { Viewport } from '../../../entities'
import { isCanvasKeyboardTypingTarget } from '../../interaction/keyboard/CanvasKeyboardShortcutIntent'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import {
  getCanvasLinkPreviewInsertCenter,
  getCanvasLinkPreviewSourceFromDataTransfer,
  insertCanvasLinkPreviewSource,
  type CanvasLinkPreviewImportSource,
} from './CanvasLinkPreviewImport'

export type CanvasLinkPreviewImportInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasLinkPreviewImport({
  commitItemsChange,
  config,
  createId,
  selection,
  stageElement,
  viewport,
}: CanvasLinkPreviewImportInput) {
  const canImportLinkPreview = config.commands.paste
  const insertLinkPreviewSource = useCallback(
    (
      source: CanvasLinkPreviewImportSource,
      event?: { clientX: number; clientY: number },
    ) =>
      insertCanvasLinkPreviewSource({
        center: getCanvasLinkPreviewInsertCenter({
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

  useEffect(() => {
    if (!canImportLinkPreview) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented || isCanvasKeyboardTypingTarget(event.target)) {
        return
      }

      const source = getCanvasLinkPreviewSourceFromDataTransfer(
        event.clipboardData,
      )

      if (!source) {
        return
      }

      event.preventDefault()
      insertLinkPreviewSource(source)
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [canImportLinkPreview, insertLinkPreviewSource])

  useEffect(() => {
    if (!canImportLinkPreview) {
      return undefined
    }

    const handleDragOver = (event: DragEvent) => {
      if (event.defaultPrevented) {
        return
      }

      if (getCanvasLinkPreviewSourceFromDataTransfer(event.dataTransfer)) {
        event.preventDefault()
      }
    }

    const handleDrop = (event: DragEvent) => {
      if (event.defaultPrevented) {
        return
      }

      const source = getCanvasLinkPreviewSourceFromDataTransfer(
        event.dataTransfer,
      )

      if (!source) {
        return
      }

      event.preventDefault()
      insertLinkPreviewSource(source, event)
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [canImportLinkPreview, insertLinkPreviewSource])
}
