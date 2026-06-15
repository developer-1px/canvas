import type {
  DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import type {
  DomEditLayoutContext,
  DomEditNodeState,
} from '../../../shared/model/DomEditTypes'
import type { DomEditAutoLayoutRect } from './DomEditAutoLayoutGeometry'

type DomEditSizeModeAxis = 'height' | 'width'
type DomEditSizeMode = DomEditNodeState['widthMode']

export function DomEditSizeModeCapsule({
  heightMode,
  heightValue,
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
        showFill={showFill}
        value={heightValue}
        onChange={onChangeHeight}
      />
    </div>
  )
}

export function shouldRenderDomEditSizeModeCapsule({
  affordanceState,
  context,
  isDragging,
}: {
  affordanceState: DomEditAffordanceState
  context: DomEditLayoutContext
  isDragging: boolean
}) {
  return (
    context.showSelfLayout ||
    context.showGridLayout ||
    context.showParentParticipation
  ) &&
    affordanceState.mode !== 'measure' &&
    affordanceState.mode !== 'xray' &&
    !isDragging
}

function DomEditSizeModeControl({
  axis,
  mode,
  showFill,
  value,
  onChange,
}: {
  axis: DomEditSizeModeAxis
  mode: DomEditSizeMode
  showFill: boolean
  value: number
  onChange: (mode: DomEditSizeMode) => void
}) {
  const availableModes = getDomEditAvailableSizeModes({ mode, showFill })
  const axisLabel = axis === 'width' ? 'W' : 'H'

  return (
    <div
      aria-label={`${axisLabel} ${Math.round(value)} ${getDomEditSizeModeLabel(mode)}`}
      className="figma-size-mode-control"
      data-mode={mode}
      role="group"
      tabIndex={0}
      title={`${axisLabel} ${getDomEditSizeModeLabel(mode)}`}
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
    >
      <span className="figma-size-mode-control__summary">
        <span className="figma-size-mode-capsule__axis">{axisLabel}</span>
        <span className="figma-size-mode-capsule__value">
          {Math.round(value)}
        </span>
        <span className="figma-size-mode-capsule__mode">
          {getDomEditSizeModeLabel(mode)}
        </span>
      </span>
      <span className="figma-size-mode-control__choices">
        {availableModes.map((availableMode) => (
          <button
            key={availableMode}
            aria-label={`${axisLabel} ${getDomEditSizeModeLabel(availableMode)}`}
            aria-pressed={availableMode === mode}
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
  mode,
  showFill,
}: {
  mode: DomEditSizeMode
  showFill: boolean
}): DomEditSizeMode[] {
  return showFill || mode === 'fill'
    ? ['fixed', 'hug', 'fill']
    : ['fixed', 'hug']
}
