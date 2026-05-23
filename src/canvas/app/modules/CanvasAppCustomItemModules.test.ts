import { describe, expect, it } from 'vitest'
import {
  createCanvasAppCustomItemModuleAssembly,
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomItemModule,
} from './CanvasAppCustomItemModules'

const renderRisk = () => 'risk'
const validateRisk = () => true

describe('CanvasAppCustomItemModules', () => {
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
    expect(assembly.customItemValidators.risk(createRiskItem())).toBe(true)
    expect(assembly.customItemValidators.risk({
      ...createRiskItem(),
      presentation: 'unknown-risk-node',
    })).toBe(false)
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-meta',
    ])
  })

  it('rejects duplicate module-owned extension keys', () => {
    const first = defineRiskModule({
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
    const second = defineDependencyModule({
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
    const first = defineRiskModule()
    const second = defineRiskModule()

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([first, second]),
    ).toThrow('Duplicate canvas custom item module: risk')
  })

  it('rejects module ids outside the app extension id contract', () => {
    expect(() =>
      defineRiskModule({
        id: 'Risk Module',
      }),
    ).toThrow('Invalid canvas app custom item module id: Risk Module')
  })

  it('rejects module presentations outside the app extension id contract', () => {
    expect(() =>
      defineRiskModule({
        presentation: 'Risk Node',
      }),
    ).toThrow('Invalid canvas app custom item presentation id: Risk Node')
  })

  it('rejects modules without renderer and validator functions', () => {
    expect(() =>
      defineRiskModule({
        renderItem: undefined,
      } as unknown as Partial<CanvasAppCustomItemModule>),
    ).toThrow('Canvas custom item module risk requires renderer')
    expect(() =>
      defineRiskModule({
        validateItem: undefined,
      } as unknown as Partial<CanvasAppCustomItemModule>),
    ).toThrow('Canvas custom item module risk requires validator')
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
  })

  it('rejects unknown disabled module ids', () => {
    const module = defineRiskModule()

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([module], {
        disabledModuleIds: ['unknown'],
      }),
    ).toThrow('Unknown disabled canvas custom item module: unknown')
  })

  it('rejects custom creation tool shortcut conflicts across modules', () => {
    const first = defineRiskModule({
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
    const second = defineDependencyModule({
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

function defineDependencyModule(
  overrides: Partial<CanvasAppCustomItemModule> = {},
) {
  return defineCanvasAppCustomItemModule({
    id: 'dependency',
    presentation: 'dependency-node',
    renderItem: () => 'dependency',
    validateItem: () => true,
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
