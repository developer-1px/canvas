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
  type CanvasAffordanceConfig,
  type CanvasCommandAdapter,
} from '../../engine'
import type {
  Point,
  Viewport,
} from '../../core'
import type {
  CanvasItem,
  EditingText,
} from '../../host'
import { getCanvasPasteOffset } from './CanvasPastePosition'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

type UseCanvasClipboardCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
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
  commitItemsChange,
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

      const didCommit = commitItemsChange({ type: 'add', items: result.clones }, {
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
      commitItemsChange,
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

    const didCommit = commitItemsChange({ type: 'add', items: clones }, {
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
    commitItemsChange,
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

    const didCommit = commitItemsChange(
      { type: 'remove-selection', selection },
      {
        before: selection,
        after: deletion.selection,
      },
    )

    if (!didCommit) {
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
    commitItemsChange,
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
