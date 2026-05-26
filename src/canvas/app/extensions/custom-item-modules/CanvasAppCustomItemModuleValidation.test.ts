import { describe, expect, it } from 'vitest'
import { createCanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import { defineCanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationToolContext } from '../custom-tools/CanvasAppCustomCreationTools'

describe('CanvasAppCustomItemModules validation', () => {
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
          shortcut: { key: 'k', shiftKey: true },
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
          shortcut: { key: 'k', shiftKey: true },
          createItem: () => null,
        },
      ],
    })

    expect(() =>
      createCanvasAppCustomItemModuleAssembly([first, second]),
    ).toThrow(
      'Duplicate canvas app custom creation tool shortcut: risk and dependency use Shift+K',
    )
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

