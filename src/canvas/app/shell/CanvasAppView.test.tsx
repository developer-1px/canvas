import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CanvasAppView } from './CanvasAppView'
import { createViewProps } from './CanvasAppViewTestFixtures'

describe('CanvasAppView', () => {
  it('hides app UI surfaces through visible view props', () => {
    const markup = renderToStaticMarkup(
      <CanvasAppView
        {...createViewProps({
          componentPalette: false,
          commandPalette: false,
          cursorChat: false,
          drawingControls: false,
          emoteControls: false,
          imageControls: false,
          inspector: false,
          minimap: false,
          sessionTimer: false,
          shortcutHelp: false,
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

    expect(markup).not.toContain('command-palette')
    expect(markup).not.toContain('component-palette')
    expect(markup).not.toContain('cursor-chat')
    expect(markup).not.toContain('drawing-controls')
    expect(markup).not.toContain('emote-controls')
    expect(markup).not.toContain('image-controls')
    expect(markup).not.toContain('canvas-minimap')
    expect(markup).not.toContain('object-inspector')
    expect(markup).not.toContain('session-timer')
    expect(markup).not.toContain('shortcut-help')
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
    const markup = renderToStaticMarkup(
      <CanvasAppView {...createViewProps({ inspector: false })} />,
    )

    expect(markup).toContain('component-palette')
    expect(markup).toContain('cursor-chat')
    expect(markup).toContain('drawing-controls')
    expect(markup).toContain('emote-controls')
    expect(markup).toContain('image-controls')
    expect(markup).toContain('canvas-minimap')
    expect(markup).toContain('session-timer')
    expect(markup).toContain('spotlight')
    expect(markup).toContain('selection-floating-bar')
    expect(markup).toContain('stamp-controls')
    expect(markup).not.toContain('selection-stamp-group')
    expect(markup).toContain('sticky-quick-create')
    expect(markup).toContain('canvas-status')
    expect(markup).toContain('text-editor')
    expect(markup).toContain('toolbar')
    expect(markup).toContain('voting-session')
    expect(markup).toContain('zoom-controls')
  })

  it('omits optional feature-pack surfaces when view renderers are uninstalled', () => {
    const markup = renderToStaticMarkup(
      <CanvasAppView
        {...createViewProps({
          commandPalette: true,
          shortcutHelp: true,
        })}
        featurePackViewRenderers={{}}
      />,
    )

    expect(markup).not.toContain('command-palette')
    expect(markup).not.toContain('component-palette')
    expect(markup).not.toContain('cursor-chat')
    expect(markup).not.toContain('canvas-status')
    expect(markup).not.toContain('zoom-controls')
    expect(markup).toContain('object-inspector')
    expect(markup).toContain('text-editor')
    expect(markup).toContain('canvas-stage')
  })

  it('renders the command palette as a modal surface when open', () => {
    const markup = renderToStaticMarkup(
      <CanvasAppView {...createViewProps({ commandPalette: true })} />,
    )

    expect(markup).toContain('command-palette')
    expect(markup).toContain('Search commands')
    expect(markup).toContain('Select')
  })

  it('renders shortcut help as a modal surface when open', () => {
    const markup = renderToStaticMarkup(
      <CanvasAppView {...createViewProps({ shortcutHelp: true })} />,
    )

    expect(markup).toContain('shortcut-help')
    expect(markup).toContain('Keyboard shortcuts')
    expect(markup).toContain('Select Tool')
  })

  it('groups desktop chrome in floating zones', () => {
    const markup = renderToStaticMarkup(<CanvasAppView {...createViewProps()} />)

    expect(markup).toContain('canvas-floating-zone-top-left')
    expect(markup).toContain('canvas-floating-zone-top-center')
    expect(markup).toContain('canvas-floating-zone-top-right')
    expect(markup).toContain('canvas-floating-zone-right-rail')
    expect(markup).toContain('canvas-floating-zone-bottom-left')
    expect(markup).toContain('canvas-floating-zone-bottom-center')
    expect(markup).toContain('canvas-floating-zone-bottom-right')
  })

  it('keeps stamp controls as their own independent surface', () => {
    const props = createViewProps()
    props.status.selectionLength = 0
    props.toolbar.selectionCommandAnchor = null

    const markup = renderToStaticMarkup(<CanvasAppView {...props} />)

    expect(markup).toContain('stamp-controls')
    expect(markup).not.toContain('selection-stamp-group')
  })

  it('renders only one right-rail panel at a time', () => {
    const markup = renderToStaticMarkup(<CanvasAppView {...createViewProps()} />)

    expect(markup).toContain('object-inspector')
    expect(markup).not.toContain('component-palette')
  })

  it('keeps custom inspector panels composed with standard chrome', () => {
    const props = createViewProps()

    props.inspector.customPanels = [{
      content: <div>Styles</div>,
      id: 'custom-styles',
    }]

    const markup = renderToStaticMarkup(<CanvasAppView {...props} />)

    expect(markup).toContain('Styles')
    expect(markup).not.toContain('object-inspector-devtools')
    expect(markup).toContain('selection-floating-bar')
    expect(markup).toContain('zoom-controls')
  })

  it('renders only one bottom-center transient surface at a time', () => {
    const props = createViewProps()
    props.findReplace.open = true

    const markup = renderToStaticMarkup(<CanvasAppView {...props} />)

    expect(markup).toContain('find-replace-panel')
    expect(markup).not.toContain('emote-controls')
  })
})
