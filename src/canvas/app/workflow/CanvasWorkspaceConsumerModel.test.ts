import { CANVAS_APP_TEXT_TARGET } from '../affordances/editing/text-editor/CanvasAppTextTarget'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasSceneAdapter } from '../../engine'
import type { CanvasItem } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import { getCanvasWorkspaceConsumerModel } from './CanvasWorkspaceConsumerModel'
import {
  createCanvasAppDocumentAuthority,
  createCanvasAppDocumentAuthorityRead,
} from './CanvasAppDocumentAuthority'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
  CANVAS_APP_READ_ONLY_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'

describe('CanvasWorkspaceConsumerModel', () => {
  it('builds consumer contexts from one workspace document contract', () => {
    const input = createInput()
    const model = getCanvasWorkspaceConsumerModel(input)

    expect(model.command).toMatchObject({
      createId: input.createId,
      document: {
        commitItemsChange: expect.any(Function),
        commitSelection: input.document.commitSelection,
        copyItemsToClipboard: input.document.copyItemsToClipboard,
        getClipboardItems: input.document.getClipboardItems,
        redo: expect.any(Function),
        setClipboardItems: input.document.setClipboardItems,
        undo: expect.any(Function),
      },
      workspace: {
        items: input.document.items,
        selection: input.document.selection,
        setSelection: input.document.setSelection,
        viewport: input.viewport,
      },
    })
    expect(model.control).toMatchObject({
      canRedo: input.document.canRedo,
      canUndo: input.document.canUndo,
      itemReadModel: input.itemReadModel,
      scene: input.scene,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.keyboard.command.commitSelection).toBe(
      input.document.commitSelection,
    )
    expect(model.keyboard.canEditText(input.document.items[0]!)).toBe(true)
    expect(model.keyboard.itemReadModel).toBe(input.itemReadModel)
    expect(model.component.workspace).toMatchObject({
      itemReadModel: input.itemReadModel,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.image).toMatchObject({
      commitItemsChange: expect.any(Function),
      createId: input.createId,
      itemReadModel: input.itemReadModel,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.linkPreview).toMatchObject({
      commitItemsChange: expect.any(Function),
      createId: input.createId,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.stamp).toMatchObject({
      commitItemsChange: expect.any(Function),
      createId: input.createId,
      itemReadModel: input.itemReadModel,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.table).toMatchObject({
      commitItemsChange: expect.any(Function),
      createId: input.createId,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.textPaste).toMatchObject({
      commitItemsChange: expect.any(Function),
      createId: input.createId,
      selection: input.document.selection,
      viewport: input.viewport,
    })
  })

  it('keeps read model and live editing fields on the consumers that need them', () => {
    const input = createInput()
    const model = getCanvasWorkspaceConsumerModel(input)

    expect(model.inspector).toMatchObject({
      document: input.authority,
      items: input.document.items,
      itemReadModel: input.itemReadModel,
      selected: input.selected,
      selection: input.document.selection,
    })
    expect(model.pointer.workspace).toMatchObject({
      itemReadModel: input.itemReadModel,
      items: input.document.items,
      scene: input.scene,
      selectedBounds: input.selectedBounds,
      selection: input.document.selection,
      setLiveItems: input.document.setLiveItems,
      setSelection: input.document.setSelection,
      setViewport: input.setViewport,
      viewport: input.viewport,
    })
    expect(model.itemLayer).toEqual({
      items: input.document.items,
      selected: input.selected,
    })
    expect(model.selection).toEqual({
      commitItemsChange: expect.any(Function),
      commitSelection: input.document.commitSelection,
      createId: input.createId,
      itemReadModel: input.itemReadModel,
      items: input.document.items,
      selection: input.document.selection,
    })
  })

  it('routes text and viewport consumers without exposing document internals elsewhere', () => {
    const input = createInput()
    const model = getCanvasWorkspaceConsumerModel(input)

    expect(model.text).toMatchObject({
      document: {
        commitItemsChange: expect.any(Function),
        findDocumentText: input.document.findDocumentText,
        replaceDocumentText: expect.any(Function),
      },
      itemReadModel: input.itemReadModel,
      selection: input.document.selection,
      viewport: input.viewport,
    })
    expect(model.viewport).toEqual({
      itemReadModel: input.itemReadModel,
      setViewport: input.setViewport,
    })
    expect(model.stage).toEqual({ viewport: input.viewport })
  })

  it('denies direct built-in document mutations through the shared authority', () => {
    const input = createInput()
    const authority = createCanvasAppDocumentAuthority({
      commitItemsChange: input.document.commitItemsChange,
      read: createCanvasAppDocumentAuthorityRead(
        CANVAS_APP_READ_ONLY_CAPABILITIES,
      ),
      readItems: () => input.document.items,
    })
    const model = getCanvasWorkspaceConsumerModel({ ...input, authority })

    expect(model.command.document.undo()).toBeUndefined()
    expect(model.command.document.redo()).toBeUndefined()
    expect(model.text.document.replaceDocumentText('before', 'after'))
      .toBe(false)
    expect(input.document.undo).not.toHaveBeenCalled()
    expect(input.document.redo).not.toHaveBeenCalled()
    expect(input.document.replaceDocumentText).not.toHaveBeenCalled()
    expect(model.pointer.canEditText(input.document.items[0]!)).toBe(false)
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasWorkspaceConsumerModel>[0]> = {},
): Parameters<typeof getCanvasWorkspaceConsumerModel>[0] {
  const items: CanvasItem[] = [{
    fill: '#ffffff',
    h: 40,
    id: 'rect-1',
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }]
  const selection = ['rect-1']
  const scene = createSceneAdapter()
  const itemReadModel = createItemReadModel({ items })
  const selectedBounds = { h: 40, w: 80, x: 10, y: 20 }
  const document = {
    canRedo: false,
    canUndo: true,
    commitItemsChange: vi.fn(() => true),
    commitSelection: vi.fn(() => true),
    copyItemsToClipboard: vi.fn(() => true),
    findDocumentText: vi.fn(() => []),
    getClipboardItems: vi.fn(() => []),
    items,
    redo: vi.fn(() => undefined),
    replaceDocumentText: vi.fn(() => true),
    selection,
    setClipboardItems: vi.fn(() => true),
    setLiveItems: vi.fn(),
    setSelection: vi.fn(),
    undo: vi.fn(() => selection),
  }
  const authority = createCanvasAppDocumentAuthority({
    commitItemsChange: document.commitItemsChange,
    read: createCanvasAppDocumentAuthorityRead(
      CANVAS_APP_EDITOR_CAPABILITIES,
    ),
    readItems: () => items,
  })

  return {
    authority,
    createId: vi.fn((prefix: string) => `${prefix}-2`),
    document,
    itemReadModel,
    scene,
    selected: new Set(selection),
    selectedBounds,
    setViewport: vi.fn(),
    viewport: { scale: 1, x: 0, y: 0 },
    ...overrides,
  }
}

function createSceneAdapter(): CanvasSceneAdapter {
  return {
    entries: [],
    getBounds: vi.fn(() => ({ h: 40, w: 80, x: 10, y: 20 })),
    getParentId: vi.fn(() => null),
    getSelectedAncestorId: vi.fn(() => null),
    isGroup: vi.fn(() => false),
  }
}

function createItemReadModel({
  items,
}: {
  items: CanvasItem[]
}): CanvasAppItemReadModel {
  return {
    findTextEditTarget: vi.fn(() => null),
    textTarget: CANVAS_APP_TEXT_TARGET,
    findItem: vi.fn((id: string) => items.find((item) => item.id === id)),
    getAllIds: vi.fn(() => items.map((item) => item.id)),
    getAllItems: vi.fn(() => items),
    getItemBounds: vi.fn(() => ({ h: 40, w: 80, x: 10, y: 20 })),
    getSelectedItems: vi.fn(() => items),
    getSelection: vi.fn((ids: string[]) => ids),
    getSelectionBounds: vi.fn(() => ({ h: 40, w: 80, x: 10, y: 20 })),
  }
}
