import type {
  KeyboardEvent,
  ReactNode,
} from 'react'
import type { Bounds } from '../../../../entities'
import { MIN_ITEM_SIZE } from '../../../../core'
import type {
  CanvasObjectStyleControl,
  CanvasObjectStyleNumberControl,
  CanvasObjectStyleSegmentedControl,
  CanvasObjectStyleSwatchControl,
} from './CanvasObjectStyleInspector'
import type { CanvasObjectInspectorCommentThread } from './CanvasObjectInspectorCommentThread'
import {
  getCanvasRadioTabIndex,
  handleCanvasRadioGroupKeyDown,
} from '../../controls/radio/CanvasRadioGroup'
import { runCanvasEditableFieldKeyboardIntent } from '../../controls/editable-field/CanvasEditableFieldKeyboard'

type CanvasObjectInspectorPanel = {
  content: ReactNode
  id: string
}

type CanvasObjectInspectorProps = {
  bounds: Bounds | null
  commentThread: CanvasObjectInspectorCommentThread | null
  customPanels: readonly CanvasObjectInspectorPanel[]
  disabled: boolean
  label: string | null
  styleControls: readonly CanvasObjectStyleControl[]
  onChangeBounds: (bounds: Bounds) => void
}

export const CANVAS_COMMENT_THREAD_MODEL = 'canvas-comment-thread'

type BoundsField = keyof Bounds

const FIELDS: Array<{ id: BoundsField; label: string; min?: number }> = [
  { id: 'x', label: 'X' },
  { id: 'y', label: 'Y' },
  { id: 'w', label: 'W', min: MIN_ITEM_SIZE },
  { id: 'h', label: 'H', min: MIN_ITEM_SIZE },
]

export function CanvasObjectInspector({
  bounds,
  commentThread,
  customPanels,
  disabled,
  label,
  styleControls,
  onChangeBounds,
}: CanvasObjectInspectorProps) {
  if (
    (!bounds || !label) &&
    !commentThread &&
    customPanels.length === 0 &&
    styleControls.length === 0
  ) {
    return null
  }

  const commitField = (field: BoundsField, inputValue: string) => {
    if (!bounds) {
      return
    }

    const value = Number(inputValue)

    if (!Number.isFinite(value)) {
      return
    }

    const minimum = field === 'w' || field === 'h' ? MIN_ITEM_SIZE : undefined
    const nextValue = minimum === undefined ? value : Math.max(minimum, value)

    onChangeBounds({
      ...bounds,
      [field]: nextValue,
    })
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    field: BoundsField,
  ) => {
    if (!bounds) {
      return
    }

    runCanvasEditableFieldKeyboardIntent({
      event,
      onCancel: () => {
        event.currentTarget.value = formatBoundsValue(bounds[field])
        event.currentTarget.blur()
      },
      onCommit: () => {
        event.currentTarget.blur()
      },
    })
  }

  return (
    <aside className="object-inspector" aria-label="Inspector">
      {bounds && label ? (
        <>
          <div className="inspector-header">{label}</div>
          <div className="inspector-grid">
            {FIELDS.map((field) => (
              <label className="inspector-field" key={field.id}>
                <span>{field.label}</span>
                <input
                  key={`${field.id}:${
                    formatBoundsValue(bounds[field.id])
                  }`}
                  defaultValue={formatBoundsValue(bounds[field.id])}
                  disabled={disabled}
                  inputMode="numeric"
                  min={field.min}
                  onBlur={(event) =>
                    commitField(field.id, event.currentTarget.value)
                  }
                  onKeyDown={(event) => handleKeyDown(event, field.id)}
                  step="1"
                  type="number"
                />
              </label>
            ))}
          </div>
        </>
      ) : null}
      {styleControls.length > 0 ? (
        <div className="inspector-style-controls">
          {styleControls.map((control) => (
            <CanvasObjectInspectorStyleControlView
              control={control}
              disabled={disabled}
              key={control.id}
            />
          ))}
        </div>
      ) : null}
      {commentThread ? (
        <CanvasObjectInspectorCommentThreadView thread={commentThread} />
      ) : null}
      {customPanels.map((panel) => (
        <div className="inspector-custom-panel" key={panel.id}>
          {panel.content}
        </div>
      ))}
    </aside>
  )
}

function CanvasObjectInspectorCommentThreadView({
  thread,
}: {
  thread: CanvasObjectInspectorCommentThread
}) {
  return (
    <section
      aria-label="Comment thread"
      className="inspector-comment-thread"
      data-canvas-comment-thread-model={CANVAS_COMMENT_THREAD_MODEL}
      data-resolved={thread.resolved ? 'true' : 'false'}
    >
      <div className="inspector-comment-thread-header">
        <span>{thread.resolved ? 'Resolved' : 'Open'}</span>
        <button
          disabled={thread.disabled}
          onClick={thread.onToggleResolved}
          type="button"
        >
          {thread.resolved ? 'Reopen' : 'Resolve'}
        </button>
      </div>
      <div className="inspector-comment-thread-messages">
        {thread.messages.map((message) => (
          <article
            className="inspector-comment-thread-message"
            key={message.id}
          >
            <div className="inspector-comment-thread-meta">
              <span>{message.authorName}</span>
              <span>{message.createdAt}</span>
            </div>
            <div className="inspector-comment-thread-body">{message.body}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CanvasObjectInspectorStyleControlView({
  control,
  disabled,
}: {
  control: CanvasObjectStyleControl
  disabled: boolean
}) {
  if (control.kind === 'number') {
    return (
      <CanvasObjectInspectorNumberStyleControl
        control={control}
        disabled={disabled}
      />
    )
  }

  if (control.kind === 'segmented') {
    return (
      <CanvasObjectInspectorSegmentedStyleControl
        control={control}
        disabled={disabled}
      />
    )
  }

  return (
    <CanvasObjectInspectorSwatchStyleControl
      control={control}
      disabled={disabled}
    />
  )
}

function CanvasObjectInspectorSwatchStyleControl({
  control,
  disabled,
}: {
  control: CanvasObjectStyleSwatchControl
  disabled: boolean
}) {
  return (
    <div className="inspector-style-control">
      <div className="inspector-style-label">{control.label}</div>
      <div
        className="inspector-swatches"
        role="radiogroup"
        aria-label={control.label}
        onKeyDown={handleCanvasRadioGroupKeyDown}
      >
        {control.swatches.map((swatch) => (
          <button
            aria-label={`${control.label} ${swatch.color}`}
            aria-checked={swatch.selected}
            className="inspector-swatch"
            disabled={disabled || control.disabled}
            key={swatch.color}
            role="radio"
            tabIndex={getCanvasRadioTabIndex({
              checked: swatch.selected,
              disabled: disabled || control.disabled,
            })}
            onClick={() => control.onSelect(swatch.color)}
            style={{ backgroundColor: swatch.color }}
            title={swatch.color}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}

function CanvasObjectInspectorNumberStyleControl({
  control,
  disabled,
}: {
  control: CanvasObjectStyleNumberControl
  disabled: boolean
}) {
  const commitNumber = (value: string) => {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      control.onChange(parsed)
    }
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    runCanvasEditableFieldKeyboardIntent({
      event,
      onCancel: () => {
        event.currentTarget.value = formatStyleNumberValue(control.value)
        event.currentTarget.blur()
      },
      onCommit: () => {
        event.currentTarget.blur()
      },
    })
  }

  return (
    <label className="inspector-style-control">
      <span className="inspector-style-label">{control.label}</span>
      <input
        aria-label={control.label}
        className="inspector-style-number"
        defaultValue={formatStyleNumberValue(control.value)}
        disabled={disabled || control.disabled}
        inputMode="decimal"
        key={`${control.id}:${formatStyleNumberValue(control.value)}`}
        max={control.max}
        min={control.min}
        onBlur={(event) => commitNumber(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={control.mixed ? 'Mixed' : undefined}
        step={control.step}
        type="number"
      />
    </label>
  )
}

function CanvasObjectInspectorSegmentedStyleControl({
  control,
  disabled,
}: {
  control: CanvasObjectStyleSegmentedControl
  disabled: boolean
}) {
  return (
    <div className="inspector-style-control">
      <div className="inspector-style-label">{control.label}</div>
      <div
        className="inspector-segments"
        role="radiogroup"
        aria-label={control.label}
        onKeyDown={handleCanvasRadioGroupKeyDown}
      >
        {control.segments.map((segment) => (
          <button
            aria-label={`${control.label} ${segment.label}`}
            aria-checked={segment.selected}
            className="inspector-segment"
            disabled={disabled || control.disabled}
            key={segment.value}
            role="radio"
            tabIndex={getCanvasRadioTabIndex({
              checked: segment.selected,
              disabled: disabled || control.disabled,
            })}
            onClick={() => control.onSelect(segment.value)}
            type="button"
          >
            {segment.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function formatBoundsValue(value: number | undefined) {
  return value === undefined ? '' : String(Math.round(value))
}

function formatStyleNumberValue(value: number | null) {
  return value === null ? '' : String(value)
}
