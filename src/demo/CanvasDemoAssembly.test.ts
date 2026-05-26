import { describe, expect, it } from 'vitest'
import {
  DEMO_CANVAS_APP_ASSEMBLY,
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
} from './CanvasDemoAssembly'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

const modules = import.meta.glob('./**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('CanvasDemoAssembly', () => {
  it('keeps the top-level demo assembly focused on module composition', () => {
    expect(modules['./CanvasDemoAssembly.ts']).not.toMatch(
      /RISK|DECISION|defineCanvasAppCustomItemModule|createCanvasDemoSvgCustomItemRenderers|risk-node|decision-node|demo-risk-text|demo-decision|kind:\s*['"](risk|decision)['"]/,
    )
  })

  it('discovers custom item modules by folder convention', () => {
    expect(DEMO_CUSTOM_ITEM_MODULES.map((module) => module.id)).toEqual([
      'decision',
      'risk',
    ])
    expect(modules['./custom-items/index.ts']).toMatch('import.meta.glob')
    expect(modules['./custom-items/index.ts']).not.toMatch(
      /RiskCustomItemModule|DecisionMapCustomItemModule|risk-node|decision-node|kind:\s*['"](risk|decision)['"]/,
    )
  })

  it('assembles demo custom item modules through the app seam', () => {
    expect(DEMO_CANVAS_APP_ASSEMBLY_INPUT.customItemModules).toBe(
      DEMO_CUSTOM_ITEM_MODULES,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.customCreationTools.map((tool) => tool.id),
    ).toEqual(['decision', 'risk'])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.customCommands.map((command) => command.id),
    ).toEqual(['decide-decision'])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.customItemRenderers['decision-node'],
    ).toBeTypeOf('function')
    expect(DEMO_CANVAS_APP_ASSEMBLY.customItemValidators.decision).toBeTypeOf(
      'function',
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.customItemRenderers['risk-node']).toBeTypeOf(
      'function',
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.customItemValidators.risk).toBeTypeOf(
      'function',
    )
  })
})
