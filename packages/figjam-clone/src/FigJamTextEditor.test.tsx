// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { EditorEnginePreviewSession } from '@interactive-os/canvas/editor'
import type { DomProjection } from '@interactive-os/canvas/react-design'
import { FigJamTextEditor, type FigJamTextEdit } from './FigJamTextEditor'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('FigJamTextEditor', () => {
  let root: Root | null = null
  let container: HTMLDivElement | null = null

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount())
    }

    container?.remove()
    root = null
    container = null
    vi.useRealTimers()
  })

  it('keeps composition input owned through blur and commits once after it ends', async () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const onCommit = vi.fn()

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <FigJamTextEditor
        edit={createEdit()}
        projection={createProjection()}
        onCancel={() => undefined}
        onChange={onChange}
        onCommit={onCommit}
      />,
    ))

    const editor = container.querySelector('textarea')

    expect(editor).toBeInstanceOf(HTMLTextAreaElement)
    if (!(editor instanceof HTMLTextAreaElement)) {
      return
    }

    await act(async () => {
      editor.dispatchEvent(new CompositionEvent('compositionstart', {
        bubbles: true,
        data: '한',
      }))
      editor.blur()
    })

    expect(onCommit).not.toHaveBeenCalled()

    await act(async () => {
      editor.dispatchEvent(new CompositionEvent('compositionend', {
        bubbles: true,
        data: '한',
      }))
      setTextAreaValue(editor, '한글')
      editor.dispatchEvent(new Event('input', { bubbles: true }))
      editor.dispatchEvent(new Event('change', { bubbles: true }))
      await vi.advanceTimersByTimeAsync(30)
    })

    expect(onChange).toHaveBeenLastCalledWith('한글')
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('waits for final composition input from a later task before committing blur', async () => {
    vi.useFakeTimers()
    const calls: string[] = []
    const onChange = vi.fn((value: string) => calls.push(`change:${value}`))
    const onCommit = vi.fn(() => calls.push('commit'))

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <FigJamTextEditor
        edit={createEdit()}
        projection={createProjection()}
        onCancel={() => undefined}
        onChange={onChange}
        onCommit={onCommit}
      />,
    ))

    const editor = container.querySelector('textarea')

    expect(editor).toBeInstanceOf(HTMLTextAreaElement)
    if (!(editor instanceof HTMLTextAreaElement)) {
      return
    }

    await act(async () => {
      editor.dispatchEvent(new CompositionEvent('compositionstart', {
        bubbles: true,
        data: '한',
      }))
      editor.dispatchEvent(new CompositionEvent('compositionend', {
        bubbles: true,
        data: '한',
      }))
      editor.blur()
    })

    expect(onCommit).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15)
      setTextAreaValue(editor, '한글')
      editor.dispatchEvent(new Event('input', { bubbles: true }))
      editor.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(calls).toEqual(['change:한글'])

    await act(async () => {
      await vi.advanceTimersByTimeAsync(29)
    })
    expect(onCommit).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(calls).toEqual(['change:한글', 'commit'])
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('invalidates an older settle timer when the preview session changes', async () => {
    vi.useFakeTimers()
    const onCommit = vi.fn()

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    const renderEditor = (edit: FigJamTextEdit) => root?.render(
      <FigJamTextEditor
        edit={edit}
        projection={createProjection()}
        onCancel={() => undefined}
        onChange={() => undefined}
        onCommit={onCommit}
      />,
    )

    await act(async () => renderEditor(createEdit()))

    const editor = container.querySelector('textarea')

    expect(editor).toBeInstanceOf(HTMLTextAreaElement)
    if (!(editor instanceof HTMLTextAreaElement)) {
      return
    }

    await act(async () => {
      editor.dispatchEvent(new CompositionEvent('compositionstart', {
        bubbles: true,
      }))
      editor.blur()
      editor.dispatchEvent(new CompositionEvent('compositionend', {
        bubbles: true,
      }))
    })

    await act(async () => renderEditor({
      ...createEdit(),
      session: {} as EditorEnginePreviewSession,
    }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31)
    })

    expect(onCommit).not.toHaveBeenCalled()
  })
})

function createEdit(): FigJamTextEdit {
  return {
    draft: '',
    label: 'Edit sticky note text',
    nodeId: 'note',
    session: {} as EditorEnginePreviewSession,
  }
}

function createProjection() {
  return {
    measure: () => ({
      clientBounds: { h: 80, w: 120, x: 0, y: 0 },
      nodeId: 'note',
      worldBounds: { h: 80, w: 120, x: 0, y: 0 },
    }),
  } as unknown as DomProjection
}

function setTextAreaValue(element: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )?.set

  setter?.call(element, value)
}
