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
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import {
  CanvasApp,
  CanvasContextCommandMenu,
  type CanvasAppAssemblyInput,
  type CanvasAppProps,
  type CanvasAppWidgetInteractions,
  type CanvasContextCommandMenuState,
  type CanvasItem,
  type CanvasJsonObject,
  type CanvasStampKind,
  type Tool,
  CANVAS_TOOLBAR_ITEM_PROPS,
  getCanvasAppWidgetInteractions,
  useCanvasToolbarRovingFocus,
} from '../canvas'
import { CanvasCommandPalette } from '../canvas/app/affordances/controls/command-palette/CanvasCommandPalette'
import { CanvasShortcutHelpOverlay } from '../canvas/app/affordances/controls/shortcut-help/CanvasShortcutHelpOverlay'
import { CanvasMinimap } from '../canvas/app/affordances/controls/minimap/CanvasMinimap'
import { CanvasObjectInspector } from '../canvas/app/affordances/editing/inspector/CanvasObjectInspector'
import { EngineSelectionToolbar } from './CanvasDevToolsSelectionToolbar'
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
  id: Tool
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
}: {
  assemblyInput?: CanvasAppAssemblyInput
}) {
  const widgetInteractions = useMemo(
    () => getCanvasAppWidgetInteractions(assemblyInput?.customItemModules),
    [assemblyInput],
  )

  return (
    <CanvasApp
      assemblyInput={assemblyInput}
      renderApp={(app) => (
        <CanvasEngineDemoSurface
          app={app}
          widgetInteractions={widgetInteractions}
        />
      )}
    />
  )
}

function CanvasEngineDemoSurface({
  app,
  widgetInteractions,
}: {
  app: CanvasEngineDemoModel
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

    if (isEngineDemoControlTarget(event.target)) {
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

    if (isEngineDemoControlTarget(event.target)) {
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

    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setSelectionToolbarVisible(false)
    setContextMenu(getEngineContextMenuPoint({
      app,
      fallback: { x: event.clientX, y: event.clientY },
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

    if (
      event.key !== 'ContextMenu' &&
      !(event.key === 'F10' && event.shiftKey)
    ) {
      return
    }

    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setSelectionToolbarVisible(false)
    setContextMenu(getEngineContextMenuPoint({ app }))
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
          onClick={app.zoomControls.onZoomOut}
          type="button"
        >
          <ZoomOut aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Zoom in"
          onClick={app.zoomControls.onZoomIn}
          type="button"
        >
          <ZoomIn aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Fit selection"
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
          onClick={app.zoomControls.onReset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Unlock all"
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
}: {
  app: CanvasEngineDemoModel
  fallback?: CanvasContextCommandMenuState
}): CanvasContextCommandMenuState {
  if (fallback && (fallback.x !== 0 || fallback.y !== 0)) {
    return fallback
  }

  const anchor = app.selection.anchor

  if (anchor) {
    return { x: anchor.x, y: anchor.y }
  }

  return {
    x: globalThis.innerWidth / 2,
    y: globalThis.innerHeight / 2,
  }
}

function isEngineDemoControlTarget(target: EventTarget) {
  return target instanceof Element &&
    target.closest(
      [
        '.context-command-menu',
        '.command-palette',
        '.engine-demo-controls',
        '.engine-demo-minimap',
        '.engine-demo-viewport-controls',
        '.engine-sticky-quick-create',
        '.engine-selection-toolbar',
        '.engine-stamp-pad',
        '.engine-widget-play-overlay',
        '.shortcut-help',
        '.text-editor',
        'button',
        'input',
        'textarea',
      ].join(','),
    ) !== null
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
