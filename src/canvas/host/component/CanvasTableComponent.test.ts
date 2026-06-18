import { describe, expect, it } from 'vitest'
import {
  CANVAS_TABLE_COMPONENT_KIND,
  createCanvasTableComponentItem,
  getCanvasTableComponentSize,
  getCanvasTableGrid,
  isCanvasTableComponentItem,
  normalizeCanvasTableRows,
} from './CanvasTableComponent'

describe('CanvasTableComponent', () => {
  it('creates a persisted table component from tabular rows', () => {
    expect(createCanvasTableComponentItem({
      id: 'component-table-import',
      point: { x: 10, y: 20 },
      rows: [
        ['Name', 'Owner'],
        ['Import CSV', 'Mina'],
        ['Review', 'Ari'],
      ],
      title: 'Roadmap',
    })).toEqual({
      accent: '#0891b2',
      columns: ['Name', 'Owner'],
      component: CANVAS_TABLE_COMPONENT_KIND,
      fill: '#ffffff',
      h: 132,
      id: 'component-table-import',
      items: ['Import CSV', 'Mina', 'Review', 'Ari'],
      stroke: '#cbd5e1',
      title: 'Roadmap',
      type: 'component',
      w: 224,
      x: 10,
      y: 20,
    })
  })

  it('normalizes empty cells, ragged rows, and large imports at the host seam', () => {
    const rows = [
      [' Name ', ''],
      ['Alice'],
      ['Bob', 'Done', 'Ignored width source'],
      ...Array.from({ length: 20 }, (_, index) => [`Extra ${index}`]),
    ]

    expect(normalizeCanvasTableRows(rows)).toEqual({
      columns: ['Name', 'Column 2', 'Column 3'],
      bodyRows: [
        ['Alice', '', ''],
        ['Bob', 'Done', 'Ignored width source'],
        ['Extra 0', '', ''],
        ['Extra 1', '', ''],
        ['Extra 2', '', ''],
        ['Extra 3', '', ''],
        ['Extra 4', '', ''],
        ['Extra 5', '', ''],
        ['Extra 6', '', ''],
        ['Extra 7', '', ''],
        ['Extra 8', '', ''],
        ['Extra 9', '', ''],
      ],
    })
  })

  it('calculates table component size with default and custom constraints', () => {
    expect(getCanvasTableComponentSize({
      columnCount: 2,
      rowCount: 3,
    })).toEqual({
      h: 132,
      w: 224,
    })

    expect(getCanvasTableComponentSize({
      columnCount: 1,
      rowCount: 1,
    }, {
      cellSize: { h: 46, w: 150 },
      maxSize: { h: 560, w: 980 },
      minSize: { h: 120, w: 260 },
    })).toEqual({
      h: 120,
      w: 260,
    })

    expect(getCanvasTableComponentSize({
      columnCount: 12,
      rowCount: 20,
    }, {
      cellSize: { h: 46, w: 150 },
      maxSize: { h: 560, w: 980 },
      minSize: { h: 120, w: 260 },
    })).toEqual({
      h: 560,
      w: 980,
    })
  })

  it('reads a table grid from existing component items', () => {
    const item = createCanvasTableComponentItem({
      id: 'component-table',
      point: { x: 0, y: 0 },
      rows: [
        ['A', 'B', 'C'],
        ['1', '2', '3'],
        ['4', '5', '6'],
      ],
    })

    expect(isCanvasTableComponentItem(item)).toBe(true)
    expect(getCanvasTableGrid(item)).toEqual({
      columns: ['A', 'B', 'C'],
      bodyRows: [
        ['1', '2', '3'],
        ['4', '5', '6'],
      ],
    })
  })
})
