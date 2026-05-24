import { describe, expect, it } from 'vitest'
import {
  createCanvasAppCustomItemModuleAssembly,
} from './CanvasAppCustomItemModuleAssembly'
import {
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleCreationTool,
} from './CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationToolContext } from '../tools/CanvasAppCustomCreationTools'

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
  })

  it('snapshots defined modules against caller mutation', () => {
    const command: NonNullable<
      CanvasAppCustomItemModule['customCommands']
    >[number] = {
      id: 'publish-risk',
      label: 'Pub',
      title: 'Publish risk',
      run: () => undefined,
    }
    const creationTool: CanvasAppCustomItemModuleCreationTool = {
      id: 'risk',
      label: '!',
      title: 'Risk',
      shortcut: { key: 'e', shiftKey: true },
      createItem: ({ startWorld }) => ({
        title: 'Risk',
        x: startWorld.x,
        y: startWorld.y,
        w: 120,
        h: 80,
        data: { severity: 'high' },
      }),
    }
    const inspectorPanel: NonNullable<
      CanvasAppCustomItemModule['inspectorPanels']
    >[number] = {
      id: 'risk-meta',
      render: ({ selection }) => selection.length,
    }
    const moduleInput: CanvasAppCustomItemModule = {
      id: 'risk',
      presentation: 'risk-node',
      renderItem: renderRisk,
      validateItem: validateRisk,
      customCommands: [command],
      customCreationTools: [creationTool],
      inspectorPanels: [inspectorPanel],
    }

    const module = defineCanvasAppCustomItemModule(moduleInput)

    moduleInput.id = 'mutated-risk'
    moduleInput.presentation = 'mutated-risk-node'
    moduleInput.renderItem = () => 'mutated'
    moduleInput.validateItem = () => false
    command.title = 'Mutated publish'
    creationTool.createItem = ({ startWorld }) => ({
      title: 'Mutated risk',
      x: startWorld.x,
      y: startWorld.y,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })
    inspectorPanel.render = () => 'mutated'

    const assembly = createCanvasAppCustomItemModuleAssembly([module])

    expect(module).toMatchObject({
      id: 'risk',
      presentation: 'risk-node',
    })
    expect(assembly.customCommands[0]).toMatchObject({
      id: 'publish-risk',
      title: 'Publish risk',
    })
    expect(assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 100, y: 140 },
      moved: false,
      startWorld: { x: 80, y: 120 },
    })).toMatchObject({
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
    })
    expect(assembly.customItemRenderers['risk-node']?.({
      item: createRiskItem(),
    })).toBe('risk')
    expect(assembly.customItemValidators.risk(createRiskItem())).toBe(true)
    expect(assembly.inspectorPanels[0]?.render({
      bounds: null,
      commitItemsChange: () => false,
      disabled: false,
      label: null,
      selectedItems: [],
      selection: ['risk-1'],
    })).toBe(1)
    expect(Object.isFrozen(module)).toBe(true)
    expect(Object.isFrozen(module.customCommands)).toBe(true)
    expect(Object.isFrozen(module.customCommands?.[0])).toBe(true)
    expect(Object.isFrozen(module.customCreationTools)).toBe(true)
    expect(Object.isFrozen(module.customCreationTools?.[0])).toBe(true)
    expect(Object.isFrozen(module.customCreationTools?.[0]?.shortcut)).toBe(
      true,
    )
    expect(Object.isFrozen(module.inspectorPanels?.[0])).toBe(true)
  })

  it('snapshots assembled module parts against caller mutation', () => {
    const command: NonNullable<
      CanvasAppCustomItemModule['customCommands']
    >[number] = {
      id: 'publish-risk',
      label: 'Pub',
      title: 'Publish risk',
      run: () => undefined,
    }
    const creationTool: NonNullable<
      CanvasAppCustomItemModule['customCreationTools']
    >[number] = {
      id: 'risk',
      label: '!',
      title: 'Risk',
      shortcut: { key: 'e', shiftKey: true },
      createItem: ({ startWorld }) => ({
        title: 'Risk',
        x: startWorld.x,
        y: startWorld.y,
        w: 120,
        h: 80,
        data: { severity: 'high' },
      }),
    }
    const inspectorPanel: NonNullable<
      CanvasAppCustomItemModule['inspectorPanels']
    >[number] = {
      id: 'risk-meta',
      render: ({ selection }) => selection.length,
    }
    const module = defineRiskModule({
      customCommands: [command],
      customCreationTools: [creationTool],
      inspectorPanels: [inspectorPanel],
    })

    const assembly = createCanvasAppCustomItemModuleAssembly([module])

    command.title = 'Mutated publish'
    command.run = () => {
      throw new Error('mutated command')
    }
    creationTool.createItem = ({ startWorld }) => ({
      title: 'Mutated risk',
      x: startWorld.x,
      y: startWorld.y,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })
    inspectorPanel.render = () => 'mutated'

    expect(assembly.customCommands[0]).toMatchObject({
      id: 'publish-risk',
      title: 'Publish risk',
    })
    expect(assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 100, y: 140 },
      moved: false,
      startWorld: { x: 80, y: 120 },
    })).toMatchObject({
      kind: 'risk',
      title: 'Risk',
    })
    expect(assembly.inspectorPanels[0]?.render({
      bounds: null,
      commitItemsChange: () => false,
      disabled: false,
      label: null,
      selectedItems: [],
      selection: ['risk-1'],
    })).toBe(1)
    expect(Object.isFrozen(assembly)).toBe(true)
    expect(Object.isFrozen(assembly.customCommands)).toBe(true)
    expect(Object.isFrozen(assembly.customCommands[0])).toBe(true)
    expect(Object.isFrozen(assembly.customCreationTools)).toBe(true)
    expect(Object.isFrozen(assembly.customCreationTools[0])).toBe(true)
    expect(Object.isFrozen(assembly.customCreationTools[0]?.shortcut)).toBe(
      true,
    )
    expect(Object.isFrozen(assembly.customItemRenderers)).toBe(true)
    expect(Object.isFrozen(assembly.customItemValidators)).toBe(true)
    expect(Object.isFrozen(assembly.inspectorPanels[0])).toBe(true)
  })

  it('rejects duplicate module-owned extension keys', () => {
    const first = defineRiskModule({
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
      defineCanvasAppCustomItemModule(
        undefined as unknown as CanvasAppCustomItemModule,
      ),
    ).toThrow('Canvas app custom item module descriptor must be an object')

    expect(() =>
      createCanvasAppCustomItemModuleAssembly(
        {} as unknown as CanvasAppCustomItemModule[],
      ),
    ).toThrow('Canvas app custom item modules must be an array')

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

  it('rejects malformed module-owned command and inspector descriptors', () => {
    expect(() =>
      defineRiskModule({
        customCommands: [
          {
            id: 'publish-risk',
            label: 'Pub',
            title: 'Publish risk',
          },
        ],
      } as unknown as Partial<CanvasAppCustomItemModule>),
    ).toThrow('Canvas app custom command publish-risk requires run')

    expect(() =>
      defineRiskModule({
        inspectorPanels: [
          {
            id: 'risk-meta',
          },
        ],
      } as unknown as Partial<CanvasAppCustomItemModule>),
    ).toThrow('Canvas app inspector panel risk-meta requires render')
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
        disabledModuleIds: {} as unknown as string[],
      }),
    ).toThrow('Canvas app disabled custom item module ids must be an array')

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

  it('contains invalid module-owned creation output before commit', () => {
    const throwingCreationModule = defineRiskModule({
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => {
            throw new Error('bad custom creation')
          },
        },
      ],
    })
    const invalidJsonModule = defineRiskModule({
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
            data: {
              run: () => undefined,
            },
          }),
        },
      ],
    } as unknown as CanvasAppCustomItemModule)
    const invalidDomainModule = defineRiskModule({
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: ({ startWorld }) => ({
            title: 'Risk',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            data: { severity: 'low' },
          }),
        },
      ],
      validateItem: (item) => item.data.severity === 'high',
    })
    const context = {
      createId: (prefix: string) => `${prefix}-1`,
      currentWorld: { x: 100, y: 140 },
      moved: false,
      startWorld: { x: 80, y: 120 },
    }

    expect(
      createCanvasAppCustomItemModuleAssembly([throwingCreationModule])
        .customCreationTools[0]?.createItem(context),
    ).toBeNull()
    expect(
      createCanvasAppCustomItemModuleAssembly([invalidJsonModule])
        .customCreationTools[0]?.createItem(context),
    ).toBeNull()
    expect(
      createCanvasAppCustomItemModuleAssembly([invalidDomainModule])
        .customCreationTools[0]?.createItem(context),
    ).toBeNull()
  })

  it('contains module-owned validator failures as invalid items', () => {
    const throwingValidatorModule = defineRiskModule({
      validateItem: () => {
        throw new Error('bad custom validator')
      },
    })

    expect(
      createCanvasAppCustomItemModuleAssembly([throwingValidatorModule])
        .customItemValidators.risk(createRiskItem()),
    ).toBe(false)
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
