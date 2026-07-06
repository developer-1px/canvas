import { vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../engine'
import { CanvasAppView } from './CanvasAppView'

export function createViewProps(
  visible: {
    commandPalette?: boolean
    componentPalette?: boolean
    cursorChat?: boolean
    drawingControls?: boolean
    emoteControls?: boolean
    imageControls?: boolean
    inspector?: boolean
    minimap?: boolean
    sessionTimer?: boolean
    selectionToolbar?: boolean
    shortcutHelp?: boolean
    spotlight?: boolean
    stampControls?: boolean
    stickyQuickCreate?: boolean
    status?: boolean
    textEditor?: boolean
    toolbar?: boolean
    votingSession?: boolean
    zoomControls?: boolean
  } = {},
): Parameters<typeof CanvasAppView>[0] {
  const config = createCanvasAffordanceConfig()
  const noop = vi.fn()

  return {
    commandPalette: {
      items: [{
        id: 'tool:select',
        section: 'Tools',
        shortcut: 'V',
        title: 'Select',
        onSelect: noop,
      }],
      open: visible.commandPalette ?? false,
      onClose: noop,
    },
    componentPalette: {
      components: [{
        accent: '#111111',
        fill: '#ffffff',
        id: 'card',
        label: 'C',
        stroke: '#cccccc',
        title: 'Card',
      }],
      visible: visible.componentPalette ?? true,
      onInsert: noop,
    },
    cursorChat: {
      maxLength: 52,
      point: { x: 260, y: 180 },
      value: 'Here',
      visible: visible.cursorChat ?? true,
      onCancel: noop,
      onChange: noop,
    },
    drawingControls: {
      colorOptions: ['#111827'],
      opacityMax: 1,
      opacityMin: 0.18,
      opacityStep: 0.01,
      style: {
        opacity: 1,
        stroke: '#111827',
        strokeWidth: 4,
      },
      toolLabel: 'Marker',
      visible: visible.drawingControls ?? true,
      widthOptions: [4],
      onOpacityChange: noop,
      onStrokeChange: noop,
      onStrokeWidthChange: noop,
    },
    emoteControls: {
      emotes: [{
        emote: 'thumbs-up',
        label: '+1',
        title: 'Thumbs up emote',
      }],
      visible: visible.emoteControls ?? true,
      onReleaseEmote: noop,
    },
    findReplace: {
      matchCount: 0,
      open: false,
      query: '',
      replacement: '',
      onClose: noop,
      onQueryChange: noop,
      onReplaceAll: noop,
      onReplacementChange: noop,
    },
    inspector: {
      bounds: { h: 80, w: 120, x: 10, y: 20 },
      commentThread: null,
      customPanels: [],
      disabled: false,
      label: 'Rect',
      styleControls: [],
      visible: visible.inspector ?? true,
      onChangeBounds: noop,
    },
    minimap: {
      model: {
        contentBounds: { h: 120, w: 200, x: 100, y: 80 },
        displayBounds: { h: 96, w: 160, x: 8, y: 8 },
        isEmpty: false,
        itemRects: [{
          id: 'rect-1',
          rect: { h: 24, w: 40, x: 24, y: 20 },
        }],
        scale: 160 / 600,
        size: { h: 112, w: 176 },
        viewportRect: { h: 60, w: 90, x: 20, y: 16 },
        viewportWorldBounds: { h: 300, w: 450, x: 0, y: 0 },
        worldBounds: { h: 360, w: 600, x: 0, y: 0 },
      },
      visible: visible.minimap ?? true,
      onNavigateToWorldPoint: noop,
    },
    imageControls: {
      canCopyImage: true,
      canDownloadImage: true,
      canPasteImage: true,
      canUploadImage: true,
      visible: visible.imageControls ?? true,
      onCopyImage: noop,
      onDownloadImage: noop,
      onPasteImage: noop,
      onUploadFiles: noop,
    },
    stage: <div className="canvas-stage" />,
    sessionTimer: {
      presetSeconds: [300, 600, 900],
      secondsRemaining: 300,
      selectedPresetSeconds: 300,
      status: 'idle',
      visible: visible.sessionTimer ?? true,
      onAddMinute: noop,
      onPause: noop,
      onReset: noop,
      onResume: noop,
      onSetDuration: noop,
      onStart: noop,
    },
    shortcutHelp: {
      items: [
        {
          id: 'tool:select',
          section: 'Tools',
          shortcut: 'V',
          title: 'Select Tool',
        },
        {
          id: 'system:shortcutHelp',
          section: 'System',
          shortcut: 'Shift+/',
          title: 'Keyboard shortcuts',
        },
      ],
      open: visible.shortcutHelp ?? false,
      onClose: noop,
    },
    spotlight: {
      active: false,
      followerCount: 0,
      visible: visible.spotlight ?? true,
      onStart: noop,
      onStop: noop,
    },
    stampControls: {
      anchor: null,
      canInsertStamp: true,
      stamps: [{
        label: '+1',
        stamp: 'thumbs-up',
        title: 'Thumbs up',
      }],
      visible: visible.stampControls ?? true,
      onInsertStamp: noop,
    },
    stickyQuickCreate: {
      controls: [{
        direction: 'right',
        x: 200,
        y: 120,
      }],
      visible: visible.stickyQuickCreate ?? true,
      onQuickCreate: noop,
    },
    status: {
      mode: 'Select',
      selectionLength: 1,
      visible: visible.status ?? true,
    },
    textEditor: {
      editing: { id: 'text-1', value: 'Text' },
      editorRef: { current: null },
      style: { left: 0, top: 0 },
      visible: visible.textEditor ?? true,
      onBlur: noop,
      onCancel: noop,
      onChange: noop,
      onCommit: noop,
    },
    toolbar: {
      commandAvailability: createCommandAvailability({
        alignBottom: false,
        alignCenter: false,
        alignLeft: false,
        alignMiddle: false,
        alignRight: false,
        alignTop: false,
        distributeHorizontal: false,
        distributeVertical: false,
        group: false,
        redo: false,
        ungroup: false,
      }),
      config,
      customCommands: [],
      customTools: [],
      commandHandlers: {
        onAlign: noop,
        onDelete: noop,
        onDistribute: noop,
        onDuplicate: noop,
        onGroup: noop,
        onLock: noop,
        onRedo: noop,
        onReorder: noop,
        onUndo: noop,
        onUngroup: noop,
        onUnlockAll: noop,
      },
      tool: 'select',
      selectionCommandAnchor: { placement: 'above', x: 120, y: 120 },
      selectionFloatingBarVisible: visible.selectionToolbar ?? true,
      visible: visible.toolbar ?? true,
      onCustomCommand: noop,
      onToolChange: noop,
    },
    votingSession: {
      canCastVote: true,
      prompt: 'Pick favorites',
      status: 'idle',
      visible: visible.votingSession ?? true,
      votesCast: 0,
      votesPerParticipant: 3,
      onEnd: noop,
      onPromptChange: noop,
      onReset: noop,
      onStart: noop,
      onVotesPerParticipantChange: noop,
    },
    zoomControls: {
      config,
      scale: 1,
      visible: visible.zoomControls ?? true,
      onFit: noop,
      onReset: noop,
      onZoomIn: noop,
      onZoomOut: noop,
    },
  }
}

function createCommandAvailability(
  overrides: Partial<CanvasCommandAvailability> = {},
): CanvasCommandAvailability {
  return {
    alignBottom: true,
    alignCenter: true,
    alignLeft: true,
    alignMiddle: true,
    alignRight: true,
    alignTop: true,
    bringForward: true,
    bringToFront: true,
    delete: true,
    duplicate: true,
    distributeHorizontal: true,
    distributeVertical: true,
    group: true,
    lockSelection: true,
    redo: true,
    selectAll: true,
    sendBackward: true,
    sendToBack: true,
    undo: true,
    ungroup: true,
    unlockAll: true,
    ...overrides,
  }
}
