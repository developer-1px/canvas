import { describe, expect, it } from 'vitest'
import { defineCanvasExtension } from '../../foundation'
import {
  createCanvasAppExtensionBundle,
  createEmptyCanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
  snapshotCanvasAppExtensionBundle,
} from './CanvasAppExtensionBundle'
import type { CanvasAppFoundationExtension } from './CanvasAppFoundationExtensionDescriptors'
import { getCanvasAppFoundationExtensionCommands } from './CanvasAppFoundationExtensionCommands'
import {
  getCanvasAppFoundationExtensionRendererSlots,
} from './CanvasAppFoundationExtensionRendererSlots'
import { getCanvasAppFoundationExtensionTools } from './CanvasAppFoundationExtensionTools'
import type { CanvasMediaImporter } from '../affordances/io/media/CanvasMediaImporters'
import type { CanvasTextPasteImporter } from '../affordances/io/text-paste/CanvasTextPasteImporters'

describe('CanvasAppExtensionBundle', () => {
  it('creates empty extension bundles', () => {
    expect(createEmptyCanvasAppExtensionBundle()).toEqual({
      customCommands: [],
      customCreationTools: [],
      customItemRenderers: {},
      customItemValidators: {},
      foundationExtensions: [],
      inspectorPanels: [],
      mediaImporters: [],
      textPasteImporters: [],
    })
  })

  it('merges extension bundle slots with stable ordering', () => {
    const current = createCanvasAppExtensionBundle({
      customCommands: [createCommand('publish')],
      customCreationTools: [createTool('risk')],
      customItemRenderers: {
        risk: () => null,
      },
      customItemValidators: {
        risk: () => true,
      },
      foundationExtensions: [createFoundationExtension('canvas.risk')],
      inspectorPanels: [createPanel('risk-panel')],
      mediaImporters: [createMediaImporter('risk-media')],
      textPasteImporters: [createTextPasteImporter('risk-paste')],
    })
    const entries = createCanvasAppExtensionBundle({
      customCommands: [createCommand('archive')],
      customCreationTools: [createTool('note')],
      customItemRenderers: {
        note: () => null,
      },
      customItemValidators: {
        note: () => true,
      },
      foundationExtensions: [createFoundationExtension('canvas.note')],
      inspectorPanels: [createPanel('note-panel')],
      mediaImporters: [createMediaImporter('note-media')],
      textPasteImporters: [createTextPasteImporter('note-paste')],
    })

    const merged = mergeCanvasAppExtensionBundle({
      current,
      entries,
      owner: 'app assembly',
    })

    expect(merged.customCommands.map((command) => command.id)).toEqual([
      'publish',
      'archive',
    ])
    expect(merged.customCreationTools.map((tool) => tool.id)).toEqual([
      'risk',
      'note',
    ])
    expect(Object.keys(merged.customItemRenderers)).toEqual(['risk', 'note'])
    expect(Object.keys(merged.customItemValidators)).toEqual(['risk', 'note'])
    expect(merged.foundationExtensions.map((extension) => extension.id))
      .toEqual(['canvas.risk', 'canvas.note'])
    expect(merged.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-panel',
      'note-panel',
    ])
    expect(merged.mediaImporters.map((importer) => importer.id)).toEqual([
      'risk-media',
      'note-media',
    ])
    expect(merged.textPasteImporters.map((importer) => importer.id)).toEqual([
      'risk-paste',
      'note-paste',
    ])
  })

  it('rejects duplicate extension bundle entries by owner and slot label', () => {
    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          customCommands: [createCommand('publish')],
        }),
        entries: createCanvasAppExtensionBundle({
          customCommands: [createCommand('publish')],
        }),
        owner: 'custom item module',
      }),
    ).toThrow('Duplicate canvas custom item module custom command: publish')

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          customItemRenderers: {
            risk: () => null,
          },
        }),
        entries: createCanvasAppExtensionBundle({
          customItemRenderers: {
            risk: () => null,
          },
        }),
        owner: 'app assembly',
      }),
    ).toThrow('Duplicate canvas app assembly custom item renderer: risk')

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          foundationExtensions: [createFoundationExtension('canvas.risk')],
        }),
        entries: createCanvasAppExtensionBundle({
          foundationExtensions: [createFoundationExtension('canvas.risk')],
        }),
        owner: 'app assembly',
      }),
    ).toThrow('Duplicate canvas app assembly foundation extension: canvas.risk')

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          foundationExtensions: [
            createFoundationExtension(
              'canvas.risk',
              'canvas.risk.tool',
              'canvas.shared.command',
            ),
          ],
        }),
        entries: createCanvasAppExtensionBundle({
          foundationExtensions: [
            createFoundationExtension(
              'canvas.note',
              'canvas.note.tool',
              'canvas.shared.command',
            ),
          ],
        }),
        owner: 'app assembly',
      }),
    ).toThrow(
      'Duplicate canvas app assembly foundation extension command: canvas.shared.command',
    )

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          foundationExtensions: [
            createFoundationExtension(
              'canvas.risk',
              'canvas.risk.tool',
              'canvas.risk.command',
              'canvas.shared.renderer',
            ),
          ],
        }),
        entries: createCanvasAppExtensionBundle({
          foundationExtensions: [
            createFoundationExtension(
              'canvas.note',
              'canvas.note.tool',
              'canvas.note.command',
              'canvas.shared.renderer',
            ),
          ],
        }),
        owner: 'app assembly',
      }),
    ).toThrow(
      'Duplicate canvas app assembly foundation extension renderer slot: canvas.shared.renderer',
    )

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          foundationExtensions: [
            createFoundationExtension('canvas.risk', 'canvas.shared.tool'),
          ],
        }),
        entries: createCanvasAppExtensionBundle({
          foundationExtensions: [
            createFoundationExtension('canvas.note', 'canvas.shared.tool'),
          ],
        }),
        owner: 'app assembly',
      }),
    ).toThrow(
      'Duplicate canvas app assembly foundation extension tool: canvas.shared.tool',
    )

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          mediaImporters: [createMediaImporter('embed')],
        }),
        entries: createCanvasAppExtensionBundle({
          mediaImporters: [createMediaImporter('embed')],
        }),
        owner: 'custom item module',
      }),
    ).toThrow('Duplicate canvas custom item module media importer: embed')

    expect(() =>
      mergeCanvasAppExtensionBundle({
        current: createCanvasAppExtensionBundle({
          textPasteImporters: [createTextPasteImporter('html')],
        }),
        entries: createCanvasAppExtensionBundle({
          textPasteImporters: [createTextPasteImporter('html')],
        }),
        owner: 'custom item module',
      }),
    ).toThrow('Duplicate canvas custom item module text paste importer: html')
  })

  it('snapshots extension bundle slots against later external mutation', () => {
    const command = createCommand('publish')
    const tool = createTool('risk')
    tool.shortcut = { key: 'r' }
    const renderRisk = () => null
    const validateRisk = () => true
    const panel = createPanel('risk-panel')
    const mediaImporter = createMediaImporter('risk-media')
    const textPasteImporter = createTextPasteImporter('risk-paste')
    const foundationExtension = createFoundationExtension('canvas.risk')
    const bundle = createCanvasAppExtensionBundle({
      customCommands: [command],
      customCreationTools: [tool],
      customItemRenderers: {
        risk: renderRisk,
      },
      customItemValidators: {
        risk: validateRisk,
      },
      foundationExtensions: [foundationExtension],
      inspectorPanels: [panel],
      mediaImporters: [mediaImporter],
      textPasteImporters: [textPasteImporter],
    })

    const snapshot = snapshotCanvasAppExtensionBundle(bundle)

    command.title = 'Mutated'
    tool.shortcut.key = 'x'
    foundationExtension.commands = []
    foundationExtension.requiredAdapters = ['renderer']
    foundationExtension.tools = []
    panel.id = 'mutated-panel'
    mediaImporter.createItems = () => []
    textPasteImporter.createItems = () => []

    expect(snapshot.customCommands[0]?.title).toBe('publish')
    expect(snapshot.customCreationTools[0]?.shortcut).toEqual({ key: 'r' })
    expect(snapshot.foundationExtensions[0]?.requiredAdapters).toEqual([
      'document',
    ])
    expect(snapshot.foundationExtensions[0]?.commands?.[0]?.requiredAdapters)
      .toEqual(['command'])
    expect(snapshot.foundationExtensions[0]?.rendererSlots?.[0]?.surface)
      .toBe('item-layer')
    expect(snapshot.foundationExtensions[0]?.tools?.[0]?.requiredAdapters)
      .toEqual(['creation'])
    const foundationCommands = getCanvasAppFoundationExtensionCommands(
      snapshot.foundationExtensions,
    )
    const foundationTools = getCanvasAppFoundationExtensionTools(
      snapshot.foundationExtensions,
    )
    const foundationRendererSlots =
      getCanvasAppFoundationExtensionRendererSlots(
        snapshot.foundationExtensions,
      )

    expect(foundationCommands[0]).toMatchObject({
      extensionId: 'canvas.risk',
      id: 'canvas.risk.command',
      requiredAdapters: ['command'],
    })
    expect(foundationCommands[0]?.plan({} as never)).toEqual([{
      selection: [],
      type: 'selection',
    }])
    expect(foundationTools).toEqual([{
      extensionId: 'canvas.risk',
      id: 'canvas.risk.tool',
      kind: 'creation',
      requiredAdapters: ['creation'],
    }])
    expect(foundationRendererSlots).toEqual([{
      extensionId: 'canvas.risk',
      id: 'canvas.risk.renderer',
      surface: 'item-layer',
    }])
    expect(snapshot.customItemRenderers.risk).toBe(renderRisk)
    expect(snapshot.customItemValidators.risk).toBe(validateRisk)
    expect(snapshot.inspectorPanels[0]?.id).toBe('risk-panel')
    expect(snapshot.mediaImporters[0]?.createItems({} as never)).toBeNull()
    expect(snapshot.textPasteImporters[0]?.createItems({} as never)).toBeNull()
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.customCommands)).toBe(true)
    expect(Object.isFrozen(snapshot.customCommands[0])).toBe(true)
    expect(Object.isFrozen(snapshot.customCreationTools[0]?.shortcut)).toBe(
      true,
    )
    expect(Object.isFrozen(snapshot.foundationExtensions[0])).toBe(true)
    expect(Object.isFrozen(snapshot.foundationExtensions[0]?.requiredAdapters))
      .toBe(true)
    expect(Object.isFrozen(snapshot.foundationExtensions[0]?.commands?.[0]))
      .toBe(true)
    expect(Object.isFrozen(
      snapshot.foundationExtensions[0]?.rendererSlots?.[0],
    )).toBe(true)
    expect(Object.isFrozen(snapshot.foundationExtensions[0]?.tools?.[0]))
      .toBe(true)
    expect(Object.isFrozen(foundationCommands)).toBe(true)
    expect(Object.isFrozen(foundationCommands[0])).toBe(true)
    expect(Object.isFrozen(foundationCommands[0]?.requiredAdapters)).toBe(true)
    expect(Object.isFrozen(foundationRendererSlots)).toBe(true)
    expect(Object.isFrozen(foundationRendererSlots[0])).toBe(true)
    expect(Object.isFrozen(foundationTools)).toBe(true)
    expect(Object.isFrozen(foundationTools[0])).toBe(true)
    expect(Object.isFrozen(foundationTools[0]?.requiredAdapters)).toBe(true)
    expect(Object.isFrozen(snapshot.customItemRenderers)).toBe(true)
    expect(Object.isFrozen(snapshot.customItemValidators)).toBe(true)
    expect(Object.isFrozen(snapshot.inspectorPanels[0])).toBe(true)
    expect(Object.isFrozen(snapshot.mediaImporters[0])).toBe(true)
    expect(Object.isFrozen(snapshot.textPasteImporters[0])).toBe(true)
  })
})

describe('CanvasAppFoundationExtensionCommands', () => {
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
})

describe('CanvasAppFoundationExtensionTools', () => {
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
})

describe('CanvasAppFoundationExtensionRendererSlots', () => {
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

function createCommand(id: string) {
  return {
    id,
    label: id,
    run: () => undefined,
    title: id,
  }
}

function createTool(id: string) {
  return {
    createItem: () => null,
    id,
    label: id,
    shortcut: undefined as { key: string } | undefined,
    title: id,
  }
}

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

function createPanel(id: string) {
  return {
    id,
    render: () => null,
  }
}

function createMediaImporter(id: string): CanvasMediaImporter {
  return {
    id,
    createItems: () => null,
  }
}

function createTextPasteImporter(id: string): CanvasTextPasteImporter {
  return {
    id,
    createItems: () => null,
  }
}
