import {
  ChevronDown,
  ChevronRight,
  Inspect,
  Layers,
  Maximize2,
  MousePointer2,
  Ruler,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useJSONDocument } from '@interactive-os/json-document/react'
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  CanvasApp,
  type CanvasAppAssemblyInput,
  type Viewport,
  type CanvasWorkspaceStorage,
  type CanvasWorkspaceStorageProvider,
} from '../../../src/canvas'
import {
  DomEditInspector,
  DomEditSelectionOverlay,
  type DomEditAffordanceProperty,
  type DomEditAffordanceState,
  type DomEditFrameGuideConfig,
} from '@interactive-os/dom-edit-affordance/react'
import type {
  DomEditInteractionAction,
} from '@interactive-os/dom-edit-affordance/interaction'
import {
  createFigmaCloneDomDocumentValue,
  FIGMA_CLONE_DOM_DOCUMENT_HISTORY_LIMIT,
  FIGMA_CLONE_DOM_DOCUMENT_SCHEMA,
  type FigmaCloneDomDocumentValue,
} from './dom-edit/FigmaCloneDomDocument'
import {
  FIGMA_CLONE_DOM_EDIT_ADAPTER,
  FIGMA_CLONE_DOM_NODE_BY_ID,
  canFigmaCloneDomNodeEditText,
  getFigmaCloneDomText,
  getFigmaCloneDomNodeDepth,
  getFigmaCloneDomRootId,
  updateFigmaCloneDomAutoLayoutField,
  updateFigmaCloneDomEditField,
  updateFigmaCloneDomText,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNode,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
} from './dom-edit/FigmaCloneDomEditModel'
import {
  createFigmaCloneCanvasItems,
  createFigmaCloneCanvasModules,
  FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
  FIGMA_CLONE_DOM_SECTION_ROOT_IDS,
  FIGMA_CLONE_SECTION_VIEWPORT_PRESETS,
  clampFigmaCloneSectionViewportField,
  getFigmaCloneSectionRootIdForNode,
  type FigmaCloneDomSectionRootId,
  type FigmaCloneSectionFrameMode,
  type FigmaCloneSectionOverflow,
  type FigmaCloneSectionViewport,
} from './figmaCloneCanvas'
import './FigmaCloneApp.css'

type FigmaCloneSelection =
  | {
      frameId: 'dom'
      rootId: FigmaCloneDomSectionRootId
      nodeId: FigmaCloneDomNodeId | null
    }
  | {
      frameId: 'widget'
      nodeId: null
    }

type FigmaCloneDomDragHistorySession = {
  mergeKey: string
  undoDepth: number
}

const FIGMA_CLONE_ITEMS = createFigmaCloneCanvasItems()

const FIGMA_CLONE_FRAME_GUIDES = {
  homePage: {
    frameNodeId: 'homePage',
    layoutColumns: { count: 6, gutter: 20, margin: 48 },
    rulerGuides: [
      { axis: 'x', id: 'home-copy-guide', offset: 96 },
      { axis: 'y', id: 'home-hero-baseline', offset: 180 },
    ],
  },
  workspacePage: {
    frameNodeId: 'workspacePage',
    layoutColumns: { count: 6, gutter: 16, margin: 32 },
    rulerGuides: [
      { axis: 'x', id: 'workspace-nav-guide', offset: 80 },
      { axis: 'y', id: 'workspace-header-baseline', offset: 132 },
    ],
  },
} satisfies Record<
  FigmaCloneDomSectionRootId,
  DomEditFrameGuideConfig<FigmaCloneDomNodeId>
>

const FIGMA_CLONE_AFFORDANCE_CONFIG = {
  gestures: {
    createArrow: false,
    createComment: false,
    createCustom: false,
    createSection: false,
    createShape: false,
    createSticky: false,
    createText: false,
    drawHighlight: false,
    drawMarker: false,
    drawPath: false,
    eraseDrawing: false,
    marquee: true,
    move: false,
    pan: true,
    resize: false,
    temporaryPan: true,
    wheelZoom: true,
  },
  overlays: {
    grid: true,
    inspector: false,
    itemOutline: false,
    marquee: true,
    resizeHandles: false,
    selectionBounds: false,
    toolbar: false,
    zoomControls: false,
  },
  shortcuts: {
    escape: true,
    fitAll: true,
    fitSelection: true,
    panTool: true,
    selectTool: true,
    temporaryPan: true,
    zoomIn: true,
    zoomOut: true,
    zoomReset: true,
  },
  tools: {
    pan: true,
    select: true,
  },
} satisfies CanvasAppAssemblyInput['affordanceConfig']

export function FigmaCloneApp() {
  const canvasRegionRef = useRef<HTMLElement | null>(null)
  const domDragHistoryRef =
    useRef<FigmaCloneDomDragHistorySession | null>(null)
  const domDocument = useJSONDocument(
    FIGMA_CLONE_DOM_DOCUMENT_SCHEMA,
    createFigmaCloneDomDocumentValue(),
    {
      history: FIGMA_CLONE_DOM_DOCUMENT_HISTORY_LIMIT,
      strict: false,
      trustedInitial: true,
    },
  )
  const [sectionViewport, setSectionViewport] =
    useState<FigmaCloneSectionViewport>(
      FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
    )
  const [selection, setSelection] = useState<FigmaCloneSelection>({
    frameId: 'dom',
    rootId: 'workspacePage',
    nodeId: null,
  })
  const [affordanceState, setAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const domState = domDocument.value.state
  const domTextState = domDocument.value.textState
  const changeAffordanceState = useCallback((
    nextState: DomEditAffordanceState,
  ) => {
    setAffordanceState(nextState)

    if (nextState.mode !== 'drag-property') {
      domDragHistoryRef.current = null
      return
    }

    const mergeKey = getFigmaCloneDomDragHistoryMergeKey(nextState.property)

    if (domDragHistoryRef.current?.mergeKey !== mergeKey) {
      domDragHistoryRef.current = {
        mergeKey,
        undoDepth: domDocument.history.undoDepth,
      }
    }
  }, [domDocument])
  const updateDomDocument = useCallback((
    update: (
      value: FigmaCloneDomDocumentValue,
    ) => FigmaCloneDomDocumentValue,
  ) => {
    const value = update(domDocument.value)

    if (value === domDocument.value) {
      return
    }

    const result = domDocument.replace('', value)

    if (!result.ok) {
      throw new Error(result.reason ?? result.code)
    }

    const dragHistory = domDragHistoryRef.current

    if (dragHistory) {
      if (domDocument.history.undoDepth > dragHistory.undoDepth + 1) {
        domDocument.history.mergeLast({ mergeKey: dragHistory.mergeKey })
      }
    }
  }, [domDocument])
  const selectedNodeId = selection.frameId === 'dom' ? selection.nodeId : null
  const selectedSectionRootId =
    selection.frameId === 'dom' ? selection.rootId : null
  const frameGuides = selection.frameId === 'dom'
    ? FIGMA_CLONE_FRAME_GUIDES[selection.rootId]
    : null
  const isSectionSelected = useCallback(
    (rootId: FigmaCloneDomSectionRootId) =>
      selectedSectionRootId === rootId && selectedNodeId === null,
    [selectedNodeId, selectedSectionRootId],
  )
  const selectSection = (rootId: FigmaCloneDomSectionRootId) => {
    setSelection({ frameId: 'dom', rootId, nodeId: null })
  }
  const selectDomNode = (nodeId: FigmaCloneDomNodeId) => {
    setSelection({
      frameId: 'dom',
      rootId: getFigmaCloneSectionRootIdForNode(nodeId),
      nodeId,
    })
  }
  const changeSectionViewportField = (
    field: 'h' | 'w',
    value: number,
  ) => {
    setSectionViewport((current) => ({
      ...current,
      [field]: clampFigmaCloneSectionViewportField(field, value),
    }))
  }
  const changeSectionOverflow = (overflow: FigmaCloneSectionOverflow) => {
    setSectionViewport((current) => ({
      ...current,
      overflow,
    }))
  }
  const changeSectionFrameMode = (frameMode: FigmaCloneSectionFrameMode) => {
    setSectionViewport((current) => ({
      ...current,
      frameMode,
    }))
  }
  const applySectionViewportPreset = (
    preset: Pick<FigmaCloneSectionViewport, 'h' | 'w'>,
  ) => {
    setSectionViewport((current) => ({
      ...current,
      h: preset.h,
      w: preset.w,
    }))
  }
  const changeDomField = (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => {
    updateDomDocument((current) => {
      const state = updateFigmaCloneDomEditField({
        field,
        nodeId,
        state: current.state,
        value,
      })

      return state === current.state ? current : { ...current, state }
    })
  }
  const changeDomAutoLayoutField = (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => {
    updateDomDocument((current) => {
      const state = updateFigmaCloneDomAutoLayoutField({
        field,
        nodeId,
        state: current.state,
        value,
      })

      return state === current.state ? current : { ...current, state }
    })
  }
  const changeDomText = useCallback((
    nodeId: FigmaCloneDomNodeId,
    value: string,
  ) => {
    updateDomDocument((current) => {
      const textState = updateFigmaCloneDomText({
        nodeId,
        state: current.textState,
        value,
      })

      return textState === current.textState
        ? current
        : { ...current, textState }
    })
  }, [updateDomDocument])
  const runDomEditCommand = useCallback((action: DomEditInteractionAction) => {
    if (action.type === 'dom-edit.command.undo') {
      domDocument.history.undo()
      return true
    }

    if (action.type === 'dom-edit.command.redo') {
      domDocument.history.redo()
      return true
    }

    return false
  }, [domDocument])
  const assemblyInput = useMemo<CanvasAppAssemblyInput>(() => ({
    affordanceConfig: FIGMA_CLONE_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
    // eslint-disable-next-line react-hooks/refs
    customItemModules: createFigmaCloneCanvasModules({
      isSectionSelected,
      sectionViewport,
      selectedNodeId,
      state: domState,
      textState: domTextState,
      onSelectSection: selectSection,
      onSelectNode: selectDomNode,
      onChangeText: changeDomText,
    }),
    initialItems: FIGMA_CLONE_ITEMS,
    initialSelection: [],
    workspaceStorageProvider: createFigmaCloneStorageProvider(),
  }), [
    changeDomText,
    domState,
    domTextState,
    isSectionSelected,
    selectedNodeId,
    sectionViewport,
  ])

  return (
    <CanvasApp
      assemblyInput={assemblyInput}
      renderApp={(app) => (
        <main className="figma-clone">
          <FigmaCloneLayersPanel
            selection={selection}
            onSelectWidgetFrame={() => {
              setSelection({ frameId: 'widget', nodeId: null })
            }}
            onSelectSection={selectSection}
            onSelectNode={selectDomNode}
          />
          <section
            className="figma-canvas-region"
            ref={canvasRegionRef}
            aria-label="Canvas"
          >
            <div className="figma-canvas-toolbar" role="toolbar" aria-label="Tools">
              <button
                aria-label="Select tool"
                aria-pressed={
                  affordanceState.mode !== 'measure' &&
                  affordanceState.mode !== 'xray'
                }
                type="button"
                onClick={() => setAffordanceState({ mode: 'idle' })}
              >
                <MousePointer2 aria-hidden="true" size={14} />
              </button>
              <button
                aria-label="Measure tool"
                aria-pressed={affordanceState.mode === 'measure'}
                title="Measure"
                type="button"
                onClick={() => setAffordanceState((current) =>
                  current.mode === 'measure'
                    ? { mode: 'idle' }
                    : { mode: 'measure' })}
              >
                <Ruler aria-hidden="true" size={14} />
              </button>
              <button
                aria-label="Toggle box model X-ray"
                aria-pressed={affordanceState.mode === 'xray'}
                title="X-ray"
                type="button"
                onClick={() => changeAffordanceState(
                  affordanceState.mode === 'xray'
                    ? { mode: 'idle' }
                    : { mode: 'xray' },
                )}
              >
                <Inspect aria-hidden="true" size={14} />
              </button>
            </div>
            {app.stage}
            <DomEditSelectionOverlay
              adapter={FIGMA_CLONE_DOM_EDIT_ADAPTER}
              affordanceState={affordanceState}
              frameGuides={frameGuides}
              isCanvasPanActive={app.activeMode === 'pan' || app.gesture === 'pan'}
              selectedNodeId={selectedNodeId}
              shellRef={canvasRegionRef as RefObject<HTMLElement | null>}
              state={domState}
              viewport={app.viewport}
              onAffordanceStateChange={changeAffordanceState}
              onChangeAutoLayout={changeDomAutoLayoutField}
              onChange={changeDomField}
              onCommand={runDomEditCommand}
            />
          </section>
          <FigmaCloneInspectorPanel
            domState={domState}
            domTextState={domTextState}
            sectionViewport={sectionViewport}
            selection={selection}
            viewport={app.viewport}
            onApplySectionViewportPreset={applySectionViewportPreset}
            onChangeDomAutoLayoutField={changeDomAutoLayoutField}
            onChangeDomField={changeDomField}
            onChangeDomText={changeDomText}
            onChangeSectionFrameMode={changeSectionFrameMode}
            onChangeSectionOverflow={changeSectionOverflow}
            onChangeSectionViewportField={changeSectionViewportField}
            onSelectDocumentRoot={() => {
              selectDomNode(selection.frameId === 'dom'
                ? selection.rootId
                : 'workspacePage')
            }}
          />
          <FigmaCloneViewportControls
            scale={app.zoomControls.scale}
            onFit={app.zoomControls.onFit}
            onZoomIn={app.zoomControls.onZoomIn}
            onZoomOut={app.zoomControls.onZoomOut}
          />
        </main>
      )}
    />
  )
}

function FigmaCloneLayersPanel({
  selection,
  onSelectWidgetFrame,
  onSelectSection,
  onSelectNode,
}: {
  selection: FigmaCloneSelection
  onSelectWidgetFrame: () => void
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const activeRootId = selection.frameId === 'dom' && selection.nodeId
    ? getFigmaCloneDomRootId(selection.nodeId)
    : null

  return (
    <aside className="figma-layers" aria-label="Layers">
      <header>
        <Layers aria-hidden="true" size={14} />
        <h1>Layers</h1>
      </header>
      <div className="figma-layer-list">
        <button
          aria-label="Select React widget frame"
          className={`figma-layer-row${selection.frameId === 'widget' ? ' figma-layer-row--selected' : ''}`}
          type="button"
          onClick={onSelectWidgetFrame}
        >
          <ChevronRight aria-hidden="true" size={12} />
          <span>React widget</span>
        </button>
        {FIGMA_CLONE_DOM_SECTION_ROOT_IDS.map((rootId) => {
          const rootNode = FIGMA_CLONE_DOM_NODE_BY_ID[rootId]
          const isSelectedSection = selection.frameId === 'dom' &&
            selection.rootId === rootId &&
            selection.nodeId === null

          return (
            <div className="figma-layer-section" key={rootId}>
              <button
                aria-label={`Select ${rootNode.label} section`}
                className={`figma-layer-row${isSelectedSection ? ' figma-layer-row--selected' : ''}`}
                type="button"
                onClick={() => onSelectSection(rootId)}
              >
                <ChevronDown aria-hidden="true" size={12} />
                <span>Section · {rootNode.label}</span>
              </button>
              <div className="figma-layer-tree">
                <FigmaCloneLayerNode
                  activeRootId={activeRootId}
                  node={rootNode}
                  selectedNodeId={selection.frameId === 'dom'
                    ? selection.nodeId
                    : null}
                  onSelectNode={onSelectNode}
                />
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function FigmaCloneLayerNode({
  activeRootId,
  node,
  selectedNodeId,
  onSelectNode,
}: {
  activeRootId: FigmaCloneDomNodeId | null
  node: FigmaCloneDomNode
  selectedNodeId: FigmaCloneDomNodeId | null
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const depth = getFigmaCloneDomNodeDepth(node.id)
  const isTopLevel = depth === 0
  const isExpanded = Boolean(node.children?.length) &&
    (!isTopLevel || activeRootId === node.id)

  return (
    <>
      <button
        aria-label={`Select layer ${node.label}`}
        className={`figma-layer-row figma-layer-row--node${selectedNodeId === node.id ? ' figma-layer-row--selected' : ''}`}
        style={{ paddingLeft: 24 + depth * 12 }}
        type="button"
        onClick={() => onSelectNode(node.id)}
      >
        {isExpanded ? (
          <ChevronDown aria-hidden="true" size={12} />
        ) : node.children?.length ? (
          <ChevronRight aria-hidden="true" size={12} />
        ) : (
          <span className="figma-layer-dot" />
        )}
        <span>{node.label}</span>
      </button>
      {isExpanded ? node.children?.map((child) => (
        <FigmaCloneLayerNode
          key={child.id}
          activeRootId={activeRootId}
          node={child}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
      )) : null}
    </>
  )
}

function FigmaCloneInspectorPanel({
  domState,
  domTextState,
  sectionViewport,
  selection,
  viewport,
  onApplySectionViewportPreset,
  onChangeDomAutoLayoutField,
  onChangeDomField,
  onChangeDomText,
  onChangeSectionFrameMode,
  onChangeSectionOverflow,
  onChangeSectionViewportField,
  onSelectDocumentRoot,
}: {
  domState: FigmaCloneDomEditState
  domTextState: FigmaCloneDomTextState
  sectionViewport: FigmaCloneSectionViewport
  selection: FigmaCloneSelection
  viewport: Viewport
  onApplySectionViewportPreset: (
    preset: Pick<FigmaCloneSectionViewport, 'h' | 'w'>,
  ) => void
  onChangeDomAutoLayoutField: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
  onChangeDomField: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
  onChangeDomText: (nodeId: FigmaCloneDomNodeId, value: string) => void
  onChangeSectionFrameMode: (frameMode: FigmaCloneSectionFrameMode) => void
  onChangeSectionOverflow: (overflow: FigmaCloneSectionOverflow) => void
  onChangeSectionViewportField: (field: 'h' | 'w', value: number) => void
  onSelectDocumentRoot: () => void
}) {
  return (
    <aside className="figma-inspector" aria-label="Design">
      <header>
        <button aria-selected="true" type="button">Design</button>
        <button aria-selected="false" type="button">Dev</button>
      </header>
      {selection.frameId === 'widget' ? (
        <section className="figma-panel-section">
          <h2>React widget</h2>
          <dl className="figma-meta">
            <div>
              <dt>Kind</dt>
              <dd>React</dd>
            </div>
            <div>
              <dt>Edit</dt>
              <dd>Widget data</dd>
            </div>
          </dl>
        </section>
      ) : selection.nodeId === null ? (
        <FigmaCloneSectionInspector
          viewport={sectionViewport}
          onApplyPreset={onApplySectionViewportPreset}
          onChangeField={onChangeSectionViewportField}
          onChangeFrameMode={onChangeSectionFrameMode}
          onChangeOverflow={onChangeSectionOverflow}
          onSelectDocumentRoot={onSelectDocumentRoot}
        />
      ) : (
        <DomEditInspector
          adapter={FIGMA_CLONE_DOM_EDIT_ADAPTER}
          canEditText={canFigmaCloneDomNodeEditText}
          getText={(nodeId) => getFigmaCloneDomText(domTextState, nodeId)}
          selectedNodeId={selection.nodeId}
          state={domState}
          viewport={viewport}
          onChangeAutoLayout={onChangeDomAutoLayoutField}
          onChange={onChangeDomField}
          onChangeText={onChangeDomText}
        />
      )}
      {selection.frameId === 'dom' && selection.nodeId ? (
        <section className="figma-panel-section">
          <h2>Source</h2>
          <code>{FIGMA_CLONE_DOM_NODE_BY_ID[selection.nodeId].label}</code>
        </section>
      ) : selection.frameId === 'dom' ? (
        <section className="figma-panel-section">
          <h2>Source</h2>
          <code>{FIGMA_CLONE_DOM_NODE_BY_ID[selection.rootId].label} section</code>
        </section>
      ) : null}
    </aside>
  )
}

function FigmaCloneSectionInspector({
  viewport,
  onApplyPreset,
  onChangeField,
  onChangeFrameMode,
  onChangeOverflow,
  onSelectDocumentRoot,
}: {
  viewport: FigmaCloneSectionViewport
  onApplyPreset: (preset: Pick<FigmaCloneSectionViewport, 'h' | 'w'>) => void
  onChangeField: (field: 'h' | 'w', value: number) => void
  onChangeFrameMode: (frameMode: FigmaCloneSectionFrameMode) => void
  onChangeOverflow: (overflow: FigmaCloneSectionOverflow) => void
  onSelectDocumentRoot: () => void
}) {
  const isMockFrame = viewport.frameMode === 'mock'

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
            <dd>{viewport.w} × {isMockFrame ? viewport.h : 'Hug'}</dd>
          </div>
        </dl>
      </section>
      <section className="figma-panel-section">
        <h2>Frame</h2>
        <div className="figma-segmented-field">
          <span>Mode</span>
          <div className="figma-segmented-control">
            <button
              aria-pressed={viewport.frameMode === 'page'}
              type="button"
              onClick={() => onChangeFrameMode('page')}
            >
              Page
            </button>
            <button
              aria-pressed={isMockFrame}
              type="button"
              onClick={() => onChangeFrameMode('mock')}
            >
              Mock
            </button>
          </div>
        </div>
      </section>
      <section className="figma-panel-section">
        <h2>Viewport</h2>
        <div className="figma-viewport-presets">
          {FIGMA_CLONE_SECTION_VIEWPORT_PRESETS.map((preset) => {
            const isActive = viewport.w === preset.w && viewport.h === preset.h

            return (
              <button
                aria-pressed={isActive}
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
              >
                <span>{preset.label}</span>
                <strong>{preset.w} × {preset.h}</strong>
              </button>
            )
          })}
        </div>
        <div className="figma-field-grid">
          <FigmaSectionNumberField
            field="w"
            label="W"
            value={viewport.w}
            onChange={onChangeField}
          />
          {isMockFrame ? (
            <FigmaSectionNumberField
              field="h"
              label="H"
              value={viewport.h}
              onChange={onChangeField}
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
                aria-pressed={viewport.overflow === 'scroll'}
                type="button"
                onClick={() => onChangeOverflow('scroll')}
              >
                Scroll
              </button>
              <button
                aria-pressed={viewport.overflow === 'clip'}
                type="button"
                onClick={() => onChangeOverflow('clip')}
              >
                Clip
              </button>
            </div>
          </div>
        </section>
      ) : null}
      <section className="figma-panel-section">
        <h2>Document</h2>
        <button
          className="figma-document-root-button"
          type="button"
          onClick={onSelectDocumentRoot}
        >
          Select root
        </button>
      </section>
    </>
  )
}

function FigmaSectionNumberField({
  field,
  label,
  value,
  onChange,
}: {
  field: 'h' | 'w'
  label: string
  value: number
  onChange: (field: 'h' | 'w', value: number) => void
}) {
  return (
    <label className="figma-number-field">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        value={value}
        onChange={(event) => {
          onChange(field, Number(event.currentTarget.value))
        }}
      />
    </label>
  )
}

function FigmaCloneViewportControls({
  scale,
  onFit,
  onZoomIn,
  onZoomOut,
}: {
  scale: number
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}) {
  return (
    <div
      className="figma-viewport-controls"
      role="toolbar"
      aria-label="Viewport"
    >
      <span>{Math.round(scale * 100)}%</span>
      <button aria-label="Zoom out" type="button" onClick={onZoomOut}>
        <ZoomOut aria-hidden="true" size={14} />
      </button>
      <button aria-label="Zoom in" type="button" onClick={onZoomIn}>
        <ZoomIn aria-hidden="true" size={14} />
      </button>
      <button aria-label="Fit" type="button" onClick={onFit}>
        <Maximize2 aria-hidden="true" size={14} />
      </button>
    </div>
  )
}

function getFigmaCloneDomDragHistoryMergeKey(
  property: DomEditAffordanceProperty,
) {
  return `dom-edit-drag:${property}`
}

function createFigmaCloneStorageProvider(): CanvasWorkspaceStorageProvider {
  const workspace = JSON.stringify({
    items: FIGMA_CLONE_ITEMS,
    selection: [],
    version: 1,
    viewport: { scale: 0.38, x: 300, y: 72 },
  })
  const storage: CanvasWorkspaceStorage = {
    getItem: () => workspace,
    setItem: () => undefined,
  }

  return () => storage
}
