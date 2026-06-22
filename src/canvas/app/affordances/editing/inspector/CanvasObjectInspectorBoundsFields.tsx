import type { KeyboardEvent } from 'react'
import type { Bounds } from '../../../../entities'
import { MIN_ITEM_SIZE } from '../../../../core'
import { runCanvasEditableFieldKeyboardIntent } from '../../controls/editable-field/CanvasEditableFieldKeyboard'

type BoundsField = keyof Bounds

const FIELDS: Array<{ id: BoundsField; label: string; min?: number }> = [
  { id: 'x', label: 'X' },
  { id: 'y', label: 'Y' },
  { id: 'w', label: 'W', min: MIN_ITEM_SIZE },
  { id: 'h', label: 'H', min: MIN_ITEM_SIZE },
]

export function CanvasObjectInspectorBoundsFields({
  bounds,
  disabled,
  onChangeBounds,
}: {
  bounds: Bounds
  disabled: boolean
  onChangeBounds: (bounds: Bounds) => void
}) {
  const commitField = (field: BoundsField, inputValue: string) => {
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
    <div className="inspector-grid">
      {FIELDS.map((field) => (
        <label className="inspector-field" key={field.id}>
          <span>{field.label}</span>
          <input
            key={`${field.id}:${formatBoundsValue(bounds[field.id])}`}
            defaultValue={formatBoundsValue(bounds[field.id])}
            disabled={disabled}
            inputMode="numeric"
            min={field.min}
            onBlur={(event) => commitField(field.id, event.currentTarget.value)}
            onKeyDown={(event) => handleKeyDown(event, field.id)}
            step="1"
            type="number"
          />
        </label>
      ))}
    </div>
  )
}

function formatBoundsValue(value: number | undefined) {
  return value === undefined ? '' : String(Math.round(value))
}
