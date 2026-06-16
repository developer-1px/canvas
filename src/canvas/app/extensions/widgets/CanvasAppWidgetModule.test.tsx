import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createCanvasAppAssembly } from '../../workflow/CanvasAppAssembly'
import {
  defineCanvasAppHtmlWidgetModule,
  defineCanvasAppReactWidgetModule,
  getCanvasAppWidgetInteractions,
} from './CanvasAppWidgetModule'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../../../entities'

describe('CanvasAppWidgetModule', () => {
  it('defines a React component widget as a normal custom canvas item', () => {
    const module = defineCanvasAppReactWidgetModule({
      defaultData: {
        label: 'Revenue',
        value: '$42k',
      },
      defaultSize: {
        h: 120,
        w: 220,
      },
      id: 'metric-widget',
      render: ({ data }) => (
        <div className="metric-widget">
          <strong>{String(data.label)}</strong>
          <span>{String(data.value)}</span>
        </div>
      ),
      title: 'Metric widget',
    })
    const assembly = createCanvasAppAssembly({
      customItemModules: [module],
    })
    const item = assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 40, y: 60 },
      moved: false,
      startWorld: { x: 40, y: 60 },
    })

    expect(item).toMatchObject({
      data: {
        label: 'Revenue',
        value: '$42k',
      },
      h: 120,
      id: 'metric-widget-1',
      kind: 'metric-widget',
      presentation: 'metric-widget-widget',
      title: 'Metric widget',
      type: 'custom',
      w: 220,
      x: 40,
      y: 60,
    })
    expect(module.validateItem(item!)).toBe(true)
    expect(assembly.customItemRenderers['metric-widget-widget'])
      .toMatchObject({
        getRenderKey: expect.any(Function),
        renderItem: module.renderItem,
      })

    const markup = renderToStaticMarkup(
      <svg>{module.renderItem({ item: item! })}</svg>,
    )

    expect(markup).toContain('<foreignObject')
    expect(markup).toContain('data-canvas-widget-kind="metric-widget"')
    expect(markup).toContain('class="canvas-widget-hit"')
    expect(markup).toContain('data-canvas-widget-hit="metric-widget"')
    expect(markup).toContain('pointer-events:none')
    expect(markup).toContain('Revenue')
    expect(markup).toContain('$42k')
  })

  it('defines an HTML and CSS widget payload rendered inside canvas bounds', () => {
    const module = defineCanvasAppHtmlWidgetModule({
      defaultCss: '.cta{color:#2563eb;font-weight:700}',
      defaultHtml: '<button class="cta">Run</button>',
      defaultSize: {
        h: 96,
        w: 180,
      },
      id: 'html-widget',
      title: 'HTML widget',
    })
    const assembly = createCanvasAppAssembly({
      customItemModules: [module],
    })
    const item = assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 280, y: 180 },
      moved: true,
      startWorld: { x: 100, y: 80 },
    })

    expect(item).toMatchObject({
      data: {
        css: '.cta{color:#2563eb;font-weight:700}',
        html: '<button class="cta">Run</button>',
      },
      h: 100,
      kind: 'html-widget',
      presentation: 'html-widget-widget',
      type: 'custom',
      w: 180,
      x: 100,
      y: 80,
    })
    expect(module.validateItem(item!)).toBe(true)
    expect(module.validateItem({
      ...item!,
      data: {
        css: '.cta{}',
      },
    })).toBe(false)

    const markup = renderToStaticMarkup(
      <svg>{module.renderItem({ item: item! })}</svg>,
    )

    expect(markup).toContain('<foreignObject')
    expect(markup).toContain('<style>.cta{color:#2563eb;font-weight:700}</style>')
    expect(markup).toContain('<button class="cta">Run</button>')
  })

  it('can render a React widget without shadow isolation for preview inspection', () => {
    const module = defineCanvasAppReactWidgetModule({
      defaultData: { source: 'src/cards/MetricCard.tsx:18:6' },
      id: 'inspectable-preview',
      isolation: 'none',
      render: ({ data }) => (
        <article data-preview-source={String(data.source)}>
          Inspect me
        </article>
      ),
      title: 'Inspectable preview',
    })
    const item = {
      data: { source: 'src/cards/MetricCard.tsx:18:6' },
      h: 120,
      id: 'preview-1',
      kind: 'inspectable-preview',
      presentation: 'inspectable-preview-widget',
      title: 'Inspectable preview',
      type: 'custom',
      w: 220,
      x: 0,
      y: 0,
    } satisfies CanvasCustomItem
    const markup = renderToStaticMarkup(
      <svg>{module.renderItem({ item })}</svg>,
    )

    expect(markup).not.toContain('canvas-widget-shadow-host')
    expect(markup).toContain('data-canvas-widget-kind="inspectable-preview"')
    expect(markup).toContain('data-preview-source="src/cards/MetricCard.tsx:18:6"')
  })

  it('exposes optional widget interactions by widget kind', () => {
    type CounterWidgetData = CanvasJsonObject & { count: number }
    const module = defineCanvasAppReactWidgetModule<CounterWidgetData>({
      defaultData: { count: 0 },
      id: 'counter-widget',
      interaction: {
        render: ({ data }) => <button>{String(data.count)}</button>,
      },
      render: ({ data }) => <span>{String(data.count)}</span>,
      title: 'Counter widget',
      validateData: (data): data is CounterWidgetData =>
        typeof data.count === 'number',
    })
    const item = {
      data: { count: 3 },
      h: 80,
      id: 'counter-1',
      kind: 'counter-widget',
      presentation: 'counter-widget-widget',
      title: 'Counter widget',
      type: 'custom',
      w: 120,
      x: 0,
      y: 0,
    } satisfies CanvasCustomItem
    const interactions = getCanvasAppWidgetInteractions([module])

    expect(Object.keys(interactions)).toEqual(['counter-widget'])
    expect(Object.isFrozen(interactions)).toBe(true)
    expect(renderToStaticMarkup(
      <>
        {interactions['counter-widget']?.render({
          data: item.data,
          item,
          onChangeData: () => undefined,
        })}
      </>,
    )).toContain('<button>3</button>')
  })
})
