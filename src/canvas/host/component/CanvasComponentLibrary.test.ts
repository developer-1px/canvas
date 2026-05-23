import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMPONENT_LIBRARY,
  createCanvasComponentLibrary,
} from './CanvasComponentLibrary'

describe('CANVAS_COMPONENT_LIBRARY', () => {
  it('creates component items from the public template contract', () => {
    for (const template of CANVAS_COMPONENT_LIBRARY.templates) {
      const item = CANVAS_COMPONENT_LIBRARY.createItem({
        id: `component-${template.id}`,
        point: { x: 12, y: 34 },
        templateId: template.id,
      })

      expect(item).toMatchObject({
        accent: template.accent,
        component: template.id,
        fill: template.fill,
        h: template.h,
        id: `component-${template.id}`,
        stroke: template.stroke,
        title: template.title,
        type: 'component',
        w: template.w,
        x: 12,
        y: 34,
      })
      expect(CANVAS_COMPONENT_LIBRARY.getPresentation(template.id)).toBe(
        template.presentation,
      )
    }
  })

  it('falls back to the default component contract for unknown persisted kinds', () => {
    const fallback = CANVAS_COMPONENT_LIBRARY.templates[0]

    expect(CANVAS_COMPONENT_LIBRARY.getTemplate('unknown')).toBe(fallback)
    expect(CANVAS_COMPONENT_LIBRARY.getPresentation('unknown')).toBe(
      fallback.presentation,
    )
    expect(
      CANVAS_COMPONENT_LIBRARY.createItem({
        id: 'component-unknown',
        point: { x: 0, y: 0 },
        templateId: 'unknown',
      }).component,
    ).toBe(fallback.id)
  })

  it('rejects malformed component lookup ids instead of silently falling back', () => {
    expect(() => CANVAS_COMPONENT_LIBRARY.getTemplate('Unknown Kind')).toThrow(
      'Invalid canvas component template id: Unknown Kind',
    )
    expect(() =>
      CANVAS_COMPONENT_LIBRARY.createItem({
        id: 'component-unknown',
        point: { x: 0, y: 0 },
        templateId: 'Unknown Kind',
      }),
    ).toThrow('Invalid canvas component template id: Unknown Kind')
  })

  it('accepts externally assembled component templates', () => {
    const library = createCanvasComponentLibrary({
      templates: [
        ...CANVAS_COMPONENT_LIBRARY.templates,
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          body: 'Open issue',
          w: 180,
          h: 96,
          fill: '#fff7ed',
          stroke: '#fb923c',
          accent: '#ea580c',
          presentation: 'risk-card',
        },
      ],
    })

    const item = library.createItem({
      id: 'component-risk',
      point: { x: 10, y: 20 },
      templateId: 'risk',
    })

    expect(library.getPresentation('risk')).toBe('risk-card')
    expect(item).toMatchObject({
      accent: '#ea580c',
      body: 'Open issue',
      component: 'risk',
      fill: '#fff7ed',
      h: 96,
      id: 'component-risk',
      stroke: '#fb923c',
      title: 'Risk',
      type: 'component',
      w: 180,
      x: 10,
      y: 20,
    })
  })

  it('rejects component template ids outside the stable id contract', () => {
    expect(() =>
      createCanvasComponentLibrary({
        templates: [
          {
            ...CANVAS_COMPONENT_LIBRARY.templates[0],
            id: 'Risk',
          },
        ],
      }),
    ).toThrow('Invalid canvas component template id: Risk')
  })

  it('rejects component presentation keys outside the stable id contract', () => {
    expect(() =>
      createCanvasComponentLibrary({
        templates: [
          {
            ...CANVAS_COMPONENT_LIBRARY.templates[0],
            presentation: 'Risk Card',
          },
        ],
      }),
    ).toThrow('Invalid canvas component presentation id: Risk Card')
  })

  it('rejects duplicate component template ids', () => {
    expect(() =>
      createCanvasComponentLibrary({
        templates: [
          CANVAS_COMPONENT_LIBRARY.templates[0],
          CANVAS_COMPONENT_LIBRARY.templates[0],
        ],
      }),
    ).toThrow('Duplicate canvas component template: sticky')
  })
})
