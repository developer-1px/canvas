import { describe, expect, it } from 'vitest'

import foundationInventory from '../../../docs/canvas-foundation-inventory.md?raw'
import foundationAdr from '../../../docs/adr/0003-canvas-foundation-extension-architecture.md?raw'
import context from '../../../CONTEXT.md?raw'

describe('Canvas foundation architecture plan', () => {
  it('defines foundation and extension vocabulary in project context', () => {
    for (const term of [
      'Canvas Foundation',
      'Canvas Foundation Contract',
      'Canvas Extension',
      'Canvas First-party Whiteboard Extension',
    ]) {
      expect(context).toContain(term)
    }
  })

  it('records the foundation ownership decision as an ADR', () => {
    expect(foundationAdr).toContain(
      '# ADR 0003: Canvas Foundation and Extension Architecture',
    )
    expect(foundationAdr).toContain('ADR 0001')
    expect(foundationAdr).toContain('ADR 0002')
    expect(foundationAdr).toContain('zod-crud')
    expect(foundationAdr).toContain('must not import Host, App, UI, Renderer')
    expect(foundationAdr).toContain('Demo `CanvasItem`')
    expect(foundationAdr).toContain('Issue #69')
  })

  it('keeps the inventory explicit about what can and cannot move', () => {
    for (const row of [
      '`src/canvas/foundation` | Foundation public facade',
      '`src/canvas/core` | Foundation',
      '`src/canvas/engine/scene` | Foundation',
      '`src/canvas/engine/selection` | Foundation',
      '`src/canvas/engine/transform` | Foundation',
      '`src/canvas/host/document` | Host adapter',
      '`src/canvas/app/workflow` | App',
      '`src/canvas/renderer` | Renderer',
    ]) {
      expect(foundationInventory).toContain(row)
    }

    expect(foundationInventory).toContain('must not mention Demo `CanvasItem`')
    expect(foundationInventory).toContain('zod-crud imports stay inside Host document adapters')
  })
})
