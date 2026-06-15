import type {
  DomEditAutoLayoutField,
  DomEditField,
  DomEditModelAdapter,
  DomEditNodeState,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditPaddingSides,
  getDomEditUniformPadding,
} from '../../../features/box-editing/DomEditPadding'
import {
  DomEditNumberField,
  DomEditReadOnlyField,
  DomEditResizeModeFields,
  DomEditSegmentedField,
  DomEditTextField,
} from './DomEditInspectorFields'
import { useDomEditMeasuredDomSize } from './useDomEditMeasuredDomSize'

export function DomEditInspector<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  canEditText,
  getText,
  selectedNodeId,
  state,
  viewport,
  onChange,
  onChangeAutoLayout,
  onChangeText,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  canEditText: (nodeId: TNodeId) => boolean
  getText: (nodeId: TNodeId) => string
  selectedNodeId: TNodeId | null
  state: TState
  viewport: DomEditViewport
  onChange: (
    nodeId: TNodeId,
    field: DomEditField,
    value: number,
  ) => void
  onChangeAutoLayout: (
    nodeId: TNodeId,
    field: DomEditAutoLayoutField,
    value: DomEditNodeState[DomEditAutoLayoutField],
  ) => void
  onChangeText: (nodeId: TNodeId, value: string) => void
}) {
  const measuredSize = useDomEditMeasuredDomSize({
    adapter,
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

  const context = adapter.getLayoutContext(selectedNodeId)
  const style = adapter.getStyle(state, selectedNodeId)
  const displayWidth = measuredSize?.w ?? style.w
  const displayHeight = measuredSize?.h ?? style.h
  const padding = getDomEditPaddingSides(style)
  const uniformPadding = getDomEditUniformPadding(padding)
  const isTextEditable = canEditText(selectedNodeId)

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
              <DomEditResizeModeFields
                heightMode={style.heightMode}
                heightValue={displayHeight}
                selectedNodeId={selectedNodeId}
                showFill
                widthMode={style.widthMode}
                widthValue={displayWidth}
                onChange={onChangeAutoLayout}
              />
            ) : null}
            <DomEditSegmentedField
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
            <DomEditNumberField
              field="order"
              label="Order"
              nodeId={selectedNodeId}
              value={style.order}
              onChange={onChange}
            />
            <DomEditNumberField
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
          <DomEditSegmentedField
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
          <DomEditSegmentedField
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
          <DomEditSegmentedField
            label="Distribution"
            options={[
              { label: 'Start', value: 'start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'end' },
              { label: 'Between', value: 'space-between' },
            ]}
            value={style.distribution === 'packed' ? 'start' : style.distribution}
            onChange={(value) => {
              onChangeAutoLayout(selectedNodeId, 'distribution', value)
            }}
          />
          <DomEditResizeModeFields
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
              <DomEditReadOnlyField label="Gap" value="Between" />
            ) : (
              <DomEditNumberField
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
          <DomEditResizeModeFields
            heightMode={style.heightMode}
            heightValue={displayHeight}
            selectedNodeId={selectedNodeId}
            showFill={context.showParentParticipation}
            widthMode={style.widthMode}
            widthValue={displayWidth}
            onChange={onChangeAutoLayout}
          />
          <div className="figma-field-grid">
            <DomEditNumberField
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
            <DomEditNumberField
              field="padding"
              label="Pad"
              nodeId={selectedNodeId}
              value={uniformPadding ?? style.padding}
              onChange={onChange}
            />
            <DomEditNumberField
              field="radius"
              label="Rad"
              nodeId={selectedNodeId}
              value={style.radius}
              onChange={onChange}
            />
            {style.widthMode === 'fixed' ? (
              <DomEditNumberField
                field="w"
                label="W"
                nodeId={selectedNodeId}
                value={style.w}
                onChange={onChange}
              />
            ) : null}
            {style.heightMode === 'fixed' ? (
              <DomEditNumberField
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
          {isTextEditable ? (
            <DomEditTextField
              nodeId={selectedNodeId}
              value={getText(selectedNodeId)}
              onChange={onChangeText}
            />
          ) : null}
        </section>
      ) : null}
      <section className="figma-panel-section">
        <h2>Effects</h2>
        <div className="figma-field-grid">
          <DomEditNumberField
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
