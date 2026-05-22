import {
  useCallback,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import {
  CANVAS_COMMAND_INSERT_OFFSET,
  cloneCanvasCommandItems,
  copyCanvasCommand,
  cutCanvasCommand,
  duplicateCanvasCommand,
  pasteCanvasCommand,
  type CanvasCommandAdapter,
} from '../../engine/CanvasCommandEngine'
import type { CanvasAffordanceConfig } from '../../engine/CanvasAffordances'
import type { Point, Viewport } from '../../engine/CanvasPrimitives'
import type { CanvasItem, EditingText } from '../../host/CanvasModel'
import { getCanvasPasteOffset } from './CanvasPastePosition'
import type { CommitCanvasItems } from './useCanvasHistory'

type UseCanvasClipboardCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setItems: CommitCanvasItems
  setSelection: Dispatch<SetStateAction<string[]>>
  svgRef: RefObject<SVGSVGElement | null>
  viewport: Viewport
}

export function useCanvasClipboardCommands({
  commandAdapter,
  config,
  createId,
  items,
  selection,
  setEditing,
  setItems,
  setSelection,
  svgRef,
  viewport,
}: UseCanvasClipboardCommandsArgs) {
  const clipboardRef = useRef<CanvasItem[]>([])
  const pasteIndexRef = useRef(0)

  const cloneItems = useCallback(
    (ids: string[], offset: Point) =>
      cloneCanvasCommandItems({
        adapter: commandAdapter,
        createId,
        ids,
        items,
        offset,
      }),
    [commandAdapter, createId, items],
  )

  const duplicateSelection = useCallback(
    (sourceIds = selection, offset: Point = CANVAS_COMMAND_INSERT_OFFSET) => {
      const result = duplicateCanvasCommand({
        adapter: commandAdapter,
        config,
        createId,
        items,
        offset,
        selection,
        sourceIds,
      })

      if (!result) {
        return []
      }

      setItems(result.items, {
        before: selection,
        after: result.selection,
      })
      setSelection(result.selection)
      return result.clones
    },
    [commandAdapter, config, createId, items, selection, setItems, setSelection],
  )

  const copySelection = useCallback(() => {
    const clipboard = copyCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!clipboard) {
      return
    }

    clipboardRef.current = clipboard
    pasteIndexRef.current = 0
  }, [commandAdapter, config, items, selection])

  const pasteSelection = useCallback(() => {
    const offset = getCanvasPasteOffset({
      clipboard: clipboardRef.current,
      pasteIndex: pasteIndexRef.current,
      viewportCenter: getViewportCenter(svgRef, viewport),
    })
    const result = pasteCanvasCommand({
      adapter: commandAdapter,
      clipboard: clipboardRef.current,
      config,
      createId,
      items,
      offset,
    })

    if (!result) {
      return
    }

    clipboardRef.current = result.clipboard
    pasteIndexRef.current += 1
    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [
    commandAdapter,
    config,
    createId,
    items,
    selection,
    setItems,
    setSelection,
    svgRef,
    viewport,
  ])

  const cutSelection = useCallback(() => {
    const result = cutCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!result) {
      return
    }

    if (result.clipboard) {
      clipboardRef.current = result.clipboard
      pasteIndexRef.current = 0
    }

    const deletion = result.deletion

    if (!deletion) {
      return
    }

    setItems(deletion.items, {
      before: selection,
      after: deletion.selection,
    })
    setEditing((current) =>
      current && deletion.clearEditingIds.includes(current.id)
        ? null
        : current,
    )
    setSelection(deletion.selection)
  }, [commandAdapter, config, items, selection, setEditing, setItems, setSelection])

  return {
    cloneItems,
    copySelection,
    cutSelection,
    duplicateSelection,
    pasteSelection,
  }
}

function getViewportCenter(
  svgRef: RefObject<SVGSVGElement | null>,
  viewport: Viewport,
): Point | null {
  const rect = svgRef.current?.getBoundingClientRect()

  if (!rect) {
    return null
  }

  return {
    x: (rect.width / 2 - viewport.x) / viewport.scale,
    y: (rect.height / 2 - viewport.y) / viewport.scale,
  }
}
