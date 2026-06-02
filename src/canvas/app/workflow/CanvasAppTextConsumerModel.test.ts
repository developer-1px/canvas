import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppTextConsumerModel } from './CanvasAppTextConsumerModel'

describe('CanvasAppTextConsumerModel', () => {
  it('fans editing state to command, component, extension, keyboard, and pointer consumers', () => {
    const runtime = createTextRuntime()
    const model = getCanvasAppTextConsumerModel(runtime)

    expect(model.command.setEditing).toBe(runtime.setEditing)
    expect(model.component.interaction.setEditing).toBe(runtime.setEditing)
    expect(model.extension.setEditing).toBe(runtime.setEditing)
    expect(model.keyboard.interaction.setEditing).toBe(runtime.setEditing)
    expect(model.pointer.workspace.setEditing).toBe(runtime.setEditing)
  })

  it('routes find replace and stage blur to the consumers that need them', () => {
    const runtime = createTextRuntime()
    const model = getCanvasAppTextConsumerModel(runtime)

    model.keyboard.openFindReplace()
    model.stage.blurTextEditor()

    expect(runtime.openFindReplace).toHaveBeenCalledTimes(1)
    expect(runtime.blurTextEditor).toHaveBeenCalledTimes(1)
  })

  it('keeps view props as the concrete runtime values', () => {
    const runtime = createTextRuntime()
    const model = getCanvasAppTextConsumerModel(runtime)

    expect(model.view).toEqual({
      findReplace: runtime.findReplace,
      textEditor: runtime.textEditor,
    })
  })
})

function createTextRuntime() {
  return {
    blurTextEditor: vi.fn(),
    findReplace: {
      matchCount: 1,
      open: true,
      query: 'hello',
      replacement: 'world',
      onClose: vi.fn(),
      onQueryChange: vi.fn(),
      onReplaceAll: vi.fn(),
      onReplacementChange: vi.fn(),
    },
    inlineTextEditor: {
      commitOnEnter: true,
      editing: null,
      enabled: true,
      setEditorElement: vi.fn(),
      onBlur: vi.fn(),
      onCancel: vi.fn(),
      onChange: vi.fn(),
      onCommit: vi.fn(),
    },
    openFindReplace: vi.fn(),
    setEditing: vi.fn(),
    textEditor: {
      editing: null,
      editorRef: { current: null },
      style: undefined,
      visible: true,
      onBlur: vi.fn(),
      onCancel: vi.fn(),
      onChange: vi.fn(),
      onCommit: vi.fn(),
    },
  }
}
