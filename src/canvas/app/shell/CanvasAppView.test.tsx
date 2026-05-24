import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../engine'
import { CanvasAppView } from './CanvasAppView'

describe('CanvasAppView', () => {
  it('hides app UI surfaces through visible view props', () => {
    const markup = renderToStaticMarkup(
      <CanvasAppView
        {...createViewProps({
          componentPalette: false,
          cursorChat: false,
          drawingControls: false,
          emoteControls: false,
          imageControls: false,
          inspector: false,
          sessionTimer: false,
          spotlight: false,
          stampControls: false,
          stickyQuickCreate: false,
          status: false,
          textEditor: false,
          toolbar: false,
          votingSession: false,
          zoomControls: false,
        })}
      />,
    )

    expect(markup).not.toContain('component-palette')
    expect(markup).not.toContain('cursor-chat')
    expect(markup).not.toContain('drawing-controls')
    expect(markup).not.toContain('emote-controls')
    expect(markup).not.toContain('image-controls')
    expect(markup).not.toContain('object-inspector')
    expect(markup).not.toContain('session-timer')
    expect(markup).not.toContain('spotlight')
    expect(markup).not.toContain('stamp-controls')
    expect(markup).not.toContain('sticky-quick-create')
    expect(markup).not.toContain('canvas-status')
    expect(markup).not.toContain('text-editor')
    expect(markup).not.toContain('toolbar')
    expect(markup).not.toContain('voting-session')
    expect(markup).not.toContain('zoom-controls')
    expect(markup).toContain('canvas-stage')
  })

  it('renders enabled app UI surfaces', () => {
    const markup = renderToStaticMarkup(<CanvasAppView {...createViewProps()} />)

    expect(markup).toContain('component-palette')
    expect(markup).toContain('cursor-chat')
    expect(markup).toContain('drawing-controls')
    expect(markup).toContain('emote-controls')
    expect(markup).toContain('image-controls')
    expect(markup).toContain('object-inspector')
    expect(markup).toContain('session-timer')
    expect(markup).toContain('spotlight')
    expect(markup).toContain('stamp-controls')
    expect(markup).toContain('data-anchored="true"')
    expect(markup).toContain('sticky-quick-create')
    expect(markup).toContain('canvas-status')
    expect(markup).toContain('text-editor')
    expect(markup).toContain('toolbar')
    expect(markup).toContain('voting-session')
    expect(markup).toContain('zoom-controls')
  })
})

function createViewProps(
  visible: {
    componentPalette?: boolean
    cursorChat?: boolean
    drawingControls?: boolean
    emoteControls?: boolean
    imageControls?: boolean
    inspector?: boolean
    sessionTimer?: boolean
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
      customPanels: [],
      disabled: false,
      label: 'Rect',
      styleControls: [],
      visible: visible.inspector ?? true,
      onChangeBounds: noop,
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
    spotlight: {
      active: false,
      followerCount: 0,
      visible: visible.spotlight ?? true,
      onStart: noop,
      onStop: noop,
    },
    stampControls: {
      anchor: { x: 320, y: 140 },
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
      scale: 1,
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
        onUndo: noop,
        onUngroup: noop,
        onUnlockAll: noop,
      },
      tool: 'select',
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
