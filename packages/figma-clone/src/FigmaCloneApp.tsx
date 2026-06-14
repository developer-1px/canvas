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
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  CanvasApp,
  type CanvasAppAssemblyInput,
  type Viewport,
  type CanvasWorkspaceStorage,
  type CanvasWorkspaceStorageProvider,
} from '../../../src/canvas'
import { FigmaCloneDomEditInspector } from './dom-edit/FigmaCloneDomEditInspector'
import {
  FIGMA_CLONE_DOM_NODE_BY_ID,
  FIGMA_CLONE_DOM_TREE,
  createFigmaCloneDomEditState,
  createFigmaCloneDomTextState,
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
  FigmaCloneDomSelectionOverlay,
  type FigmaCloneDomAffordanceState,
} from './dom-edit/overlay'
import {
  createFigmaCloneCanvasItems,
  createFigmaCloneCanvasModules,
  FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
  FIGMA_CLONE_SECTION_VIEWPORT_PRESETS,
  type FigmaCloneSectionOverflow,
  type FigmaCloneSectionViewport,
  type FigmaCloneFrameId,
} from './figmaCloneCanvas'
import './FigmaCloneApp.css'

type FigmaCloneSelection =
  | {
      frameId: 'dom'
      nodeId: FigmaCloneDomNodeId | null
    }
  | {
      frameId: 'widget'
      nodeId: null
    }

const FIGMA_CLONE_ITEMS = createFigmaCloneCanvasItems()

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
  const [domState, setDomState] = useState<FigmaCloneDomEditState>(
    createFigmaCloneDomEditState,
  )
  const [domTextState, setDomTextState] = useState<FigmaCloneDomTextState>(
    createFigmaCloneDomTextState,
  )
  const [sectionViewport, setSectionViewport] =
    useState<FigmaCloneSectionViewport>(
      FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT,
    )
  const [selection, setSelection] = useState<FigmaCloneSelection>({
    frameId: 'dom',
    nodeId: null,
  })
  const [affordanceState, setAffordanceState] =
    useState<FigmaCloneDomAffordanceState>({ mode: 'idle' })
  const selectedNodeId = selection.frameId === 'dom' ? selection.nodeId : null
  const isSectionSelected =
    selection.frameId === 'dom' && selection.nodeId === null
  const selectSection = () => {
    setSelection({ frameId: 'dom', nodeId: null })
  }
  const selectDomNode = (nodeId: FigmaCloneDomNodeId) => {
    setSelection({ frameId: 'dom', nodeId })
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
    setDomState((current) =>
      updateFigmaCloneDomEditField({
        field,
        nodeId,
        state: current,
        value,
      }),
    )
  }
  const changeDomAutoLayoutField = (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => {
    setDomState((current) =>
      updateFigmaCloneDomAutoLayoutField({
        field,
        nodeId,
        state: current,
        value,
      }),
    )
  }
  const changeDomText = (nodeId: FigmaCloneDomNodeId, value: string) => {
    setDomTextState((current) =>
      updateFigmaCloneDomText({
        nodeId,
        state: current,
        value,
      }),
    )
  }
  const assemblyInput = useMemo<CanvasAppAssemblyInput>(() => ({
    affordanceConfig: FIGMA_CLONE_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
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
  }), [domState, domTextState, isSectionSelected, sectionViewport, selectedNodeId])

  return (
    <CanvasApp
      assemblyInput={assemblyInput}
      renderApp={(app) => (
        <main className="figma-clone">
          <FigmaCloneLayersPanel
            selection={selection}
            onSelectFrame={(frameId) => {
              setSelection(frameId === 'dom'
                ? { frameId: 'dom', nodeId: null }
                : { frameId: 'widget', nodeId: null })
            }}
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
                onClick={() => setAffordanceState((current) =>
                  current.mode === 'xray'
                    ? { mode: 'idle' }
                    : { mode: 'xray' })}
              >
                <Inspect aria-hidden="true" size={14} />
              </button>
            </div>
            {app.stage}
            <FigmaCloneDomSelectionOverlay
              affordanceState={affordanceState}
              isCanvasPanActive={app.activeMode === 'pan' || app.gesture === 'pan'}
              selectedNodeId={selectedNodeId}
              shellRef={canvasRegionRef as RefObject<HTMLElement | null>}
              state={domState}
              viewport={app.viewport}
              onAffordanceStateChange={setAffordanceState}
              onChangeAutoLayout={changeDomAutoLayoutField}
              onChange={changeDomField}
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
            onChangeSectionOverflow={changeSectionOverflow}
            onChangeSectionViewportField={changeSectionViewportField}
            onSelectDocumentRoot={() => selectDomNode('workspacePage')}
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
  onSelectFrame,
  onSelectNode,
}: {
  selection: FigmaCloneSelection
  onSelectFrame: (frameId: FigmaCloneFrameId) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const activeRootId = selection.frameId === 'dom'
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
          onClick={() => onSelectFrame('widget')}
        >
          <ChevronRight aria-hidden="true" size={12} />
          <span>React widget</span>
        </button>
        <button
          aria-label="Select Section viewport"
          className={`figma-layer-row${selection.frameId === 'dom' && !selection.nodeId ? ' figma-layer-row--selected' : ''}`}
          type="button"
          onClick={() => onSelectFrame('dom')}
        >
          <ChevronDown aria-hidden="true" size={12} />
          <span>Section</span>
        </button>
        <div className="figma-layer-tree">
          {FIGMA_CLONE_DOM_TREE.map((node) => (
            <FigmaCloneLayerNode
              key={node.id}
              activeRootId={activeRootId}
              node={node}
              selectedNodeId={selection.frameId === 'dom' ? selection.nodeId : null}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
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
          onChangeOverflow={onChangeSectionOverflow}
          onSelectDocumentRoot={onSelectDocumentRoot}
        />
      ) : (
        <FigmaCloneDomEditInspector
          selectedNodeId={selection.nodeId}
          state={domState}
          textState={domTextState}
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
          <code>Section viewport</code>
        </section>
      ) : null}
    </aside>
  )
}

function FigmaCloneSectionInspector({
  viewport,
  onApplyPreset,
  onChangeField,
  onChangeOverflow,
  onSelectDocumentRoot,
}: {
  viewport: FigmaCloneSectionViewport
  onApplyPreset: (preset: Pick<FigmaCloneSectionViewport, 'h' | 'w'>) => void
  onChangeField: (field: 'h' | 'w', value: number) => void
  onChangeOverflow: (overflow: FigmaCloneSectionOverflow) => void
  onSelectDocumentRoot: () => void
}) {
  return (
    <>
      <section className="figma-panel-section figma-panel-section--identity">
        <h2>Section</h2>
        <dl className="figma-context-meta">
          <div>
            <dt>Role</dt>
            <dd>browser</dd>
          </div>
          <div>
            <dt>Viewport</dt>
            <dd>{viewport.w} × {viewport.h}</dd>
          </div>
        </dl>
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
          <FigmaSectionNumberField
            field="h"
            label="H"
            value={viewport.h}
            onChange={onChangeField}
          />
        </div>
      </section>
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

function createFigmaCloneStorageProvider(): CanvasWorkspaceStorageProvider {
  const workspace = JSON.stringify({
    items: FIGMA_CLONE_ITEMS,
    selection: [],
    version: 1,
    viewport: { scale: 0.72, x: 32, y: 64 },
  })
  const storage: CanvasWorkspaceStorage = {
    getItem: () => workspace,
    setItem: () => undefined,
  }

  return () => storage
}

function clampFigmaCloneSectionViewportField(
  field: 'h' | 'w',
  value: number,
) {
  const min = field === 'w' ? 320 : 360
  const max = field === 'w' ? 1920 : 1400
  const finite = Number.isFinite(value)
    ? value
    : FIGMA_CLONE_DEFAULT_SECTION_VIEWPORT[field]

  return Math.min(max, Math.max(min, Math.round(finite)))
}
