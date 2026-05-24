import {
  createRef,
  isValidElement,
  type ReactElement,
} from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CanvasTextEditor } from './CanvasTextEditor'

describe('CanvasTextEditor', () => {
  it('lets modified Enter bubble to global quick-create shortcuts', () => {
    const onCommit = vi.fn()
    const preventDefault = vi.fn()
    const editor = renderTextEditor({ onCommit })

    editor.props.onKeyDown({
      ctrlKey: true,
      key: 'Enter',
      metaKey: false,
      preventDefault,
      shiftKey: false,
    })

    expect(preventDefault).not.toHaveBeenCalled()
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('commits plain Enter and keeps Shift+Enter for multiline text', () => {
    const onCommit = vi.fn()
    const preventDefault = vi.fn()
    const editor = renderTextEditor({ onCommit })

    editor.props.onKeyDown({
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      preventDefault,
      shiftKey: false,
    })
    editor.props.onKeyDown({
      ctrlKey: false,
      key: 'Enter',
      metaKey: false,
      preventDefault,
      shiftKey: true,
    })

    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledTimes(1)
  })
})

function renderTextEditor({
  onCommit,
}: {
  onCommit: () => void
}) {
  const rendered = CanvasTextEditor({
    editing: { id: 'sticky-1', value: 'Text' },
    editorRef: createRef<HTMLTextAreaElement>(),
    onBlur: () => undefined,
    onCancel: () => undefined,
    onChange: () => undefined,
    onCommit,
    style: {
      fontSize: 16,
      height: 120,
      left: 10,
      minHeight: 120,
      top: 20,
      width: 160,
    },
  })

  if (!isValidElement(rendered)) {
    throw new Error('Expected text editor to render')
  }

  return rendered as ReactElement<{
    onKeyDown: (event: {
      ctrlKey: boolean
      key: string
      metaKey: boolean
      preventDefault: () => void
      shiftKey: boolean
    }) => void
  }>
}
