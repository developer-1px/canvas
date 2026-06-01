import type { KeyboardEvent } from 'react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  dispatchHtmlSpecimenPreviewFocusRequest,
} from './HtmlSpecimenPreviewFocusRequest'
import {
  getHtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import {
  createHtmlSpecimenOutlineFromHtml,
  deleteHtmlSpecimenOutlineNode,
  findHtmlSpecimenOutlineElementById,
  pasteHtmlSpecimenOutlineNodes,
  replaceHtmlSpecimenOutlineText,
  type HtmlSpecimenOutlineEditResult,
  type HtmlSpecimenOutlineElement,
} from './HtmlSpecimenOutline'
import {
  commitHtmlSpecimenOutline,
} from './HtmlSpecimenOutlineCommit'
import {
  HtmlSpecimenOutlineClipboardControls,
  HtmlSpecimenOutlineToolbar,
} from './HtmlSpecimenOutlineControls'
import {
  focusHtmlSpecimenOutlineKeyboardRow,
  getHtmlSpecimenOutlineKeyboardCommand,
  getHtmlSpecimenOutlineRowElementId,
  isHtmlSpecimenOutlineFocusCommand,
  isHtmlSpecimenOutlineTextEntryTarget,
  runHtmlSpecimenOutlineCommand,
  type HtmlSpecimenOutlineCommand,
} from './HtmlSpecimenOutlineKeyboard'
import {
  createHtmlSpecimenOutlineRows,
  formatHtmlSpecimenOutlineRowLabel,
  type HtmlSpecimenOutlineEditorNode,
} from './HtmlSpecimenOutlineRows'
import {
  HtmlSpecimenOutlineTree,
} from './HtmlSpecimenOutlineTree'

export type { HtmlSpecimenOutlineEditorNode }

export type HtmlSpecimenOutlineEditorTarget = {
  item: CanvasCustomItem
  node: HtmlSpecimenOutlineEditorNode
  nodes: readonly HtmlSpecimenOutlineEditorNode[]
}

type HtmlSpecimenOutlineClipboard = {
  nodes: HtmlSpecimenOutlineElement[]
}

export function HtmlSpecimenOutlineEditor({
  context,
  target,
}: {
  context: CanvasAppInspectorPanelContext
  target: HtmlSpecimenOutlineEditorTarget
}) {
  const specimen = getHtmlSpecimenData(target.item)
  const outline = useMemo(
    () => createHtmlSpecimenOutlineFromHtml(specimen.html),
    [specimen.html],
  )
  const rows = useMemo(
    () => createHtmlSpecimenOutlineRows({
      nodes: target.nodes,
      outline,
    }),
    [outline, target.nodes],
  )
  const [editNodeId, setEditNodeId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [clipboard, setClipboard] =
    useState<HtmlSpecimenOutlineClipboard | null>(null)
  const treeRef = useRef<HTMLDivElement | null>(null)

  const focusNodeId = rows.some((row) => row.id === target.node.id)
    ? target.node.id
    : rows[0]?.id ?? target.node.id
  const focusedRow = rows.find((row) => row.id === focusNodeId) ??
    rows[0] ??
    null
  const canMutate = !context.disabled && outline !== null && focusedRow !== null
  const activeRowElementId = focusedRow
    ? getHtmlSpecimenOutlineRowElementId(focusedRow.id)
    : undefined

  useEffect(() => {
    if (!activeRowElementId) {
      return
    }

    const activeRow = document.getElementById(activeRowElementId)

    if (!activeRow || !treeRef.current?.contains(activeRow)) {
      return
    }

    activeRow.scrollIntoView({ block: 'nearest' })
  }, [activeRowElementId])

  const focusTree = () => {
    treeRef.current?.focus({ preventScroll: true })
  }

  const requestTreeFocus = () => {
    window.requestAnimationFrame(() => {
      focusTree()
    })
  }

  const focusRow = (nodeId: string) => {
    dispatchHtmlSpecimenPreviewFocusRequest(window, {
      itemId: target.item.id,
      nodeId,
    })
  }

  const startEdit = (nodeId: string) => {
    const row = rows.find((candidate) => candidate.id === nodeId)

    if (!row?.editable || context.disabled) {
      return
    }

    setEditNodeId(nodeId)
    setDraftText(row.text)
  }

  const commitEdit = (nodeId: string, nextText: string) => {
    if (!outline) {
      setEditNodeId(null)
      return false
    }

    const result = replaceHtmlSpecimenOutlineText({
      nextText,
      nodeId,
      outline,
    })

    if (!result.ok) {
      setEditNodeId(null)
      return false
    }

    setEditNodeId(null)

    return commitHtmlSpecimenOutline({
      change: {
        nextText,
        nodeId,
        previousText: result.previousText,
        target: formatHtmlSpecimenOutlineRowLabel(
          rows.find((row) => row.id === nodeId) ?? focusedRow,
        ),
      },
      context,
      nextFocusId: result.nextFocusId,
      outline: result.outline,
      specimen,
      targetItem: target.item,
    })
  }

  const commitCommand = (result: HtmlSpecimenOutlineEditResult) => {
    if (!result.ok) {
      return false
    }

    return commitHtmlSpecimenOutline({
      context,
      nextFocusId: result.nextFocusId,
      outline: result.outline,
      specimen,
      targetItem: target.item,
    })
  }

  const runCommand = (command: HtmlSpecimenOutlineCommand) => {
    if (!canMutate || !focusedRow || !outline) {
      return false
    }

    if (command === 'edit') {
      startEdit(focusedRow.id)
      return true
    }

    if (command === 'copy') {
      const node = findHtmlSpecimenOutlineElementById({
        nodeId: focusedRow.id,
        outline,
      })

      if (!node) {
        return false
      }

      setClipboard({ nodes: [node] })
      return true
    }

    if (command === 'cut') {
      const node = findHtmlSpecimenOutlineElementById({
        nodeId: focusedRow.id,
        outline,
      })

      if (!node) {
        return false
      }

      setClipboard({ nodes: [node] })
      return commitCommand(deleteHtmlSpecimenOutlineNode({
        nodeId: focusedRow.id,
        outline,
      }))
    }

    if (command === 'paste-sibling' || command === 'paste-child') {
      return clipboard
        ? commitCommand(pasteHtmlSpecimenOutlineNodes({
            mode: command === 'paste-child' ? 'child' : 'sibling',
            nodeId: focusedRow.id,
            outline,
            payload: clipboard.nodes,
          }))
        : false
    }

    return commitCommand(runHtmlSpecimenOutlineCommand({
      command,
      nodeId: focusedRow.id,
      outline,
    }))
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return
    }

    if (isHtmlSpecimenOutlineTextEntryTarget(event.target)) {
      return
    }

    const command = getHtmlSpecimenOutlineKeyboardCommand(event)

    if (!command) {
      return
    }

    if (editNodeId) {
      return
    }

    if (isHtmlSpecimenOutlineFocusCommand(command)) {
      if (focusHtmlSpecimenOutlineKeyboardRow({
        command,
        focusNodeId,
        rows,
        targetItemId: target.item.id,
      })) {
        event.preventDefault()
        event.stopPropagation()
      }
      return
    }

    if (runCommand(command)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <div className="html-specimen-outline">
      <HtmlSpecimenOutlineTree
        activeRowElementId={activeRowElementId}
        draftText={draftText}
        editNodeId={editNodeId}
        focusNodeId={focusNodeId}
        onCancelEdit={() => {
          setEditNodeId(null)
          requestTreeFocus()
        }}
        onCommitEdit={(rowId, value, reason) => {
          commitEdit(rowId, value)

          if (reason === 'keyboard') {
            requestTreeFocus()
          }
        }}
        onDraftTextChange={setDraftText}
        onFocusRow={(nodeId, eventDetail) => {
          focusRow(nodeId)

          if (eventDetail > 1) {
            startEdit(nodeId)
            return
          }

          focusTree()
        }}
        onKeyDown={handleKeyDown}
        onStartEdit={startEdit}
        rows={rows}
        treeRef={treeRef}
      />
      <div className="html-specimen-outline-actions">
        <HtmlSpecimenOutlineToolbar
          canMutate={canMutate}
          disabled={context.disabled}
          focusedRow={focusedRow}
          onCommand={runCommand}
          onEdit={startEdit}
        />
        <HtmlSpecimenOutlineClipboardControls
          canMutate={canMutate}
          hasClipboard={clipboard !== null}
          onCommand={runCommand}
        />
      </div>
    </div>
  )
}
