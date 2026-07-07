import {
  ArrowUpRight,
  Eraser,
  Frame,
  Highlighter,
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
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import {
  CanvasApp,
  type CanvasAppAssemblyInput,
  type CanvasAppProps,
  type Tool,
} from '../canvas'
import {
  CANVAS_TOOLBAR_ITEM_PROPS,
  CanvasCommandPalette,
  CanvasContextCommandMenu,
  CanvasShortcutHelpOverlay,
  type CanvasContextCommandMenuState,
  getCanvasContextMenuKeyboardIntent,
  useCanvasToolbarRovingFocus,
} from '../canvas/app'
import './CanvasEngineDemoApp.css'

type CanvasEngineDemoModel =
  Parameters<NonNullable<CanvasAppProps['renderApp']>>[0]

type CanvasEngineDemoVariant = 'engine' | 'figjam'

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

const ENGINE_SELECTION_DRAG_THRESHOLD = 3

export function CanvasEngineDemoApp({
  assemblyInput,
  variant = 'engine',
}: {
  assemblyInput?: CanvasAppAssemblyInput
  variant?: CanvasEngineDemoVariant
}) {
  return (
    <CanvasApp
      assemblyInput={assemblyInput}
      renderApp={(app) => (
        <CanvasEngineDemoSurface app={app} variant={variant} />
      )}
    />
  )
}

function CanvasEngineDemoSurface({
  app,
  variant,
}: {
  app: CanvasEngineDemoModel
  variant: CanvasEngineDemoVariant
}) {
  const viewportPercent = `${Math.round(app.zoomControls.scale * 100)}%`
  const [selectionToolbarVisible, setSelectionToolbarVisible] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [contextMenu, setContextMenu] =
    useState<CanvasContextCommandMenuState | null>(null)
  const [, setSelectionPointer] =
    useState<EngineSelectionPointerState | null>(null)
  const toolToolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()
  const viewportToolbarRovingFocus =
    useCanvasToolbarRovingFocus<HTMLDivElement>()
  const selectionFloatingBar =
    app.featurePackViewRenderers.selectionFloatingBar
  const hideSelectionToolbar = () => {
    setSelectionToolbarVisible(false)
  }
  const closeContextMenu = () => {
    setContextMenu(null)
  }
  const handleWorkspacePointerDownCapture = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (isEngineDemoControlTarget(event.target)) {
      return
    }

    setSelectionToolbarVisible(false)
    setContextMenu(null)
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
    const contextMenuKeyboardIntent = getCanvasContextMenuKeyboardIntent({
      event,
      key: event.key,
    })

    if (!contextMenuKeyboardIntent) {
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
    <main className="engine-demo-app" data-theme={theme}>
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
        />
        {selectionToolbarVisible && selectionFloatingBar ? (
          selectionFloatingBar({
            anchor: app.selection.anchor,
            commandAvailability: app.toolbar.commandAvailability,
            config: app.toolbar.config,
            customCommands: app.toolbar.customCommands,
            commandHandlers: app.toolbar.commandHandlers,
            imageControls: app.imageControls,
            inspector: app.inspector,
            selection: app.selection,
            textEditor: app.textEditor,
            tool: app.toolbar.tool,
            visible: true,
            zoomControls: app.zoomControls,
            onClose: hideSelectionToolbar,
            onCustomCommand: app.toolbar.onCustomCommand,
          })
        ) : null}
        <EngineTextEditor {...app.textEditor} />
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
      <div
        {...toolToolbarRovingFocus}
        className="engine-demo-controls"
        role="toolbar"
        aria-label={variant === 'figjam' ? 'FigJam tools' : 'Engine affordances'}
      >
        {ENGINE_DEMO_TOOLS.map(({ icon: Icon, id, label }) => (
          <button
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            aria-label={label}
            aria-pressed={app.toolbar.tool === id}
            key={id}
            onClick={() => {
              hideSelectionToolbar()
              app.toolbar.onToolChange(id)
            }}
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        ))}
      </div>
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
      <CanvasCommandPalette {...app.commandPalette} />
      <CanvasShortcutHelpOverlay {...app.shortcutHelp} />
    </main>
  )
}

function EngineStickyQuickCreateControls({
  stickyQuickCreate,
}: {
  stickyQuickCreate: CanvasEngineDemoModel['stickyQuickCreate']
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
            stickyQuickCreate.onQuickCreate(control.direction)
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
        '.engine-demo-viewport-controls',
        '.engine-sticky-quick-create',
        '.selection-floating-bar',
        '.selection-toolbar-menu',
        '.selection-toolbar-stamp-pad',
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
