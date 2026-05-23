import { describe, expect, it } from 'vitest'
import {
  createCanvasAppCustomItemModuleAssembly,
  defineCanvasAppCustomItemModule,
} from './CanvasAppCustomItemModules'

describe('CanvasAppCustomItemModules', () => {
  it('collects product-owned custom item parts behind one module seam', () => {
    const renderRisk = () => 'risk'
    const validateRisk = () => true
    const module = defineCanvasAppCustomItemModule({
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
          createItem: ({ createId, startWorld }) => ({
            id: createId('risk'),
            type: 'custom',
            kind: 'risk',
            presentation: 'risk-node',
            title: 'Risk',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            data: { severity: 'high' },
          }),
        },
      ],
      customItemRenderers: {
        'risk-node': renderRisk,
      },
      customItemValidators: {
        risk: validateRisk,
      },
      inspectorPanels: [
        {
          id: 'risk-meta',
          render: ({ selection }) => selection.length,
        },
      ],
    })

    const assembly = createCanvasAppCustomItemModuleAssembly([module])

    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'publish-risk',
    ])
    expect(assembly.customCreationTools.map((tool) => tool.id)).toEqual([
      'risk',
    ])
    expect(assembly.customItemRenderers['risk-node']).toBe(renderRisk)
    expect(assembly.customItemValidators.risk).toBe(validateRisk)
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-meta',
    ])
  })

  it('rejects duplicate module-owned extension keys', () => {
    const first = defineCanvasAppCustomItemModule({
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: ({ createId, startWorld }) => ({
            id: createId('risk'),
            type: 'custom',
            kind: 'risk',
            presentation: 'risk-node',
            title: 'Risk',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            data: { severity: 'high' },
          }),
        },
      ],
    })
    const second = defineCanvasAppCustomItemModule({
      customCreationTools: [
        {
          id: 'risk',
          label: '?',
          title: 'Duplicate risk',
          createItem: () => null,
        },
      ],
    })

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([first, second]),
    ).toThrow('Duplicate canvas custom item module custom creation tool: risk')
  })
})
