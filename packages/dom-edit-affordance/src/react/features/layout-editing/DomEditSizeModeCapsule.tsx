import type {
  DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import type {
  DomEditLayoutContext,
  DomEditNodeState,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditSizeSourceDescriptor,
} from '../../../features/size-editing/DomEditSizeSource'
import type { DomEditAutoLayoutRect } from './DomEditAutoLayoutGeometry'
import {
  getDomEditRadioTabIndex,
  handleDomEditRadioGroupKeyDown,
} from '../../shared/DomEditRadioGroup'

type DomEditSizeModeAxis = 'height' | 'width'
type DomEditSizeMode = DomEditNodeState['widthMode']

export function DomEditSizeModeCapsule({
  heightMode,
  heightValue,
  parentDisplay,
  rect,
  showFill,
  widthMode,
  widthValue,
  onAffordanceStateChange,
  onChangeHeight,
  onChangeWidth,
}: {
  heightMode: DomEditSizeMode
  heightValue: number
  parentDisplay: DomEditLayoutContext['parentDisplay']
  rect: DomEditAutoLayoutRect & { scale: number }
  showFill: boolean
  widthMode: DomEditSizeMode
  widthValue: number
  onAffordanceStateChange: (state: DomEditAffordanceState) => void
  onChangeHeight: (mode: DomEditSizeMode) => void
  onChangeWidth: (mode: DomEditSizeMode) => void
}) {
  return (
    <div
      className="figma-size-mode-capsule"
      style={{
        left: rect.x + rect.w / 2,
        top: rect.y + rect.h + 5,
        transform: `translateX(-50%) scale(${1 / rect.scale})`,
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerEnter={() =>
        onAffordanceStateChange({
          mode: 'hover-property',
          property: 'size',
        })}
      onPointerLeave={() => onAffordanceStateChange({ mode: 'idle' })}
    >
      <DomEditSizeModeControl
        axis="width"
        mode={widthMode}
        parentDisplay={parentDisplay}
        showFill={showFill}
        value={widthValue}
        onChange={onChangeWidth}
      />
      <span className="figma-size-mode-capsule__divider" aria-hidden="true">
        x
      </span>
      <DomEditSizeModeControl
        axis="height"
        mode={heightMode}
        parentDisplay={parentDisplay}
        showFill={showFill}
        value={heightValue}
        onChange={onChangeHeight}
      />
    </div>
  )
}

function DomEditSizeModeControl({
  axis,
  mode,
  parentDisplay,
  showFill,
  value,
  onChange,
}: {
  axis: DomEditSizeModeAxis
  mode: DomEditSizeMode
  parentDisplay: DomEditLayoutContext['parentDisplay']
  showFill: boolean
  value: number
  onChange: (mode: DomEditSizeMode) => void
}) {
  const availableModes = getDomEditAvailableSizeModes({ showFill })
  const source = getDomEditSizeSourceDescriptor({
    axis,
    mode,
    parentDisplay,
    value,
  })

  return (
    <div
      aria-label={source.ariaLabel}
      className="figma-size-mode-control"
      data-mode={mode}
      data-parent-relative={source.isParentRelative ? 'true' : 'false'}
      data-size-source={source.kind}
      role="group"
      title={`${source.axisLabel} ${source.label}`}
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
    >
      <span className="figma-size-mode-control__summary">
        <span className="figma-size-mode-capsule__axis">
          {source.axisLabel}
        </span>
        <span className="figma-size-mode-capsule__value">
          {source.valueLabel}
        </span>
        <span className="figma-size-mode-capsule__mode">
          {source.label}
        </span>
      </span>
      <span
        className="figma-size-mode-control__choices"
        role="radiogroup"
        aria-label={source.ariaLabel}
        onKeyDown={handleDomEditRadioGroupKeyDown}
      >
        {availableModes.map((availableMode) => (
          <button
            key={availableMode}
            aria-label={`${source.axisLabel} ${getDomEditSizeModeLabel(availableMode)}`}
            aria-checked={availableMode === mode}
            role="radio"
            tabIndex={getDomEditRadioTabIndex({
              checked: availableMode === mode,
            })}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onChange(availableMode)
            }}
          >
            {getDomEditSizeModeLabel(availableMode)}
          </button>
        ))}
      </span>
    </div>
  )
}

function getDomEditSizeModeLabel(mode: DomEditSizeMode) {
  if (mode === 'hug') {
    return 'Hug'
  }

  if (mode === 'fill') {
    return 'Fill'
  }

  return 'Fixed'
}

function getDomEditAvailableSizeModes({
  showFill,
}: {
  showFill: boolean
}): DomEditSizeMode[] {
  return showFill ? ['fixed', 'hug', 'fill'] : ['fixed', 'hug']
}
