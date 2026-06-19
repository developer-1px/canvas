import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Frame,
  Highlighter,
  Map as MapIcon,
  Maximize2,
  MessageSquareText,
  Moon,
  MousePointer2,
  Move,
  PencilLine,
  PenLine,
  Plus,
  RotateCcw,
  Square,
  StickyNote,
  Sun,
  Type,
  Unlock,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import {
  CanvasApp,
  CanvasCommandPalette,
  CanvasContextCommandMenu,
  CanvasMinimap,
  CanvasObjectInspector,
  CanvasShortcutHelpOverlay,
  type CanvasAppAssemblyInput,
  type CanvasAppProps,
  type CanvasAppWidgetInteractions,
  type CanvasContextCommandMenuState,
  type CanvasItem,
  type CanvasJsonObject,
  type CanvasStampKind,
  type CanvasBuiltinTool,
  CANVAS_TOOLBAR_ITEM_PROPS,
  getCanvasAppCommandAriaKeyshortcuts,
  getCanvasKeyboardToolAriaKeyshortcuts,
  getCanvasAppWidgetInteractions,
  getCanvasClientViewportSize,
  getCanvasContextMenuKeyboardIntent,
  getCanvasContextMenuPosition,
  useCanvasToolbarRovingFocus,
} from '../canvas'
import {
  isCanvasEngineDemoControlTarget,
} from './CanvasEngineDemoControlTarget'
import { EngineSelectionToolbar } from './CanvasDevToolsSelectionToolbar'
import {
  applyCanvasEngineDemoFeaturePackSwitchToAssemblySource,
  createCanvasEngineDemoFeaturePackAssemblySource,
  getCanvasEngineDemoFeaturePackSwitchControls,
  type EngineDemoFeaturePackSwitchControl,
  type EngineDemoFeaturePackSwitchId,
} from './CanvasEngineDemoFeaturePacks'
import {
  getCanvasPresentationFrames,
  getNextCanvasPresentationFrameIndex,
} from './CanvasDevToolsPresentationMode'
import { EngineWidgetPlayOverlay } from './CanvasDevToolsWidgetPlayOverlay'
import './CanvasDevToolsDemoApp.css'

type CanvasEngineDemoModel =
  Parameters<NonNullable<CanvasAppProps['renderApp']>>[0]

const ENGINE_DEMO_TOOLS = [
  { icon: MousePointer2, id: 'select', label: 'Select tool' },
  { icon: Move, id: 'pan', label: 'Pan tool' },
  { icon: Square, id: 'rect', label: 'Shape tool' },
  { icon: Type, id: 'text', label: 'Text tool' },
  { icon: StickyNote, id: 'sticky', label: 'Sticky note tool' },
  { icon: MessageSquareText, id: 'comment', label: 'Comment tool' },
  { icon: Frame, id: 'section', label: 'Section tool' },
  { icon: PenLine, id: 'pen', label: 'Pen tool' },
  { icon: PencilLine, id: 'marker', label: 'Marker tool' },
  { icon: Highlighter, id: 'highlight', label: 'Highlighter tool' },
  { icon: Eraser, id: 'eraser', label: 'Eraser tool' },
  { icon: ArrowUpRight, id: 'arrow', label: 'Arrow tool' },
] as const satisfies readonly {
  icon: typeof MousePointer2
  id: CanvasBuiltinTool
  label: string
}[]

const ENGINE_DEMO_FEATURE_PACK_SWITCHES = [
  {
    icon: Frame,
    id: 'component-source-outline',
    label: 'Source outlines',
  },
  {
    icon: Square,
    id: 'component-inspector',
    label: 'Component inspector',
  },
  {
    icon: RotateCcw,
    id: 'component-sync',
    label: 'Component sync',
  },
] as const satisfies readonly {
  icon: typeof MousePointer2
  id: EngineDemoFeaturePackSwitchId
  label: string
}[]

type EngineSelectionPointerState = {
  dragging: boolean
  pointerId: number
  x: number
  y: number
}

type EnginePresentationState = {
  active: boolean
  index: number
}

const ENGINE_SELECTION_DRAG_THRESHOLD = 3

const ENGINE_SELECTION_STAMPS = [
  { label: '+1', stamp: 'thumbs-up', title: 'Stamp +1' },
  { label: '!', stamp: 'attention', title: 'Stamp !' },
  { label: '?', stamp: 'question', title: 'Stamp ?' },
] as const satisfies readonly {
  label: string
  stamp: CanvasStampKind
  title: string
}[]

export function CanvasDevToolsDemoApp({
  assemblyInput,
  featurePackSwitches = false,
}: {
  assemblyInput?: CanvasAppAssemblyInput
  featurePackSwitches?: boolean
}) {
  const [featurePackAssemblyState, setFeaturePackAssemblyState] = useState(
    () => ({
      assemblyInput,
      source: createCanvasEngineDemoFeaturePackAssemblySource(assemblyInput),
    }),
  )
  const featurePackAssemblySource =
    featurePackAssemblyState.assemblyInput === assemblyInput
      ? featurePackAssemblyState.source
      : createCanvasEngineDemoFeaturePackAssemblySource(assemblyInput)
  const featurePackAssemblySourceRef = useRef(featurePackAssemblySource)

  useEffect(() => {
    featurePackAssemblySourceRef.current = featurePackAssemblySource
  }, [featurePackAssemblySource])

  const runtimeAssemblyInput = featurePackSwitches
    ? featurePackAssemblySource.assemblyInput
    : assemblyInput
  const featurePackSwitchControls = useMemo(
    () => featurePackSwitches
      ? getCanvasEngineDemoFeaturePackSwitchControls(runtimeAssemblyInput)
      : [],
    [featurePackSwitches, runtimeAssemblyInput],
  )
  const widgetInteractions = useMemo(
    () => getCanvasAppWidgetInteractions(runtimeAssemblyInput?.customItemModules),
    [runtimeAssemblyInput],
  )
  const handleFeaturePackSwitchChange = useCallback((
    id: EngineDemoFeaturePackSwitchId,
    enabled: boolean,
  ) => {
    void applyCanvasEngineDemoFeaturePackSwitchToAssemblySource({
      enabled,
      featurePackId: id,
      source: featurePackAssemblySourceRef.current,
    }).then((result) => {
      featurePackAssemblySourceRef.current = result.source
      setFeaturePackAssemblyState({
        assemblyInput,
        source: result.source,
      })
    })
  }, [assemblyInput])

  return (
    <CanvasApp
      assemblyInput={runtimeAssemblyInput}
      renderApp={(app) => (
        <CanvasEngineDemoSurface
          app={app}
          featurePackSwitchControls={featurePackSwitchControls}
          onFeaturePackSwitchChange={handleFeaturePackSwitchChange}
          widgetInteractions={widgetInteractions}
        />
      )}
    />
  )
}

function CanvasEngineDemoSurface({
  app,
  featurePackSwitchControls,
  onFeaturePackSwitchChange,
  widgetInteractions,
}: {
  app: CanvasEngineDemoModel
  featurePackSwitchControls: readonly EngineDemoFeaturePackSwitchControl[]
  onFeaturePackSwitchChange: (
    id: EngineDemoFeaturePackSwitchId,
    enabled: boolean,
  ) => void
  widgetInteractions: CanvasAppWidgetInteractions
}) {
  const viewportPercent = `${Math.round(app.zoomControls.scale * 100)}%`
  const [selectionToolbarVisible, setSelectionToolbarVisible] = useState(false)
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null)
  const [presentation, setPresentation] = useState<EnginePresentationState>({
    active: false,
    index: 0,
  })
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [minimapVisible, setMinimapVisible] = useState(true)
  const [contextMenu, setContextMenu] =
    useState<CanvasContextCommandMenuState | null>(null)
  const [, setSelectionPointer] =
    useState<EngineSelectionPointerState | null>(null)
  const toolToolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()
  const viewportToolbarRovingFocus =
    useCanvasToolbarRovingFocus<HTMLDivElement>()
  const presentationEnabled = app.toolbar.config.overlays.presentationMode
  const presentationFrames = getCanvasPresentationFrames(app.items)
  const activePresentationIndex =
    presentationFrames.length > 0
      ? Math.min(presentation.index, presentationFrames.length - 1)
      : 0
  const activePresentationFrame = presentationFrames[activePresentationIndex] ??
    null
  const presenting =
    presentationEnabled && presentation.active && activePresentationFrame !== null
  const activeItem = activeWidgetId
    ? app.selection.items.find((item) => item.id === activeWidgetId) ?? null
    : null
  const activeWidgetItem = activeItem?.type === 'custom' ? activeItem : null
  const activeWidgetInteraction = activeWidgetItem
    ? widgetInteractions[activeWidgetItem.kind] ?? null
    : null
  const visibleActiveWidgetId =
    activeWidgetInteraction && app.toolbar.tool === 'select'
      ? activeWidgetId
      : null
  const {
    visible: inspectorVisible,
    ...inspectorProps
  } = app.inspector
  const inspectorHasContent = inspectorVisible && (
    inspectorProps.customPanels.length > 0 ||
    inspectorProps.styleControls.length > 0 ||
    (inspectorProps.bounds !== null && inspectorProps.label !== null)
  )
  const onToggleWidgetPlay = () => {
    const selectedItem =
      app.selection.items.length === 1 ? app.selection.items[0] : null
    const selectedId = getEngineWidgetInteraction(
      selectedItem,
      widgetInteractions,
    )
      ? selectedItem?.id
      : null

    if (!selectedId) {
      setActiveWidgetId(null)
      return
    }

    setActiveWidgetId((current) =>
      current && current === selectedId ? null : selectedId,
    )
  }
  const onChangeWidgetData = (itemId: string, data: CanvasJsonObject) => {
    app.selection.onReplaceSelectedItems((item) =>
      item.id === itemId && item.type === 'custom'
        ? { ...item, data }
        : item,
    )
  }
  const fitPresentationFrame = (index: number) => {
    const frame = presentationFrames[index]

    if (!frame) {
      return false
    }

    app.zoomControls.onFitItems([frame.id])
    return true
  }
  const enterPresentation = () => {
    if (!presentationEnabled || presentationFrames.length === 0) {
      return
    }

    hideSelectionToolbar()
    setActiveWidgetId(null)
    setContextMenu(null)
    app.toolbar.onToolChange('select')
    setPresentation({ active: true, index: 0 })
    fitPresentationFrame(0)
  }
  const exitPresentation = () => {
    setPresentation({ active: false, index: 0 })
  }
  const navigatePresentation = (direction: -1 | 1) => {
    const nextIndex = getNextCanvasPresentationFrameIndex({
      current: activePresentationIndex,
      direction,
      length: presentationFrames.length,
    })

    setPresentation({ active: true, index: nextIndex })
    fitPresentationFrame(nextIndex)
  }
  const hideSelectionToolbar = () => {
    setSelectionToolbarVisible(false)
  }
  const closeContextMenu = () => {
    setContextMenu(null)
  }
  const handleWorkspacePointerDownCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (presenting) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (isCanvasEngineDemoControlTarget(event.target)) {
      return
    }

    setSelectionToolbarVisible(false)
    setContextMenu(null)
    setActiveWidgetId(null)
    setSelectionPointer({
      dragging: false,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    })
  }
  const handleWorkspacePointerMoveCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (presenting) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    setSelectionPointer((current) => {
      if (!current || current.pointerId !== event.pointerId) {
        return current
      }

      const dx = event.clientX - current.x
      const dy = event.clientY - current.y

      return current.dragging ||
          Math.hypot(dx, dy) <= ENGINE_SELECTION_DRAG_THRESHOLD
        ? current
        : { ...current, dragging: true }
    })
  }
  const handleWorkspacePointerUpCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (presenting) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (isCanvasEngineDemoControlTarget(event.target)) {
      return
    }

    setSelectionPointer((current) => {
      if (!current || current.pointerId !== event.pointerId) {
        return null
      }

      setSelectionToolbarVisible(!current.dragging)
      return null
    })
  }
  const handleWorkspacePointerCancelCapture = () => {
    setSelectionPointer(null)
    setSelectionToolbarVisible(false)
  }
  const handleWorkspaceContextMenuCapture = (
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    if (presenting) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (isCanvasEngineDemoControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setSelectionToolbarVisible(false)
    setContextMenu(getEngineContextMenuPoint({
      app,
      fallback: { x: event.clientX, y: event.clientY },
      viewportSize: getCanvasClientViewportSize() ?? undefined,
    }))
  }
  const handleWorkspaceKeyDownCapture = (
    event: ReactKeyboardEvent<HTMLElement>,
  ) => {
    if (presenting) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        exitPresentation()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        event.stopPropagation()
        navigatePresentation(1)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        event.stopPropagation()
        navigatePresentation(-1)
        return
      }

      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (event.key === 'Escape' && activeWidgetId) {
      setActiveWidgetId(null)
      return
    }

    const contextMenuKeyboardIntent = getCanvasContextMenuKeyboardIntent({
      event,
      key: event.key,
    })

    if (!contextMenuKeyboardIntent) {
      return
    }

    if (isCanvasEngineDemoControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setSelectionToolbarVisible(false)
    setContextMenu(getEngineContextMenuPoint({
      app,
      viewportSize: getCanvasClientViewportSize() ?? undefined,
    }))
  }

  return (
    <main
      className="engine-demo-app"
      data-presenting={presenting ? 'true' : 'false'}
      data-theme={theme}
    >
      <section
        className="engine-demo-workspace"
        aria-label="Canvas"
        tabIndex={0}
        onContextMenuCapture={handleWorkspaceContextMenuCapture}
        onKeyDownCapture={handleWorkspaceKeyDownCapture}
        onPointerCancelCapture={handleWorkspacePointerCancelCapture}
        onPointerDownCapture={handleWorkspacePointerDownCapture}
        onPointerMoveCapture={handleWorkspacePointerMoveCapture}
        onPointerUpCapture={handleWorkspacePointerUpCapture}
      >
        {app.stage}
        <EngineStickyQuickCreateControls
          stickyQuickCreate={app.stickyQuickCreate}
          onCreate={hideSelectionToolbar}
        />
        {selectionToolbarVisible && !presenting ? (
          <EngineSelectionToolbar
            key={app.selection.ids.join('\u0000')}
            activeWidgetId={visibleActiveWidgetId}
            app={app}
            hasWidgetInteraction={(item) =>
              Boolean(getEngineWidgetInteraction(item, widgetInteractions))}
            onClose={hideSelectionToolbar}
            onToggleWidgetPlay={onToggleWidgetPlay}
          />
        ) : null}
        {selectionToolbarVisible && !presenting ? (
          <EngineStampPad
            app={app}
            onInsert={hideSelectionToolbar}
          />
        ) : null}
        {!presenting ? (
          <EngineWidgetPlayOverlay
            activeWidgetId={visibleActiveWidgetId}
            interaction={activeWidgetInteraction}
            item={visibleActiveWidgetId ? activeWidgetItem : null}
            onChangeData={onChangeWidgetData}
          />
        ) : null}
        {!presenting ? <EngineTextEditor {...app.textEditor} /> : null}
        {!presenting && minimapVisible && app.minimap.visible ? (
          <div className="engine-demo-minimap">
            <CanvasMinimap
              model={app.minimap.model}
              onNavigateToWorldPoint={app.minimap.onNavigateToWorldPoint}
            />
          </div>
        ) : null}
        <CanvasContextCommandMenu
          commandAvailability={app.toolbar.commandAvailability}
          config={app.toolbar.config}
          customCommands={app.toolbar.customCommands}
          commandHandlers={app.toolbar.commandHandlers}
          menu={contextMenu}
          onClose={closeContextMenu}
          onCustomCommand={app.toolbar.onCustomCommand}
        />
      </section>
      {!presenting && inspectorHasContent ? (
        <div className="engine-demo-inspector">
          <CanvasObjectInspector {...inspectorProps} />
        </div>
      ) : null}
      {!presenting && featurePackSwitchControls.length > 0 ? (
        <EngineFeaturePackSwitchToolbar
          controls={featurePackSwitchControls}
          onChange={onFeaturePackSwitchChange}
        />
      ) : null}
      {!presenting ? (
        <div
          {...toolToolbarRovingFocus}
          className="engine-demo-controls"
          role="toolbar"
          aria-label="Engine affordances"
        >
          {ENGINE_DEMO_TOOLS.map(({ icon: Icon, id, label }) => (
            <button
              {...CANVAS_TOOLBAR_ITEM_PROPS}
              aria-label={label}
              aria-keyshortcuts={getCanvasKeyboardToolAriaKeyshortcuts({
                config: app.toolbar.config,
                tool: id,
              })}
              aria-pressed={app.toolbar.tool === id}
              key={id}
              onClick={() => {
                hideSelectionToolbar()
                setActiveWidgetId(null)
                app.toolbar.onToolChange(id)
              }}
              type="button"
            >
              <Icon aria-hidden="true" size={14} strokeWidth={2} />
            </button>
          ))}
        </div>
      ) : null}
      <div
        {...viewportToolbarRovingFocus}
        className="engine-demo-viewport-controls"
        role="toolbar"
        aria-label="Viewport controls"
      >
        <span aria-label="Canvas scale">{viewportPercent}</span>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Zoom out"
          aria-keyshortcuts={getCanvasAppCommandAriaKeyshortcuts({
            config: app.toolbar.config,
            id: 'viewport:zoom-out',
          })}
          onClick={app.zoomControls.onZoomOut}
          type="button"
        >
          <ZoomOut aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Zoom in"
          aria-keyshortcuts={getCanvasAppCommandAriaKeyshortcuts({
            config: app.toolbar.config,
            id: 'viewport:zoom-in',
          })}
          onClick={app.zoomControls.onZoomIn}
          type="button"
        >
          <ZoomIn aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Fit selection"
          aria-keyshortcuts={getCanvasAppCommandAriaKeyshortcuts({
            config: app.toolbar.config,
            id: 'viewport:fit',
          })}
          onClick={app.zoomControls.onFit}
          type="button"
        >
          <Maximize2 aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Toggle minimap"
          aria-pressed={minimapVisible}
          onClick={() => setMinimapVisible((current) => !current)}
          type="button"
        >
          <MapIcon aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        {presentationEnabled ? (
          <EnginePresentationControls
            active={presenting}
            count={presentationFrames.length}
            index={activePresentationIndex}
            onEnter={enterPresentation}
            onExit={exitPresentation}
            onNext={() => navigatePresentation(1)}
            onPrevious={() => navigatePresentation(-1)}
          />
        ) : null}
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          type="button"
        >
          {theme === 'dark' ? (
            <Sun aria-hidden="true" size={14} strokeWidth={2} />
          ) : (
            <Moon aria-hidden="true" size={14} strokeWidth={2} />
          )}
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Reset viewport"
          aria-keyshortcuts={getCanvasAppCommandAriaKeyshortcuts({
            config: app.toolbar.config,
            id: 'viewport:reset-zoom',
          })}
          onClick={app.zoomControls.onReset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Unlock all"
          aria-keyshortcuts={getCanvasAppCommandAriaKeyshortcuts({
            config: app.toolbar.config,
            id: 'command:unlockAll',
          })}
          onClick={app.toolbar.commandHandlers.onUnlockAll}
          type="button"
        >
          <Unlock aria-hidden="true" size={14} strokeWidth={2} />
        </button>
      </div>
      {!presenting ? <CanvasCommandPalette {...app.commandPalette} /> : null}
      {!presenting ? <CanvasShortcutHelpOverlay {...app.shortcutHelp} /> : null}
    </main>
  )
}

function EngineFeaturePackSwitchToolbar({
  controls,
  onChange,
}: {
  controls: readonly EngineDemoFeaturePackSwitchControl[]
  onChange: (id: EngineDemoFeaturePackSwitchId, enabled: boolean) => void
}) {
  return (
    <div
      className="engine-demo-feature-packs"
      role="toolbar"
      aria-label="Feature packs"
    >
      {controls.map((control) => {
        const switchDefinition =
          getEngineDemoFeaturePackSwitchDefinition(control.featurePackId)
        const Icon = switchDefinition.icon

        return (
          <button
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            aria-label={`Toggle ${control.label}`}
            aria-pressed={control.active}
            data-feature-pack={control.featurePackId}
            disabled={control.disabled}
            key={control.featurePackId}
            onClick={() => onChange(control.featurePackId, !control.active)}
            title={control.label}
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        )
      })}
    </div>
  )
}

function getEngineDemoFeaturePackSwitchDefinition(
  id: EngineDemoFeaturePackSwitchId,
) {
  const definition = ENGINE_DEMO_FEATURE_PACK_SWITCHES.find((candidate) =>
    candidate.id === id
  )

  if (!definition) {
    throw new Error(`Unknown engine demo feature pack switch: ${id}`)
  }

  return definition
}

function EnginePresentationControls({
  active,
  count,
  index,
  onEnter,
  onExit,
  onNext,
  onPrevious,
}: {
  active: boolean
  count: number
  index: number
  onEnter: () => void
  onExit: () => void
  onNext: () => void
  onPrevious: () => void
}) {
  if (!active) {
    return (
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Enter presentation"
        disabled={count === 0}
        onClick={onEnter}
        type="button"
      >
        <Frame aria-hidden="true" size={14} strokeWidth={2} />
      </button>
    )
  }

  return (
    <>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Previous frame"
        onClick={onPrevious}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={14} strokeWidth={2} />
      </button>
      <span aria-label="Presentation frame">{index + 1}/{count}</span>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Next frame"
        onClick={onNext}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />
      </button>
      <button
        {...CANVAS_TOOLBAR_ITEM_PROPS}
        aria-label="Exit presentation"
        onClick={onExit}
        type="button"
      >
        <X aria-hidden="true" size={14} strokeWidth={2} />
      </button>
    </>
  )
}

function EngineStickyQuickCreateControls({
  stickyQuickCreate,
  onCreate,
}: {
  stickyQuickCreate: CanvasEngineDemoModel['stickyQuickCreate']
  onCreate: () => void
}) {
  if (!stickyQuickCreate.visible) {
    return null
  }

  return (
    <>
      {stickyQuickCreate.controls.map((control) => (
        <button
          aria-label={`Create sticky note ${control.direction}`}
          className="engine-sticky-quick-create"
          data-direction={control.direction}
          key={control.direction}
          onClick={() => {
            if (stickyQuickCreate.onQuickCreate(control.direction)) {
              onCreate()
            }
          }}
          onPointerDown={(event) => event.stopPropagation()}
          style={{
            '--engine-sticky-quick-create-x': `${control.x}px`,
            '--engine-sticky-quick-create-y': `${control.y}px`,
          } as CSSProperties}
          title="Create sticky note"
          type="button"
        >
          <Plus aria-hidden="true" size={13} strokeWidth={2.4} />
        </button>
      ))}
    </>
  )
}

function EngineStampPad({
  app,
  onInsert,
}: {
  app: CanvasEngineDemoModel
  onInsert: () => void
}) {
  const {
    anchor,
    disabled,
    ids,
  } = app.selection

  if (
    !anchor ||
    ids.length === 0 ||
    !app.selection.canStamp ||
    app.textEditor.editing ||
    app.toolbar.tool !== 'select'
  ) {
    return null
  }

  return (
    <div
      className="engine-stamp-pad"
      role="group"
      aria-label="Stamp reactions"
      data-placement={anchor.placement}
      style={{
        '--engine-selection-x': `${anchor.x}px`,
        '--engine-selection-y': `${anchor.y}px`,
      } as CSSProperties}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {ENGINE_SELECTION_STAMPS.map((stamp) => (
        <button
          aria-label={`Add ${stamp.label} stamp`}
          disabled={disabled}
          key={stamp.stamp}
          onClick={() => {
            if (app.selection.onInsertStampNearSelection(stamp)) {
              onInsert()
            }
          }}
          title={stamp.title}
          type="button"
        >
          {stamp.label}
        </button>
      ))}
    </div>
  )
}

function getEngineWidgetInteraction(
  item: CanvasItem | null,
  widgetInteractions: CanvasAppWidgetInteractions,
) {
  return item?.type === 'custom'
    ? widgetInteractions[item.kind] ?? null
    : null
}

function getEngineContextMenuPoint({
  app,
  fallback,
  viewportSize,
}: {
  app: CanvasEngineDemoModel
  fallback?: CanvasContextCommandMenuState
  viewportSize?: { height: number; width: number }
}): CanvasContextCommandMenuState {
  if (fallback) {
    return getCanvasContextMenuPosition({
      point: fallback,
      viewportSize,
    })
  }

  const anchor = app.selection.anchor

  if (anchor) {
    return getCanvasContextMenuPosition({
      point: { x: anchor.x, y: anchor.y },
      viewportSize,
    })
  }

  return getCanvasContextMenuPosition({
    point: {
      x: (viewportSize?.width ?? globalThis.innerWidth) / 2,
      y: (viewportSize?.height ?? globalThis.innerHeight) / 2,
    },
    viewportSize,
  })
}

function EngineTextEditor({
  editing,
  editorRef,
  style,
  visible,
  onBlur,
  onCancel,
  onChange,
  onCommit,
}: CanvasEngineDemoModel['textEditor']) {
  if (!visible || !editing || !style) {
    return null
  }

  return (
    <textarea
      ref={editorRef as RefObject<HTMLTextAreaElement | null>}
      className="text-editor"
      value={editing.value}
      style={style}
      spellCheck={false}
      onBlur={onBlur}
      onChange={(event) => {
        onChange({
          id: editing.id,
          value: event.target.value,
        })
      }}
      onKeyDown={(event) => {
        const shortcutModifier = event.metaKey || event.ctrlKey

        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !shortcutModifier
        ) {
          event.preventDefault()
          onCommit()
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          onCancel()
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
    />
  )
}
