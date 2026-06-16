import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasTableCsvSourceFromDataTransfer,
  getCanvasTableCsvSourceFromText,
  getCanvasTableInsertCenter,
  getCanvasTableSourceFromDataTransfer,
  getCanvasTableSourceFromHTML,
  insertCanvasTableSource,
  readCanvasTableFileSource,
} from './CanvasTableImport'

describe('CanvasTableImport', () => {
  it('parses CSV and spreadsheet clipboard text into import sources', () => {
    expect(getCanvasTableCsvSourceFromText(
      'Name,Owner\n"Import, CSV",Mina\nReview,Ari',
      { name: 'roadmap.csv' },
    )).toEqual({
      name: 'roadmap.csv',
      rows: [
        ['Name', 'Owner'],
        ['Import, CSV', 'Mina'],
        ['Review', 'Ari'],
      ],
    })

    expect(getCanvasTableCsvSourceFromText(
      'Name\tOwner\nImport CSV\tMina',
    )).toEqual({
      rows: [
        ['Name', 'Owner'],
        ['Import CSV', 'Mina'],
      ],
    })
  })

  it('ignores plain non-tabular clipboard text', () => {
    expect(getCanvasTableCsvSourceFromText('hello, world')).toBeNull()
    expect(getCanvasTableCsvSourceFromText('just text')).toBeNull()
  })

  it('reads table text from clipboard data transfer types', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) =>
        type === 'text/plain' ? 'A\tB\n1\t2' : '',
      ),
    } as unknown as DataTransfer

    expect(getCanvasTableCsvSourceFromDataTransfer(dataTransfer)).toEqual({
      rows: [
        ['A', 'B'],
        ['1', '2'],
      ],
    })
  })

  it('reads TSV table text before other clipboard table formats', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) => ({
        'text/csv': 'Wrong,Value\n3,4',
        'text/plain': 'Plain\tValue\n5\t6',
        'text/tab-separated-values': 'Metric\tValue\nUsers\t42',
      })[type] ?? ''),
    } as unknown as DataTransfer

    expect(getCanvasTableSourceFromDataTransfer(dataTransfer)).toEqual({
      format: 'text-tsv',
      rows: [
        ['Metric', 'Value'],
        ['Users', '42'],
      ],
    })
  })

  it('reads TSV table files into import sources', async () => {
    const file = Object.assign(
      new Blob(['Metric\tValue\nUsers\t42'], {
        type: 'text/tab-separated-values',
      }),
      { name: 'metrics.tsv' },
    )

    await expect(readCanvasTableFileSource(file)).resolves.toEqual({
      format: 'text-tsv',
      name: 'metrics.tsv',
      rows: [
        ['Metric', 'Value'],
        ['Users', '42'],
      ],
    })
  })

  it('parses HTML table clipboard markup into import sources', () => {
    expect(getCanvasTableSourceFromHTML(`
      <table>
        <thead>
          <tr><th>Phase</th><th>Owner</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Design &amp; QA</td>
            <td>Mina&nbsp;Kim<script>ignored()</script></td>
          </tr>
          <tr><td colspan="2">Ship</td></tr>
        </tbody>
      </table>
    `)).toEqual({
      format: 'text-html',
      rows: [
        ['Phase', 'Owner'],
        ['Design & QA', 'Mina Kim'],
        ['Ship', ''],
      ],
    })
  })

  it('ignores HTML that is not a useful table', () => {
    expect(getCanvasTableSourceFromHTML('<p>hello</p>')).toBeNull()
    expect(getCanvasTableSourceFromHTML('<table><tr><td>One</td></tr></table>'))
      .toBeNull()
  })

  it('inserts imported tables centered on viewport or drop point', () => {
    const commitItemsChange = vi.fn(() => true)
    const createId = vi.fn(() => 'component-table-1')
    const source = {
      name: 'roadmap.csv',
      rows: [
        ['Name', 'Owner'],
        ['Import CSV', 'Mina'],
      ],
    }

    expect(insertCanvasTableSource({
      center: { x: 200, y: 100 },
      context: {
        commitItemsChange,
        createId,
        selection: ['component-sticky'],
      },
      source,
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            component: 'table',
            columns: ['Name', 'Owner'],
            id: 'component-table-1',
            items: ['Import CSV', 'Mina'],
            title: 'roadmap',
            x: 88,
            y: 56,
          }),
        ],
      },
      {
        before: ['component-sticky'],
        after: ['component-table-1'],
      },
    )
  })

  it('derives insert center from screen coordinates or viewport center', () => {
    const stageElement = {
      getScreenPoint: vi.fn(() => ({ x: 410, y: 260 })),
      getViewportCenter: vi.fn(() => ({ x: 100, y: 120 })),
    }
    const viewport = { scale: 2, x: 10, y: 20 }

    expect(getCanvasTableInsertCenter({
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 200, y: 120 })
    expect(getCanvasTableInsertCenter({
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport: { scale: Number.NaN, x: 10, y: 20 },
    })).toEqual({ x: 4000, y: 2400 })
    expect(getCanvasTableInsertCenter({
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 100, y: 120 })
  })
})
