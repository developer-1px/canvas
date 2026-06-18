import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasComponentPalette } from './CanvasComponentPalette'

describe('CanvasComponentPalette', () => {
  it('renders component templates and component part summaries', () => {
    const markup = renderToStaticMarkup(
      <CanvasComponentPalette
        componentSets={[{
          id: 'score-card',
          instances: [{
            itemIds: ['score-card-a', 'score-card-value-a'],
            label: 'Score card A',
            rootItemId: 'score-card-a',
            slots: [
              {
                itemId: 'score-card-a',
                label: 'Root',
                slotId: 'root',
              },
              {
                itemId: 'score-card-value-a',
                label: 'Value',
                slotId: 'value',
              },
            ],
          }],
          label: 'Score card',
          parts: [
            {
              itemIds: ['score-card-a', 'score-card-b'],
              label: 'Root',
              slotId: 'root',
            },
            {
              itemIds: ['score-card-value-a', 'score-card-value-b'],
              label: 'Value',
              slotId: 'value',
            },
          ],
        }]}
        components={[{
          accent: '#2563eb',
          fill: '#dbeafe',
          id: 'card',
          label: 'C',
          stroke: '#93c5fd',
          title: 'Card',
        }]}
        onInsert={vi.fn()}
      />,
    )

    expect(markup).toContain('component-palette')
    expect(markup).toContain('Component templates')
    expect(markup).toContain('Card')
    expect(markup).toContain('Score card')
    expect(markup).toContain('Root')
    expect(markup).toContain('Value')
    expect(markup).toContain('>2<')
  })
})
