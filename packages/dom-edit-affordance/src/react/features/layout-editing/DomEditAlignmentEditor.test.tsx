// @vitest-environment jsdom

import { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import type {
  DomEditLayoutContext,
  DomEditModelAdapter,
  DomEditNodeState,
  DomEditState,
} from '../../../shared/model/DomEditTypes'
import { DomEditAutoLayoutOverlay } from './DomEditAutoLayoutOverlay'
import {
  CANVAS_DOM_ALIGNMENT_POPOVER_MODEL,
  CANVAS_DOM_ALIGNMENT_PREVIEW_GUIDE_MODEL,
  DomEditAlignmentEditor,
} from './DomEditAlignmentEditor'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('DomEditAlignmentEditor', () => {
  it('exposes stable alignment affordance metadata values', () => {
    expect(CANVAS_DOM_ALIGNMENT_POPOVER_MODEL).toBe(
      'canvas-dom-alignment-popover',
    )
    expect(CANVAS_DOM_ALIGNMENT_PREVIEW_GUIDE_MODEL).toBe(
      'canvas-dom-alignment-preview-guide',
    )
  })

  it('renders the alignment popover as a labelled disclosure region', () => {
    const markup = renderToStaticMarkup(
      <DomEditAlignmentEditor
        id="alignment-panel"
        context={createLayoutContext()}
        isOpen
        labelledBy="alignment-trigger"
        selectedNodeId="node-1"
        style={createNodeStyle()}
        onChangeAutoLayout={vi.fn()}
        onClose={vi.fn()}
        onPreview={vi.fn()}
      />,
    )

    expect(markup).toContain('id="alignment-panel"')
    expect(markup).toContain(
      `data-dom-edit-alignment-popover-model="${CANVAS_DOM_ALIGNMENT_POPOVER_MODEL}"`,
    )
    expect(markup).toContain('role="region"')
    expect(markup).toContain('aria-labelledby="alignment-trigger"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('role="radio"')
    expect(markup).toContain('aria-checked="true"')
    expect(markup).not.toContain('role="dialog"')
  })

  it('clears a preview only after an open editor closes', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    const onPreview = vi.fn()
    const renderEditor = (isOpen: boolean) => (
      <DomEditAlignmentEditor
        id="alignment-panel"
        context={createLayoutContext()}
        isOpen={isOpen}
        labelledBy="alignment-trigger"
        selectedNodeId="node-1"
        style={createNodeStyle()}
        onChangeAutoLayout={vi.fn()}
        onClose={vi.fn()}
        onPreview={onPreview}
      />
    )

    await act(async () => root.render(renderEditor(false)))
    expect(onPreview).not.toHaveBeenCalled()

    await act(async () => root.render(renderEditor(true)))
    expect(onPreview).not.toHaveBeenCalled()

    await act(async () => root.render(renderEditor(false)))
    expect(onPreview).toHaveBeenCalledOnce()
    expect(onPreview).toHaveBeenCalledWith(null)

    await act(async () => root.unmount())
  })

  it('connects the auto layout trigger to the alignment panel', () => {
    const markup = renderToStaticMarkup(
      <DomEditAutoLayoutOverlay
        adapter={createAdapter()}
        affordanceState={{ mode: 'idle' }}
        rect={{ h: 80, scale: 1, w: 120, x: 10, y: 20 }}
        selectedNodeId="node-1"
        shellRef={{ current: null }}
        state={{ 'node-1': createNodeStyle() }}
        target={{} as HTMLElement}
        viewport={{ scale: 1, x: 0, y: 0 }}
        onAffordanceStateChange={vi.fn()}
        onChange={vi.fn()}
        onChangeAutoLayout={vi.fn()}
      />,
    )

    expect(markup).toContain('aria-label="Alignment editor"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toMatch(/aria-controls="[^"]+-panel"/)
  })
})

function createAdapter(): DomEditModelAdapter<string, DomEditState<string>> {
  return {
    getElement: () => null,
    getLayoutContext: () => createLayoutContext(),
    getParentId: () => null,
    getStyle: (state, nodeId) => state[nodeId],
    readNodeId: () => null,
  }
}

function createLayoutContext(): DomEditLayoutContext<string> {
  return {
    contentType: 'container',
    display: 'flex',
    hasChildren: true,
    label: 'Frame',
    nodeId: 'node-1',
    parentDisplay: null,
    parentId: null,
    position: 'static',
    showBox: true,
    showContent: true,
    showFlexLayout: true,
    showGeometry: true,
    showGridLayout: false,
    showParentParticipation: false,
    showSelfLayout: true,
  }
}

function createNodeStyle(): DomEditNodeState {
  return {
    align: 'center',
    alignSelf: 'auto',
    direction: 'row',
    distribution: 'start',
    gap: 8,
    h: 80,
    heightMode: 'fixed',
    margin: 0,
    opacity: 1,
    order: 0,
    padding: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    radius: 0,
    rotation: 0,
    w: 120,
    widthMode: 'fixed',
    x: 10,
    y: 20,
  }
}
