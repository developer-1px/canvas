import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  createEditorEngine,
  type EditorEngine,
  type EditorEnginePreviewSession,
} from '@interactive-os/canvas/editor'
import {
  createDesignDocument,
  createDomProjection,
  createReactDesignDefinitionRegistry,
  ReactDesignRenderer,
  type DesignDocument,
  type DesignDocumentSnapshot,
  type DesignJSONValue,
  type DesignNodeId,
  type DomProjection,
} from '@interactive-os/canvas/react-design'
import {
  DomEditEditorOverlay,
  type DomEditAffordanceState,
} from '@interactive-os/dom-edit-affordance/react'
import {
  FIGJAM_SHAPE_DEFINITION_ID,
  FIGJAM_STICKY_NOTE_DEFINITION_ID,
  FIGJAM_WIDGET_PACK,
} from '@interactive-os/figjam-pack'
import '@interactive-os/figjam-pack/style.css'
import './FigJamWidgetPackFixtureApp.css'

const FIGJAM_WIDGET_BOARD_ID = 'figjam-widget-board'
const FIGJAM_WIDGET_VIEWPORT = { scale: 1, x: 0, y: 0 }

type WidgetTextEdit = {
  readonly draft: string
  readonly nodeId: DesignNodeId
  readonly session: EditorEnginePreviewSession
}

export function FigJamWidgetPackFixtureApp() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const creationCountRef = useRef({ shape: 0, sticky: 0 })
  const [stageMemory] = useState(createFigJamWidgetStageMemory)
  const [document] = useState(createFigJamWidgetFixtureDocument)
  const [projection] = useState(() => createDomProjection({
    getStageElement: stageMemory.read,
    getViewport: () => FIGJAM_WIDGET_VIEWPORT,
  }))
  const [editor] = useState(() => createEditorEngine({ document, projection }))
  const snapshot = useSyncExternalStore(
    editor.subscribe,
    editor.snapshot,
    editor.snapshot,
  )
  const [affordanceState, setAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const [textEdit, setTextEdit] = useState<WidgetTextEdit | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const registry = useMemo(() => createReactDesignDefinitionRegistry({
    definitions: FIGJAM_WIDGET_PACK.definitions,
    intrinsics: ['section'],
  }), [])
  const selectedNodeId = snapshot.selection.primaryNodeId
  const selectedNode = selectedNodeId ? editor.read.node(selectedNodeId) : null
  const selectedDefinition = getWidgetDefinition(selectedNode)
  const transformableNodeId = selectedDefinition && (
    selectedDefinition.capabilities.transform.move ||
    selectedDefinition.capabilities.transform.resize
  ) ? selectedNodeId : null
  const Inspector = selectedDefinition?.Inspector
  const selectedWidgetProps = selectedNode && selectedDefinition
    ? FIGJAM_WIDGET_PACK.parseProps(
        selectedDefinition.id,
        selectedNode.props,
      )
    : null
  const widgetNodes = editor.read.children(FIGJAM_WIDGET_BOARD_ID)
  const stickyCount = widgetNodes.filter((node) =>
    node.definition.id === FIGJAM_STICKY_NOTE_DEFINITION_ID).length
  const shapeCount = widgetNodes.filter((node) =>
    node.definition.id === FIGJAM_SHAPE_DEFINITION_ID).length

  useStrictModeSafeRuntimeDisposal(editor, projection)
  useWidgetSelectionMirror({
    projection,
    revision: snapshot.revision,
    selectedNodeId,
  })

  const createWidget = useCallback((
    definitionId: typeof FIGJAM_SHAPE_DEFINITION_ID |
      typeof FIGJAM_STICKY_NOTE_DEFINITION_ID,
  ) => {
    const kind = definitionId === FIGJAM_STICKY_NOTE_DEFINITION_ID
      ? 'sticky'
      : 'shape'
    const count = creationCountRef.current[kind] + 1

    creationCountRef.current[kind] = count
    const created = FIGJAM_WIDGET_PACK.create(definitionId, {
      nodeId: `${kind}-${count}`,
      x: kind === 'sticky' ? 72 + (count - 1) * 24 : 352 + (count - 1) * 24,
      y: kind === 'sticky' ? 80 + (count - 1) * 24 : 244 + (count - 1) * 24,
    })

    if (!created.ok) {
      setLastError(created.reason)
      return
    }

    const result = editor.commands.execute({
      type: 'node.create',
      index: editor.read.children(FIGJAM_WIDGET_BOARD_ID).length,
      label: `Create ${kind}`,
      node: created.node,
      parentId: FIGJAM_WIDGET_BOARD_ID,
    })

    if (!result.ok) {
      setLastError(result.reason)
      return
    }

    setLastError(null)
    editor.commands.execute({
      type: 'selection.replace',
      nodeId: created.node.id,
    })
  }, [editor])

  const finishTextEdit = useCallback((commit: boolean) => {
    if (!textEdit) {
      return
    }

    const result = commit
      ? textEdit.session.commit()
      : textEdit.session.cancel()

    setLastError(result.ok ? null : result.reason)
    setTextEdit(null)
  }, [textEdit])

  const beginTextEdit = useCallback((event: MouseEvent<HTMLElement>) => {
    const nodeId = projection.hitPath(event.target)[0]
    const node = nodeId ? editor.read.node(nodeId) : null
    const definition = getWidgetDefinition(node)

    if (
      !node ||
      !definition ||
      definition.capabilities.textEdit === false ||
      node.text === null
    ) {
      return
    }

    finishTextEdit(false)
    editor.commands.execute({ type: 'selection.replace', nodeId: node.id })
    const session = editor.commands.beginPreview({
      label: 'Edit sticky note text',
      nodeId: node.id,
    })

    if (!session) {
      setLastError(`Cannot edit widget text: ${node.id}`)
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setLastError(null)
    setTextEdit({ draft: node.text, nodeId: node.id, session })
  }, [editor, finishTextEdit, projection])

  const updateTextEdit = useCallback((value: string) => {
    if (!textEdit) {
      return
    }

    const result = textEdit.session.update([{ target: 'text', value }])

    if (!result.ok) {
      setLastError(result.reason)
      return
    }

    setLastError(null)
    setTextEdit({ ...textEdit, draft: value })
  }, [textEdit])

  const editWidgetProp = useCallback((
    field: string,
    value: DesignJSONValue,
    label: string,
  ) => {
    if (!selectedNode || !selectedDefinition) {
      return
    }

    const parsed = FIGJAM_WIDGET_PACK.parseProps(
      selectedDefinition.id,
      { ...selectedNode.props, [field]: value },
    )

    if (!parsed.ok) {
      setLastError(parsed.reason)
      return
    }

    const parsedValue = parsed.value[field]

    if (parsedValue === undefined) {
      setLastError(`Widget props omitted edited field: ${field}`)
      return
    }

    const result = editor.commands.execute({
      type: 'node.edit',
      edits: [{ field, target: 'props', value: parsedValue }],
      label,
      nodeId: selectedNode.id,
    })

    setLastError(result.ok ? null : result.reason)
  }, [editor, selectedDefinition, selectedNode])
  const setStageElement = useCallback((element: HTMLDivElement | null) => {
    stageRef.current = element
    stageMemory.write(element)
  }, [stageMemory])

  return (
    <main
      className="figma-clone figjam-widget-fixture"
      data-history-can-redo={snapshot.history.canRedo}
      data-history-can-undo={snapshot.history.canUndo}
      data-last-error={lastError ?? undefined}
      data-preview-node-id={snapshot.preview?.nodeId}
      data-selected-node-id={selectedNodeId ?? undefined}
      data-shape-count={shapeCount}
      data-sticky-count={stickyCount}
    >
      <aside className="figma-layers" aria-label="Widget library">
        <header><h1>Widgets</h1></header>
        <div className="figma-layer-list">
          <button
            className="figma-layer-row"
            type="button"
            onClick={() => createWidget(FIGJAM_STICKY_NOTE_DEFINITION_ID)}
          >
            Sticky note
          </button>
          <button
            className="figma-layer-row"
            type="button"
            onClick={() => createWidget(FIGJAM_SHAPE_DEFINITION_ID)}
          >
            Shape
          </button>
        </div>
      </aside>

      <section className="figma-canvas-region" aria-label="Widget canvas">
        <div className="figma-canvas-toolbar" role="toolbar" aria-label="History">
          <button
            aria-label="Undo widget edit"
            disabled={!snapshot.history.canUndo}
            type="button"
            onClick={() => editor.commands.execute({ type: 'history.undo' })}
          >
            Undo
          </button>
          <button
            aria-label="Redo widget edit"
            disabled={!snapshot.history.canRedo}
            type="button"
            onClick={() => editor.commands.execute({ type: 'history.redo' })}
          >
            Redo
          </button>
        </div>
        <div
          ref={setStageElement}
          className="figma-direct-dom__stage"
          data-mode="select"
          onDoubleClick={beginTextEdit}
        >
          <div className="figma-direct-dom__world">
            <ReactDesignRenderer
              projection={projection}
              read={editor.read}
              registry={registry}
            />
          </div>
          <DomEditEditorOverlay
            affordanceState={affordanceState}
            editor={editor}
            isCanvasPanActive={false}
            selectedNodeId={transformableNodeId}
            shellRef={stageRef}
            viewport={FIGJAM_WIDGET_VIEWPORT}
            onAffordanceStateChange={setAffordanceState}
          />
          {textEdit ? (
            <FigJamWidgetTextEditor
              edit={textEdit}
              projection={projection}
              onCancel={() => finishTextEdit(false)}
              onChange={updateTextEdit}
              onCommit={() => finishTextEdit(true)}
            />
          ) : null}
        </div>
      </section>

      <aside className="figma-inspector" aria-label="Widget inspector">
        <header><h1>Widget</h1></header>
        <div className="figma-inspector-body">
          {selectedNode && selectedDefinition ? (
            <section className="figma-panel-section">
              <h2>{selectedNode.label}</h2>
              <p className="figjam-widget-fixture__capabilities">
                Move · Resize
                {selectedDefinition.capabilities.textEdit === false
                  ? ''
                  : ' · Text'}
              </p>
              {Inspector && selectedWidgetProps?.ok ? (
                <Inspector
                  editProp={editWidgetProp}
                  node={selectedNode}
                  props={selectedWidgetProps.value}
                />
              ) : null}
            </section>
          ) : (
            <section className="figma-panel-section">
              <h2>No widget selected</h2>
            </section>
          )}
        </div>
      </aside>
    </main>
  )
}

function FigJamWidgetTextEditor({
  edit,
  projection,
  onCancel,
  onChange,
  onCommit,
}: {
  readonly edit: WidgetTextEdit
  readonly projection: DomProjection
  readonly onCancel: () => void
  readonly onChange: (value: string) => void
  readonly onCommit: () => void
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const measurement = projection.measure(edit.nodeId)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [edit.nodeId])

  if (!measurement) {
    return null
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onCancel()
      return
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      event.stopPropagation()
      onCommit()
    }
  }

  return (
    <textarea
      ref={inputRef}
      aria-label="Edit sticky note text"
      className="figjam-widget-text-editor"
      data-dom-edit-editor-control
      data-widget-text-editor={edit.nodeId}
      style={{
        height: measurement.worldBounds.h,
        left: measurement.worldBounds.x,
        top: measurement.worldBounds.y,
        width: measurement.worldBounds.w,
      }}
      value={edit.draft}
      onBlur={onCommit}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={handleKeyDown}
    />
  )
}

function createFigJamWidgetFixtureDocument(): DesignDocument {
  return createDesignDocument({
    schemaVersion: 1,
    roots: [FIGJAM_WIDGET_BOARD_ID],
    nodes: [{
      id: FIGJAM_WIDGET_BOARD_ID,
      label: 'Widget board',
      definition: { kind: 'intrinsic', id: 'section' },
      children: [],
      props: { className: 'figjam-widget-board' },
      text: null,
      layout: {},
      style: {},
      frame: {
        x: 64,
        y: 64,
        width: 920,
        height: 600,
        rotation: 0,
        widthMode: 'fixed',
        heightMode: 'fixed',
        overflow: 'visible',
      },
      component: null,
    }],
  } satisfies DesignDocumentSnapshot)
}

function createFigJamWidgetStageMemory() {
  let element: HTMLElement | null = null

  return {
    read: () => element,
    write: (nextElement: HTMLElement | null) => {
      element = nextElement
    },
  }
}

function getWidgetDefinition(node: ReturnType<EditorEngine['read']['node']>) {
  return node?.definition.kind === 'widget'
    ? FIGJAM_WIDGET_PACK.resolve(node.definition.id)
    : null
}

function useWidgetSelectionMirror({
  projection,
  revision,
  selectedNodeId,
}: {
  readonly projection: DomProjection
  readonly revision: number
  readonly selectedNodeId: DesignNodeId | null
}) {
  useEffect(() => {
    for (const nodeId of projection.registeredNodeIds()) {
      const element = projection.element(nodeId)

      if (nodeId === selectedNodeId) {
        element?.setAttribute('data-selected', 'true')
      } else {
        element?.removeAttribute('data-selected')
      }
    }
  }, [projection, revision, selectedNodeId])
}

function useStrictModeSafeRuntimeDisposal(
  editor: EditorEngine,
  projection: DomProjection,
) {
  const lifetimeRef = useRef({ editor, generation: 0, projection })

  useEffect(() => {
    const generation = lifetimeRef.current.generation + 1

    lifetimeRef.current = { editor, generation, projection }

    return () => {
      queueMicrotask(() => {
        const current = lifetimeRef.current

        if (
          current.generation === generation ||
          current.editor !== editor ||
          current.projection !== projection
        ) {
          editor.dispose()
          projection.dispose()
        }
      })
    }
  }, [editor, projection])
}
