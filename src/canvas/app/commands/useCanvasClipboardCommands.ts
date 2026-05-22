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
  deleteCanvasCommand,
  duplicateCanvasCommand,
  type CanvasCommandAdapter,
} from '../../engine/command/CanvasCommandEngine'
import type { CanvasAffordanceConfig } from '../../engine/affordance/CanvasAffordances'
import type { Point, Viewport } from '../../entities'
import type { CanvasItem, EditingText } from '../../entities'
import {
  createAddCanvasItemsPatch,
  createRemoveCanvasItemsPatch,
} from '../../host/document/CanvasDocumentPatches'
import { getCanvasPasteOffset } from './CanvasPastePosition'
import type {
  CanvasDocumentClipboard,
  CommitCanvasSelection,
  CommitCanvasItemsPatch,
} from '../document/useCanvasDocument'

type UseCanvasClipboardCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitSelection: CommitCanvasSelection
  commitItemsPatch: CommitCanvasItemsPatch
  config: CanvasAffordanceConfig
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  createId: (prefix: string) => string
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  svgRef: RefObject<SVGSVGElement | null>
  viewport: Viewport
}

export function useCanvasClipboardCommands({
  commandAdapter,
  commitSelection,
  commitItemsPatch,
  config,
  copyItemsToClipboard,
  createId,
  getClipboardItems,
  items,
  selection,
  setEditing,
  setClipboardItems,
  svgRef,
  viewport,
}: UseCanvasClipboardCommandsArgs) {
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

      const didCommit = commitItemsPatch(createAddCanvasItemsPatch(result.clones), {
        before: selection,
        after: result.selection,
      })

      if (!didCommit) {
        return []
      }

      return result.clones
    },
    [
      commandAdapter,
      commitItemsPatch,
      config,
      createId,
      items,
      selection,
    ],
  )

  const copySelection = useCallback(() => {
    if (!config.commands.copy || !copyItemsToClipboard(selection)) {
      return
    }

    pasteIndexRef.current = 0
  }, [config.commands.copy, copyItemsToClipboard, selection])

  const pasteSelection = useCallback(() => {
    if (!config.commands.paste) {
      return
    }

    const clipboard = getClipboardItems()
    const offset = getCanvasPasteOffset({
      clipboard,
      pasteIndex: pasteIndexRef.current,
      viewportCenter: getViewportCenter(svgRef, viewport),
    })
    const clones = commandAdapter.pasteItems({
      clipboard,
      createId,
      offset,
    })

    if (clones.length === 0) {
      return
    }

    const didCommit = commitItemsPatch(createAddCanvasItemsPatch(clones), {
      before: selection,
      after: clones.map((item) => item.id),
    })

    if (!didCommit) {
      return
    }

    setClipboardItems(clones)
    pasteIndexRef.current += 1
  }, [
    commandAdapter,
    commitItemsPatch,
    config.commands.paste,
    createId,
    getClipboardItems,
    selection,
    setClipboardItems,
    svgRef,
    viewport,
  ])

  const cutSelection = useCallback(() => {
    if (!config.commands.cut) {
      return
    }

    if (config.commands.copy && copyItemsToClipboard(selection)) {
      pasteIndexRef.current = 0
    }

    const deletion = deleteCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!deletion) {
      return
    }

    const patch = createRemoveCanvasItemsPatch(items, selection)

    if (patch.length > 0) {
      commitItemsPatch(patch, {
        before: selection,
        after: deletion.selection,
      })
    } else {
      commitSelection(deletion.selection)
    }

    setEditing((current) =>
      current && deletion.clearEditingIds.includes(current.id)
        ? null
        : current,
    )
  }, [
    commandAdapter,
    commitSelection,
    commitItemsPatch,
    config,
    copyItemsToClipboard,
    items,
    selection,
    setEditing,
  ])

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
