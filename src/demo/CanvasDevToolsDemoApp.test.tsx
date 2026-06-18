import { describe, expect, it } from 'vitest'
import {
  createCanvasEngineDemoAssemblyInput,
} from './CanvasEngineDemoFeaturePacks'

describe('CanvasDevToolsDemoApp', () => {
  it('maps engine feature pack switches to runtime feature pack states', () => {
    const assemblyInput = createCanvasEngineDemoAssemblyInput({
      assemblyInput: {
        featurePackStates: [{
          id: 'component-source-outline',
          status: 'enabled',
        }],
      },
      featurePackSwitchState: {
        'component-inspector': true,
        'component-source-outline': false,
        'component-sync': true,
      },
      featurePackSwitches: true,
    })

    expect(assemblyInput?.featurePackStates).toEqual([
      {
        id: 'component-source-outline',
        status: 'enabled',
      },
      {
        id: 'component-source-outline',
        status: 'uninstalled',
      },
      {
        id: 'component-inspector',
        status: 'enabled',
      },
      {
        id: 'component-sync',
        status: 'enabled',
      },
    ])
  })

  it('leaves assembly input untouched when switches are disabled', () => {
    const input = {
      initialSelection: ['a'],
    }

    expect(createCanvasEngineDemoAssemblyInput({
      assemblyInput: input,
      featurePackSwitchState: {
        'component-inspector': true,
        'component-source-outline': true,
        'component-sync': true,
      },
      featurePackSwitches: false,
    })).toBe(input)
  })
})
