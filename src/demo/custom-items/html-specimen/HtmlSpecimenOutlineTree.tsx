import type {
  KeyboardEventHandler,
  RefObject,
} from 'react'
import {
  getHtmlSpecimenOutlineRowElementId,
} from './HtmlSpecimenOutlineKeyboard'
import {
  formatHtmlSpecimenOutlineRowLabel,
  formatHtmlSpecimenOutlineRowText,
  type HtmlSpecimenOutlineRow,
} from './HtmlSpecimenOutlineRows'
import {
  HtmlSpecimenOutlineTextInput,
} from './HtmlSpecimenOutlineTextInput'

const HTML_SPECIMEN_ROW_HEIGHT = 24

export function HtmlSpecimenOutlineTree({
  activeRowElementId,
  draftText,
  editNodeId,
  focusNodeId,
  onCancelEdit,
  onCommitEdit,
  onDraftTextChange,
  onFocusRow,
  onKeyDown,
  onStartEdit,
  rows,
  treeRef,
}: {
  activeRowElementId?: string
  draftText: string
  editNodeId: string | null
  focusNodeId: string
  onCancelEdit: () => void
  onCommitEdit: (rowId: string, value: string, reason: 'blur' | 'keyboard') => void
  onDraftTextChange: (value: string) => void
  onFocusRow: (nodeId: string, eventDetail: number) => void
  onKeyDown: KeyboardEventHandler<HTMLDivElement>
  onStartEdit: (nodeId: string) => void
  rows: readonly HtmlSpecimenOutlineRow[]
  treeRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      aria-activedescendant={activeRowElementId}
      aria-label="HTML outline"
      className="html-specimen-outline-tree"
      onKeyDown={onKeyDown}
      ref={treeRef}
      role="tree"
      tabIndex={0}
    >
      {rows.map((row) => (
        <div
          aria-expanded={row.hasChildren ? true : undefined}
          aria-level={row.path.length}
          aria-selected={row.id === focusNodeId}
          className="html-specimen-outline-row"
          data-active={row.id === focusNodeId}
          id={getHtmlSpecimenOutlineRowElementId(row.id)}
          key={row.id}
          role="treeitem"
          style={{
            minHeight: HTML_SPECIMEN_ROW_HEIGHT,
            paddingLeft: `${Math.max(0, row.path.length - 1) * 12 + 6}px`,
          }}
        >
          <span className="html-specimen-outline-marker">
            {row.hasChildren ? 'v' : row.editable ? 'T' : '-'}
          </span>
          {editNodeId === row.id ? (
            <HtmlSpecimenOutlineTextInput
              onCancel={onCancelEdit}
              onChange={onDraftTextChange}
              onCommit={(value, reason) => onCommitEdit(row.id, value, reason)}
              value={draftText}
            />
          ) : (
            <button
              aria-label={`${formatHtmlSpecimenOutlineRowLabel(row)} CSS`}
              className="html-specimen-outline-row-button"
              onClick={(event) => onFocusRow(row.id, event.detail)}
              onDoubleClick={() => onStartEdit(row.id)}
              tabIndex={-1}
              type="button"
            >
              <code>{formatHtmlSpecimenOutlineRowLabel(row)}</code>
              <span className="html-specimen-outline-row-text">
                {formatHtmlSpecimenOutlineRowText(row)}
              </span>
              <span className="html-specimen-outline-row-css">CSS</span>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
