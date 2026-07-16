import type {
  EditorEngine,
  EditorEngineNodeEditScope,
  EditorEngineSnapshot,
} from '@interactive-os/canvas/editor'
import type {
  DesignNodeFrame,
  ReactDesignDefinitionRegistry,
} from '@interactive-os/canvas/react-design'
import { DomEditEditorInspector } from '@interactive-os/dom-edit-affordance/react'

const FIGMA_FRAME_PRESETS = [
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900 },
  { id: 'laptop', label: 'Laptop', width: 1280, height: 800 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const

export type FigmaComponentEditScope = Exclude<
  EditorEngineNodeEditScope,
  'auto'
>

export function FigmaCloneInspector({
  componentEditScope = 'instance',
  editor,
  onComponentEditScopeChange,
  registry,
  spacingGridSize,
  snapshot,
}: {
  readonly componentEditScope?: FigmaComponentEditScope
  readonly editor: EditorEngine
  readonly onComponentEditScopeChange?: (scope: FigmaComponentEditScope) => void
  readonly registry: ReactDesignDefinitionRegistry
  readonly spacingGridSize?: number
  readonly snapshot: EditorEngineSnapshot
}) {
  const selectedNodeId = snapshot.selection.primaryNodeId
  const selectedNode = selectedNodeId
    ? editor.read.node(selectedNodeId)
    : null
  const nodeEditScope = selectedNode?.component
    ? componentEditScope
    : undefined
  const definition = selectedNode
    ? registry.resolveRegistered(selectedNode.definition) ??
      (selectedNode.component
        ? registry.resolveRegistered({
            kind: 'component',
            id: selectedNode.component.definitionId,
          })
        : null)
    : null

  return (
    <>
      {selectedNode?.frame ? (
        <FigmaCloneFrameInspector
          editor={editor}
          nodeId={selectedNode.id}
          frame={selectedNode.frame}
        />
      ) : null}
      {selectedNode?.component ? (
        <section className="figma-panel-section">
          <h2>Component edit</h2>
          <div className="figma-segmented-field">
            <span>Scope</span>
            <div className="figma-segmented-control">
              <button
                aria-pressed={componentEditScope === 'instance'}
                type="button"
                onClick={() => onComponentEditScopeChange?.('instance')}
              >
                Instance
              </button>
              <button
                aria-pressed={componentEditScope === 'definition'}
                type="button"
                onClick={() => onComponentEditScopeChange?.('definition')}
              >
                Definition
              </button>
            </div>
          </div>
        </section>
      ) : null}
      <DomEditEditorInspector
        editScope={nodeEditScope}
        editor={editor}
        spacingGridSize={spacingGridSize}
      />
      {selectedNode && definition?.renderInspector
        ? definition.renderInspector({
            editor,
            node: selectedNode,
            editProp: (field, value, label) => {
              editor.commands.execute({
                edits: [{ field, target: 'props', value }],
                label,
                nodeId: selectedNode.id,
                scope: nodeEditScope,
                type: 'node.edit',
              })
            },
          })
        : null}
    </>
  )
}

function FigmaCloneFrameInspector({
  editor,
  frame,
  nodeId,
}: {
  readonly editor: EditorEngine
  readonly frame: DesignNodeFrame
  readonly nodeId: string
}) {
  const isMockFrame = frame.heightMode === 'fixed'
  const editFrame = (
    label: string,
    values: Partial<DesignNodeFrame>,
  ) => {
    editor.commands.execute({
      type: 'frame.edit',
      label,
      nodeId,
      values,
    })
  }

  return (
    <>
      <section className="figma-panel-section figma-panel-section--identity">
        <h2>Section</h2>
        <dl className="figma-context-meta">
          <div>
            <dt>Role</dt>
            <dd>{isMockFrame ? 'browser' : 'page'}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>
              {frame.width} × {isMockFrame ? frame.height : 'Hug'}
            </dd>
          </div>
        </dl>
      </section>
      <section className="figma-panel-section">
        <h2>Frame</h2>
        <div className="figma-segmented-field">
          <span>Mode</span>
          <div className="figma-segmented-control">
            <button
              aria-pressed={!isMockFrame}
              type="button"
              onClick={() => editFrame('Use page frame', {
                heightMode: 'content',
              })}
            >
              Page
            </button>
            <button
              aria-pressed={isMockFrame}
              type="button"
              onClick={() => editFrame('Use mock frame', {
                heightMode: 'fixed',
              })}
            >
              Mock
            </button>
          </div>
        </div>
      </section>
      <section className="figma-panel-section">
        <h2>Viewport</h2>
        <div className="figma-viewport-presets">
          {FIGMA_FRAME_PRESETS.map((preset) => (
            <button
              aria-pressed={
                frame.width === preset.width && frame.height === preset.height
              }
              key={preset.id}
              type="button"
              onClick={() => editFrame(`Apply ${preset.label} frame`, {
                width: preset.width,
                height: preset.height,
              })}
            >
              <span>{preset.label}</span>
              <strong>{preset.width} × {preset.height}</strong>
            </button>
          ))}
        </div>
        <div className="figma-field-grid">
          <FigmaCloneFrameNumberField
            label="W"
            value={frame.width}
            onChange={(width) => editFrame('Update frame width', { width })}
          />
          {isMockFrame ? (
            <FigmaCloneFrameNumberField
              label="H"
              value={frame.height}
              onChange={(height) => editFrame('Update frame height', {
                height,
              })}
            />
          ) : (
            <div className="figma-readonly-field">
              <span>H</span>
              <strong>Hug</strong>
            </div>
          )}
        </div>
      </section>
      {isMockFrame ? (
        <section className="figma-panel-section">
          <h2>Overflow</h2>
          <div className="figma-segmented-field">
            <span>Mode</span>
            <div className="figma-segmented-control">
              <button
                aria-pressed={frame.overflow === 'scroll'}
                type="button"
                onClick={() => editFrame('Scroll frame overflow', {
                  overflow: 'scroll',
                })}
              >
                Scroll
              </button>
              <button
                aria-pressed={frame.overflow === 'clip'}
                type="button"
                onClick={() => editFrame('Clip frame overflow', {
                  overflow: 'clip',
                })}
              >
                Clip
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

function FigmaCloneFrameNumberField({
  label,
  value,
  onChange,
}: {
  readonly label: 'H' | 'W'
  readonly value: number
  readonly onChange: (value: number) => void
}) {
  return (
    <label className="figma-number-field">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  )
}
