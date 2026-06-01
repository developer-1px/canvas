import { describe, expect, it } from 'vitest'
import { createCanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import { defineCanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationToolContext } from '../custom-tools/CanvasAppCustomCreationTools'

describe('CanvasAppCustomItemModules assembly seam', () => {
  it('collects product-owned custom item parts behind one module seam', () => {
    const module = defineRiskModule({
      customCommands: [
        {
          id: 'publish-risk',
          label: 'Pub',
          title: 'Publish risk',
          run: () => undefined,
        },
      ],
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: ({ startWorld }: CanvasAppCustomCreationToolContext) => ({
            title: 'Risk',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            data: { severity: 'high' },
          }),
        },
      ],
      inspectorPanels: [
        {
          id: 'risk-meta',
          render: ({ selection }) => selection.length,
        },
      ],
      mediaImporters: [{
        id: 'risk-media',
        createItems: () => [],
      }],
      textPasteImporters: [{
        id: 'risk-paste',
        createItems: () => [],
      }],
    })

    const assembly = createCanvasAppCustomItemModuleAssembly([module])

    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'publish-risk',
    ])
    expect(assembly.customCreationTools.map((tool) => tool.id)).toEqual([
      'risk',
    ])
    expect(assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 100, y: 140 },
      moved: false,
      startWorld: { x: 80, y: 120 },
    })).toEqual({
      id: 'risk-1',
      type: 'custom',
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
      x: 80,
      y: 120,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })
    expect(assembly.customItemRenderers['risk-node']).toBe(renderRisk)
    expect(assembly.customItemValidators.risk(createRiskItem())).toBe(true)
    expect(assembly.customItemValidators.risk({
      ...createRiskItem(),
      presentation: 'unknown-risk-node',
    })).toBe(false)
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-meta',
    ])
    expect(assembly.mediaImporters.map((importer) => importer.id)).toEqual([
      'risk-media',
    ])
    expect(assembly.textPasteImporters.map((importer) => importer.id)).toEqual([
      'risk-paste',
    ])
  })


  it('omits disabled modules from the assembled extension parts', () => {
    const module = defineRiskModule({
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => null,
        },
      ],
    })

    const assembly = createCanvasAppCustomItemModuleAssembly([module], {
      disabledModuleIds: ['risk'],
    })

    expect(assembly.customCreationTools).toEqual([])
    expect(assembly.customItemRenderers).toEqual({})
    expect(assembly.customItemValidators).toEqual({})
    expect(assembly.mediaImporters).toEqual([])
    expect(assembly.textPasteImporters).toEqual([])
  })

})

const renderRisk = () => 'risk'
const validateRisk = () => true

function defineRiskModule(
  overrides: Partial<CanvasAppCustomItemModule> = {},
) {
  return defineCanvasAppCustomItemModule({
    id: 'risk',
    presentation: 'risk-node',
    renderItem: renderRisk,
    validateItem: validateRisk,
    ...overrides,
  })
}
function createRiskItem() {
  return {
    id: 'risk-1',
    type: 'custom',
    kind: 'risk',
    presentation: 'risk-node',
    title: 'Risk',
    x: 0,
    y: 0,
    w: 120,
    h: 80,
    data: { severity: 'high' },
  } as const
}
