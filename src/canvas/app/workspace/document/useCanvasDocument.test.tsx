// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import type { CanvasItem } from '../../../entities'
import { useCanvasDocument } from './useCanvasDocument'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('useCanvasDocument', () => {
  const roots: ReturnType<typeof createRoot>[] = []

  afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => act(() => root.unmount())))
    document.body.replaceChildren()
  })

  it('keeps live pointer previews out of the committed persistence snapshot', async () => {
    const initial = rect('rect-1', 0)
    const preview = rect('rect-1', 80)
    let model: ReturnType<typeof useCanvasDocument> | null = null
    const container = document.createElement('div')
    const root = createRoot(container)
    roots.push(root)
    document.body.append(container)

    function Harness() {
      model = useCanvasDocument([initial], [initial.id])
      return null
    }

    await act(async () => root.render(<Harness />))
    await act(async () => {
      model!.setLiveItems([preview])
      model!.setSelection([])
    })

    expect(model!.items).toEqual([preview])
    expect(model!.selection).toEqual([])
    expect(model!.committedItems).toEqual([initial])
    expect(model!.committedSelection).toEqual([initial.id])

    await act(async () => {
      model!.setLiveItems([initial])
      model!.setSelection([initial.id])
    })

    expect(model!.committedItems).toEqual([initial])
    expect(model!.committedSelection).toEqual([initial.id])
  })
})

function rect(id: string, x: number): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x,
    y: 0,
  }
}
