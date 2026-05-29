import type {
  KeyboardEvent,
  ReactNode,
} from 'react'
import type { Bounds } from '../../../../entities'
import { MIN_ITEM_SIZE } from '../../../../core'

type CanvasObjectInspectorPanel = {
  content: ReactNode
  id: string
}

type CanvasObjectInspectorStyleControl = {
  disabled: boolean
  id: string
  label: string
  swatches: readonly CanvasObjectInspectorStyleSwatch[]
  onSelect: (color: string) => void
}

type CanvasObjectInspectorStyleSwatch = {
  color: string
  selected: boolean
}

type CanvasObjectInspectorProps = {
  bounds: Bounds | null
  customPanels: readonly CanvasObjectInspectorPanel[]
  disabled: boolean
  label: string | null
  styleControls: readonly CanvasObjectInspectorStyleControl[]
  onChangeBounds: (bounds: Bounds) => void
}

type BoundsField = keyof Bounds

const FIELDS: Array<{ id: BoundsField; label: string; min?: number }> = [
  { id: 'x', label: 'X' },
  { id: 'y', label: 'Y' },
  { id: 'w', label: 'W', min: MIN_ITEM_SIZE },
  { id: 'h', label: 'H', min: MIN_ITEM_SIZE },
]

export function CanvasObjectInspector({
  bounds,
  customPanels,
  disabled,
  label,
  styleControls,
  onChangeBounds,
}: CanvasObjectInspectorProps) {
  if ((!bounds || !label) && customPanels.length === 0 && styleControls.length === 0) {
    return null
  }

  const devtoolsPanelActive = customPanels.some((panel) =>
    panel.id === 'html-specimen-css')
  const objectBounds = devtoolsPanelActive ? null : bounds
  const objectLabel = devtoolsPanelActive ? null : label
  const visibleStyleControls = devtoolsPanelActive ? [] : styleControls

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

    if (event.key === 'Enter') {
      event.currentTarget.blur()
      return
    }

    if (event.key === 'Escape') {
      event.currentTarget.value = formatBoundsValue(bounds[field])
      event.currentTarget.blur()
    }
  }

  return (
    <aside
      className={devtoolsPanelActive
        ? 'object-inspector object-inspector-devtools'
        : 'object-inspector'}
      aria-label="Inspector"
    >
      {objectBounds && objectLabel ? (
        <>
          <div className="inspector-header">{objectLabel}</div>
          <div className="inspector-grid">
            {FIELDS.map((field) => (
              <label className="inspector-field" key={field.id}>
                <span>{field.label}</span>
                <input
                  key={`${field.id}:${
                    formatBoundsValue(objectBounds[field.id])
                  }`}
                  defaultValue={formatBoundsValue(objectBounds[field.id])}
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
      {visibleStyleControls.length > 0 ? (
        <div className="inspector-style-controls">
          {visibleStyleControls.map((control) => (
            <div className="inspector-style-control" key={control.id}>
              <div className="inspector-style-label">{control.label}</div>
              <div className="inspector-swatches">
                {control.swatches.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    className="inspector-swatch"
                    aria-label={`${control.label} ${swatch.color}`}
                    aria-pressed={swatch.selected}
                    disabled={disabled || control.disabled}
                    title={swatch.color}
                    style={{ backgroundColor: swatch.color }}
                    onClick={() => control.onSelect(swatch.color)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {customPanels.map((panel) => (
        <div className="inspector-custom-panel" key={panel.id}>
          {panel.content}
        </div>
      ))}
    </aside>
  )
}

function formatBoundsValue(value: number | undefined) {
  return value === undefined ? '' : String(Math.round(value))
}
