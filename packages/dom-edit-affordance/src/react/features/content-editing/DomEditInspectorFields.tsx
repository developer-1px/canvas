import type {
  DomEditAutoLayoutField,
  DomEditField,
  DomEditNodeId,
  DomEditNodeState,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditRadioTabIndex,
  handleDomEditRadioGroupKeyDown,
} from '../../shared/DomEditRadioGroup'
import {
  resolveDomEditSpacingGridSize,
  snapDomEditSpacingValue,
} from '../../../shared/gesture/DomEditOverlayGesture'

export function DomEditResizeModeFields<TNodeId extends DomEditNodeId>({
  heightMode,
  heightValue,
  selectedNodeId,
  showFill,
  widthMode,
  widthValue,
  onChange,
}: {
  heightMode: DomEditNodeState['heightMode']
  heightValue: number
  selectedNodeId: TNodeId
  showFill: boolean
  widthMode: DomEditNodeState['widthMode']
  widthValue: number
  onChange: (
    nodeId: TNodeId,
    field: DomEditAutoLayoutField,
    value: DomEditNodeState[DomEditAutoLayoutField],
  ) => void
}) {
  return (
    <div className="figma-size-cycle-fields">
      <DomEditSizeCycleField
        axis="W"
        mode={widthMode}
        showFill={showFill || widthMode === 'fill' || heightMode === 'fill'}
        value={widthValue}
        onChange={(value) => {
          onChange(selectedNodeId, 'widthMode', value)
        }}
      />
      <DomEditSizeCycleField
        axis="H"
        mode={heightMode}
        showFill={showFill || widthMode === 'fill' || heightMode === 'fill'}
        value={heightValue}
        onChange={(value) => {
          onChange(selectedNodeId, 'heightMode', value)
        }}
      />
    </div>
  )
}

export function DomEditSegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="figma-segmented-field">
      <span>{label}</span>
      <div
        className="figma-segmented-control"
        role="radiogroup"
        aria-label={label}
        onKeyDown={handleDomEditRadioGroupKeyDown}
      >
        {options.map((option) => (
          <button
            aria-checked={option.value === value}
            key={option.value}
            role="radio"
            tabIndex={getDomEditRadioTabIndex({
              checked: option.value === value,
            })}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DomEditNumberField<TNodeId extends DomEditNodeId>({
  field,
  label,
  nodeId,
  spacingGridSize,
  value,
  onChange,
}: {
  field: DomEditField
  label: string
  nodeId: TNodeId
  spacingGridSize?: number
  value: number
  onChange: (
    nodeId: TNodeId,
    field: DomEditField,
    value: number,
  ) => void
}) {
  const normalizedSpacingGridSize = spacingGridSize === undefined
    ? undefined
    : resolveDomEditSpacingGridSize({ gridSize: spacingGridSize })

  return (
    <label className="figma-number-field">
      <span>{label}</span>
      <input
        aria-label={label}
        step={normalizedSpacingGridSize}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.currentTarget.value)

          onChange(
            nodeId,
            field,
            normalizedSpacingGridSize === undefined
              ? nextValue
              : snapDomEditSpacingValue(nextValue, {
                  gridSize: normalizedSpacingGridSize,
                }),
          )
        }}
      />
    </label>
  )
}

export function DomEditReadOnlyField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="figma-readonly-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function DomEditTextField<TNodeId extends DomEditNodeId>({
  nodeId,
  value,
  onChange,
}: {
  nodeId: TNodeId
  value: string
  onChange: (nodeId: TNodeId, value: string) => void
}) {
  return (
    <label className="figma-text-field">
      <span>Text</span>
      <textarea
        aria-label="Text"
        rows={Math.min(3, Math.max(1, value.split('\n').length))}
        value={value}
        onChange={(event) => {
          onChange(nodeId, event.currentTarget.value)
        }}
      />
    </label>
  )
}

function DomEditSizeCycleField({
  axis,
  mode,
  showFill,
  value,
  onChange,
}: {
  axis: 'H' | 'W'
  mode: DomEditNodeState['widthMode']
  showFill: boolean
  value: number
  onChange: (value: DomEditNodeState['widthMode']) => void
}) {
  return (
    <button
      aria-label={`${axis} ${Math.round(value)} ${formatDomEditSizeMode(mode)}`}
      className="figma-size-cycle-field"
      data-mode={mode}
      type="button"
      onClick={() => onChange(getNextDomEditSizeMode({ mode, showFill }))}
    >
      <span>{axis}</span>
      <strong>{Math.round(value)}</strong>
      <em>{formatDomEditSizeMode(mode)}</em>
    </button>
  )
}

function getNextDomEditSizeMode({
  mode,
  showFill,
}: {
  mode: DomEditNodeState['widthMode']
  showFill: boolean
}): DomEditNodeState['widthMode'] {
  const modes: DomEditNodeState['widthMode'][] =
    showFill || mode === 'fill'
      ? ['fixed', 'hug', 'fill']
      : ['fixed', 'hug']
  const currentIndex = modes.indexOf(mode)

  return modes[(currentIndex + 1) % modes.length]
}

function formatDomEditSizeMode(mode: DomEditNodeState['widthMode']) {
  if (mode === 'fill') {
    return 'Fill'
  }

  if (mode === 'hug') {
    return 'Hug'
  }

  return 'Fixed'
}
