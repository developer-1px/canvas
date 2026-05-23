import { describe, expect, it } from 'vitest'
import {
  createCanvasDemoSvgComponentPresentationRenderers,
  type CanvasDemoSvgComponentRendererStrategy,
} from '../rendering'
import { createCanvasComponentLibrary } from '../../host'
import { createCanvasAppAssembly } from './CanvasAppAssembly'

describe('CanvasAppAssembly', () => {
  it('assembles product-specific component library and presentation registry', () => {
    const componentLibrary = createCanvasComponentLibrary({
      templates: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          w: 180,
          h: 96,
          fill: '#fff7ed',
          stroke: '#fb923c',
          accent: '#ea580c',
          presentation: 'risk-card',
        },
      ],
    })
    const renderRisk: CanvasDemoSvgComponentRendererStrategy = ({ item }) =>
      item.title
    const componentPresentationRenderers =
      createCanvasDemoSvgComponentPresentationRenderers({
        'risk-card': renderRisk,
      })

    const assembly = createCanvasAppAssembly({
      componentLibrary,
      componentPresentationRenderers,
      customCommands: [
        {
          id: 'publish',
          label: 'Pub',
          title: 'Publish selection',
          run: () => undefined,
        },
      ],
      inspectorPanels: [
        {
          id: 'risk-meta',
          render: ({ selection }) => selection.length,
        },
      ],
      initialItems: [],
    })

    expect(assembly.componentLibrary.getPresentation('risk')).toBe('risk-card')
    expect(assembly.componentPresentationRenderers['risk-card']).toBe(renderRisk)
    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'publish',
    ])
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-meta',
    ])
    expect(assembly.initialItems).toEqual([])
  })
})
