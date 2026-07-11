// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  createDesignDocument,
  type DesignNode,
} from '@interactive-os/canvas/react-design'

import {
  FIGJAM_SHAPE_DEFINITION,
  FIGJAM_SHAPE_DEFINITION_ID,
  FIGJAM_SHAPE_DEFAULT_PROPS,
  FIGJAM_CHECKLIST_DEFINITION,
  FIGJAM_CHECKLIST_DEFAULT_PROPS,
  FIGJAM_STICKY_NOTE_DEFINITION,
  FIGJAM_STICKY_NOTE_DEFINITION_ID,
  FIGJAM_WIDGET_PACK,
  createFigJamChecklistNode,
} from './index'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('FigJam widget pack', () => {
  it('registers every stable first-party widget definition through one pack', () => {
    expect(FIGJAM_STICKY_NOTE_DEFINITION_ID).toBe('figjam.sticky-note')
    expect(FIGJAM_SHAPE_DEFINITION_ID).toBe('figjam.shape')
    expect(FIGJAM_WIDGET_PACK.definitions.map(({ id }) => id)).toEqual([
      FIGJAM_STICKY_NOTE_DEFINITION_ID,
      FIGJAM_SHAPE_DEFINITION_ID,
      'figjam.text',
      'figjam.drawing',
      'figjam.connector',
      'figjam.comment',
      'figjam.stamp',
      'figjam.image',
      'figjam.checklist',
      'figjam.kanban',
      'figjam.table',
      'figjam.link-preview',
    ])
    expect(FIGJAM_WIDGET_PACK.resolve(FIGJAM_STICKY_NOTE_DEFINITION_ID))
      .toBe(FIGJAM_STICKY_NOTE_DEFINITION)
    expect(FIGJAM_WIDGET_PACK.resolve(FIGJAM_SHAPE_DEFINITION_ID))
      .toBe(FIGJAM_SHAPE_DEFINITION)
    expect(FIGJAM_WIDGET_PACK.resolve('figjam.unknown')).toBeNull()
  })

  it('creates JSON-serializable canonical nodes from validated defaults', () => {
    const stickyNote = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_STICKY_NOTE_DEFINITION_ID,
      { nodeId: 'sticky-1', x: 24, y: 36 },
    ))
    const shape = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_SHAPE_DEFINITION_ID,
      { nodeId: 'shape-1', x: 320, y: 72 },
    ))

    expect(stickyNote).toMatchObject({
      id: 'sticky-1',
      definition: {
        kind: 'widget',
        id: FIGJAM_STICKY_NOTE_DEFINITION_ID,
      },
      props: { position: 'absolute', tone: 'yellow' },
      text: 'Write something…',
      layout: {
        x: 24,
        y: 36,
        w: 180,
        h: 140,
        widthMode: 'fixed',
        heightMode: 'fixed',
      },
      frame: null,
    })
    expect(shape).toMatchObject({
      id: 'shape-1',
      definition: {
        kind: 'widget',
        id: FIGJAM_SHAPE_DEFINITION_ID,
      },
      props: {
        position: 'absolute',
        shape: 'rectangle',
        fill: 'blue',
        stroke: 'blue',
      },
      text: 'Shape',
      layout: {
        x: 320,
        y: 72,
        w: 160,
        h: 120,
        widthMode: 'fixed',
        heightMode: 'fixed',
      },
      frame: null,
    })
    expect(JSON.parse(JSON.stringify([stickyNote, shape])))
      .toEqual([stickyNote, shape])
    expect(FIGJAM_WIDGET_PACK.parseProps(
      FIGJAM_STICKY_NOTE_DEFINITION_ID,
      { position: 'absolute', tone: 'pink' },
    )).toEqual({
      ok: true,
      value: { position: 'absolute', tone: 'pink' },
    })
    expect(FIGJAM_WIDGET_PACK.parseProps(
      FIGJAM_SHAPE_DEFINITION_ID,
      {
        position: 'absolute',
        shape: 'diamond',
        fill: 'coral',
        stroke: 'ink',
      },
    )).toEqual({
      ok: true,
      value: {
        position: 'absolute',
        shape: 'diamond',
        fill: 'coral',
        stroke: 'ink',
      },
    })
  })

  it('keeps both authored labels on the common node-text edit capability', () => {
    expect(FIGJAM_STICKY_NOTE_DEFINITION.capabilities).toEqual({
      textEdit: { source: 'node-text', multiline: true },
      transform: { move: true, resize: true },
    })
    expect(FIGJAM_SHAPE_DEFINITION.capabilities).toEqual({
      textEdit: { source: 'node-text', multiline: true },
      transform: { move: true, resize: true },
    })
    expect(FIGJAM_WIDGET_PACK.parseProps(
      FIGJAM_STICKY_NOTE_DEFINITION_ID,
      { position: 'absolute', tone: 'neon' },
    )).toMatchObject({ ok: false })
    expect(FIGJAM_WIDGET_PACK.parseProps(
      FIGJAM_SHAPE_DEFINITION_ID,
      {
        position: 'relative',
        shape: 'rectangle',
        fill: 'blue',
        stroke: 'blue',
      },
    )).toMatchObject({ ok: false })
  })

  it('renders direct React DOM and contains SVG inside only the shape', () => {
    const stickyNote = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_STICKY_NOTE_DEFINITION_ID,
      { nodeId: 'sticky-render', x: 0, y: 0 },
    ))
    const shape = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_SHAPE_DEFINITION_ID,
      { nodeId: 'shape-render', x: 200, y: 0 },
    ))
    const stickyMarkup = renderWidget(stickyNote)
    const shapeMarkup = renderWidget({
      ...shape,
      props: {
        position: 'absolute',
        shape: 'diamond',
        fill: 'coral',
        stroke: 'ink',
      },
    })

    expect(stickyMarkup).toMatch(/^<article /)
    expect(stickyMarkup).toContain('data-figjam-widget="sticky-note"')
    expect(stickyMarkup).toContain('Write something…')
    expect(stickyMarkup).not.toContain('<svg')
    expect(shapeMarkup).toMatch(/^<div /)
    expect(shapeMarkup).toContain('data-figjam-widget="shape"')
    expect(shapeMarkup).toContain('data-shape-fill="coral"')
    expect(shapeMarkup).toContain('<svg')
    expect(shapeMarkup).toContain('<path')
    expect(`${stickyMarkup}${shapeMarkup}`).not.toMatch(
      /<canvas|foreignObject/,
    )
  })

  it('uses a pack-owned fallback when authored widget props are invalid', () => {
    const stickyNote = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_STICKY_NOTE_DEFINITION_ID,
      { nodeId: 'sticky-invalid', x: 0, y: 0 },
    ))
    const shape = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_SHAPE_DEFINITION_ID,
      { nodeId: 'shape-invalid', x: 200, y: 0 },
    ))
    const stickyMarkup = renderWidget({
      ...stickyNote,
      props: { position: 'absolute', tone: 'neon' },
    })
    const shapeMarkup = renderWidget({
      ...shape,
      props: {
        position: 'absolute',
        shape: 'star',
        fill: 'blue',
        stroke: 'blue',
      },
    })

    expect(stickyMarkup).toContain('data-figjam-widget-error=')
    expect(stickyMarkup).toContain('Sticky note unavailable')
    expect(shapeMarkup).toContain('data-figjam-widget-error=')
    expect(shapeMarkup).toContain('Shape unavailable')
  })

  it('contributes a compact shape Inspector through the narrow editProp seam', async () => {
    const shape = expectCreated(FIGJAM_WIDGET_PACK.create(
      FIGJAM_SHAPE_DEFINITION_ID,
      { nodeId: 'shape-inspector', x: 0, y: 0 },
    ))
    const Inspector = FIGJAM_SHAPE_DEFINITION.Inspector
    const editProp = vi.fn()

    if (!Inspector) {
      throw new Error('Expected the shape Inspector contribution')
    }

    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => root.render(createElement(Inspector, {
      node: shape,
      props: FIGJAM_SHAPE_DEFAULT_PROPS,
      editProp,
    })))

    const fill = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Shape fill"]',
    )
    const kind = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Shape kind"]',
    )

    expect(fill?.value).toBe('blue')
    expect([...(fill?.options ?? [])].map(({ value }) => value))
      .toContain('coral')
    expect(kind?.value).toBe('rectangle')

    await act(async () => {
      if (!fill) {
        throw new Error('Expected the shape fill control')
      }

      fill.value = 'coral'
      fill.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(editProp).toHaveBeenCalledWith(
      'fill',
      'coral',
      'Change shape fill',
    )

    await act(async () => root.unmount())
  })

  it('uses native checklist inputs and commits Inspector item updates', async () => {
    const checklist = createFigJamChecklistNode({
      nodeId: 'checklist-inspector',
      x: 0,
      y: 0,
    })
    const Inspector = FIGJAM_CHECKLIST_DEFINITION.Inspector
    const editProp = vi.fn()

    if (!Inspector) {
      throw new Error('Expected the checklist Inspector contribution')
    }

    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => root.render(createElement(Inspector, {
      node: checklist,
      props: FIGJAM_CHECKLIST_DEFAULT_PROPS,
      editProp,
    })))

    const owner = container.querySelector<HTMLInputElement>(
      'input[aria-label="Toggle Owner"]',
    )

    expect(owner?.type).toBe('checkbox')
    expect(owner?.checked).toBe(false)

    await act(async () => {
      if (!owner) {
        throw new Error('Expected Owner checklist input')
      }

      owner.click()
    })

    expect(editProp).toHaveBeenCalledWith(
      'items',
      expect.arrayContaining([
        expect.objectContaining({ id: 'owner', checked: true }),
      ]),
      'Toggle checklist item',
    )

    await act(async () => root.unmount())
  })
})

function expectCreated(result: ReturnType<typeof FIGJAM_WIDGET_PACK.create>) {
  expect(result.ok).toBe(true)

  if (!result.ok) {
    throw new Error(result.reason)
  }

  return result.node
}

function renderWidget(node: DesignNode) {
  const definition = FIGJAM_WIDGET_PACK.definitions.find(
    ({ id }) => id === node.definition.id,
  )

  if (!definition) {
    throw new Error(`Missing render definition: ${node.definition.id}`)
  }

  const document = createDesignDocument({
    schemaVersion: 1,
    roots: [node.id],
    nodes: [node],
  })

  return renderToStaticMarkup(createElement(definition.render, {
    node,
    children: null,
    read: document.read,
    rootProps: {
      ref: () => undefined,
      'data-design-node-id': node.id,
      'data-design-definition-id': node.definition.id,
    },
  }))
}
