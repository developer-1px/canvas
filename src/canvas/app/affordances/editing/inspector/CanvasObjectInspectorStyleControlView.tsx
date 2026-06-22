import type { KeyboardEvent } from 'react'
import type {
  CanvasObjectStyleControl,
  CanvasObjectStyleNumberControl,
  CanvasObjectStyleSegmentedControl,
  CanvasObjectStyleSwatchControl,
} from './CanvasObjectStyleInspector'
import {
  createCanvasRadioGroupDescriptor,
  handleCanvasRadioGroupKeyDown,
} from '../../controls/radio/CanvasRadioGroup'
import { runCanvasEditableFieldKeyboardIntent } from '../../controls/editable-field/CanvasEditableFieldKeyboard'

export function CanvasObjectInspectorStyleControlView({
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
  const isDisabled = disabled || control.disabled
  const checkedSwatch = control.swatches.find((swatch) => swatch.selected)
  const swatchDescriptor = createCanvasRadioGroupDescriptor({
    ariaLabel: control.label,
    checkedId: checkedSwatch?.color ?? null,
    groupId: `canvas-object-style-${control.id}`,
    items: control.swatches.map((swatch) => ({
      ...swatch,
      disabled: isDisabled,
      id: swatch.color,
    })),
  })

  return (
    <div className="inspector-style-control">
      <div className="inspector-style-label">{control.label}</div>
      <div
        className="inspector-swatches"
        {...swatchDescriptor.rootAttributes}
        onKeyDown={handleCanvasRadioGroupKeyDown}
      >
        {swatchDescriptor.items.map((swatch) => (
          <button
            {...swatch.attributes}
            aria-label={`${control.label} ${swatch.color}`}
            className="inspector-swatch"
            disabled={swatch.isDisabled}
            key={swatch.color}
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
  const isDisabled = disabled || control.disabled
  const checkedSegment = control.segments.find((segment) => segment.selected)
  const segmentDescriptor = createCanvasRadioGroupDescriptor({
    ariaLabel: control.label,
    checkedId: checkedSegment?.value ?? control.value,
    groupId: `canvas-object-style-${control.id}`,
    items: control.segments.map((segment) => ({
      ...segment,
      disabled: isDisabled,
      id: segment.value,
    })),
  })

  return (
    <div className="inspector-style-control">
      <div className="inspector-style-label">{control.label}</div>
      <div
        className="inspector-segments"
        {...segmentDescriptor.rootAttributes}
        onKeyDown={handleCanvasRadioGroupKeyDown}
      >
        {segmentDescriptor.items.map((segment) => (
          <button
            {...segment.attributes}
            aria-label={`${control.label} ${segment.label}`}
            className="inspector-segment"
            disabled={segment.isDisabled}
            key={segment.value}
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

function formatStyleNumberValue(value: number | null) {
  return value === null ? '' : String(value)
}
