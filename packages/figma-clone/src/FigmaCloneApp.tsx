import {
  ChevronDown,
  ChevronRight,
  Inspect,
  Layers,
  Maximize2,
  MousePointer2,
  Ruler,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { useJSONDocument } from '@interactive-os/json-document/react'
import {
  CanvasApp,
  type CanvasAppAssemblyInput,
} from '../../../src/canvas'
import {
  CANVAS_TOOLBAR_ITEM_PROPS,
  useCanvasToolbarRovingFocus,
} from '../../../src/canvas/app'
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  type CanvasWorkspaceStorage,
  type CanvasWorkspaceStorageProvider,
} from '../../../src/canvas/app/authoring'
import {
  DEFAULT_DOM_EDIT_OVERLAY_LAYER_VISIBILITY,
  DomEditSelectionOverlay,
  type DomEditAffordanceProperty,
  type DomEditAffordanceState,
  type DomEditOverlayLayerVisibility,
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
  getFigmaCloneDomComponentBinding,
  getFigmaCloneDomToggledAxisSizeMode,
  getFigmaCloneDomText,
  getFigmaCloneDomNodeDepth,
  getFigmaCloneDomRootId,
  updateFigmaCloneDomComponentAutoLayoutField,
  updateFigmaCloneDomComponentEditField,
  updateFigmaCloneDomText,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomAutoLayoutSizeMode,
  type FigmaCloneDomComponentBinding,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomDisplay,
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
import { getFigmaCloneDomFrameGuides } from './dom-editor/guideConfig'
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

type FigmaCloneLayerTreeHandlers = {
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
}

const FIGMA_CLONE_LAYER_TREE_BUTTON_SELECTOR =
  '[data-figma-layer-tree-button]'

const FIGMA_CLONE_WIDGET_FRAME_ITEM_ID = 'figma-widget-frame'

const FIGMA_CLONE_ITEMS = createFigmaCloneCanvasItems()
const FIGMA_CLONE_EDITOR_OVERLAY_LAYERS: DomEditOverlayLayerVisibility =
  DEFAULT_DOM_EDIT_OVERLAY_LAYER_VISIBILITY

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
  const toolToolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()
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
  const overlayLayers = FIGMA_CLONE_EDITOR_OVERLAY_LAYERS
  const [affordanceState, setAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const [layerQuery, setLayerQuery] = useState('')
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
  const frameGuides = useMemo(() => selectedSectionRootId
    ? getFigmaCloneDomFrameGuides({
        rootId: selectedSectionRootId,
        sectionViewport,
      })
    : null,
  [sectionViewport, selectedSectionRootId])
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
      const state = updateFigmaCloneDomComponentEditField({
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
      const state = updateFigmaCloneDomComponentAutoLayoutField({
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
      renderApp={(app) => {
        const focusCanvasItem = (canvasItemId: string) => {
          app.viewportFocus.fitItems([canvasItemId])
        }
        const selectWidgetFrameAndFocus = () => {
          setSelection({ frameId: 'widget', nodeId: null })
          focusCanvasItem(FIGMA_CLONE_WIDGET_FRAME_ITEM_ID)
        }
        const selectSectionAndFocus = (
          rootId: FigmaCloneDomSectionRootId,
        ) => {
          selectSection(rootId)
          focusCanvasItem(getFigmaCloneDomCanvasFrameItemId(rootId))
        }
        const selectNodeAndFocus = (nodeId: FigmaCloneDomNodeId) => {
          selectDomNode(nodeId)
          focusCanvasItem(getFigmaCloneCanvasItemIdForNode(nodeId))
        }
        const selectedCanvasItemId = getFigmaCloneSelectedCanvasItemId(selection)

        return (
          <main className="figma-clone">
            <FigmaCloneSelectionViewportFocus
              canvasItemId={selectedCanvasItemId}
              onFitItems={app.viewportFocus.fitItems}
            />
            <FigmaCloneLayersPanel
              query={layerQuery}
              selection={selection}
              onQueryChange={setLayerQuery}
              onSelectWidgetFrame={selectWidgetFrameAndFocus}
              onSelectSection={selectSectionAndFocus}
              onSelectNode={selectNodeAndFocus}
            />
            <section
              className="figma-canvas-region"
              ref={canvasRegionRef}
              aria-label="Canvas"
            >
              <div
                {...toolToolbarRovingFocus}
                className="figma-canvas-toolbar"
                role="toolbar"
                aria-label="Tools"
              >
                <button
                  {...CANVAS_TOOLBAR_ITEM_PROPS}
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
                  {...CANVAS_TOOLBAR_ITEM_PROPS}
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
                  {...CANVAS_TOOLBAR_ITEM_PROPS}
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
              {app.stageOverlaySlot.render(
                <DomEditSelectionOverlay
                  adapter={FIGMA_CLONE_DOM_EDIT_ADAPTER}
                  affordanceState={affordanceState}
                  frameGuides={frameGuides}
                  isCanvasPanActive={app.activeMode === 'pan' || app.gesture === 'pan'}
                  overlayLayers={overlayLayers}
                  selectedNodeId={selectedNodeId}
                  shellRef={canvasRegionRef as RefObject<HTMLElement | null>}
                  state={domState}
                  viewport={app.viewport}
                  onAffordanceStateChange={changeAffordanceState}
                  onChangeAutoLayout={changeDomAutoLayoutField}
                  onChange={changeDomField}
                  onCommand={runDomEditCommand}
                />,
              )}
            </section>
            <FigmaCloneInspectorPanel
              domState={domState}
              domTextState={domTextState}
              sectionViewport={sectionViewport}
              selection={selection}
              onApplySectionViewportPreset={applySectionViewportPreset}
              onChangeDomAutoLayoutField={changeDomAutoLayoutField}
              onChangeDomField={changeDomField}
              onChangeDomText={changeDomText}
              onChangeSectionFrameMode={changeSectionFrameMode}
              onChangeSectionOverflow={changeSectionOverflow}
              onChangeSectionViewportField={changeSectionViewportField}
              onSelectNode={selectDomNode}
              onSelectDocumentRoot={() => {
                selectDomNode(selection.frameId === 'dom'
                  ? selection.rootId
                  : 'workspacePage')
              }}
            />
            <FigmaCloneViewportControls
              scale={app.zoomControls.scale}
              onFit={app.viewportFocus.fitAll}
              onFitSelection={() =>
                app.viewportFocus.fitItems([
                  selectedCanvasItemId,
                ])}
              onZoomIn={app.zoomControls.onZoomIn}
              onZoomOut={app.zoomControls.onZoomOut}
            />
          </main>
        )
      }}
    />
  )
}

function FigmaCloneSelectionViewportFocus({
  canvasItemId,
  onFitItems,
}: {
  canvasItemId: string
  onFitItems: (ids: readonly string[]) => void
}) {
  const lastFocusedItemIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastFocusedItemIdRef.current === canvasItemId) {
      return undefined
    }

    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) {
        return
      }

      lastFocusedItemIdRef.current = canvasItemId
      onFitItems([canvasItemId])
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [canvasItemId, onFitItems])

  return null
}

function FigmaCloneLayersPanel({
  query,
  selection,
  onQueryChange,
  onSelectWidgetFrame,
  onSelectSection,
  onSelectNode,
}: {
  query: string
  selection: FigmaCloneSelection
  onQueryChange: (value: string) => void
  onSelectWidgetFrame: () => void
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const activeRootId = selection.frameId === 'dom' && selection.nodeId
    ? getFigmaCloneDomRootId(selection.nodeId)
    : null
  const normalizedQuery = normalizeFigmaCloneLayerQuery(query)
  const visibleSections = getFigmaCloneVisibleLayerSections({
    query: normalizedQuery,
  })
  const showWidgetLayer = matchesFigmaCloneLayerQuery(
    'React widget',
    normalizedQuery,
  )
  const topLevelSize =
    (showWidgetLayer ? 1 : 0) + visibleSections.length
  const rawSelectedTreeItemId = getFigmaCloneSelectedLayerTreeItemId(selection)
  const visibleTreeItemIds = getFigmaCloneVisibleLayerTreeItemIds({
    showWidgetLayer,
    visibleSections,
  })
  const selectedTreeItemId = visibleTreeItemIds.includes(rawSelectedTreeItemId)
    ? rawSelectedTreeItemId
    : visibleTreeItemIds[0] ?? ''
  const forceExpandedLayers = Boolean(normalizedQuery)

  return (
    <aside className="figma-layers" aria-label="Layers">
      <header>
        <Layers aria-hidden="true" size={14} />
        <h1>Layers</h1>
      </header>
      <div className="figma-layer-tools">
        <label className="figma-layer-search">
          <Search aria-hidden="true" size={13} />
          <input
            aria-label="Search layers"
            placeholder="Search DOM nodes"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
          />
        </label>
      </div>
      <div className="figma-layer-list" role="tree" aria-label="Layers">
        {topLevelSize === 0 ? (
          <div className="figma-layer-empty">No layers</div>
        ) : null}
        {showWidgetLayer ? (
          <div
            aria-level={1}
            aria-posinset={1}
            aria-selected={selection.frameId === 'widget'}
            aria-setsize={topLevelSize}
            role="treeitem"
            aria-label="React widget"
          >
            <button
              aria-label="Select React widget frame"
              className={`figma-layer-row${selection.frameId === 'widget' ? ' figma-layer-row--selected' : ''}`}
              data-figma-layer-kind="widget"
              data-figma-layer-tree-button
              data-figma-layer-tree-id="widget"
              tabIndex={selectedTreeItemId === 'widget' ? 0 : -1}
              type="button"
              onClick={onSelectWidgetFrame}
              onKeyDown={(event) =>
                handleFigmaCloneLayerTreeKeyDown(event, {
                  onSelectNode,
                  onSelectSection,
                })}
            >
              <ChevronRight aria-hidden="true" size={12} />
              <span>React widget</span>
            </button>
          </div>
        ) : null}
        {visibleSections.map(({ rootId, rootNode }, index) => {
          const fullRootNode = FIGMA_CLONE_DOM_NODE_BY_ID[rootId]
          const isSelectedSection = selection.frameId === 'dom' &&
            selection.rootId === rootId &&
            selection.nodeId === null
          const sectionTreeItemId = getFigmaCloneSectionTreeItemId(rootId)

          return (
            <div
              aria-expanded="true"
              aria-level={1}
              aria-posinset={
                (showWidgetLayer ? 1 : 0) + index + 1
              }
              aria-selected={isSelectedSection}
              aria-setsize={topLevelSize}
              className="figma-layer-section"
              key={rootId}
              role="treeitem"
              aria-label={`${fullRootNode.label} section`}
            >
              <button
                aria-label={`Select ${fullRootNode.label} section`}
                className={`figma-layer-row${isSelectedSection ? ' figma-layer-row--selected' : ''}`}
                data-figma-layer-expanded="true"
                data-figma-layer-has-children="true"
                data-figma-layer-kind="section"
                data-figma-layer-section-root-id={rootId}
                data-figma-layer-tree-button
                data-figma-layer-tree-id={sectionTreeItemId}
                tabIndex={selectedTreeItemId === sectionTreeItemId ? 0 : -1}
                type="button"
                onClick={() => onSelectSection(rootId)}
                onKeyDown={(event) =>
                  handleFigmaCloneLayerTreeKeyDown(event, {
                    onSelectNode,
                    onSelectSection,
                  })}
              >
                <ChevronDown aria-hidden="true" size={12} />
                <span>Section · {fullRootNode.label}</span>
              </button>
              <div className="figma-layer-tree" role="group">
                <FigmaCloneLayerNode
                  activeRootId={activeRootId}
                  forceExpanded={forceExpandedLayers}
                  node={rootNode}
                  parentTreeItemId={sectionTreeItemId}
                  posInSet={1}
                  rootId={rootId}
                  selectedNodeId={selection.frameId === 'dom'
                    ? selection.nodeId
                    : null}
                  selectedTreeItemId={selectedTreeItemId}
                  setSize={1}
                  onSelectSection={onSelectSection}
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
  forceExpanded,
  node,
  parentTreeItemId,
  posInSet,
  rootId,
  selectedNodeId,
  selectedTreeItemId,
  setSize,
  onSelectSection,
  onSelectNode,
}: {
  activeRootId: FigmaCloneDomNodeId | null
  forceExpanded: boolean
  node: FigmaCloneDomNode
  parentTreeItemId: string
  posInSet: number
  rootId: FigmaCloneDomSectionRootId
  selectedNodeId: FigmaCloneDomNodeId | null
  selectedTreeItemId: string
  setSize: number
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const depth = getFigmaCloneDomNodeDepth(node.id)
  const isTopLevel = depth === 0
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = hasChildren &&
    (forceExpanded || !isTopLevel || activeRootId === node.id)
  const treeItemId = getFigmaCloneNodeTreeItemId(node.id)

  return (
    <div
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={depth + 2}
      aria-posinset={posInSet}
      aria-selected={selectedNodeId === node.id}
      aria-setsize={setSize}
      role="treeitem"
      aria-label={node.label}
    >
      <button
        aria-label={`Select layer ${node.label}`}
        className={`figma-layer-row figma-layer-row--node${selectedNodeId === node.id ? ' figma-layer-row--selected' : ''}`}
        data-figma-layer-depth={depth}
        data-figma-layer-expanded={isExpanded}
        data-figma-layer-has-children={hasChildren}
        data-figma-layer-kind="node"
        data-figma-layer-node-id={node.id}
        data-figma-layer-parent-tree-id={parentTreeItemId}
        data-figma-layer-root-id={rootId}
        data-figma-layer-tree-button
        data-figma-layer-tree-id={treeItemId}
        style={{ paddingLeft: 24 + depth * 12 }}
        tabIndex={selectedTreeItemId === treeItemId ? 0 : -1}
        type="button"
        onClick={() => onSelectNode(node.id)}
        onKeyDown={(event) =>
          handleFigmaCloneLayerTreeKeyDown(event, {
            onSelectNode,
            onSelectSection,
          })}
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
      {isExpanded ? (
        <div className="figma-layer-tree" role="group">
          {node.children?.map((child, index) => (
            <FigmaCloneLayerNode
              key={child.id}
              activeRootId={activeRootId}
              forceExpanded={forceExpanded}
              node={child}
              parentTreeItemId={treeItemId}
              posInSet={index + 1}
              rootId={rootId}
              selectedNodeId={selectedNodeId}
              selectedTreeItemId={selectedTreeItemId}
              setSize={node.children?.length ?? 0}
              onSelectSection={onSelectSection}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function handleFigmaCloneLayerTreeKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  handlers: FigmaCloneLayerTreeHandlers,
) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return
  }

  const buttons = getFigmaCloneLayerTreeButtons(event.currentTarget)
  const currentIndex = buttons.indexOf(event.currentTarget)

  if (currentIndex < 0) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusFigmaCloneLayerTreeButton(buttons, currentIndex + 1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusFigmaCloneLayerTreeButton(buttons, currentIndex - 1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusFigmaCloneLayerTreeButton(buttons, 0)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusFigmaCloneLayerTreeButton(buttons, buttons.length - 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveFigmaCloneLayerTreeRight(event.currentTarget, buttons, handlers)
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveFigmaCloneLayerTreeLeft(event.currentTarget, buttons, handlers)
  }
}

function getFigmaCloneLayerTreeButtons(button: HTMLButtonElement) {
  const tree = button.closest('[role="tree"]')

  if (!tree) {
    return []
  }

  return Array.from(
    tree.querySelectorAll<HTMLButtonElement>(
      FIGMA_CLONE_LAYER_TREE_BUTTON_SELECTOR,
    ),
  )
}

function focusFigmaCloneLayerTreeButton(
  buttons: readonly HTMLButtonElement[],
  nextIndex: number,
) {
  const nextButton = buttons.at(
    Math.max(0, Math.min(buttons.length - 1, nextIndex)),
  )

  if (!nextButton) {
    return
  }

  buttons.forEach((button) => {
    button.tabIndex = button === nextButton ? 0 : -1
  })
  nextButton.focus()
}

function moveFigmaCloneLayerTreeRight(
  button: HTMLButtonElement,
  buttons: readonly HTMLButtonElement[],
  { onSelectNode }: FigmaCloneLayerTreeHandlers,
) {
  if (button.dataset.figmaLayerHasChildren !== 'true') {
    return
  }

  if (button.dataset.figmaLayerExpanded === 'true') {
    focusFigmaCloneLayerTreeChild(button, buttons)
    return
  }

  const nodeId = button.dataset.figmaLayerNodeId

  if (isFigmaCloneDomNodeId(nodeId)) {
    onSelectNode(nodeId)
  }
}

function moveFigmaCloneLayerTreeLeft(
  button: HTMLButtonElement,
  buttons: readonly HTMLButtonElement[],
  { onSelectSection }: FigmaCloneLayerTreeHandlers,
) {
  const isExpandedNode = button.dataset.figmaLayerKind === 'node' &&
    button.dataset.figmaLayerExpanded === 'true'
  const isRootNode = button.dataset.figmaLayerDepth === '0'
  const rootId = button.dataset.figmaLayerRootId

  if (isExpandedNode && isRootNode && isFigmaCloneDomSectionRootId(rootId)) {
    onSelectSection(rootId)
    return
  }

  focusFigmaCloneLayerTreeParent(button, buttons)
}

function focusFigmaCloneLayerTreeChild(
  button: HTMLButtonElement,
  buttons: readonly HTMLButtonElement[],
) {
  const treeItemId = button.dataset.figmaLayerTreeId
  const childIndex = buttons.findIndex((candidate) =>
    candidate.dataset.figmaLayerParentTreeId === treeItemId
  )

  if (childIndex >= 0) {
    focusFigmaCloneLayerTreeButton(buttons, childIndex)
  }
}

function focusFigmaCloneLayerTreeParent(
  button: HTMLButtonElement,
  buttons: readonly HTMLButtonElement[],
) {
  const parentTreeItemId = button.dataset.figmaLayerParentTreeId

  if (!parentTreeItemId) {
    return
  }

  const parentIndex = buttons.findIndex((candidate) =>
    candidate.dataset.figmaLayerTreeId === parentTreeItemId
  )

  if (parentIndex >= 0) {
    focusFigmaCloneLayerTreeButton(buttons, parentIndex)
  }
}

function getFigmaCloneSelectedLayerTreeItemId(
  selection: FigmaCloneSelection,
) {
  if (selection.frameId === 'widget') {
    return 'widget'
  }

  if (selection.nodeId) {
    return getFigmaCloneNodeTreeItemId(selection.nodeId)
  }

  return getFigmaCloneSectionTreeItemId(selection.rootId)
}

function getFigmaCloneSelectedCanvasItemId(selection: FigmaCloneSelection) {
  if (selection.frameId === 'widget') {
    return FIGMA_CLONE_WIDGET_FRAME_ITEM_ID
  }

  const rootId = selection.nodeId
    ? getFigmaCloneSectionRootIdForNode(selection.nodeId)
    : selection.rootId

  return getFigmaCloneDomCanvasFrameItemId(rootId)
}

function getFigmaCloneCanvasItemIdForNode(nodeId: FigmaCloneDomNodeId) {
  return getFigmaCloneDomCanvasFrameItemId(
    getFigmaCloneSectionRootIdForNode(nodeId),
  )
}

function getFigmaCloneDomCanvasFrameItemId(
  rootId: FigmaCloneDomSectionRootId,
) {
  return rootId === 'homePage'
    ? 'figma-dom-home-frame'
    : 'figma-dom-workspace-frame'
}

function getFigmaCloneSectionTreeItemId(rootId: FigmaCloneDomSectionRootId) {
  return `section:${rootId}`
}

function getFigmaCloneNodeTreeItemId(nodeId: FigmaCloneDomNodeId) {
  return `node:${nodeId}`
}

type FigmaCloneVisibleLayerSection = {
  rootId: FigmaCloneDomSectionRootId
  rootNode: FigmaCloneDomNode
}

function getFigmaCloneVisibleLayerSections({
  query,
}: {
  query: string
}): FigmaCloneVisibleLayerSection[] {
  return FIGMA_CLONE_DOM_SECTION_ROOT_IDS.flatMap((rootId) => {
    const fullRootNode = FIGMA_CLONE_DOM_NODE_BY_ID[rootId]
    const sectionMatches = matchesFigmaCloneLayerQuery(
      `${fullRootNode.label} section`,
      query,
    )

    if (sectionMatches) {
      return [{ rootId, rootNode: fullRootNode }]
    }

    const rootNode = getFigmaCloneVisibleLayerNode(fullRootNode, {
      query,
    })

    return rootNode ? [{ rootId, rootNode }] : []
  })
}

function getFigmaCloneVisibleLayerNode(
  node: FigmaCloneDomNode,
  filter: {
    query: string
  },
): FigmaCloneDomNode | null {
  const matchesSelf = matchesFigmaCloneLayerQuery(
    getFigmaCloneLayerSearchLabel(node),
    filter.query,
  )

  if (matchesSelf) {
    return node
  }

  const children = (node.children ?? [])
    .map((child) => getFigmaCloneVisibleLayerNode(child, filter))
    .filter((child): child is FigmaCloneDomNode => Boolean(child))

  if (children.length === 0) {
    return null
  }

  return {
    ...node,
    children,
  }
}

function getFigmaCloneLayerSearchLabel(node: FigmaCloneDomNode) {
  const componentBinding = getFigmaCloneDomComponentBinding(node.id)

  if (!componentBinding) {
    return `${node.label} ${node.id}`
  }

  return [
    node.label,
    node.id,
    componentBinding.componentLabel,
    componentBinding.instanceLabel,
    componentBinding.slotLabel,
  ].join(' ')
}

function matchesFigmaCloneLayerQuery(label: string, query: string) {
  if (!query) {
    return true
  }

  return normalizeFigmaCloneLayerQuery(label).includes(query)
}

function normalizeFigmaCloneLayerQuery(value: string) {
  return value.trim().toLowerCase()
}

function getFigmaCloneVisibleLayerTreeItemIds({
  showWidgetLayer,
  visibleSections,
}: {
  showWidgetLayer: boolean
  visibleSections: readonly FigmaCloneVisibleLayerSection[]
}) {
  const ids: string[] = []

  if (showWidgetLayer) {
    ids.push('widget')
  }

  for (const section of visibleSections) {
    ids.push(getFigmaCloneSectionTreeItemId(section.rootId))
    pushFigmaCloneLayerNodeTreeItemIds(ids, section.rootNode)
  }

  return ids
}

function pushFigmaCloneLayerNodeTreeItemIds(
  ids: string[],
  node: FigmaCloneDomNode,
) {
  ids.push(getFigmaCloneNodeTreeItemId(node.id))
  for (const child of node.children ?? []) {
    pushFigmaCloneLayerNodeTreeItemIds(ids, child)
  }
}

function isFigmaCloneDomSectionRootId(
  value: string | undefined,
): value is FigmaCloneDomSectionRootId {
  return FIGMA_CLONE_DOM_SECTION_ROOT_IDS.some((rootId) => rootId === value)
}

function isFigmaCloneDomNodeId(
  value: string | undefined,
): value is FigmaCloneDomNodeId {
  return Boolean(value && value in FIGMA_CLONE_DOM_NODE_BY_ID)
}

function FigmaCloneInspectorPanel({
  domState,
  domTextState,
  sectionViewport,
  selection,
  onApplySectionViewportPreset,
  onChangeDomAutoLayoutField,
  onChangeDomField,
  onChangeDomText,
  onChangeSectionFrameMode,
  onChangeSectionOverflow,
  onChangeSectionViewportField,
  onSelectDocumentRoot,
  onSelectNode,
}: {
  domState: FigmaCloneDomEditState
  domTextState: FigmaCloneDomTextState
  sectionViewport: FigmaCloneSectionViewport
  selection: FigmaCloneSelection
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
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  return (
    <aside className="figma-inspector" aria-label="CSS Inspector">
      <header>
        <h1>CSS</h1>
      </header>
      <div className="figma-inspector-body">
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
                <dd>Outside DOM CSS</dd>
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
          <>
            <FigmaCloneCssPanel
              nodeId={selection.nodeId}
              state={domState}
              textState={domTextState}
              onChangeAutoLayout={onChangeDomAutoLayoutField}
              onChange={onChangeDomField}
              onChangeText={onChangeDomText}
            />
            <FigmaCloneComponentInspector
              binding={getFigmaCloneDomComponentBinding(selection.nodeId)}
              onSelectNode={onSelectNode}
            />
          </>
        )}
      </div>
    </aside>
  )
}

function FigmaCloneCssPanel({
  nodeId,
  state,
  textState,
  onChangeAutoLayout,
  onChange,
  onChangeText,
}: {
  nodeId: FigmaCloneDomNodeId
  state: FigmaCloneDomEditState
  textState: FigmaCloneDomTextState
  onChangeAutoLayout: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
  onChangeText: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  const context = FIGMA_CLONE_DOM_EDIT_ADAPTER.getLayoutContext(nodeId)
  const style = FIGMA_CLONE_DOM_EDIT_ADAPTER.getStyle(state, nodeId)
  const distributionValue = style.distribution === 'packed'
    ? 'start'
    : style.distribution
  const canEditText = canFigmaCloneDomNodeEditText(nodeId)

  return (
    <section className="figma-panel-section">
      <h2>CSS</h2>
      <div className="figma-css-declarations">
        <FigmaCloneCssSizeModeDeclaration
          axis="W"
          field="widthMode"
          mode={style.widthMode}
          name="width"
          nodeId={nodeId}
          parentDisplay={context.parentDisplay}
          value={style.w}
          onChange={onChangeAutoLayout}
        />
        <FigmaCloneCssSizeModeDeclaration
          axis="H"
          field="heightMode"
          mode={style.heightMode}
          name="height"
          nodeId={nodeId}
          parentDisplay={context.parentDisplay}
          value={style.h}
          onChange={onChangeAutoLayout}
        />
        <FigmaCloneCssReadOnlyDeclaration
          name="display"
          value={context.display}
        />
        {context.showSelfLayout || context.showGridLayout ? (
          <>
            {context.showSelfLayout ? (
              <>
                <FigmaCloneCssSelectDeclaration
                  label="CSS flex-direction"
                  name="flex-direction"
                  options={[
                    { label: 'row', value: 'row' },
                    { label: 'column', value: 'column' },
                  ]}
                  value={style.direction}
                  onChange={(value) =>
                    onChangeAutoLayout(nodeId, 'direction', value)}
                />
                <FigmaCloneCssSelectDeclaration
                  label="CSS align-items"
                  name="align-items"
                  options={[
                    { label: 'flex-start', value: 'start' },
                    { label: 'center', value: 'center' },
                    { label: 'flex-end', value: 'end' },
                    { label: 'stretch', value: 'stretch' },
                  ]}
                  value={style.align}
                  onChange={(value) =>
                    onChangeAutoLayout(nodeId, 'align', value)}
                />
                <FigmaCloneCssSelectDeclaration
                  label="CSS justify-content"
                  name="justify-content"
                  options={[
                    { label: 'flex-start', value: 'start' },
                    { label: 'center', value: 'center' },
                    { label: 'flex-end', value: 'end' },
                    { label: 'space-between', value: 'space-between' },
                  ]}
                  value={distributionValue}
                  onChange={(value) =>
                    onChangeAutoLayout(nodeId, 'distribution', value)}
                />
              </>
            ) : null}
            <FigmaCloneCssNumberDeclaration
              field="gap"
              label="CSS gap"
              name="gap"
              nodeId={nodeId}
              value={style.gap}
              onChange={onChange}
            />
          </>
        ) : null}
        {context.showParentParticipation ? (
          <FigmaCloneCssSelectDeclaration
            label="CSS align-self"
            name="align-self"
            options={[
              { label: 'auto', value: 'auto' },
              { label: 'flex-start', value: 'start' },
              { label: 'center', value: 'center' },
              { label: 'flex-end', value: 'end' },
              { label: 'stretch', value: 'stretch' },
            ]}
            value={style.alignSelf}
            onChange={(value) =>
              onChangeAutoLayout(nodeId, 'alignSelf', value)}
          />
        ) : null}
        <FigmaCloneCssNumberDeclaration
          field="padding"
          label="CSS padding"
          name="padding"
          nodeId={nodeId}
          value={style.padding}
          onChange={onChange}
        />
        <FigmaCloneCssNumberDeclaration
          field="margin"
          label="CSS margin"
          name="margin"
          nodeId={nodeId}
          value={style.margin}
          onChange={onChange}
        />
        <FigmaCloneCssNumberDeclaration
          field="radius"
          label="CSS border radius"
          name="border-radius"
          nodeId={nodeId}
          value={style.radius}
          onChange={onChange}
        />
        <FigmaCloneCssNumberDeclaration
          field="opacity"
          label="CSS opacity"
          name="opacity"
          nodeId={nodeId}
          value={style.opacity}
          onChange={onChange}
        />
        {canEditText ? (
          <FigmaCloneCssTextDeclaration
            nodeId={nodeId}
            value={getFigmaCloneDomText(textState, nodeId)}
            onChange={onChangeText}
          />
        ) : null}
      </div>
    </section>
  )
}

function FigmaCloneCssSizeModeDeclaration({
  axis,
  field,
  mode,
  name,
  nodeId,
  parentDisplay,
  value,
  onChange,
}: {
  axis: 'H' | 'W'
  field: Extract<FigmaCloneDomAutoLayoutField, 'heightMode' | 'widthMode'>
  mode: FigmaCloneDomAutoLayoutSizeMode
  name: string
  nodeId: FigmaCloneDomNodeId
  parentDisplay: FigmaCloneDomDisplay | null
  value: number
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
}) {
  const modeLabel = formatFigmaCloneCssSizeMode(mode)

  return (
    <button
      aria-label={`${axis} ${Math.round(value)} ${modeLabel}`}
      className="figma-css-declaration figma-css-size-mode-button"
      data-mode={mode}
      type="button"
      onClick={() => {
        onChange(
          nodeId,
          field,
          getFigmaCloneDomToggledAxisSizeMode({ mode, parentDisplay }),
        )
      }}
    >
      <code>{name}</code>
      <span>
        <strong>{Math.round(value)}</strong>
        <em>{modeLabel}</em>
      </span>
    </button>
  )
}

function FigmaCloneCssReadOnlyDeclaration({
  name,
  value,
}: {
  name: string
  value: string
}) {
  return (
    <div className="figma-css-declaration">
      <code>{name}</code>
      <span>{value}</span>
    </div>
  )
}

function FigmaCloneCssNumberDeclaration({
  field,
  label,
  name,
  nodeId,
  value,
  onChange,
}: {
  field: FigmaCloneDomEditField
  label: string
  name: string
  nodeId: FigmaCloneDomNodeId
  value: number
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
}) {
  return (
    <label className="figma-css-declaration">
      <code>{name}</code>
      <input
        aria-label={label}
        type="number"
        value={value}
        onChange={(event) =>
          onChange(nodeId, field, Number(event.currentTarget.value))}
      />
    </label>
  )
}

function FigmaCloneCssSelectDeclaration<
  TValue extends FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
>({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string
  name: string
  options: readonly { label: string; value: TValue }[]
  value: TValue
  onChange: (value: TValue) => void
}) {
  return (
    <label className="figma-css-declaration">
      <code>{name}</code>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as TValue)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function formatFigmaCloneCssSizeMode(
  mode: FigmaCloneDomAutoLayoutSizeMode,
) {
  if (mode === 'fill') {
    return 'Fill'
  }

  if (mode === 'hug') {
    return 'Hug'
  }

  return 'Fixed'
}

function FigmaCloneCssTextDeclaration({
  nodeId,
  value,
  onChange,
}: {
  nodeId: FigmaCloneDomNodeId
  value: string
  onChange: (nodeId: FigmaCloneDomNodeId, value: string) => void
}) {
  return (
    <label className="figma-css-declaration figma-css-declaration--text">
      <code>text-content</code>
      <textarea
        aria-label="CSS text content"
        rows={Math.min(3, Math.max(1, value.split('\n').length))}
        value={value}
        onChange={(event) => onChange(nodeId, event.currentTarget.value)}
      />
    </label>
  )
}

function FigmaCloneComponentInspector({
  binding,
  onSelectNode,
}: {
  binding: FigmaCloneDomComponentBinding | null
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  if (!binding) {
    return null
  }

  return (
    <section className="figma-panel-section figma-panel-section--component">
      <h2>Component</h2>
      <dl className="figma-context-meta">
        <div>
          <dt>Set</dt>
          <dd>{binding.componentLabel}</dd>
        </div>
        <div>
          <dt>Instance</dt>
          <dd>{binding.instanceLabel}</dd>
        </div>
        <div>
          <dt>Slot</dt>
          <dd>{binding.slotLabel}</dd>
        </div>
      </dl>
      <div
        aria-label={`${binding.componentLabel} synced instances`}
        className="figma-component-instances"
      >
        {binding.slotNodeIds.map((nodeId) => {
          const isCurrent = nodeId === binding.currentNodeId
          const nodeLabel = FIGMA_CLONE_DOM_NODE_BY_ID[nodeId].label

          return (
            <button
              aria-pressed={isCurrent}
              key={nodeId}
              type="button"
              onClick={() => onSelectNode(nodeId)}
            >
              {nodeLabel}
            </button>
          )
        })}
      </div>
      <p className="figma-component-sync-note">
        {binding.syncDescription}
      </p>
    </section>
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
  onFitSelection,
  onZoomIn,
  onZoomOut,
}: {
  scale: number
  onFit: () => void
  onFitSelection: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}) {
  const toolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()

  return (
    <div
      {...toolbarRovingFocus}
      className="figma-viewport-controls"
      role="toolbar"
      aria-label="Viewport"
    >
      <span>{Math.round(scale * 100)}%</span>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Zoom out"
        type="button"
        onClick={onZoomOut}
      >
        <ZoomOut aria-hidden="true" size={14} />
      </button>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Zoom in"
        type="button"
        onClick={onZoomIn}
      >
        <ZoomIn aria-hidden="true" size={14} />
      </button>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Fit selection"
        type="button"
        onClick={onFitSelection}
      >
        <Maximize2 aria-hidden="true" size={14} />
      </button>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Fit all"
        type="button"
        onClick={onFit}
      >
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
