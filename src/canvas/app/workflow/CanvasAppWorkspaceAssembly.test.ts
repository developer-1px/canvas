import { describe, expect, it } from 'vitest'
import type {
  CanvasItem,
} from '../../host'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemValidators,
} from '../modules/CanvasAppCustomItemValidatorContracts'
import { createCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssembly'

describe('CanvasAppWorkspaceAssembly', () => {
  it('keeps demo defaults only when host does not provide initial items', () => {
    const defaults = createDefaults()
    const customItems = [createRectItem('rect-1')]

    expect(createCanvasAppWorkspaceAssembly(
      {},
      defaults,
      { customItemValidators: {} },
    ).initialSelection).toEqual(['default-rect'])
    expect(createCanvasAppWorkspaceAssembly(
      { initialItems: customItems },
      defaults,
      { customItemValidators: {} },
    ).initialSelection).toEqual([])
    expect(createCanvasAppWorkspaceAssembly(
      {
        initialItems: customItems,
        initialSelection: ['rect-1'],
      },
      defaults,
      { customItemValidators: {} },
    ).initialSelection).toEqual(['rect-1'])
  })

  it('normalizes initial items with assembled custom item validators', () => {
    const riskItem = createRiskItem()
    const validators: CanvasAppCustomItemValidators = {
      risk: (item) => item.data.severity === 'high',
    }

    expect(createCanvasAppWorkspaceAssembly(
      { initialItems: [riskItem] },
      createDefaults(),
      { customItemValidators: validators },
    ).initialItems).toEqual([riskItem])
    expect(() =>
      createCanvasAppWorkspaceAssembly(
        { initialItems: [riskItem] },
        createDefaults(),
        {
          customItemValidators: {
            risk: () => false,
          },
        },
      ),
    ).toThrow('Invalid custom canvas item: risk')
  })

  it('accepts product storage providers without mutating defaults', () => {
    const defaults = createDefaults()
    const workspaceStorageProvider: CanvasWorkspaceStorageProvider = () => null

    expect(createCanvasAppWorkspaceAssembly(
      { workspaceStorageProvider },
      defaults,
      { customItemValidators: {} },
    ).workspaceStorageProvider).toBe(workspaceStorageProvider)
    expect(createCanvasAppWorkspaceAssembly(
      {},
      defaults,
      { customItemValidators: {} },
    ).workspaceStorageProvider).toBe(defaults.workspaceStorageProvider)
  })
})

function createDefaults() {
  return {
    initialItems: [createRectItem('default-rect')],
    initialSelection: ['default-rect'],
    workspaceStorageProvider: () => null,
  }
}

function createRectItem(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
  }
}

function createRiskItem(): CanvasItem {
  return {
    data: { severity: 'high' },
    h: 80,
    id: 'risk-1',
    kind: 'risk',
    presentation: 'risk-node',
    title: 'Risk',
    type: 'custom',
    w: 120,
    x: 0,
    y: 0,
  }
}
