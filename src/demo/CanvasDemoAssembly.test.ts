import { describe, expect, it } from 'vitest'
import { DEMO_CANVAS_APP_ASSEMBLY } from './CanvasDemoAssembly'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

const modules = import.meta.glob('./**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('CanvasDemoAssembly', () => {
  it('keeps the top-level demo assembly focused on module composition', () => {
    expect(modules['./CanvasDemoAssembly.ts']).not.toMatch(
      /RISK|defineCanvasAppCustomItemModule|createCanvasDemoSvgCustomItemRenderers|risk-node|demo-risk-text|kind:\s*['"]risk['"]/,
    )
  })

  it('discovers custom item modules by folder convention', () => {
    expect(DEMO_CUSTOM_ITEM_MODULES.map((module) => module.id)).toEqual(['risk'])
    expect(modules['./custom-items/index.ts']).toMatch('import.meta.glob')
    expect(modules['./custom-items/index.ts']).not.toMatch(
      /RiskCustomItemModule|risk-node|kind:\s*['"]risk['"]/,
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
