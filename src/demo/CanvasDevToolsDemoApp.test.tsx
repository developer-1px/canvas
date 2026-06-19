import { describe, expect, it } from 'vitest'
import {
  applyCanvasEngineDemoFeaturePackSwitchToAssemblySource,
  createCanvasEngineDemoFeaturePackAssemblySource,
  getCanvasEngineDemoFeaturePackSwitchControls,
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
      featureFlagSettings: [{
        enabled: false,
        id: 'component-sync',
      }],
    })).toEqual({
      'component-inspector': true,
      'component-source-outline': true,
      'component-sync': false,
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
    expect(getCanvasEngineDemoFeaturePackSwitchControls({
      featurePackStates: [{
        id: 'component-source-outline',
        status: 'disabled',
      }],
    }).map((control) => ({
      actionKind: control.actionKind,
      active: control.active,
      disabled: control.disabled,
      featurePackId: control.featurePackId,
      label: control.label,
      target: control.target,
    }))).toEqual([
      {
        actionKind: 'enable',
        active: false,
        disabled: false,
        featurePackId: 'component-source-outline',
        label: 'Component source outline',
        target: {
          featurePackId: 'component-source-outline',
          kind: 'pack',
        },
      },
      {
        actionKind: 'disable',
        active: true,
        disabled: false,
        featurePackId: 'component-inspector',
        label: 'Component inspector',
        target: {
          featurePackId: 'component-inspector',
          kind: 'pack',
        },
      },
      {
        actionKind: 'disable',
        active: true,
        disabled: false,
        featurePackId: 'component-sync',
        label: 'Component sync',
        target: {
          featurePackId: 'component-sync',
          kind: 'pack',
        },
      },
    ])
  })

  it('applies engine feature pack switches through feature flag settings', async () => {
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
    expect(result.source.assemblyInput?.featureFlagSettings).toEqual([{
      enabled: false,
      id: 'component-source-outline',
    }])
    expect(result.source.assemblyInput?.featurePackStates?.find((state) =>
      state.id === 'component-source-outline'
    )).toBeUndefined()
    expect(getCanvasEngineDemoFeaturePackSwitchState(
      result.source.assemblyInput,
    )['component-source-outline']).toBe(false)
  })

  it('lets feature flag switch settings override existing source state for the same pack', async () => {
    const source = createCanvasEngineDemoFeaturePackAssemblySource({
      featurePackStates: [{
        id: 'component-source-outline',
        status: 'enabled',
      }],
    })
    const result = await applyCanvasEngineDemoFeaturePackSwitchToAssemblySource({
      enabled: false,
      featurePackId: 'component-source-outline',
      source,
    })

    expect(result.applied).toBe(true)
    expect(result.source.assemblyInput?.featureFlagSettings).toEqual([{
      enabled: false,
      id: 'component-source-outline',
    }])
    expect(result.source.assemblyInput?.featurePackStates).toEqual([])
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
