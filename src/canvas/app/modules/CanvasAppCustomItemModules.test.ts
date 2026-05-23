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
      id: 'risk',
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
      id: 'risk',
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
      id: 'duplicate-risk',
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

  it('rejects duplicate module ids', () => {
    const first = defineCanvasAppCustomItemModule({ id: 'risk' })
    const second = defineCanvasAppCustomItemModule({ id: 'risk' })

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([first, second]),
    ).toThrow('Duplicate canvas custom item module: risk')
  })

  it('omits disabled modules from the assembled extension parts', () => {
    const module = defineCanvasAppCustomItemModule({
      id: 'risk',
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => null,
        },
      ],
      customItemValidators: {
        risk: () => true,
      },
    })

    const assembly = createCanvasAppCustomItemModuleAssembly([module], {
      disabledModuleIds: ['risk'],
    })

    expect(assembly.customCreationTools).toEqual([])
    expect(assembly.customItemValidators).toEqual({})
  })

  it('rejects unknown disabled module ids', () => {
    const module = defineCanvasAppCustomItemModule({ id: 'risk' })

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([module], {
        disabledModuleIds: ['unknown'],
      }),
    ).toThrow('Unknown disabled canvas custom item module: unknown')
  })

  it('rejects custom creation tool shortcut conflicts across modules', () => {
    const first = defineCanvasAppCustomItemModule({
      id: 'risk',
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          shortcut: { key: 'e', shiftKey: true },
          createItem: () => null,
        },
      ],
    })
    const second = defineCanvasAppCustomItemModule({
      id: 'dependency',
      customCreationTools: [
        {
          id: 'dependency',
          label: 'D',
          title: 'Dependency',
          shortcut: { key: 'e', shiftKey: true },
          createItem: () => null,
        },
      ],
    })

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([first, second]),
    ).toThrow(
      'Duplicate canvas app custom creation tool shortcut: risk and dependency use Shift+E',
    )
  })
})
