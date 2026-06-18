import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type {
  CanvasAppStageRenderInput,
} from '../workflow'
import CanvasApp from './CanvasApp'

describe('CanvasApp', () => {
  it('gates component source outlines behind the source outline feature pack', () => {
    const withSourceOutline = captureCanvasAppStage({
      featurePackStates: [
        { id: 'component-library', status: 'enabled' },
        { id: 'component-source-outline', status: 'enabled' },
        { id: 'component-authoring', status: 'uninstalled' },
      ],
    })
    const withAuthoringOnly = captureCanvasAppStage({
      featurePackStates: [
        { id: 'component-library', status: 'enabled' },
        { id: 'component-source-outline', status: 'disabled' },
        { id: 'component-authoring', status: 'enabled' },
      ],
    })

    expect(withSourceOutline?.overlays.componentPartSourceOutlines)
      .toMatchObject([
        {
          componentId: 'story-card',
          componentLabel: 'Story card',
          itemIds: ['story-card-root'],
          label: 'Root',
          slotId: 'root',
          bounds: {
            h: 80,
            w: 120,
            x: 10,
            y: 20,
          },
        },
      ])
    expect(withAuthoringOnly?.overlays.componentPartSourceOutlines).toEqual([])
  })
})

function captureCanvasAppStage({
  featurePackStates,
}: {
  featurePackStates: readonly {
    id: string
    status: 'enabled' | 'uninstalled'
  }[]
}) {
  let stageInput: CanvasAppStageRenderInput | null = null

  renderToStaticMarkup(
    <CanvasApp
      assemblyInput={{
        componentDefinitions: [{
          id: 'story-card',
          instances: [{
            label: 'Default',
            slots: {
              root: 'story-card-root',
            },
          }],
          label: 'Story card',
          source: {
            exportName: 'StoryCard',
            importPath: '/src/widgets/StoryCard.tsx',
            layer: 'widgets',
          },
        }],
        featurePackStates,
        initialItems: [{
          fill: '#ffffff',
          h: 80,
          id: 'story-card-root',
          stroke: '#6d28d9',
          type: 'rect',
          w: 120,
          x: 10,
          y: 20,
        }],
        initialSelection: [],
        stageAdapter: {
          renderStage: (input) => {
            stageInput = input
            return null
          },
        },
      }}
      renderApp={() => null}
    />,
  )

  return stageInput
}
