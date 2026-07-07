import { CANVAS_APP_TEXT_TARGET } from '../affordances/editing/text-editor/CanvasAppTextTarget'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import { renderCanvasWhiteboardSvgItem } from './CanvasWhiteboardSvgItemRenderer'
import {
  CanvasInlineTextEditingContext,
  type CanvasInlineTextEditingContextValue,
} from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasWhiteboardSvgComponentPresentationRegistry'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS } from './CanvasWhiteboardSvgCustomItemRendererRegistry'

describe('CanvasWhiteboardSvgItemRenderer built-in components', () => {
  it('renders sticky notes as a single editable note body', () => {
    const markup = renderItem({
      accent: '#ca8a04',
      body: 'Decision note',
      component: 'sticky',
      fill: '#fef3c7',
      h: 148,
      id: 'component-sticky',
      stroke: '#eab308',
      title: 'Sticky',
      type: 'component',
      w: 188,
      x: 92,
      y: 88,
    }, () => 'note-card')

    expect(markup).toContain('component-sticky-note')
    expect(markup).toContain('component-sticky-text')
    expect(markup).toContain('data-text-item-id="component-sticky"')
    expect(markup).toContain('Decision note')
    expect(markup).not.toContain('component-title')
    expect(markup).not.toContain('Sticky')
  })


  it('keeps blank quick-created sticky notes visually blank', () => {
    const markup = renderItem({
      accent: '#ca8a04',
      body: '',
      component: 'sticky',
      fill: '#fef3c7',
      h: 148,
      id: 'component-sticky',
      stroke: '#eab308',
      title: 'Sticky',
      type: 'component',
      w: 188,
      x: 92,
      y: 88,
    }, () => 'note-card')

    expect(markup).toContain('component-sticky-text')
    expect(markup).toContain('component-sticky-body')
    expect(markup).toContain('data-text-item-id="component-sticky"')
    expect(markup).not.toContain('Sticky')
  })

  it('opens active sticky body as a contenteditable text surface', () => {
    const markup = renderItem({
      accent: '#ca8a04',
      body: 'Decision note',
      component: 'sticky',
      fill: '#fef3c7',
      h: 148,
      id: 'component-sticky',
      stroke: '#eab308',
      title: 'Sticky',
      type: 'component',
      w: 188,
      x: 92,
      y: 88,
    }, () => 'note-card', {
      inlineTextEditor: createInlineTextEditor({
        editing: { id: 'component-sticky', value: 'Draft note' },
      }),
    })

    expect(markup).toContain('contentEditable="plaintext-only"')
    expect(markup).toContain('data-editing="true"')
    expect(markup).toContain('role="textbox"')
    expect(markup).not.toContain('textarea')
  })


  it('renders table components from their dynamic column and row data', () => {
    const markup = renderItem({
      accent: '#0891b2',
      columns: ['Name', 'Owner'],
      component: 'table',
      fill: '#ffffff',
      h: 132,
      id: 'component-table',
      items: ['Import CSV', 'Mina', 'Review', 'Ari'],
      stroke: '#cbd5e1',
      title: 'Roadmap',
      type: 'component',
      w: 224,
      x: 0,
      y: 0,
    }, () => 'matrix-table')

    expect(markup).toContain('Name')
    expect(markup).toContain('Owner')
    expect(markup).toContain('Import CSV')
    expect(markup).toContain('Review')
    expect(markup).not.toContain('x1="112"')
    expect(markup).toContain('y2="88"')
  })


  it('renders checklist checked state from component data', () => {
    const markup = renderItem({
      accent: '#16a34a',
      checkedItems: [1],
      component: 'checklist',
      fill: '#ffffff',
      h: 156,
      id: 'component-checklist',
      items: ['Scope', 'Owner', 'Next'],
      stroke: '#cbd5e1',
      title: 'Checklist',
      type: 'component',
      w: 224,
      x: 0,
      y: 0,
    }, () => 'checklist-list')

    expect(markup).toContain('Scope')
    expect(markup).toContain('Owner')
    expect(markup).toContain('Next')
    expect(markup).toContain('M 21 79 L 25 83 L 30 75')
    expect(markup).not.toContain('M 21 57 L 25 61 L 31 53')
  })


  it('renders kanban cards from normalized component data', () => {
    const markup = renderItem({
      accent: '#7c3aed',
      component: 'kanban',
      fill: '#f8fafc',
      h: 190,
      id: 'component-kanban',
      items: ['', '  Doing  '],
      stroke: '#cbd5e1',
      title: 'Queue',
      type: 'component',
      w: 214,
      x: 0,
      y: 0,
    }, () => 'kanban-stack')

    expect(markup).toContain('Queue')
    expect(markup).toContain('New card')
    expect(markup).toContain('Doing')
    expect(markup).toContain('width="186"')
  })

  it('renders scorecards as metric summaries', () => {
    const markup = renderItem({
      accent: '#3269d7',
      body: 'Run health',
      columns: ['Events', 'Warnings'],
      component: 'scorecard',
      fill: '#ffffff',
      h: 146,
      id: 'component-scorecard',
      items: ['47', 'streamed', '6', 'review'],
      stroke: '#d6dee8',
      title: 'Run metrics',
      type: 'component',
      w: 430,
      x: 0,
      y: 0,
    }, () => 'metric-scorecard')

    expect(markup).toContain('report-scorecard')
    expect(markup).toContain('47')
    expect(markup).toContain('Warnings')
  })

  it('renders timeline components as step progress', () => {
    const markup = renderItem({
      accent: '#0891b2',
      checkedItems: [0, 1],
      component: 'timeline',
      fill: '#ffffff',
      h: 126,
      id: 'component-timeline',
      items: ['Parse', 'Stream', 'Review'],
      stroke: '#d6dee8',
      title: 'Run state',
      type: 'component',
      w: 430,
      x: 0,
      y: 0,
    }, () => 'workflow-timeline')

    expect(markup).toContain('report-timeline')
    expect(markup).toContain('Parse')
    expect(markup).toContain('data-active="true"')
  })

  it('renders queues with done and open states', () => {
    const markup = renderItem({
      accent: '#7653c7',
      checkedItems: [0],
      component: 'queue',
      fill: '#ffffff',
      h: 142,
      id: 'component-queue',
      items: ['Resolve duplicates', 'Approve publish'],
      stroke: '#d6dee8',
      title: 'Review status',
      type: 'component',
      w: 286,
      x: 0,
      y: 0,
    }, () => 'review-queue')

    expect(markup).toContain('report-queue')
    expect(markup).toContain('Done')
    expect(markup).toContain('Open')
  })

  it('renders evidence ledgers from row triplets', () => {
    const markup = renderItem({
      accent: '#0f766e',
      columns: ['Source', 'Signal', 'State'],
      component: 'evidence',
      fill: '#ffffff',
      h: 142,
      id: 'component-evidence',
      items: ['CRM', 'Expansion risk', 'verified'],
      stroke: '#d6dee8',
      title: 'Evidence',
      type: 'component',
      w: 430,
      x: 0,
      y: 0,
    }, () => 'evidence-ledger')

    expect(markup).toContain('report-evidence')
    expect(markup).toContain('Expansion risk')
    expect(markup).toContain('verified')
  })

  it('renders trace maps as source-to-claim rows', () => {
    const markup = renderItem({
      accent: '#0f8f63',
      columns: ['Source', 'Signal', 'State'],
      component: 'evidence-map',
      fill: 'rgba(241, 253, 249, 0.76)',
      h: 152,
      id: 'claim-evidence',
      items: ['CRM', 'Expansion risk', 'verified'],
      stroke: 'rgba(15, 143, 99, 0.24)',
      title: 'Claim evidence',
      type: 'component',
      w: 430,
      x: 0,
      y: 0,
    }, () => 'evidence-map')

    expect(markup).toContain('trace-map')
    expect(markup).toContain('Expansion risk')
    expect(markup).toContain('verified')
  })

  it('renders review boards as compact status rows', () => {
    const markup = renderItem({
      accent: '#7fb7ff',
      checkedItems: [0],
      component: 'review-board',
      fill: 'rgba(247, 251, 255, 0.84)',
      h: 166,
      id: 'review-status',
      items: ['Resolve duplicates', 'Approve publish'],
      stroke: 'rgba(127, 183, 255, 0.28)',
      title: 'Review status',
      type: 'component',
      w: 430,
      x: 0,
      y: 0,
    }, () => 'review-board')

    expect(markup).toContain('review-board')
    expect(markup).toContain('Closed')
    expect(markup).toContain('Open')
  })

  it('renders gate strips from scorecard metrics', () => {
    const markup = renderItem({
      accent: '#ff8a4c',
      body: 'Quality gate summary',
      columns: ['Schema', 'Evidence'],
      component: 'gate-strip',
      fill: 'rgba(255, 249, 244, 0.84)',
      h: 150,
      id: 'qa-results',
      items: ['Pass', '0 invalid', 'Review', '4 claims'],
      stroke: 'rgba(255, 138, 76, 0.3)',
      title: 'Gate results',
      type: 'component',
      w: 430,
      x: 0,
      y: 0,
    }, () => 'gate-strip')

    expect(markup).toContain('gate-strip')
    expect(markup).toContain('Schema')
    expect(markup).toContain('Review')
  })

})

function renderItem(
  item: CanvasItem,
  getComponentPresentation = (component: string) => component,
  options: {
    inlineTextEditor?: CanvasInlineTextEditingContextValue
    selected?: Set<string>
  } = {},
) {
  const itemMarkup = (
    <svg>
      {renderCanvasWhiteboardSvgItem({
        componentPresentationRenderers:
          DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
        customItemRenderers: DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
        getComponentPresentation,
        item,
        locked: false,
        onArrowEndpointPointerDown: () => undefined,
        onItemPointerDown: () => undefined,
        canEditText: (item) => CANVAS_APP_TEXT_TARGET.canEdit(item),
        onTextDoubleClick: () => undefined,
        outlineIds: new Set(),
        selected: options.selected ?? new Set(),
      })}
    </svg>
  )

  return renderToStaticMarkup(
    options.inlineTextEditor ? (
      <CanvasInlineTextEditingContext.Provider value={options.inlineTextEditor}>
        {itemMarkup}
      </CanvasInlineTextEditingContext.Provider>
    ) : itemMarkup,
  )
}

function createInlineTextEditor(
  overrides: Partial<CanvasInlineTextEditingContextValue> = {},
): CanvasInlineTextEditingContextValue {
  return {
    commitOnEnter: true,
    editing: null,
    enabled: true,
    setEditorElement: () => undefined,
    onBlur: () => undefined,
    onCancel: () => undefined,
    onChange: () => undefined,
    onCommit: () => undefined,
    ...overrides,
  }
}
