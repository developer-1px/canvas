import { describe, expect, it } from 'vitest'

import { defineCanvasAppFeaturePack } from './defineCanvasAppFeaturePack'

describe('defineCanvasAppFeaturePack', () => {
  it('defines an extension feature pack manifest', () => {
    const manifest = defineCanvasAppFeaturePack({
      extensions: {
        customCommands: [createCommand('publish')],
      },
      id: 'publish-pack',
      label: 'Publish pack',
    })

    expect(manifest.id).toBe('publish-pack')
    expect(manifest.extensionFeaturePack?.extensionBundle.customCommands
      .map((command) => command.id)).toEqual(['publish'])
    expect(manifest.viewFeaturePack).toBeUndefined()
  })

  it('defines a view feature pack manifest', () => {
    const renderStatus = () => null
    const manifest = defineCanvasAppFeaturePack({
      id: 'status-pack',
      label: 'Status pack',
      viewRenderers: {
        status: renderStatus,
      },
    })

    expect(manifest.id).toBe('status-pack')
    expect(manifest.extensionFeaturePack).toBeUndefined()
    expect(manifest.viewFeaturePack?.viewRenderers.status).toBe(renderStatus)
  })

  it('defines a manifest with extension and view contributions', () => {
    const renderStatus = () => null
    const manifest = defineCanvasAppFeaturePack({
      extensions: {
        customCommands: [createCommand('publish')],
      },
      id: 'publishing-status',
      label: 'Publishing status',
      viewRenderers: {
        status: renderStatus,
      },
    })

    expect(manifest.extensionFeaturePack?.id).toBe('publishing-status')
    expect(manifest.viewFeaturePack?.id).toBe('publishing-status')
  })

  it('fails fast for malformed definitions', () => {
    expect(() =>
      defineCanvasAppFeaturePack({
        id: 'Publish Pack',
        label: 'Publish pack',
        viewRenderers: {},
      }),
    ).toThrow('Invalid canvas app feature pack id: Publish Pack')
    expect(() =>
      defineCanvasAppFeaturePack({
        id: 'publish-pack',
        label: '',
        viewRenderers: {},
      }),
    ).toThrow('Canvas app feature pack publish-pack requires label')
    expect(() =>
      defineCanvasAppFeaturePack({
        id: 'publish-pack',
        label: 'Publish pack',
      }),
    ).toThrow(
      'Feature pack publish-pack must provide extensions or viewRenderers',
    )
  })

  it('snapshots descriptor input before external mutation', () => {
    const renderStatus = () => null
    const renderReplacement = () => null
    const customCommands = [createCommand('publish')]
    const viewRenderers = {
      status: renderStatus,
    }
    const definition = {
      extensions: {
        customCommands,
      },
      id: 'publishing-status',
      label: 'Publishing status',
      viewRenderers,
    }

    const manifest = defineCanvasAppFeaturePack(definition)

    customCommands.push(createCommand('archive'))
    viewRenderers.status = renderReplacement

    expect(manifest.extensionFeaturePack?.extensionBundle.customCommands
      .map((command) => command.id)).toEqual(['publish'])
    expect(manifest.viewFeaturePack?.viewRenderers.status).toBe(renderStatus)
    expect(Object.isFrozen(manifest)).toBe(true)
    expect(Object.isFrozen(manifest.extensionFeaturePack?.extensionBundle))
      .toBe(true)
    expect(Object.isFrozen(manifest.viewFeaturePack?.viewRenderers)).toBe(true)
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
