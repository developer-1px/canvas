import { describe, expect, it } from 'vitest'
import {
  createCanvasAppExtensionBundle,
  createEmptyCanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from './CanvasAppExtensionBundle'

describe('CanvasAppExtensionBundle', () => {
  it('creates empty extension bundles', () => {
    expect(createEmptyCanvasAppExtensionBundle()).toEqual({
      customCommands: [],
      customCreationTools: [],
      customItemRenderers: {},
      customItemValidators: {},
      inspectorPanels: [],
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
      inspectorPanels: [createPanel('risk-panel')],
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
      inspectorPanels: [createPanel('note-panel')],
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
    expect(merged.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-panel',
      'note-panel',
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
    title: id,
  }
}

function createPanel(id: string) {
  return {
    id,
    render: () => null,
  }
}
