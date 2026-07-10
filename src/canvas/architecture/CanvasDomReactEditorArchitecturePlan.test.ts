import { describe, expect, it } from 'vitest'

import context from '../../../CONTEXT.md?raw'
import editorAdr from '../../../docs/adr/0005-canonical-dom-react-editor-runtime.md?raw'

const normalizedEditorAdr = editorAdr.replace(/\s+/g, ' ')

describe('DOM/React editor architecture plan', () => {
  it('defines the canonical editor module vocabulary in project context', () => {
    for (const term of [
      'DesignDocument',
      'Authored Content',
      'Editor Runtime State',
      'ReactDesignRenderer',
      'DomProjection',
      'EditorEngine',
      'React Component Definition',
      'React Widget Definition',
      'Product Pack',
      'Read-only Compatibility Projection',
      'Legacy CanvasItem Runtime',
    ]) {
      expect(context).toContain(`- ${term}:`)
    }
  })

  it('records the canonical DOM/React editor decision as an accepted ADR', () => {
    expect(editorAdr).toContain(
      '# ADR 0005: Canonical DOM/React Editor Runtime',
    )
    expect(editorAdr).toContain('## Status\n\nAccepted')

    for (const moduleName of [
      'DesignDocument',
      'ReactDesignRenderer',
      'DomProjection',
      'EditorEngine',
      'React Component Definition',
      'React Widget Definition',
      'Product Pack',
    ]) {
      expect(editorAdr).toContain(moduleName)
    }

    expect(editorAdr).toContain('`src/canvas/design-document/`')
    expect(editorAdr).toContain('Issue #621')
  })

  it('separates authored content from ephemeral editor runtime state', () => {
    for (const persistentTerm of [
      'schema version',
      'stable node ids',
      'ordered children',
      'JSON props',
      'layout and style',
      'component and widget references',
    ]) {
      expect(editorAdr).toContain(persistentTerm)
    }

    for (const ephemeralTerm of [
      'selection',
      'camera and viewport',
      'active tool and mode',
      'focus and hover',
      'HTMLElement registration',
      'measurement and observation',
      'overlay, guide, and marquee state',
      'pointer draft and live preview',
    ]) {
      expect(editorAdr).toContain(ephemeralTerm)
    }

    expect(normalizedEditorAdr).toContain(
      'runtime owns the lifecycle and composition of a `DomProjection` instance',
    )
    expect(normalizedEditorAdr).toContain(
      '`DomProjection` remains the semantic owner of node-to-`HTMLElement` registration',
    )
  })

  it('makes direct React DOM canonical without turning live DOM into document state', () => {
    expect(normalizedEditorAdr).toContain('direct React DOM')
    expect(normalizedEditorAdr).toContain('derived runtime output')
    expect(normalizedEditorAdr).toContain('DOM or SVG overlays')
    expect(normalizedEditorAdr).toContain('widget-internal SVG')
    expect(normalizedEditorAdr).toContain(
      'not the canonical authored-content renderer',
    )
  })

  it('prohibits dual writes and permits only a read-only compatibility projection', () => {
    expect(normalizedEditorAdr).toContain('must not dual-write')
    expect(normalizedEditorAdr).toContain('one atomic DesignDocument command')
    expect(normalizedEditorAdr).toContain('Read-only Compatibility Projection')
    expect(normalizedEditorAdr).toContain('one-way')
    expect(normalizedEditorAdr).toContain(
      'no mutation, history, persistence, or reverse sync',
    )
  })
})
