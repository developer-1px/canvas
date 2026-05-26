import { describe, expect, it } from 'vitest'
import { createCanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import { defineCanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomItemModule } from './CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationToolContext } from '../custom-tools/CanvasAppCustomCreationTools'

describe('CanvasAppCustomItemModules runtime containment', () => {
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
