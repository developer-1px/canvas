import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppItemsChange } from '../../workspace/document/CanvasAppDocumentContracts'
import { executeCanvasAppFoundationExtensionEffects } from './CanvasAppFoundationExtensionEffects'
import type { CanvasAppFoundationExtensionEffect } from './CanvasAppFoundationExtensionRuntime'

describe('CanvasAppFoundationExtensionEffects', () => {
  it('applies document, selection, and viewport effects through one executor', () => {
    const commitDocumentPatch = vi.fn(() => true)
    const commitSelection = vi.fn(() => true)
    const setViewport = vi.fn()
    const change: CanvasAppItemsChange = {
      items: [{
        fill: '#fff',
        h: 80,
        id: 'rect-1',
        stroke: '#111',
        type: 'rect',
        w: 120,
        x: 10,
        y: 20,
      }],
      type: 'add',
    }
    const effects: readonly CanvasAppFoundationExtensionEffect[] = [
      {
        patch: [change],
        selection: { after: ['rect-1'], before: [] },
        type: 'document-patch',
      },
      { selection: ['rect-1'], type: 'selection' },
      {
        type: 'viewport',
        viewport: { scale: 1.5, x: 40, y: 60 },
      },
    ]

    expect(executeCanvasAppFoundationExtensionEffects({
      context: {
        commitDocumentPatch,
        commitSelection,
        setViewport,
      },
      effects,
    })).toBe(true)
    expect(commitDocumentPatch).toHaveBeenCalledWith(
      [change],
      { after: ['rect-1'], before: [] },
    )
    expect(commitSelection).toHaveBeenCalledWith(['rect-1'])
    expect(setViewport).toHaveBeenCalledWith({ scale: 1.5, x: 40, y: 60 })
  })

  it('applies descriptor-planned post-create editing through the executor', () => {
    const setEditing = vi.fn()

    expect(executeCanvasAppFoundationExtensionEffects({
      context: { setEditing },
      effects: [{
        editing: { id: 'sticky-1', value: '' },
        type: 'editing',
      }],
    })).toBe(true)
    expect(setEditing).toHaveBeenCalledWith({ id: 'sticky-1', value: '' })
  })

  it('contains adapter failures and stops later effects', () => {
    const commitSelection = vi.fn(() => {
      throw new Error('selection adapter unavailable')
    })
    const setViewport = vi.fn()

    expect(() => executeCanvasAppFoundationExtensionEffects({
      context: { commitSelection, setViewport },
      effects: [
        { selection: ['sticky-1'], type: 'selection' },
        {
          type: 'viewport',
          viewport: { scale: 2, x: 0, y: 0 },
        },
      ],
    })).not.toThrow()
    expect(executeCanvasAppFoundationExtensionEffects({
      context: { commitSelection, setViewport },
      effects: [{ selection: ['sticky-1'], type: 'selection' }],
    })).toBe(false)
    expect(setViewport).not.toHaveBeenCalled()
  })
})
