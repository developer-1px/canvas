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
  getCanvasTableCsvFileFromDataTransfer,
  getCanvasTableCsvSourceFromDataTransfer,
  getCanvasTableInsertCenter,
  insertCanvasTableSource,
  readCanvasTableCsvFileSource,
  type CanvasTableImportSource,
} from './CanvasTableImport'

export type CanvasTableImportInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasTableImport({
  commitItemsChange,
  config,
  createId,
  selection,
  stageElement,
  viewport,
}: CanvasTableImportInput) {
  const canImportTable = config.commands.paste
  const insertTableSource = useCallback(
    (
      source: CanvasTableImportSource,
      event?: { clientX: number; clientY: number },
    ) =>
      insertCanvasTableSource({
        center: getCanvasTableInsertCenter({
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

  const insertTableCsvFile = useCallback(
    async (
      file: Blob & { name?: string },
      event?: { clientX: number; clientY: number },
    ) => {
      const source = await readCanvasTableCsvFileSource(file)

      return source ? insertTableSource(source, event) : false
    },
    [insertTableSource],
  )

  useEffect(() => {
    if (!canImportTable) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (isCanvasKeyboardTypingTarget(event.target)) {
        return
      }

      const source = getCanvasTableCsvSourceFromDataTransfer(
        event.clipboardData,
      )

      if (!source) {
        return
      }

      event.preventDefault()
      insertTableSource(source)
    }

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [canImportTable, insertTableSource])

  useEffect(() => {
    if (!canImportTable) {
      return undefined
    }

    const handleDragOver = (event: DragEvent) => {
      if (getCanvasTableCsvFileFromDataTransfer(event.dataTransfer)) {
        event.preventDefault()
      }
    }

    const handleDrop = (event: DragEvent) => {
      const file = getCanvasTableCsvFileFromDataTransfer(event.dataTransfer)

      if (file) {
        event.preventDefault()
        void insertTableCsvFile(file, event)
        return
      }

      const source = getCanvasTableCsvSourceFromDataTransfer(
        event.dataTransfer,
      )

      if (!source) {
        return
      }

      event.preventDefault()
      insertTableSource(source, event)
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [canImportTable, insertTableCsvFile, insertTableSource])
}
