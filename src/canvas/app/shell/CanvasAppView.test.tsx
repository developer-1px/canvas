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
          inspector: false,
          status: false,
          textEditor: false,
          toolbar: false,
          zoomControls: false,
        })}
      />,
    )

    expect(markup).not.toContain('component-palette')
    expect(markup).not.toContain('object-inspector')
    expect(markup).not.toContain('canvas-status')
    expect(markup).not.toContain('text-editor')
    expect(markup).not.toContain('toolbar')
    expect(markup).not.toContain('zoom-controls')
    expect(markup).toContain('canvas-stage')
  })

  it('renders enabled app UI surfaces', () => {
    const markup = renderToStaticMarkup(<CanvasAppView {...createViewProps()} />)

    expect(markup).toContain('component-palette')
    expect(markup).toContain('object-inspector')
    expect(markup).toContain('canvas-status')
    expect(markup).toContain('text-editor')
    expect(markup).toContain('toolbar')
    expect(markup).toContain('zoom-controls')
  })
})

function createViewProps(
  visible: {
    componentPalette?: boolean
    inspector?: boolean
    status?: boolean
    textEditor?: boolean
    toolbar?: boolean
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
      visible: visible.inspector ?? true,
      onChangeBounds: noop,
    },
    stage: <div className="canvas-stage" />,
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
      tool: 'select',
      visible: visible.toolbar ?? true,
      onAlign: noop,
      onCustomCommand: noop,
      onDelete: noop,
      onDistribute: noop,
      onDuplicate: noop,
      onGroup: noop,
      onLock: noop,
      onRedo: noop,
      onToolChange: noop,
      onUndo: noop,
      onUngroup: noop,
      onUnlockAll: noop,
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
