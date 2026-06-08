import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasTableCsvSourceFromDataTransfer,
  getCanvasTableCsvSourceFromText,
  getCanvasTableInsertCenter,
  insertCanvasTableSource,
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
