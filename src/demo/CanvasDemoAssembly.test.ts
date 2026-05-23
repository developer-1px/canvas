import { describe, expect, it } from 'vitest'
import { DEMO_CANVAS_APP_ASSEMBLY } from './CanvasDemoAssembly'

const modules = import.meta.glob('./**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('CanvasDemoAssembly', () => {
  it('keeps the top-level demo assembly focused on module composition', () => {
    expect(modules['./CanvasDemoAssembly.ts']).not.toMatch(
      /defineCanvasAppCustomItemModule|createCanvasDemoSvgCustomItemRenderers|risk-node|demo-risk-text|kind:\s*['"]risk['"]/,
    )
  })

  it('assembles demo custom item modules through the app seam', () => {
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.customCreationTools.map((tool) => tool.id),
    ).toEqual(['risk'])
    expect(DEMO_CANVAS_APP_ASSEMBLY.customItemRenderers['risk-node']).toBeTypeOf(
      'function',
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.customItemValidators.risk).toBeTypeOf(
      'function',
    )
  })
})
