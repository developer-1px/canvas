import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppExtensionConsumerModel } from './CanvasAppExtensionConsumerModel'

describe('CanvasAppExtensionConsumerModel', () => {
  it('builds control extension context from custom command and tool state', () => {
    const runtime = createExtensionRuntime()
    const model = getCanvasAppExtensionConsumerModel(runtime)

    model.control.onRunCustomCommand('publish')

    expect(model.control.customCommands).toBe(runtime.customCommandStates)
    expect(model.control.customTools).toBe(runtime.customCreationToolStates)
    expect(runtime.runCustomCommand).toHaveBeenCalledWith('publish')
  })

  it('exposes custom creation tool state to keyboard consumers', () => {
    const runtime = createExtensionRuntime()
    const model = getCanvasAppExtensionConsumerModel(runtime)

    expect(model.keyboard.customCreationTools).toBe(
      runtime.customCreationToolStates,
    )
  })

  it('keeps raw custom creation tool descriptors scoped to pointer consumers', () => {
    const runtime = createExtensionRuntime()
    const model = getCanvasAppExtensionConsumerModel(runtime)

    expect(model.pointer.customCreationTools).toBe(runtime.customCreationTools)
    expect(model.keyboard.customCreationTools).not.toBe(
      runtime.customCreationTools,
    )
    expect(model.control).not.toHaveProperty('customCreationTools')
  })
})

function createExtensionRuntime() {
  return {
    customCommandStates: [{
      ariaLabel: 'Publish',
      disabled: false,
      id: 'publish',
      label: 'P',
      title: 'Publish',
    }],
    customCreationToolStates: [{
      ariaLabel: 'Risk tool',
      id: 'custom:risk' as const,
      label: 'R',
      statusLabel: 'Risk',
      title: 'Risk',
    }],
    customCreationTools: [{
      createItem: vi.fn(() => null),
      id: 'risk',
      label: 'R',
      title: 'Risk',
    }],
    runCustomCommand: vi.fn(() => true),
  }
}
