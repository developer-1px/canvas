import '@interactive-os/canvas/style.css'
import { CanvasApp } from '@interactive-os/canvas'
import { defineCanvasAppFeaturePack } from '@interactive-os/canvas/app/authoring'

const analyticsFeaturePack = defineCanvasAppFeaturePack({
  id: 'analytics',
  label: 'Analytics',
  extensions: {
    customCommands: [{
      id: 'log-selection',
      isEnabled: ({ selection }) => selection.length > 0,
      label: 'Log selection',
      run: ({ selection }) => {
        console.info('Selected canvas items', selection)
      },
      title: 'Log selected canvas item ids',
    }],
  },
})

export function CanvasWithCustomFeaturePack() {
  return (
    <CanvasApp
      assemblyInput={{
        additionalFeaturePackManifests: [analyticsFeaturePack],
      }}
    />
  )
}
