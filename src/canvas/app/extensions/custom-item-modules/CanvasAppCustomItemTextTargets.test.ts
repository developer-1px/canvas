import { describe, expect, it } from 'vitest'
import type {
  CanvasComponentItem,
  CanvasCustomItem,
  TextItem,
} from '../../../entities'
import { CANVAS_STICKY_NOTE_EXTENSION } from '../../../foundation'
import { createCanvasDocumentController } from '../../../host'
import { createCanvasAppTextTarget } from '../../affordances/editing/text-editor/CanvasAppTextTarget'
import {
  CANVAS_APP_STICKY_NOTE_CAPABILITY_ADAPTER,
  compileCanvasAppFoundationExtensions,
} from '../foundation-extensions'
import { createCanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import { defineCanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomItemTextTarget } from './CanvasAppCustomItemTextTargetContracts'

const noteTextTarget = {
  canEdit: () => true,
  commitsOnEnter: () => true,
  getCommittedValue: ({ value }) => value.trim() === '' ? 'Note' : value,
  getEditorBounds: (item) => ({ h: item.h, w: item.w, x: item.x, y: item.y }),
  getValue: (item) =>
    typeof item.data.label === 'string' ? item.data.label : '',
  planCommitUpdates: (_item, text) => [
    { field: 'data/label', operation: 'replace', value: text },
  ],
} satisfies CanvasAppCustomItemTextTarget

const noteModule = defineCanvasAppCustomItemModule({
  id: 'note-card',
  presentation: 'note-card',
  renderItem: () => null,
  textTarget: noteTextTarget,
  validateItem: (item): item is CanvasCustomItem => item.kind === 'note-card',
})

const noteItem: CanvasCustomItem = {
  data: { label: 'Before' },
  h: 80,
  id: 'note-1',
  kind: 'note-card',
  presentation: 'note-card',
  title: 'Note',
  type: 'custom',
  w: 120,
  x: 10,
  y: 20,
}

const textItem: TextItem = {
  h: 40,
  id: 'text-1',
  text: 'Label',
  type: 'text',
  w: 120,
  x: 0,
  y: 0,
}

const stickyItem: CanvasComponentItem = {
  accent: '#ca8a04',
  body: 'Decision',
  component: 'sticky',
  fill: '#fef3c7',
  h: 148,
  id: 'sticky-1',
  stroke: '#eab308',
  title: 'Sticky',
  type: 'component',
  w: 188,
  x: 0,
  y: 0,
}

describe('Canvas app custom item text targets', () => {
  it('assembles module text targets into the extension bundle', () => {
    const assembly = createCanvasAppCustomItemModuleAssembly([noteModule])

    expect(assembly.customItemTextTargets['note-card']).toBeDefined()
    expect(Object.isFrozen(assembly.customItemTextTargets)).toBe(true)
  })

  it('resolves custom item editing through the composite text target', () => {
    const assembly = createCanvasAppCustomItemModuleAssembly([noteModule])
    const composite = createCanvasAppTextTarget(assembly.customItemTextTargets)

    expect(composite.canEdit(noteItem)).toBe(true)
    expect(composite.getValue(noteItem)).toBe('Before')
    expect(composite.getEditorBounds(noteItem)).toEqual({
      h: 80,
      w: 120,
      x: 10,
      y: 20,
    })
    expect(
      composite.getCommittedValue({ item: noteItem, value: '  ' }),
    ).toBe('Note')
  })

  it('keeps whiteboard items and unregistered custom kinds contained', () => {
    const assembly = createCanvasAppCustomItemModuleAssembly([noteModule])
    const composite = createCanvasAppTextTarget(assembly.customItemTextTargets)
    const unknownCustomItem: CanvasCustomItem = {
      ...noteItem,
      id: 'other-1',
      kind: 'other-card',
      presentation: 'other-card',
    }

    expect(composite.canEdit(textItem)).toBe(true)
    expect(composite.getValue(textItem)).toBe('Label')
    expect(composite.canEdit(unknownCustomItem)).toBe(false)
    expect(composite.getValue(unknownCustomItem)).toBe('')
    expect(composite.planCommitUpdates(unknownCustomItem, 'next')).toEqual([])
  })

  it('enables sticky text only through the compiled foundation adapter', () => {
    const base = createCanvasAppTextTarget()
    const runtime = compileCanvasAppFoundationExtensions({
      adapters: [CANVAS_APP_STICKY_NOTE_CAPABILITY_ADAPTER],
      extensions: [CANVAS_STICKY_NOTE_EXTENSION],
    })
    const composite = createCanvasAppTextTarget({}, runtime.textTargets)

    expect(base.canEdit(stickyItem)).toBe(false)
    expect(composite.canEdit(stickyItem)).toBe(true)
    expect(composite.getValue(stickyItem)).toBe('Decision')
  })

  it('commits custom item text through the document set-text change', () => {
    const assembly = createCanvasAppCustomItemModuleAssembly([noteModule])
    const composite = createCanvasAppTextTarget(assembly.customItemTextTargets)
    const controller = createCanvasDocumentController(
      [noteItem],
      [],
      { customItemValidators: assembly.customItemValidators },
      composite,
    )

    const committed = controller.commitItemsChange(
      { id: 'note-1', text: 'After', type: 'set-text' },
      [noteItem],
    )

    expect(committed).not.toBe(false)

    const [updated] = controller.readItems()

    expect(updated?.type).toBe('custom')
    expect(
      updated?.type === 'custom' ? updated.data.label : null,
    ).toBe('After')
  })
})
