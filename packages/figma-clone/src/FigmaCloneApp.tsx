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
  getFigmaCloneDomNodeDepth,
  getFigmaCloneDomRootId,
  updateFigmaCloneDomAutoLayoutField,
  updateFigmaCloneDomEditField,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNode,
  type FigmaCloneDomNodeId,
} from './dom-edit/FigmaCloneDomEditModel'
import {
  FigmaCloneDomSelectionOverlay,
  type FigmaCloneDomAffordanceState,
} from './dom-edit/overlay'
import {
  createFigmaCloneCanvasItems,
  createFigmaCloneCanvasModules,
  type FigmaCloneFrameId,
} from './figmaCloneCanvas'
import './FigmaCloneApp.css'

type FigmaCloneSelection =
  | {
      frameId: 'dom'
      nodeId: FigmaCloneDomNodeId
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
  const [selection, setSelection] = useState<FigmaCloneSelection>({
    frameId: 'dom',
    nodeId: 'workspacePage',
  })
  const [affordanceState, setAffordanceState] =
    useState<FigmaCloneDomAffordanceState>({ mode: 'idle' })
  const selectedNodeId = selection.frameId === 'dom' ? selection.nodeId : null
  const selectDomNode = (nodeId: FigmaCloneDomNodeId) => {
    setSelection({ frameId: 'dom', nodeId })
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
  const assemblyInput = useMemo<CanvasAppAssemblyInput>(() => ({
    affordanceConfig: FIGMA_CLONE_AFFORDANCE_CONFIG,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
    customItemModules: createFigmaCloneCanvasModules({
      selectedNodeId,
      state: domState,
      onSelectNode: selectDomNode,
    }),
    initialItems: FIGMA_CLONE_ITEMS,
    initialSelection: [],
    workspaceStorageProvider: createFigmaCloneStorageProvider(),
  }), [domState, selectedNodeId])

  return (
    <CanvasApp
      assemblyInput={assemblyInput}
      renderApp={(app) => (
        <main className="figma-clone">
          <FigmaCloneLayersPanel
            selection={selection}
            onSelectFrame={(frameId) => {
              setSelection(frameId === 'dom'
                ? { frameId: 'dom', nodeId: selectedNodeId ?? 'workspacePage' }
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
            selection={selection}
            viewport={app.viewport}
            onChangeDomAutoLayoutField={changeDomAutoLayoutField}
            onChangeDomField={changeDomField}
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
          aria-label="Select DOM edit frame"
          className={`figma-layer-row${selection.frameId === 'dom' && !selection.nodeId ? ' figma-layer-row--selected' : ''}`}
          type="button"
          onClick={() => onSelectFrame('dom')}
        >
          <ChevronDown aria-hidden="true" size={12} />
          <span>DOM edit</span>
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
  selection,
  viewport,
  onChangeDomAutoLayoutField,
  onChangeDomField,
}: {
  domState: FigmaCloneDomEditState
  selection: FigmaCloneSelection
  viewport: Viewport
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
      ) : (
        <FigmaCloneDomEditInspector
          selectedNodeId={selection.nodeId}
          state={domState}
          viewport={viewport}
          onChangeAutoLayout={onChangeDomAutoLayoutField}
          onChange={onChangeDomField}
        />
      )}
      {selection.frameId === 'dom' && selection.nodeId ? (
        <section className="figma-panel-section">
          <h2>Source</h2>
          <code>{FIGMA_CLONE_DOM_NODE_BY_ID[selection.nodeId].label}</code>
        </section>
      ) : null}
    </aside>
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
