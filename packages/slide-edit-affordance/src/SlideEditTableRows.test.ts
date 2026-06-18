import { describe, expect, it } from 'vitest'

import {
  getSlideEditTableRowsJSONPasteValue,
  getSlideEditTableRowsPasteCommandEffect,
  SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE,
} from './SlideEditTableRows'
import {
  getSlideEditTableRowsJSONPasteValue as getSlideEditTableRowsJSONPasteValueFromPackage,
} from './index'

describe('SlideEditTableRows', () => {
  it('reads custom MIME direct rows JSON values first', () => {
    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE]: JSON.stringify({
          columns: ['Metric', 'Value'],
          rows: [
            {
              Metric: 'Revenue',
              Value: 42,
            },
            {
              Metric: 'Risk',
              Value: false,
            },
          ],
        }),
        'application/json': '{"tableRows":[["Ignored"]]}',
      }),
    })).toEqual({
      columnCount: 2,
      format: 'json',
      payloadLength: expect.any(Number),
      rowCount: 3,
      rows: [
        ['Metric', 'Value'],
        ['Revenue', '42'],
        ['Risk', 'false'],
      ],
      sourceType: SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE,
      surface: 'table-rows',
    })

    expect(getSlideEditTableRowsJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE]:
          '[["Name","Count"],["A",1]]',
      }),
    })).toMatchObject({
      rows: [
        ['Name', 'Count'],
        ['A', '1'],
      ],
    })
  })

  it('reads wrapped table rows from general JSON candidates', () => {
    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          tableRows: [
            ['Name', 'Count'],
            ['A', 1],
            ['B', 2],
          ],
        }),
      }),
    })).toMatchObject({
      rows: [
        ['Name', 'Count'],
        ['A', '1'],
        ['B', '2'],
      ],
      wrapper: 'tableRows',
    })

    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': JSON.stringify({
          table: {
            headers: ['Name', 'Count'],
            rows: [
              {
                Count: 2,
                Name: 'B',
              },
            ],
          },
        }),
      }),
      storagePolicy: {
        maxCellLength: 4,
        maxColumns: 2,
        maxRows: 2,
        normalizeCell: ({ value }) => value.toUpperCase(),
      },
    })).toMatchObject({
      columnCount: 2,
      rowCount: 2,
      rows: [
        ['NAME', 'COUN'],
        ['B', '2'],
      ],
      wrapper: 'table',
    })
  })

  it('converts table rows paste values to replace command effects', () => {
    const pasteValue = getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': JSON.stringify({
          rows: [
            ['Name', 'Count'],
            ['A', 1],
          ],
        }),
      }),
    })!

    expect(getSlideEditTableRowsPasteCommandEffect({
      pasteValue,
      slideId: 'slide-a',
      target: {
        isTable: true,
        objectId: 'table-a',
      },
    })).toEqual({
      metadata: {
        columnCount: 2,
        format: 'json',
        payloadLength: expect.any(Number),
        rowCount: 2,
        targetIds: ['table-a'],
      },
      payload: {
        id: 'replace-table-rows',
        objectId: 'table-a',
        rows: [
          ['Name', 'Count'],
          ['A', '1'],
        ],
      },
      selection: {
        objectIds: ['table-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('ignores unavailable table rows paste routes', () => {
    const pasteValue = getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE]:
          '[["Name"],["A"]]',
      }),
    })!

    expect(getSlideEditTableRowsPasteCommandEffect({
      pasteValue,
      target: null,
    })).toBeNull()
    expect(getSlideEditTableRowsPasteCommandEffect({
      pasteValue,
      target: {
        isTable: false,
        objectId: 'shape-a',
      },
    })).toBeNull()
    expect(getSlideEditTableRowsPasteCommandEffect({
      pasteValue,
      target: {
        isLocked: true,
        isTable: true,
        objectId: 'table-a',
      },
    })).toBeNull()
    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '[["Direct generic"]]',
      }),
    })).toBeNull()
    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
    expect(getSlideEditTableRowsJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE]: '[["   "]]',
      }),
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}
