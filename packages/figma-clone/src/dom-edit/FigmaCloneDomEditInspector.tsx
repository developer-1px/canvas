import {
  useLayoutEffect,
  useState,
} from 'react'
import type { Viewport } from '../../../../src/canvas'
import {
  canFigmaCloneDomNodeEditText,
  getFigmaCloneDomElement,
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  getFigmaCloneDomText,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
} from './FigmaCloneDomEditModel'

export function FigmaCloneDomEditInspector({
  selectedNodeId,
  state,
  textState,
  viewport,
  onChange,
  onChangeAutoLayout,
  onChangeText,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  viewport: Viewport
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
  onChangeAutoLayout: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  const measuredSize = useFigmaCloneMeasuredDomSize({
    selectedNodeId,
    state,
    viewport,
  })

  if (!selectedNodeId) {
    return (
      <section className="figma-panel-section">
        <h2>Design</h2>
      </section>
    )
  }

  const context = getFigmaCloneDomLayoutContext(selectedNodeId)
  const style = getFigmaCloneDomEditStyle(state, selectedNodeId)
  const displayWidth = measuredSize?.w ?? style.w
  const displayHeight = measuredSize?.h ?? style.h
  const canEditText = canFigmaCloneDomNodeEditText(selectedNodeId)

  return (
    <>
      <section className="figma-panel-section figma-panel-section--identity">
        <h2>{context.label}</h2>
        <dl className="figma-context-meta">
          <div>
            <dt>Display</dt>
            <dd>{context.display}</dd>
          </div>
          <div>
            <dt>Parent</dt>
            <dd>{context.parentDisplay ?? 'root'}</dd>
          </div>
        </dl>
      </section>
      {context.showParentParticipation ? (
        <section className="figma-panel-section">
          <h2>Parent</h2>
          <div className="figma-resize-modes">
            {!context.showSelfLayout ? (
              <FigmaResizeModeFields
                heightMode={style.heightMode}
                heightValue={displayHeight}
                selectedNodeId={selectedNodeId}
                showFill
                widthMode={style.widthMode}
                widthValue={displayWidth}
                onChange={onChangeAutoLayout}
              />
            ) : null}
            <FigmaSegmentedField
              label="Align self"
              options={[
                { label: 'Auto', value: 'auto' },
                { label: 'Start', value: 'start' },
                { label: 'Center', value: 'center' },
                { label: 'End', value: 'end' },
                { label: 'Stretch', value: 'stretch' },
              ]}
              value={style.alignSelf}
              onChange={(value) => {
                onChangeAutoLayout(selectedNodeId, 'alignSelf', value)
              }}
            />
          </div>
          <div className="figma-field-grid">
            <FigmaNumberField
              field="order"
              label="Order"
              nodeId={selectedNodeId}
              value={style.order}
              onChange={onChange}
            />
            <FigmaNumberField
              field="margin"
              label="Mar"
              nodeId={selectedNodeId}
              value={style.margin}
              onChange={onChange}
            />
          </div>
        </section>
      ) : null}
      {context.showSelfLayout ? (
        <section className="figma-panel-section">
          <h2>Layout</h2>
          <FigmaSegmentedField
            label="Direction"
            options={[
              { label: 'H', value: 'row' },
              { label: 'V', value: 'column' },
            ]}
            value={style.direction}
            onChange={(value) => {
              onChangeAutoLayout(selectedNodeId, 'direction', value)
            }}
          />
          <FigmaSegmentedField
            label="Align"
            options={[
              { label: 'Start', value: 'start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'end' },
              { label: 'Stretch', value: 'stretch' },
            ]}
            value={style.align}
            onChange={(value) => {
              onChangeAutoLayout(selectedNodeId, 'align', value)
            }}
          />
          <FigmaSegmentedField
            label="Distribution"
            options={[
              { label: 'Packed', value: 'packed' },
              { label: 'Between', value: 'space-between' },
            ]}
            value={style.distribution}
            onChange={(value) => {
              onChangeAutoLayout(selectedNodeId, 'distribution', value)
            }}
          />
          <FigmaResizeModeFields
            heightMode={style.heightMode}
            heightValue={displayHeight}
            selectedNodeId={selectedNodeId}
            showFill={context.showParentParticipation}
            widthMode={style.widthMode}
            widthValue={displayWidth}
            onChange={onChangeAutoLayout}
          />
          <div className="figma-field-grid">
            {style.distribution === 'space-between' ? (
              <FigmaReadOnlyField label="Gap" value="Between" />
            ) : (
              <FigmaNumberField
                field="gap"
                label="Gap"
                nodeId={selectedNodeId}
                value={style.gap}
                onChange={onChange}
              />
            )}
          </div>
        </section>
      ) : null}
      {context.showGridLayout ? (
        <section className="figma-panel-section">
          <h2>Layout</h2>
          <dl className="figma-context-meta">
            <div>
              <dt>Mode</dt>
              <dd>grid</dd>
            </div>
          </dl>
          <FigmaResizeModeFields
            heightMode={style.heightMode}
            heightValue={displayHeight}
            selectedNodeId={selectedNodeId}
            showFill={context.showParentParticipation}
            widthMode={style.widthMode}
            widthValue={displayWidth}
            onChange={onChangeAutoLayout}
          />
          <div className="figma-field-grid">
            <FigmaNumberField
              field="gap"
              label="Gap"
              nodeId={selectedNodeId}
              value={style.gap}
              onChange={onChange}
            />
          </div>
        </section>
      ) : null}
      {context.showBox ? (
        <section className="figma-panel-section">
          <h2>Box</h2>
          <div className="figma-field-grid">
            <FigmaNumberField
              field="padding"
              label="Pad"
              nodeId={selectedNodeId}
              value={style.padding}
              onChange={onChange}
            />
            <FigmaNumberField
              field="radius"
              label="Rad"
              nodeId={selectedNodeId}
              value={style.radius}
              onChange={onChange}
            />
            {style.widthMode === 'fixed' ? (
              <FigmaNumberField
                field="w"
                label="W"
                nodeId={selectedNodeId}
                value={style.w}
                onChange={onChange}
              />
            ) : null}
            {style.heightMode === 'fixed' ? (
              <FigmaNumberField
                field="h"
                label="H"
                nodeId={selectedNodeId}
                value={style.h}
                onChange={onChange}
              />
            ) : null}
          </div>
        </section>
      ) : null}
      {context.showContent ? (
        <section className="figma-panel-section">
          <h2>Content</h2>
          <dl className="figma-context-meta">
            <div>
              <dt>Type</dt>
              <dd>{context.contentType}</dd>
            </div>
          </dl>
          {canEditText ? (
            <FigmaTextField
              nodeId={selectedNodeId}
              value={getFigmaCloneDomText(textState, selectedNodeId)}
              onChange={onChangeText}
            />
          ) : null}
        </section>
      ) : null}
      <section className="figma-panel-section">
        <h2>Effects</h2>
        <div className="figma-field-grid">
          <FigmaNumberField
            field="opacity"
            label="Opacity"
            nodeId={selectedNodeId}
            value={style.opacity}
            onChange={onChange}
          />
        </div>
      </section>
    </>
  )
}

type FigmaCloneMeasuredDomSize = {
  h: number
  w: number
}

type FigmaCloneMeasuredDomSizeState = {
  nodeId: FigmaCloneDomNodeId
  size: FigmaCloneMeasuredDomSize
}

function useFigmaCloneMeasuredDomSize({
  selectedNodeId,
  state,
  viewport,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  viewport: Viewport
}): FigmaCloneMeasuredDomSize | null {
  const [measurement, setMeasurement] =
    useState<FigmaCloneMeasuredDomSizeState | null>(null)

  useLayoutEffect(() => {
    if (!selectedNodeId) {
      const frame = requestAnimationFrame(() => {
        setMeasurement(null)
      })

      return () => cancelAnimationFrame(frame)
    }

    const target = getFigmaCloneDomElement(selectedNodeId)

    if (!target) {
      const frame = requestAnimationFrame(() => {
        setMeasurement(null)
      })

      return () => cancelAnimationFrame(frame)
    }

    let frame = 0
    const measure = () => {
      const rect = target.getBoundingClientRect()
      const scale = viewport.scale > 0 ? viewport.scale : 1
      const nextSize = {
        h: Math.round(rect.height / scale),
        w: Math.round(rect.width / scale),
      }

      setMeasurement((current) =>
        current &&
        current.nodeId === selectedNodeId &&
        current.size.h === nextSize.h &&
        current.size.w === nextSize.w
          ? current
          : { nodeId: selectedNodeId, size: nextSize })
    }
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    scheduleMeasure()

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(target)
    window.addEventListener('resize', scheduleMeasure)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [selectedNodeId, state, viewport.scale])

  return measurement?.nodeId === selectedNodeId ? measurement.size : null
}

function FigmaResizeModeFields({
  heightMode,
  heightValue,
  selectedNodeId,
  showFill,
  widthMode,
  widthValue,
  onChange,
}: {
  heightMode: FigmaCloneDomEditNodeState['heightMode']
  heightValue: number
  selectedNodeId: FigmaCloneDomNodeId
  showFill: boolean
  widthMode: FigmaCloneDomEditNodeState['widthMode']
  widthValue: number
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
}) {
  return (
    <div className="figma-size-cycle-fields">
      <FigmaSizeCycleField
        axis="W"
        mode={widthMode}
        showFill={showFill || widthMode === 'fill' || heightMode === 'fill'}
        value={widthValue}
        onChange={(value) => {
          onChange(selectedNodeId, 'widthMode', value)
        }}
      />
      <FigmaSizeCycleField
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

function FigmaSizeCycleField({
  axis,
  mode,
  showFill,
  value,
  onChange,
}: {
  axis: 'H' | 'W'
  mode: FigmaCloneDomEditNodeState['widthMode']
  showFill: boolean
  value: number
  onChange: (value: FigmaCloneDomEditNodeState['widthMode']) => void
}) {
  return (
    <button
      aria-label={`${axis} ${Math.round(value)} ${formatFigmaSizeMode(mode)}`}
      className="figma-size-cycle-field"
      data-mode={mode}
      type="button"
      onClick={() => onChange(getNextFigmaSizeMode({ mode, showFill }))}
    >
      <span>{axis}</span>
      <strong>{Math.round(value)}</strong>
      <em>{formatFigmaSizeMode(mode)}</em>
    </button>
  )
}

function getNextFigmaSizeMode({
  mode,
  showFill,
}: {
  mode: FigmaCloneDomEditNodeState['widthMode']
  showFill: boolean
}): FigmaCloneDomEditNodeState['widthMode'] {
  const modes: FigmaCloneDomEditNodeState['widthMode'][] =
    showFill || mode === 'fill'
      ? ['fixed', 'hug', 'fill']
      : ['fixed', 'hug']
  const currentIndex = modes.indexOf(mode)

  return modes[(currentIndex + 1) % modes.length]
}

function formatFigmaSizeMode(mode: FigmaCloneDomEditNodeState['widthMode']) {
  if (mode === 'fill') {
    return 'Fill'
  }

  if (mode === 'hug') {
    return 'Hug'
  }

  return 'Fixed'
}

function FigmaSegmentedField<T extends string>({
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
      <div className="figma-segmented-control">
        {options.map((option) => (
          <button
            aria-pressed={option.value === value}
            key={option.value}
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

function FigmaNumberField({
  field,
  label,
  nodeId,
  value,
  onChange,
}: {
  field: FigmaCloneDomEditField
  label: string
  nodeId: FigmaCloneDomNodeId
  value: number
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
}) {
  return (
    <label className="figma-number-field">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        value={value}
        onChange={(event) => {
          onChange(nodeId, field, Number(event.currentTarget.value))
        }}
      />
    </label>
  )
}

function FigmaReadOnlyField({
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

function FigmaTextField({
  nodeId,
  value,
  onChange,
}: {
  nodeId: FigmaCloneDomNodeId
  value: string
  onChange: (nodeId: FigmaCloneDomNodeId, value: string) => void
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
