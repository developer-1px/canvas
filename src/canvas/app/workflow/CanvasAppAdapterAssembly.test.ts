import { describe, expect, it } from 'vitest'
import { CANVAS_ITEM_ENGINE_ADAPTERS } from '../../host'
import { DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER } from '../rendering/CanvasAppItemLayerAdapter'
import { DEFAULT_CANVAS_APP_STAGE_ADAPTER } from '../rendering/CanvasAppStageAdapter'
import { createCanvasAppAdapterAssembly } from './CanvasAppAdapterAssembly'
import type { CanvasAppAssemblyAdapters } from './CanvasAppAdapterContracts'

describe('CanvasAppAdapterAssembly', () => {
  it('keeps default item, item layer, and stage adapters together', () => {
    const defaults = createDefaults()

    expect(createCanvasAppAdapterAssembly({}, defaults)).toEqual(defaults)
  })

  it('accepts product adapters independently at the app assembly seam', () => {
    const defaults = createDefaults()
    const itemAdapters = {
      ...CANVAS_ITEM_ENGINE_ADAPTERS,
      command: {
        ...CANVAS_ITEM_ENGINE_ADAPTERS.command,
        selectAll: () => ['custom'],
      },
    }
    const itemLayerAdapter = {
      renderItems: () => 'items',
    }
    const stageAdapter = {
      renderStage: () => 'stage',
    }

    expect(createCanvasAppAdapterAssembly({
      itemAdapters,
      itemLayerAdapter,
      stageAdapter,
    }, defaults)).toEqual({
      itemAdapters,
      itemLayerAdapter,
      stageAdapter,
    })
    expect(createCanvasAppAdapterAssembly({
      itemLayerAdapter,
    }, defaults)).toEqual({
      ...defaults,
      itemLayerAdapter,
    })
  })
})

function createDefaults(): CanvasAppAssemblyAdapters {
  return {
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  }
}
