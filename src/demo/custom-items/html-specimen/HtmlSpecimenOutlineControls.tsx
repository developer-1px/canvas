import type {
  HtmlSpecimenOutlineCommand,
} from './HtmlSpecimenOutlineKeyboard'
import type {
  HtmlSpecimenOutlineRow,
} from './HtmlSpecimenOutlineRows'

export function HtmlSpecimenOutlineToolbar({
  canMutate,
  disabled,
  focusedRow,
  onCommand,
  onEdit,
}: {
  canMutate: boolean
  disabled: boolean
  focusedRow: HtmlSpecimenOutlineRow | null
  onCommand: (command: HtmlSpecimenOutlineCommand) => void
  onEdit: (nodeId: string) => void
}) {
  return (
    <div className="html-specimen-outline-toolbar">
      <button
        aria-label="Edit text"
        disabled={!focusedRow?.editable || disabled}
        onClick={() => focusedRow && onEdit(focusedRow.id)}
        type="button"
      >
        Edit
      </button>
      <button
        aria-label="Move up"
        disabled={!canMutate}
        onClick={() => onCommand('move-up')}
        type="button"
      >
        Up
      </button>
      <button
        aria-label="Move down"
        disabled={!canMutate}
        onClick={() => onCommand('move-down')}
        type="button"
      >
        Down
      </button>
      <button
        aria-label="Outdent"
        disabled={!canMutate}
        onClick={() => onCommand('promote')}
        type="button"
      >
        Out
      </button>
      <button
        aria-label="Indent"
        disabled={!canMutate}
        onClick={() => onCommand('demote')}
        type="button"
      >
        In
      </button>
      <button
        aria-label="Duplicate"
        disabled={!canMutate}
        onClick={() => onCommand('duplicate')}
        type="button"
      >
        Dup
      </button>
      <button
        aria-label="Delete"
        disabled={!canMutate}
        onClick={() => onCommand('delete')}
        type="button"
      >
        Del
      </button>
    </div>
  )
}

export function HtmlSpecimenOutlineClipboardControls({
  canMutate,
  hasClipboard,
  onCommand,
}: {
  canMutate: boolean
  hasClipboard: boolean
  onCommand: (command: HtmlSpecimenOutlineCommand) => void
}) {
  return (
    <div className="html-specimen-outline-clipboard">
      <button
        aria-label="Copy"
        disabled={!canMutate}
        onClick={() => onCommand('copy')}
        type="button"
      >
        Copy
      </button>
      <button
        aria-label="Cut"
        disabled={!canMutate}
        onClick={() => onCommand('cut')}
        type="button"
      >
        Cut
      </button>
      <button
        aria-label="Paste sibling"
        disabled={!canMutate || !hasClipboard}
        onClick={() => onCommand('paste-sibling')}
        type="button"
      >
        Paste
      </button>
      <button
        aria-label="Paste child"
        disabled={!canMutate || !hasClipboard}
        onClick={() => onCommand('paste-child')}
        type="button"
      >
        Child
      </button>
    </div>
  )
}
