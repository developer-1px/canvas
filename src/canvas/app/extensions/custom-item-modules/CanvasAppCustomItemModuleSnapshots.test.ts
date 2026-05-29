import { describe, expect, it } from 'vitest'
import { createCanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import { defineCanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleCreationTool,
} from './CanvasAppCustomItemModules'

describe('CanvasAppCustomItemModules snapshots', () => {
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
      shortcut: { key: 'k', shiftKey: true },
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
    const textPasteImporter: NonNullable<
      CanvasAppCustomItemModule['textPasteImporters']
    >[number] = {
      id: 'risk-paste',
      createItems: () => null,
    }
    const moduleInput: CanvasAppCustomItemModule = {
      id: 'risk',
      presentation: 'risk-node',
      renderItem: renderRisk,
      validateItem: validateRisk,
      customCommands: [command],
      customCreationTools: [creationTool],
      inspectorPanels: [inspectorPanel],
      textPasteImporters: [textPasteImporter],
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
    textPasteImporter.createItems = () => []

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
    expect(assembly.textPasteImporters[0]?.createItems({} as never)).toBeNull()
    expect(Object.isFrozen(module)).toBe(true)
    expect(Object.isFrozen(module.customCommands)).toBe(true)
    expect(Object.isFrozen(module.customCommands?.[0])).toBe(true)
    expect(Object.isFrozen(module.customCreationTools)).toBe(true)
    expect(Object.isFrozen(module.customCreationTools?.[0])).toBe(true)
    expect(Object.isFrozen(module.customCreationTools?.[0]?.shortcut)).toBe(
      true,
    )
    expect(Object.isFrozen(module.inspectorPanels?.[0])).toBe(true)
    expect(Object.isFrozen(module.textPasteImporters?.[0])).toBe(true)
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
      shortcut: { key: 'k', shiftKey: true },
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
    const textPasteImporter: NonNullable<
      CanvasAppCustomItemModule['textPasteImporters']
    >[number] = {
      id: 'risk-paste',
      createItems: () => null,
    }
    const module = defineRiskModule({
      customCommands: [command],
      customCreationTools: [creationTool],
      inspectorPanels: [inspectorPanel],
      textPasteImporters: [textPasteImporter],
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
    textPasteImporter.createItems = () => []

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
    expect(assembly.textPasteImporters[0]?.createItems({} as never)).toBeNull()
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
    expect(Object.isFrozen(assembly.textPasteImporters[0])).toBe(true)
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
