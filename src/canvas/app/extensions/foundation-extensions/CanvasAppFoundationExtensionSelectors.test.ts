import { describe, expect, it } from 'vitest'
import { defineCanvasExtension } from '../../../foundation'
import {
  getCanvasAppFoundationExtensionCommands,
  type CanvasAppFoundationExtension,
} from './index'
import {
  getCanvasAppFoundationExtensionRendererSlots,
} from './index'
import {
  getCanvasAppFoundationExtensionTools,
} from './index'

describe('CanvasAppFoundationExtensionSelectors', () => {
  it('indexes registered foundation extension commands with owning extension ids', () => {
    expect(getCanvasAppFoundationExtensionCommands([])).toEqual([])

    const commands = getCanvasAppFoundationExtensionCommands([
      createFoundationExtension('canvas.risk'),
    ])

    expect(commands[0]).toMatchObject({
      extensionId: 'canvas.risk',
      id: 'canvas.risk.command',
      requiredAdapters: ['command'],
    })
    expect(commands[0]?.plan({} as never)).toEqual([{
      selection: [],
      type: 'selection',
    }])
  })

  it('indexes registered foundation extension tools with owning extension ids', () => {
    expect(getCanvasAppFoundationExtensionTools([])).toEqual([])

    expect(getCanvasAppFoundationExtensionTools([
      createFoundationExtension('canvas.risk'),
    ])).toEqual([{
      extensionId: 'canvas.risk',
      id: 'canvas.risk.tool',
      kind: 'creation',
      requiredAdapters: ['creation'],
    }])
  })

  it('indexes registered foundation extension renderer slots with owning extension ids', () => {
    expect(getCanvasAppFoundationExtensionRendererSlots([])).toEqual([])

    expect(getCanvasAppFoundationExtensionRendererSlots([
      createFoundationExtension('canvas.risk'),
    ])).toEqual([{
      extensionId: 'canvas.risk',
      id: 'canvas.risk.renderer',
      surface: 'item-layer',
    }])
  })
})

function createFoundationExtension(
  id: string,
  toolId = `${id}.tool`,
  commandId = `${id}.command`,
  rendererSlotId = `${id}.renderer`,
): CanvasAppFoundationExtension {
  return defineCanvasExtension({
    commands: [{
      id: commandId,
      plan: () => [{ selection: [], type: 'selection' as const }],
      requiredAdapters: ['command'],
    }],
    id,
    requiredAdapters: ['document'],
    rendererSlots: [{
      id: rendererSlotId,
      surface: 'item-layer',
    }],
    tools: [{
      id: toolId,
      kind: 'creation',
      requiredAdapters: ['creation'],
    }],
  })
}
