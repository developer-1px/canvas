import { describe, expect, it } from 'vitest'
import {
  applyCanvasEngineDemoFeaturePackSwitchToAssemblySource,
  createCanvasEngineDemoFeaturePackAssemblySource,
  getCanvasEngineDemoFeaturePackSwitchState,
} from './CanvasEngineDemoFeaturePacks'

describe('CanvasDevToolsDemoApp', () => {
  it('projects engine feature pack switches from the marketplace model', () => {
    expect(getCanvasEngineDemoFeaturePackSwitchState()).toEqual({
      'component-inspector': true,
      'component-source-outline': true,
      'component-sync': true,
    })
    expect(getCanvasEngineDemoFeaturePackSwitchState({
      featurePackStates: [{
        id: 'component-source-outline',
        status: 'disabled',
      }],
    })).toEqual({
      'component-inspector': true,
      'component-source-outline': false,
      'component-sync': true,
    })
  })

  it('applies engine feature pack switches through marketplace target source transactions', async () => {
    const source = createCanvasEngineDemoFeaturePackAssemblySource()
    const result = await applyCanvasEngineDemoFeaturePackSwitchToAssemblySource({
      enabled: false,
      featurePackId: 'component-source-outline',
      source,
    })

    expect(result).toMatchObject({
      applied: true,
      enabled: false,
      featurePackId: 'component-source-outline',
      status: 'applied',
    })
    expect(result.source.assemblyInput?.featurePackStates?.find((state) =>
      state.id === 'component-source-outline'
    )).toEqual({
      id: 'component-source-outline',
      status: 'disabled',
    })
    expect(getCanvasEngineDemoFeaturePackSwitchState(
      result.source.assemblyInput,
    )['component-source-outline']).toBe(false)
  })

  it('keeps source unchanged when the requested switch state is already current', async () => {
    const source = createCanvasEngineDemoFeaturePackAssemblySource({
      featurePackStates: [{
        id: 'component-source-outline',
        status: 'disabled',
      }],
    })
    const result = await applyCanvasEngineDemoFeaturePackSwitchToAssemblySource({
      enabled: false,
      featurePackId: 'component-source-outline',
      source,
    })

    expect(result).toEqual({
      applied: false,
      enabled: false,
      featurePackId: 'component-source-outline',
      source,
      status: 'unchanged',
    })
  })
})
