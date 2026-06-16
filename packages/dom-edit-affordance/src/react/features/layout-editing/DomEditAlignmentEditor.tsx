import {
  useEffect,
  type KeyboardEvent,
} from 'react'
import type {
  DomEditAutoLayoutAlign,
  DomEditAutoLayoutDistribution,
  DomEditAutoLayoutField,
  DomEditLayoutContext,
  DomEditNodeId,
  DomEditNodeState,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditRadioTabIndex,
  handleDomEditRadioGroupKeyDown,
} from '../../shared/DomEditRadioGroup'

export type DomEditAlignmentPreview = {
  align: Exclude<DomEditAutoLayoutAlign, 'auto'>
}

const DOM_EDIT_DISTRIBUTION_OPTIONS = [
  { label: 'Start', value: 'start' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'end' },
  { label: 'Between', value: 'space-between' },
] satisfies Array<{
  label: string
  value: Exclude<DomEditAutoLayoutDistribution, 'packed'>
}>

const DOM_EDIT_ALIGN_OPTIONS = [
  { label: 'Start', value: 'start' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'end' },
  { label: 'Stretch', value: 'stretch' },
] satisfies Array<{
  label: string
  value: Exclude<DomEditAutoLayoutAlign, 'auto'>
}>

export function DomEditAlignmentEditor<
  TNodeId extends DomEditNodeId,
>({
  context,
  id,
  isOpen,
  labelledBy,
  selectedNodeId,
  style,
  onChangeAutoLayout,
  onClose,
  onPreview,
}: {
  context: DomEditLayoutContext<TNodeId>
  id: string
  isOpen: boolean
  labelledBy: string
  selectedNodeId: TNodeId
  style: DomEditNodeState
  onChangeAutoLayout: (
    nodeId: TNodeId,
    field: DomEditAutoLayoutField,
    value: DomEditNodeState[DomEditAutoLayoutField],
  ) => void
  onClose: () => void
  onPreview: (preview: DomEditAlignmentPreview | null) => void
}) {
  useEffect(() => {
    if (!isOpen) {
      onPreview(null)
    }
  }, [isOpen, onPreview])

  if (!isOpen) {
    return null
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
  }
  const distributionValue = style.distribution === 'packed'
    ? 'start'
    : style.distribution

  return (
    <div
      id={id}
      className="figma-alignment-popover"
      role="region"
      aria-labelledby={labelledBy}
      onKeyDown={handleKeyDown}
    >
      {context.showSelfLayout ? (
        <section>
          <h2>justify-content</h2>
          <div
            className="figma-alignment-option-grid"
            role="radiogroup"
            aria-label="justify-content"
            onKeyDown={handleDomEditRadioGroupKeyDown}
          >
            {DOM_EDIT_DISTRIBUTION_OPTIONS.map((option) => (
              <button
                aria-label={`Justify ${option.label.toLowerCase()}`}
                aria-checked={distributionValue === option.value}
                className="figma-alignment-option"
                key={option.value}
                role="radio"
                tabIndex={getDomEditRadioTabIndex({
                  checked: distributionValue === option.value,
                })}
                type="button"
                onClick={() => {
                  onChangeAutoLayout(
                    selectedNodeId,
                    'distribution',
                    option.value,
                  )
                }}
              >
                <span className={`figma-alignment-option__icon figma-alignment-option__icon--${option.value}`} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <section>
        <h2>align-items</h2>
        <div
          className="figma-alignment-option-grid"
          role="radiogroup"
          aria-label="align-items"
          onKeyDown={handleDomEditRadioGroupKeyDown}
        >
          {DOM_EDIT_ALIGN_OPTIONS.map((option) => (
            <button
              aria-label={`Align ${option.label.toLowerCase()}`}
              aria-checked={style.align === option.value}
              className="figma-alignment-option"
              key={option.value}
              role="radio"
              tabIndex={getDomEditRadioTabIndex({
                checked: style.align === option.value,
              })}
              type="button"
              onBlur={() => onPreview(null)}
              onClick={() => {
                onChangeAutoLayout(selectedNodeId, 'align', option.value)
              }}
              onFocus={() => onPreview({ align: option.value })}
              onPointerEnter={() => onPreview({ align: option.value })}
              onPointerLeave={() => onPreview(null)}
            >
              <span className={`figma-alignment-option__icon figma-alignment-option__icon--${option.value}`} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
