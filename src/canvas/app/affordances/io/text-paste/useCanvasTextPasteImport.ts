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
  getCanvasTextPasteInsertPosition,
  getCanvasTextPasteSourcesFromDataTransfer,
  insertCanvasTextPasteSource,
} from './CanvasTextPasteImport'
import type { CanvasTextPasteImporter } from './CanvasTextPasteImporters'

export type CanvasTextPasteImportInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  selection: string[]
  stageElement: CanvasAppStageElement
  textPasteImporters: readonly CanvasTextPasteImporter[]
  viewport: Viewport
}

export function useCanvasTextPasteImport({
  commitItemsChange,
  config,
  createId,
  selection,
  stageElement,
  textPasteImporters,
  viewport,
}: CanvasTextPasteImportInput) {
  const canImportTextPaste =
    config.commands.paste && textPasteImporters.length > 0
  const insertTextPasteSource = useCallback(
    (text: string, event?: { clientX: number; clientY: number }) =>
      insertCanvasTextPasteSource({
        context: {
          commitItemsChange,
          createId,
          selection,
        },
        importers: textPasteImporters,
        position: getCanvasTextPasteInsertPosition({
          event,
          stageElement,
          viewport,
        }),
        text,
        viewport,
      }),
    [
      commitItemsChange,
      createId,
      selection,
      stageElement,
      textPasteImporters,
      viewport,
    ],
  )

  useEffect(() => {
    if (!canImportTextPaste) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented || isCanvasKeyboardTypingTarget(event.target)) {
        return
      }

      const sources = getCanvasTextPasteSourcesFromDataTransfer(
        event.clipboardData,
      )

      for (const source of sources) {
        if (insertTextPasteSource(source)) {
          event.preventDefault()
          return
        }
      }
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [canImportTextPaste, insertTextPasteSource])
}
