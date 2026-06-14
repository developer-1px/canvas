import {
  useLayoutEffect,
  useState,
} from 'react'
import type { Viewport } from '../../../../src/canvas'
import {
  getFigmaCloneDomElement,
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from './FigmaCloneDomEditModel'

export function FigmaCloneDomEditInspector({
  selectedNodeId,
  state,
  viewport,
  onChange,
  onChangeAutoLayout,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
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

function useFigmaCloneMeasuredDomSize({
  selectedNodeId,
  state,
  viewport,
}: {
  selectedNodeId: FigmaCloneDomNodeId | null
  state: FigmaCloneDomEditState
  viewport: Viewport
}): FigmaCloneMeasuredDomSize | null {
  const [size, setSize] = useState<FigmaCloneMeasuredDomSize | null>(null)

  useLayoutEffect(() => {
    if (!selectedNodeId) {
      setSize(null)
      return undefined
    }

    const target = getFigmaCloneDomElement(selectedNodeId)

    if (!target) {
      setSize(null)
      return undefined
    }

    let frame = 0
    const measure = () => {
      const rect = target.getBoundingClientRect()
      const scale = viewport.scale > 0 ? viewport.scale : 1
      const nextSize = {
        h: Math.round(rect.height / scale),
        w: Math.round(rect.width / scale),
      }

      setSize((current) =>
        current && current.h === nextSize.h && current.w === nextSize.w
          ? current
          : nextSize)
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

  return size
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
