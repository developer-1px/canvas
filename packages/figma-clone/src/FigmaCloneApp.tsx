import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Inspect,
  Layers,
  Maximize2,
  MousePointer2,
  PackagePlus,
  Ruler,
  Search,
  Star,
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
  type CanvasItem,
  type Viewport,
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
  CanvasDevtoolsOverlay,
  createCanvasDevtoolsFeaturePackManifest,
  type CanvasDevtoolsContextSummary,
  type CanvasDevtoolsMode,
  type CanvasDevtoolsNoteSummary,
} from '@interactive-os/canvas-pack-devtools'
import {
  DEFAULT_DOM_EDIT_OVERLAY_LAYER_VISIBILITY,
  DomEditInspector,
  DomEditSelectionOverlay,
  type DomEditAffordanceProperty,
  type DomEditAffordanceState,
  type DomEditOverlayLayer,
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
  getFigmaCloneDomText,
  getFigmaCloneDomNodeDepth,
  getFigmaCloneDomRootId,
  listFigmaCloneStoryImports,
  listFigmaCloneDomComponentSets,
  updateFigmaCloneDomComponentAutoLayoutField,
  updateFigmaCloneDomComponentEditField,
  updateFigmaCloneDomText,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomComponentBinding,
  type FigmaCloneDomComponentId,
  type FigmaCloneDomComponentPartSummary,
  type FigmaCloneDomComponentSetSummary,
  type FigmaCloneDomComponentSourceLayer,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNode,
  type FigmaCloneDomNodeId,
  type FigmaCloneDomTextState,
  type FigmaCloneStoryImportId,
  type FigmaCloneStoryImportSummary,
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

type FigmaCloneGuideLayer = Exclude<DomEditOverlayLayer, 'selection'>

type FigmaCloneInspectorTab = 'design' | 'dev'

type FigmaCloneLayerFavoriteId =
  | 'widget'
  | `section:${FigmaCloneDomSectionRootId}`
  | `node:${FigmaCloneDomNodeId}`

type FigmaCloneLayerNotesState = Partial<
  Record<FigmaCloneLayerFavoriteId, string>
>

const FIGMA_CLONE_INITIAL_LAYER_NOTES = {
  'section:workspacePage': 'Validate workspace spacing before handoff.',
  widget: 'Check widget state against the source component.',
} satisfies FigmaCloneLayerNotesState

type FigmaCloneComponentPageGroup = {
  components: readonly FigmaCloneDomComponentSetSummary[]
  pageLabel: string
  pageRootId: FigmaCloneDomSectionRootId
}

type FigmaCloneComponentSourceGroup = {
  components: readonly FigmaCloneDomComponentSetSummary[]
  label: string
  layer: FigmaCloneDomComponentSourceLayer
}

type FigmaCloneLayerTreeHandlers = {
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
}

const FIGMA_CLONE_LAYER_TREE_BUTTON_SELECTOR =
  '[data-figma-layer-tree-button]'

const FIGMA_CLONE_WIDGET_FRAME_ITEM_ID = 'figma-widget-frame'

const FIGMA_CLONE_ITEMS = createFigmaCloneCanvasItems()
const FIGMA_CLONE_DOM_COMPONENT_SETS = listFigmaCloneDomComponentSets()
const FIGMA_CLONE_STORY_IMPORTS = listFigmaCloneStoryImports()
const FIGMA_CLONE_COMPONENT_SOURCE_ORDER = [
  'widgets',
  'features',
  'shared',
] as const satisfies readonly FigmaCloneDomComponentSourceLayer[]
const FIGMA_CLONE_COMPONENT_SOURCE_LABELS = {
  features: 'features',
  shared: 'shared',
  widgets: 'widgets',
} as const satisfies Record<FigmaCloneDomComponentSourceLayer, string>

const FIGMA_CLONE_GUIDE_LAYER_CONTROLS = [
  { label: 'Flex', layer: 'flex' },
  { label: 'Grid', layer: 'grid' },
  { label: 'Spacing', layer: 'spacing' },
  { label: 'Guides', layer: 'guides' },
  { label: 'Box', layer: 'boxModel' },
] satisfies Array<{
  label: string
  layer: FigmaCloneGuideLayer
}>

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
  const [overlayLayers, setOverlayLayers] =
    useState<DomEditOverlayLayerVisibility>(
      DEFAULT_DOM_EDIT_OVERLAY_LAYER_VISIBILITY,
    )
  const [affordanceState, setAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const [layerQuery, setLayerQuery] = useState('')
  const [favoriteLayersOnly, setFavoriteLayersOnly] = useState(false)
  const [favoriteLayerIds, setFavoriteLayerIds] =
    useState<Set<FigmaCloneLayerFavoriteId>>(() => new Set())
  const [importedComponentIds, setImportedComponentIds] =
    useState<Set<FigmaCloneDomComponentId>>(() => new Set())
  const [importedStoryIds, setImportedStoryIds] =
    useState<Set<FigmaCloneStoryImportId>>(() => new Set())
  const [layerNotes, setLayerNotes] = useState<FigmaCloneLayerNotesState>(
    () => ({ ...FIGMA_CLONE_INITIAL_LAYER_NOTES }),
  )
  const [devtoolsMode, setDevtoolsMode] =
    useState<CanvasDevtoolsMode>('measure')
  const [sourceCopyState, setSourceCopyState] = useState('')
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
  const toggleOverlayLayer = useCallback((layer: FigmaCloneGuideLayer) => {
    setOverlayLayers((current) => ({
      ...current,
      [layer]: !current[layer],
      selection: true,
    }))
  }, [])
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
  const toggleFavoriteLayer = useCallback((
    favoriteId: FigmaCloneLayerFavoriteId,
  ) => {
    setFavoriteLayerIds((current) => {
      const next = new Set(current)

      if (next.has(favoriteId)) {
        next.delete(favoriteId)
      } else {
        next.add(favoriteId)
      }

      return next
    })
  }, [])
  const changeLayerNote = useCallback((
    layerId: FigmaCloneLayerFavoriteId,
    note: string,
  ) => {
    setLayerNotes((current) => {
      const next = { ...current }

      if (note) {
        next[layerId] = note
      } else {
        delete next[layerId]
      }

      return next
    })
  }, [])
  const copySourceReference = useCallback((sourceReference: string) => {
    void writeFigmaCloneClipboardText(sourceReference).then((copied) => {
      setSourceCopyState(copied ? 'Copied source' : 'Copy unavailable')
      window.setTimeout(() => setSourceCopyState(''), 1200)
    })
  }, [])
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
    additionalFeaturePackManifests: [
      createCanvasDevtoolsFeaturePackManifest({ initialMode: 'measure' }),
    ],
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
        const importComponent = (
          component: FigmaCloneDomComponentSetSummary,
        ) => {
          const importTarget = component.instances[0]?.rootNodeId

          if (!importTarget) {
            return
          }

          setImportedComponentIds((current) => {
            const next = new Set(current)
            next.add(component.id)
            return next
          })
          selectNodeAndFocus(importTarget)
        }
        const importStory = (story: FigmaCloneStoryImportSummary) => {
          setImportedStoryIds((current) => {
            const next = new Set(current)
            next.add(story.id)
            return next
          })
          selectSectionAndFocus(story.rootId)
        }
        const selectedCanvasItemId = getFigmaCloneSelectedCanvasItemId(selection)
        const devtoolsNotes = createFigmaCloneDevtoolsNotes({
          items: app.items,
          layerNotes,
          selection,
        })
        const devtoolsContext = createFigmaCloneDevtoolsContext(selection)

        return (
          <main className="figma-clone">
            <FigmaCloneSelectionViewportFocus
              canvasItemId={selectedCanvasItemId}
              onFitItems={app.viewportFocus.fitItems}
            />
            <FigmaCloneLayersPanel
              favoriteLayerIds={favoriteLayerIds}
              favoritesOnly={favoriteLayersOnly}
              query={layerQuery}
              selection={selection}
              onFavoritesOnlyChange={setFavoriteLayersOnly}
              onQueryChange={setLayerQuery}
              onSelectWidgetFrame={selectWidgetFrameAndFocus}
              onSelectSection={selectSectionAndFocus}
              onSelectNode={selectNodeAndFocus}
              onSelectNodeAndFocus={selectNodeAndFocus}
              onToggleFavorite={toggleFavoriteLayer}
            />
            <FigmaCloneImportRail
              favoriteLayerIds={favoriteLayerIds}
              favoritesOnly={favoriteLayersOnly}
              importedComponentIds={importedComponentIds}
              importedStoryIds={importedStoryIds}
              query={layerQuery}
              selection={selection}
              stories={FIGMA_CLONE_STORY_IMPORTS}
              onImportComponent={importComponent}
              onImportStory={importStory}
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
                <FigmaCloneGuideLayerControls
                  visibility={overlayLayers}
                  onToggle={toggleOverlayLayer}
                />
              </div>
              {app.stageOverlaySlot.render(
                <>
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
                  />
                  <CanvasDevtoolsOverlay
                    activeMode={devtoolsMode}
                    context={devtoolsContext}
                    items={app.items}
                    notes={devtoolsNotes}
                    selectedItemIds={[selectedCanvasItemId]}
                    viewport={app.viewport}
                    onModeChange={setDevtoolsMode}
                  />
                </>,
              )}
            </section>
            <FigmaCloneInspectorPanel
              copyState={sourceCopyState}
              domState={domState}
              domTextState={domTextState}
              layerNotes={layerNotes}
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
              onChangeLayerNote={changeLayerNote}
              onCopySourceReference={copySourceReference}
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

function FigmaCloneGuideLayerControls({
  visibility,
  onToggle,
}: {
  visibility: DomEditOverlayLayerVisibility
  onToggle: (layer: FigmaCloneGuideLayer) => void
}) {
  return (
    <div className="figma-guide-layer-control" role="group" aria-label="Guide layers">
      {FIGMA_CLONE_GUIDE_LAYER_CONTROLS.map((control) => (
        <label className="figma-guide-layer-toggle" key={control.layer}>
          <input
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            aria-label={`${control.label} overlays`}
            checked={visibility[control.layer]}
            type="checkbox"
            onChange={() => onToggle(control.layer)}
          />
          <span>{control.label}</span>
        </label>
      ))}
    </div>
  )
}

function FigmaCloneImportRail({
  favoriteLayerIds,
  favoritesOnly,
  importedComponentIds,
  importedStoryIds,
  query,
  selection,
  stories,
  onImportComponent,
  onImportStory,
  onSelectNode,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  favoritesOnly: boolean
  importedComponentIds: Set<FigmaCloneDomComponentId>
  importedStoryIds: Set<FigmaCloneStoryImportId>
  query: string
  selection: FigmaCloneSelection
  stories: readonly FigmaCloneStoryImportSummary[]
  onImportComponent: (component: FigmaCloneDomComponentSetSummary) => void
  onImportStory: (story: FigmaCloneStoryImportSummary) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const componentSourceGroups = getFigmaCloneVisibleComponentSourceGroups({
    favoriteLayerIds,
    favoritesOnly,
    query: normalizeFigmaCloneLayerQuery(query),
  })

  return (
    <aside className="figma-import-rail" aria-label="Imports">
      <header>
        <PackagePlus aria-hidden="true" size={14} />
        <h1>Imports</h1>
      </header>
      <FigmaCloneStoryImportPanel
        importedStoryIds={importedStoryIds}
        stories={stories}
        onImportStory={onImportStory}
      />
      <FigmaCloneComponentLibrary
        favoriteLayerIds={favoriteLayerIds}
        groups={componentSourceGroups}
        importedComponentIds={importedComponentIds}
        selection={selection}
        onImportComponent={onImportComponent}
        onSelectNode={onSelectNode}
      />
    </aside>
  )
}

function FigmaCloneStoryImportPanel({
  importedStoryIds,
  stories,
  onImportStory,
}: {
  importedStoryIds: Set<FigmaCloneStoryImportId>
  stories: readonly FigmaCloneStoryImportSummary[]
  onImportStory: (story: FigmaCloneStoryImportSummary) => void
}) {
  return (
    <section className="figma-story-imports" aria-label="Story imports">
      <div className="figma-story-imports__head">
        <BookOpen aria-hidden="true" size={13} />
        <span>Stories</span>
        <strong>{stories.length}</strong>
      </div>
      {stories.map((story) => {
        const imported = importedStoryIds.has(story.id)

        return (
          <article
            className="figma-story-import-card"
            data-figma-story-imported={imported ? 'true' : 'false'}
            key={story.id}
          >
            <div className="figma-story-import-card__head">
              <div>
                <strong>{story.label}</strong>
                <code>{story.source}</code>
              </div>
              <button
                aria-label={`Import ${story.label} story`}
                aria-pressed={imported}
                type="button"
                onClick={() => onImportStory(story)}
              >
                <PackagePlus aria-hidden="true" size={13} />
              </button>
            </div>
            <div
              aria-label={`${story.label} imported components`}
              className="figma-story-import-card__components"
            >
              {story.componentIds.map((componentId) => (
                <span key={componentId}>
                  {getFigmaCloneStoryComponentLabel(componentId)}
                </span>
              ))}
            </div>
          </article>
        )
      })}
    </section>
  )
}

function FigmaCloneLayersPanel({
  favoriteLayerIds,
  favoritesOnly,
  query,
  selection,
  onFavoritesOnlyChange,
  onQueryChange,
  onSelectWidgetFrame,
  onSelectSection,
  onSelectNode,
  onSelectNodeAndFocus,
  onToggleFavorite,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  favoritesOnly: boolean
  query: string
  selection: FigmaCloneSelection
  onFavoritesOnlyChange: (value: boolean) => void
  onQueryChange: (value: string) => void
  onSelectWidgetFrame: () => void
  onSelectSection: (rootId: FigmaCloneDomSectionRootId) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
  onSelectNodeAndFocus: (nodeId: FigmaCloneDomNodeId) => void
  onToggleFavorite: (favoriteId: FigmaCloneLayerFavoriteId) => void
}) {
  const activeRootId = selection.frameId === 'dom' && selection.nodeId
    ? getFigmaCloneDomRootId(selection.nodeId)
    : null
  const selectedLayerFavoriteId =
    getFigmaCloneSelectedLayerFavoriteId(selection)
  const selectedLayerLabel = getFigmaCloneSelectedLayerLabel(selection)
  const normalizedQuery = normalizeFigmaCloneLayerQuery(query)
  const visibleSections = getFigmaCloneVisibleLayerSections({
    favoriteLayerIds,
    favoritesOnly,
    query: normalizedQuery,
  })
  const showWidgetLayer = matchesFigmaCloneLayerFilters({
    favoriteId: 'widget',
    favoriteLayerIds,
    favoritesOnly,
    label: 'React widget',
    query: normalizedQuery,
  })
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
  const visibleLayerCount = getFigmaCloneVisibleLayerCount({
    showWidgetLayer,
    visibleSections,
  })
  const favoriteCount = favoriteLayerIds.size
  const totalLayerCount = getFigmaCloneTotalLayerCount()
  const selectedLayerIsFavorite = favoriteLayerIds.has(selectedLayerFavoriteId)
  const forceExpandedLayers = Boolean(normalizedQuery || favoritesOnly)
  const componentPageGroups = getFigmaCloneVisibleComponentPageGroups({
    favoriteLayerIds,
    favoritesOnly,
    query: normalizedQuery,
  })

  return (
    <aside className="figma-layers" aria-label="Layers">
      <header>
        <Layers aria-hidden="true" size={14} />
        <h1>Layers</h1>
        <span className="figma-layer-count">
          {visibleLayerCount}/{totalLayerCount}
        </span>
        <button
          aria-label={selectedLayerIsFavorite
            ? `Remove ${selectedLayerLabel} from favorites`
            : `Add ${selectedLayerLabel} to favorites`}
          aria-pressed={selectedLayerIsFavorite}
          className="figma-layer-favorite-action"
          title={selectedLayerIsFavorite ? 'Remove favorite' : 'Add favorite'}
          type="button"
          onClick={() => onToggleFavorite(selectedLayerFavoriteId)}
        >
          <Star
            aria-hidden="true"
            fill={selectedLayerIsFavorite ? 'currentColor' : 'none'}
            size={14}
          />
        </button>
      </header>
      <div className="figma-layer-tools">
        <label className="figma-layer-search">
          <Search aria-hidden="true" size={13} />
          <input
            aria-label="Search layers"
            placeholder="Search components, layers"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
          />
        </label>
        <button
          aria-label="Show favorite layers"
          aria-pressed={favoritesOnly}
          className="figma-layer-filter"
          type="button"
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Star
            aria-hidden="true"
            fill={favoritesOnly ? 'currentColor' : 'none'}
            size={12}
          />
          <span>{favoriteCount}</span>
        </button>
      </div>
      <FigmaCloneComponentVariantBoard
        favoriteLayerIds={favoriteLayerIds}
        groups={componentPageGroups}
        selection={selection}
        onSelectNode={onSelectNodeAndFocus}
      />
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
              data-figma-layer-favorite={favoriteLayerIds.has('widget') ? 'true' : 'false'}
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
              <FigmaCloneLayerFavoriteMark
                favorite={favoriteLayerIds.has('widget')}
              />
            </button>
          </div>
        ) : null}
        {visibleSections.map(({ rootId, rootNode }, index) => {
          const fullRootNode = FIGMA_CLONE_DOM_NODE_BY_ID[rootId]
          const isSelectedSection = selection.frameId === 'dom' &&
            selection.rootId === rootId &&
            selection.nodeId === null
          const sectionTreeItemId = getFigmaCloneSectionTreeItemId(rootId)
          const sectionFavoriteId =
            getFigmaCloneLayerFavoriteIdForSection(rootId)

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
                data-figma-layer-favorite={favoriteLayerIds.has(sectionFavoriteId) ? 'true' : 'false'}
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
                <FigmaCloneLayerFavoriteMark
                  favorite={favoriteLayerIds.has(sectionFavoriteId)}
                />
              </button>
              <div className="figma-layer-tree" role="group">
                <FigmaCloneLayerNode
                  activeRootId={activeRootId}
                  favoriteLayerIds={favoriteLayerIds}
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

function FigmaCloneComponentLibrary({
  favoriteLayerIds,
  groups,
  importedComponentIds,
  selection,
  onImportComponent,
  onSelectNode,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  groups: readonly FigmaCloneComponentSourceGroup[]
  importedComponentIds: Set<FigmaCloneDomComponentId>
  selection: FigmaCloneSelection
  onImportComponent: (component: FigmaCloneDomComponentSetSummary) => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  if (groups.length === 0) {
    return null
  }

  return (
    <div className="figma-component-library" aria-label="Component library">
      {groups.map((group) => (
        <section
          aria-label={`${group.label} component imports`}
          className="figma-component-source-group"
          key={group.layer}
        >
          <div className="figma-component-source-group__head">
            <span>{group.label}</span>
            <strong>{group.components.length}</strong>
          </div>
          {group.components.map((component) => {
            const favorite = component.instances.some((instance) =>
              favoriteLayerIds.has(
                getFigmaCloneLayerFavoriteIdForNode(instance.rootNodeId),
              ))
            const importTarget = component.instances[0]?.rootNodeId
            const imported = importedComponentIds.has(component.id)

            return (
              <div className="figma-component-library-card" key={component.id}>
                <div className="figma-component-library-card__head">
                  <div>
                    <strong>{component.label}</strong>
                    <code>{component.source.importPath}</code>
                  </div>
                  {importTarget ? (
                    <button
                      aria-label={`Import ${component.label} component`}
                      aria-pressed={imported}
                      data-figma-component-import-source={
                        component.source.layer
                      }
                      type="button"
                      onClick={() => onImportComponent(component)}
                    >
                      <PackagePlus aria-hidden="true" size={13} />
                    </button>
                  ) : null}
                </div>
                <div
                  aria-label={`${component.label} parts`}
                  className="figma-component-part-list"
                >
                  {component.parts.map((part) => (
                    <button
                      aria-label={`Select ${component.label} ${part.label} part`}
                      data-figma-component-part-favorite={favorite
                        ? 'true'
                        : 'false'}
                      key={part.slotLabel}
                      type="button"
                      onClick={() =>
                        onSelectNode(getFigmaCloneComponentPartTargetNodeId({
                          component,
                          part,
                          selection,
                        }))}
                    >
                      <span>{part.label}</span>
                      <small>{part.nodeIds.length}</small>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

function FigmaCloneComponentVariantBoard({
  favoriteLayerIds,
  groups,
  selection,
  onSelectNode,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  groups: readonly FigmaCloneComponentPageGroup[]
  selection: FigmaCloneSelection
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  if (groups.length === 0) {
    return null
  }

  const selectedNodeId = selection.frameId === 'dom' ? selection.nodeId : null

  return (
    <div className="figma-component-board" aria-label="Component variants">
      {groups.map((group) => (
        <section
          aria-label={`${group.pageLabel} components`}
          className="figma-component-page-group"
          key={group.pageRootId}
        >
          <div className="figma-component-page-group__head">
            <span>{group.pageLabel}</span>
            <strong>{group.components.length}</strong>
          </div>
          {group.components.map((component) => (
            <div className="figma-component-set" key={component.id}>
              <div className="figma-component-set__head">
                <strong>{component.label}</strong>
                <span>{component.instances.length} variants</span>
              </div>
              <div
                aria-label={`${component.label} variants`}
                className="figma-component-variant-list"
                role="group"
              >
                {component.instances.map((instance) => {
                  const isSelected = selectedNodeId !== null &&
                    instance.nodeIds.includes(selectedNodeId)
                  const isFavorite = favoriteLayerIds.has(
                    getFigmaCloneLayerFavoriteIdForNode(instance.rootNodeId),
                  )

                  return (
                    <button
                      aria-label={`Select ${component.label} ${instance.label} variant`}
                      aria-pressed={isSelected}
                      data-figma-component-variant-favorite={isFavorite
                        ? 'true'
                        : 'false'}
                      key={instance.rootNodeId}
                      type="button"
                      onClick={() => onSelectNode(instance.rootNodeId)}
                    >
                      <span>{instance.label}</span>
                      <FigmaCloneLayerFavoriteMark favorite={isFavorite} />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

function FigmaCloneLayerNode({
  activeRootId,
  favoriteLayerIds,
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
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
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
  const favoriteId = getFigmaCloneLayerFavoriteIdForNode(node.id)
  const isFavorite = favoriteLayerIds.has(favoriteId)

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
        data-figma-layer-favorite={isFavorite ? 'true' : 'false'}
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
        <FigmaCloneLayerFavoriteMark favorite={isFavorite} />
      </button>
      {isExpanded ? (
        <div className="figma-layer-tree" role="group">
          {node.children?.map((child, index) => (
            <FigmaCloneLayerNode
              key={child.id}
              activeRootId={activeRootId}
              favoriteLayerIds={favoriteLayerIds}
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

function FigmaCloneLayerFavoriteMark({
  favorite,
}: {
  favorite: boolean
}) {
  return (
    <Star
      aria-hidden="true"
      className="figma-layer-favorite-mark"
      data-favorite={favorite ? 'true' : 'false'}
      fill={favorite ? 'currentColor' : 'none'}
      size={11}
    />
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

function createFigmaCloneDevtoolsNotes({
  items,
  layerNotes,
  selection,
}: {
  items: readonly CanvasItem[]
  layerNotes: FigmaCloneLayerNotesState
  selection: FigmaCloneSelection
}): readonly CanvasDevtoolsNoteSummary[] {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const selectedLayerId = getFigmaCloneSelectedLayerFavoriteId(selection)

  return (Object.entries(layerNotes) as ReadonlyArray<readonly [
    FigmaCloneLayerFavoriteId,
    string | undefined,
  ]>).flatMap(([layerId, body]) => {
    if (!body) {
      return []
    }

    const item = itemById.get(
      getFigmaCloneCanvasItemIdForLayerFavoriteId(layerId),
    )

    if (!item) {
      return []
    }

    return [{
      attachedTo: getFigmaCloneLayerLabelForFavoriteId(layerId),
      body,
      bounds: {
        h: item.h,
        w: item.w,
        x: item.x,
        y: item.y,
      },
      id: `figma-note:${layerId}`,
      messageCount: 1,
      resolved: false,
      selected: layerId === selectedLayerId,
    }]
  })
}

function createFigmaCloneDevtoolsContext(
  selection: FigmaCloneSelection,
): CanvasDevtoolsContextSummary {
  const sourceReference = getFigmaCloneInspectorSourceReference(selection)

  if (selection.frameId === 'widget') {
    return {
      fields: [
        { name: 'layer', value: 'widgets' },
        { name: 'item', value: FIGMA_CLONE_WIDGET_FRAME_ITEM_ID },
        { name: 'kind', value: 'figma-clone-react-widget' },
      ],
      subtitle: sourceReference,
      title: 'React widget',
    }
  }

  if (!selection.nodeId) {
    return {
      fields: [
        { name: 'layer', value: 'page' },
        { name: 'root', value: selection.rootId },
        {
          name: 'item',
          value: getFigmaCloneDomCanvasFrameItemId(selection.rootId),
        },
      ],
      subtitle: sourceReference,
      title: `${FIGMA_CLONE_DOM_NODE_BY_ID[selection.rootId].label} section`,
    }
  }

  const binding = getFigmaCloneDomComponentBinding(selection.nodeId)
  const component = binding
    ? FIGMA_CLONE_DOM_COMPONENT_SETS.find((candidate) =>
      candidate.id === binding.componentId)
    : null
  const fields = [
    { name: 'node', value: selection.nodeId },
    { name: 'root', value: getFigmaCloneSectionRootIdForNode(selection.nodeId) },
    ...(binding
      ? [
          { name: 'component', value: binding.componentLabel },
          { name: 'instance', value: binding.instanceLabel },
          { name: 'slot', value: binding.slotLabel },
        ]
      : []),
    ...(component
      ? [
          { name: 'layer', value: component.source.layer },
          { name: 'source', value: component.source.importPath },
        ]
      : [{ name: 'layer', value: 'local node' }]),
  ]

  return {
    fields,
    subtitle: sourceReference,
    title: FIGMA_CLONE_DOM_NODE_BY_ID[selection.nodeId].label,
  }
}

function getFigmaCloneCanvasItemIdForLayerFavoriteId(
  layerId: FigmaCloneLayerFavoriteId,
) {
  if (layerId === 'widget') {
    return FIGMA_CLONE_WIDGET_FRAME_ITEM_ID
  }

  if (layerId.startsWith('section:')) {
    return getFigmaCloneDomCanvasFrameItemId(
      layerId.slice('section:'.length) as FigmaCloneDomSectionRootId,
    )
  }

  return getFigmaCloneCanvasItemIdForNode(
    layerId.slice('node:'.length) as FigmaCloneDomNodeId,
  )
}

function getFigmaCloneLayerLabelForFavoriteId(
  layerId: FigmaCloneLayerFavoriteId,
) {
  if (layerId === 'widget') {
    return 'React widget'
  }

  if (layerId.startsWith('section:')) {
    const rootId = layerId.slice('section:'.length) as FigmaCloneDomSectionRootId

    return `${FIGMA_CLONE_DOM_NODE_BY_ID[rootId].label} section`
  }

  return FIGMA_CLONE_DOM_NODE_BY_ID[
    layerId.slice('node:'.length) as FigmaCloneDomNodeId
  ].label
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

function getFigmaCloneSelectedLayerFavoriteId(
  selection: FigmaCloneSelection,
): FigmaCloneLayerFavoriteId {
  if (selection.frameId === 'widget') {
    return 'widget'
  }

  if (selection.nodeId) {
    return getFigmaCloneLayerFavoriteIdForNode(selection.nodeId)
  }

  return getFigmaCloneLayerFavoriteIdForSection(selection.rootId)
}

function getFigmaCloneSelectedLayerLabel(selection: FigmaCloneSelection) {
  if (selection.frameId === 'widget') {
    return 'React widget'
  }

  if (selection.nodeId) {
    return FIGMA_CLONE_DOM_NODE_BY_ID[selection.nodeId].label
  }

  return `${FIGMA_CLONE_DOM_NODE_BY_ID[selection.rootId].label} section`
}

function getFigmaCloneSectionTreeItemId(rootId: FigmaCloneDomSectionRootId) {
  return `section:${rootId}`
}

function getFigmaCloneNodeTreeItemId(nodeId: FigmaCloneDomNodeId) {
  return `node:${nodeId}`
}

function getFigmaCloneLayerFavoriteIdForSection(
  rootId: FigmaCloneDomSectionRootId,
): FigmaCloneLayerFavoriteId {
  return `section:${rootId}`
}

function getFigmaCloneLayerFavoriteIdForNode(
  nodeId: FigmaCloneDomNodeId,
): FigmaCloneLayerFavoriteId {
  return `node:${nodeId}`
}

type FigmaCloneVisibleLayerSection = {
  rootId: FigmaCloneDomSectionRootId
  rootNode: FigmaCloneDomNode
}

function getFigmaCloneVisibleLayerSections({
  favoriteLayerIds,
  favoritesOnly,
  query,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  favoritesOnly: boolean
  query: string
}): FigmaCloneVisibleLayerSection[] {
  return FIGMA_CLONE_DOM_SECTION_ROOT_IDS.flatMap((rootId) => {
    const fullRootNode = FIGMA_CLONE_DOM_NODE_BY_ID[rootId]
    const sectionFavoriteId = getFigmaCloneLayerFavoriteIdForSection(rootId)
    const sectionMatches = matchesFigmaCloneLayerFilters({
      favoriteId: sectionFavoriteId,
      favoriteLayerIds,
      favoritesOnly,
      label: `${fullRootNode.label} section`,
      query,
    })

    if (sectionMatches) {
      return [{ rootId, rootNode: fullRootNode }]
    }

    const rootNode = getFigmaCloneVisibleLayerNode(fullRootNode, {
      favoriteLayerIds,
      favoritesOnly,
      query,
    })

    return rootNode ? [{ rootId, rootNode }] : []
  })
}

function getFigmaCloneVisibleLayerNode(
  node: FigmaCloneDomNode,
  filter: {
    favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
    favoritesOnly: boolean
    query: string
  },
): FigmaCloneDomNode | null {
  const matchesSelf = matchesFigmaCloneLayerFilters({
    favoriteId: getFigmaCloneLayerFavoriteIdForNode(node.id),
    favoriteLayerIds: filter.favoriteLayerIds,
    favoritesOnly: filter.favoritesOnly,
    label: getFigmaCloneLayerSearchLabel(node),
    query: filter.query,
  })

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

function getFigmaCloneVisibleComponentPageGroups({
  favoriteLayerIds,
  favoritesOnly,
  query,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  favoritesOnly: boolean
  query: string
}): FigmaCloneComponentPageGroup[] {
  const groups = new Map<FigmaCloneDomSectionRootId, FigmaCloneComponentPageGroup>()

  for (const component of FIGMA_CLONE_DOM_COMPONENT_SETS) {
    const componentMatchesQuery = matchesFigmaCloneLayerQuery(
      getFigmaCloneComponentSetSearchLabel(component),
      query,
    )
    const instances = component.instances.filter((instance) =>
      (!favoritesOnly ||
        isFigmaCloneComponentInstanceFavorite(instance, favoriteLayerIds)) &&
      (componentMatchesQuery ||
        matchesFigmaCloneLayerQuery(
          getFigmaCloneComponentInstanceSearchLabel(component, instance),
          query,
        )))

    if (instances.length === 0) {
      continue
    }

    const pageGroup = groups.get(component.pageRootId) ?? {
      components: [],
      pageLabel: component.pageLabel,
      pageRootId: component.pageRootId,
    }

    groups.set(component.pageRootId, {
      ...pageGroup,
      components: [
        ...pageGroup.components,
        {
          ...component,
          instances,
        },
      ],
    })
  }

  return Array.from(groups.values())
}

function getFigmaCloneVisibleComponentSourceGroups({
  favoriteLayerIds,
  favoritesOnly,
  query,
}: {
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  favoritesOnly: boolean
  query: string
}): FigmaCloneComponentSourceGroup[] {
  return FIGMA_CLONE_COMPONENT_SOURCE_ORDER.flatMap((layer) => {
    const components = FIGMA_CLONE_DOM_COMPONENT_SETS
      .filter((component) => component.source.layer === layer)
      .filter((component) => {
        const hasFavorite = component.instances.some((instance) =>
          isFigmaCloneComponentInstanceFavorite(instance, favoriteLayerIds))

        return (!favoritesOnly || hasFavorite) &&
          matchesFigmaCloneLayerQuery(
            getFigmaCloneComponentSetSearchLabel(component),
            query,
          )
      })

    if (components.length === 0) {
      return []
    }

    return [{
      components,
      label: FIGMA_CLONE_COMPONENT_SOURCE_LABELS[layer],
      layer,
    }]
  })
}

function getFigmaCloneStoryComponentLabel(
  componentId: FigmaCloneDomComponentId,
) {
  return FIGMA_CLONE_DOM_COMPONENT_SETS.find((component) =>
    component.id === componentId)?.label ?? componentId
}

function getFigmaCloneComponentSetSearchLabel(
  component: FigmaCloneDomComponentSetSummary,
) {
  return [
    component.label,
    component.id,
    component.pageLabel,
    component.source.exportName,
    component.source.importPath,
    component.source.layer,
    ...component.parts.flatMap((part) => [part.label, part.slotLabel]),
  ].join(' ')
}

function getFigmaCloneComponentInstanceSearchLabel(
  component: FigmaCloneDomComponentSetSummary,
  instance: FigmaCloneDomComponentSetSummary['instances'][number],
) {
  return [
    component.label,
    instance.label,
    component.pageLabel,
    instance.rootNodeId,
    ...instance.slots.flatMap((slot) => [slot.label, slot.nodeId]),
  ].join(' ')
}

function isFigmaCloneComponentInstanceFavorite(
  instance: FigmaCloneDomComponentSetSummary['instances'][number],
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>,
) {
  return instance.nodeIds.some((nodeId) =>
    favoriteLayerIds.has(getFigmaCloneLayerFavoriteIdForNode(nodeId)))
}

function getFigmaCloneComponentPartTargetNodeId({
  component,
  part,
  selection,
}: {
  component: FigmaCloneDomComponentSetSummary
  part: FigmaCloneDomComponentPartSummary
  selection: FigmaCloneSelection
}): FigmaCloneDomNodeId {
  const selectedNodeId = selection.frameId === 'dom' ? selection.nodeId : null
  const selectedInstance = selectedNodeId
    ? component.instances.find((instance) =>
      instance.nodeIds.includes(selectedNodeId))
    : null
  const selectedPartNodeId = selectedInstance?.slots.find((slot) =>
    slot.label === part.slotLabel)?.nodeId

  const fallbackNodeId = part.nodeIds[0] ?? component.instances[0]?.rootNodeId

  if (!fallbackNodeId) {
    throw new Error(`Missing component part target for ${component.id}`)
  }

  return selectedPartNodeId ?? fallbackNodeId
}

function matchesFigmaCloneLayerFilters({
  favoriteId,
  favoriteLayerIds,
  favoritesOnly,
  label,
  query,
}: {
  favoriteId: FigmaCloneLayerFavoriteId
  favoriteLayerIds: Set<FigmaCloneLayerFavoriteId>
  favoritesOnly: boolean
  label: string
  query: string
}) {
  return matchesFigmaCloneLayerQuery(label, query) &&
    (!favoritesOnly || favoriteLayerIds.has(favoriteId))
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

function getFigmaCloneVisibleLayerCount({
  showWidgetLayer,
  visibleSections,
}: {
  showWidgetLayer: boolean
  visibleSections: readonly FigmaCloneVisibleLayerSection[]
}) {
  return (showWidgetLayer ? 1 : 0) +
    visibleSections.reduce(
      (total, section) =>
        total + 1 + getFigmaCloneLayerNodeCount(section.rootNode),
      0,
    )
}

function getFigmaCloneTotalLayerCount() {
  return 1 + FIGMA_CLONE_DOM_SECTION_ROOT_IDS.length +
    FIGMA_CLONE_DOM_SECTION_ROOT_IDS.reduce(
      (total, rootId) =>
        total + getFigmaCloneLayerNodeCount(FIGMA_CLONE_DOM_NODE_BY_ID[rootId]),
      0,
    )
}

function getFigmaCloneLayerNodeCount(node: FigmaCloneDomNode): number {
  return 1 + (node.children ?? []).reduce(
    (total, child) => total + getFigmaCloneLayerNodeCount(child),
    0,
  )
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
  copyState,
  domState,
  domTextState,
  layerNotes,
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
  onChangeLayerNote,
  onCopySourceReference,
  onSelectDocumentRoot,
  onSelectNode,
}: {
  copyState: string
  domState: FigmaCloneDomEditState
  domTextState: FigmaCloneDomTextState
  layerNotes: FigmaCloneLayerNotesState
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
  onChangeLayerNote: (
    layerId: FigmaCloneLayerFavoriteId,
    note: string,
  ) => void
  onCopySourceReference: (sourceReference: string) => void
  onSelectDocumentRoot: () => void
  onSelectNode: (nodeId: FigmaCloneDomNodeId) => void
}) {
  const [activeTab, setActiveTab] = useState<FigmaCloneInspectorTab>('design')
  const selectedLayerId = getFigmaCloneSelectedLayerFavoriteId(selection)
  const selectedLayerNote = layerNotes[selectedLayerId] ?? ''
  const sourceReference = getFigmaCloneInspectorSourceReference(selection)

  return (
    <aside className="figma-inspector" aria-label="Design">
      <header role="tablist" aria-label="Inspector panels">
        <FigmaCloneInspectorTabButton
          activeTab={activeTab}
          tab="design"
          onActivate={setActiveTab}
        />
        <FigmaCloneInspectorTabButton
          activeTab={activeTab}
          tab="dev"
          onActivate={setActiveTab}
        />
      </header>
      {activeTab === 'design' ? (
        <div
          aria-labelledby="figma-inspector-design-tab"
          id="figma-inspector-design-panel"
          role="tabpanel"
        >
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
            <>
              <FigmaCloneComponentInspector
                binding={getFigmaCloneDomComponentBinding(selection.nodeId)}
                onSelectNode={onSelectNode}
              />
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
            </>
          )}
          <FigmaCloneReviewNotePanel
            note={selectedLayerNote}
            selection={selection}
            onChange={(note) => onChangeLayerNote(selectedLayerId, note)}
          />
        </div>
      ) : (
        <div
          aria-labelledby="figma-inspector-dev-tab"
          id="figma-inspector-dev-panel"
          role="tabpanel"
        >
          <FigmaCloneSourcePanel
            copyState={copyState}
            sourceLabel={getFigmaCloneInspectorSourceLabel(selection)}
            sourceReference={sourceReference}
            onCopy={onCopySourceReference}
          />
          {selection.frameId === 'dom' && selection.nodeId ? (
            <FigmaCloneCssPanel
              nodeId={selection.nodeId}
              state={domState}
              onChangeAutoLayout={onChangeDomAutoLayoutField}
              onChange={onChangeDomField}
            />
          ) : null}
        </div>
      )}
    </aside>
  )
}

function FigmaCloneReviewNotePanel({
  note,
  selection,
  onChange,
}: {
  note: string
  selection: FigmaCloneSelection
  onChange: (note: string) => void
}) {
  return (
    <section className="figma-panel-section">
      <h2>Review</h2>
      <textarea
        aria-label={`Review note for ${getFigmaCloneSelectedLayerLabel(selection)}`}
        className="figma-review-note"
        placeholder="Leave note"
        rows={4}
        value={note}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </section>
  )
}

function FigmaCloneSourcePanel({
  copyState,
  sourceLabel,
  sourceReference,
  onCopy,
}: {
  copyState: string
  sourceLabel: string
  sourceReference: string
  onCopy: (sourceReference: string) => void
}) {
  return (
    <section className="figma-panel-section">
      <div className="figma-panel-section__heading-row">
        <h2>Source</h2>
        {copyState ? (
          <span aria-live="polite" className="figma-copy-state">
            {copyState}
          </span>
        ) : null}
      </div>
      <dl className="figma-context-meta">
        <div>
          <dt>Target</dt>
          <dd>{sourceLabel}</dd>
        </div>
      </dl>
      <button
        aria-label="Copy source reference"
        className="figma-source-copy-button"
        type="button"
        onClick={() => onCopy(sourceReference)}
      >
        <Copy aria-hidden="true" size={13} />
        <code>{sourceReference}</code>
      </button>
    </section>
  )
}

function FigmaCloneCssPanel({
  nodeId,
  state,
  onChangeAutoLayout,
  onChange,
}: {
  nodeId: FigmaCloneDomNodeId
  state: FigmaCloneDomEditState
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
}) {
  const context = FIGMA_CLONE_DOM_EDIT_ADAPTER.getLayoutContext(nodeId)
  const style = FIGMA_CLONE_DOM_EDIT_ADAPTER.getStyle(state, nodeId)
  const distributionValue = style.distribution === 'packed'
    ? 'start'
    : style.distribution

  return (
    <section className="figma-panel-section">
      <h2>CSS</h2>
      <div className="figma-css-declarations">
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
      </div>
    </section>
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

function FigmaCloneInspectorTabButton({
  activeTab,
  tab,
  onActivate,
}: {
  activeTab: FigmaCloneInspectorTab
  tab: FigmaCloneInspectorTab
  onActivate: (tab: FigmaCloneInspectorTab) => void
}) {
  const selected = activeTab === tab
  const label = getFigmaCloneInspectorTabLabel(tab)

  return (
    <button
      aria-controls={`figma-inspector-${tab}-panel`}
      aria-selected={selected}
      id={`figma-inspector-${tab}-tab`}
      role="tab"
      tabIndex={selected ? 0 : -1}
      type="button"
      onClick={() => onActivate(tab)}
      onKeyDown={(event) =>
        handleFigmaCloneInspectorTabKeyDown(event, tab, onActivate)}
    >
      {label}
    </button>
  )
}

function handleFigmaCloneInspectorTabKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  tab: FigmaCloneInspectorTab,
  onActivate: (tab: FigmaCloneInspectorTab) => void,
) {
  const nextTab = getFigmaCloneInspectorKeyboardTab(event.key, tab)

  if (!nextTab) {
    return
  }

  event.preventDefault()
  onActivate(nextTab)
  requestAnimationFrame(() => {
    document.getElementById(`figma-inspector-${nextTab}-tab`)?.focus()
  })
}

function getFigmaCloneInspectorKeyboardTab(
  key: string,
  tab: FigmaCloneInspectorTab,
): FigmaCloneInspectorTab | null {
  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return tab === 'design' ? 'dev' : 'design'
  }

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return tab === 'design' ? 'dev' : 'design'
  }

  if (key === 'Home') {
    return 'design'
  }

  if (key === 'End') {
    return 'dev'
  }

  if (key === 'Enter' || key === ' ') {
    return tab
  }

  return null
}

function getFigmaCloneInspectorTabLabel(tab: FigmaCloneInspectorTab) {
  return tab === 'design' ? 'Design' : 'Dev'
}

function getFigmaCloneInspectorSourceLabel(selection: FigmaCloneSelection) {
  if (selection.frameId === 'widget') {
    return 'React widget'
  }

  if (selection.nodeId) {
    return FIGMA_CLONE_DOM_NODE_BY_ID[selection.nodeId].label
  }

  return `${FIGMA_CLONE_DOM_NODE_BY_ID[selection.rootId].label} section`
}

function getFigmaCloneInspectorSourceReference(selection: FigmaCloneSelection) {
  if (selection.frameId === 'widget') {
    return 'packages/figma-clone/src/widget/FigmaCloneWidgetModule.tsx#widget'
  }

  const targetId = selection.nodeId ?? selection.rootId

  return `packages/figma-clone/src/dom-edit/FigmaCloneDomEditSurface.tsx#${targetId}`
}

async function writeFigmaCloneClipboardText(value: string) {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== 'function'
  ) {
    return false
  }

  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
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
