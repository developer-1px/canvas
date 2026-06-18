import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_TABLE_CSV_MIME_TYPES,
  CANVAS_TABLE_FILE_IMPORT_SUPPORTED_FORMATS,
  CANVAS_TABLE_IMPORT_MODEL,
  CANVAS_TABLE_IMPORT_SUPPORTED_FORMATS,
  CANVAS_TABLE_TSV_MIME_TYPES,
  getCanvasTableCsvSourceFromDataTransfer,
  getCanvasTableCsvSourceFromText,
  getCanvasTableColumnCount,
  getCanvasTableFileFromDataTransfer,
  getCanvasTableFilesFromDataTransfer,
  getCanvasTableFilesFromList,
  getCanvasTableInsertCenter,
  getCanvasTableSourceFromDataTransfer,
  getCanvasTableSourceFromHTML,
  getCanvasTableSourceFromText,
  insertCanvasTableSource,
  normalizeCanvasTableRows,
  readCanvasTableFileSources,
  readCanvasTableFileSource,
  routeCanvasTableImportTargetReplace,
} from './CanvasTableImport'

describe('CanvasTableImport', () => {
  it('exposes a stable model metadata value', () => {
    expect(CANVAS_TABLE_IMPORT_MODEL).toBe('canvas-table-import')
  })

  it('exposes supported clipboard and file formats in reader priority order', () => {
    expect(CANVAS_TABLE_IMPORT_SUPPORTED_FORMATS).toEqual([
      'text/tab-separated-values',
      'text/csv',
      'text/html',
      'text/markdown',
      'text/x-markdown',
      'text/plain',
    ])
    expect(CANVAS_TABLE_FILE_IMPORT_SUPPORTED_FORMATS).toEqual([
      'Files',
      'application/vnd.ms-excel',
      'text/comma-separated-values',
      'text/csv',
      'text/tab-separated-values',
    ])
  })

  it('reads every advertised clipboard table format through the DataTransfer reader', () => {
    const fixtures = {
      'text/csv': {
        format: 'text-csv',
        rows: [
          ['Name', 'Owner'],
          ['Import', 'Mina'],
        ],
        text: 'Name,Owner\nImport,Mina',
      },
      'text/html': {
        format: 'text-html',
        rows: [
          ['Phase', 'Owner'],
          ['Build', 'Ari'],
        ],
        text: '<table><tr><th>Phase</th><th>Owner</th></tr><tr><td>Build</td><td>Ari</td></tr></table>',
      },
      'text/markdown': {
        format: 'text-markdown',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
        text: '| Metric | Value |\n| --- | --- |\n| Users | 42 |',
      },
      'text/plain': {
        format: 'text-delimited',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
        text: 'Metric\tValue\nUsers\t42',
      },
      'text/tab-separated-values': {
        format: 'text-tsv',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
        text: 'Metric\tValue\nUsers\t42',
      },
      'text/x-markdown': {
        format: 'text-markdown',
        rows: [
          ['Phase', 'Owner'],
          ['Import', 'Mina'],
        ],
        text: '| Phase | Owner |\n| --- | --- |\n| Import | Mina |',
      },
    } as const

    for (const type of CANVAS_TABLE_IMPORT_SUPPORTED_FORMATS) {
      const fixture = fixtures[type]
      const dataTransfer = {
        getData: vi.fn((requestedType: string) =>
          requestedType === type ? fixture.text : '',
        ),
      } as unknown as DataTransfer

      expect(getCanvasTableSourceFromDataTransfer(dataTransfer)).toEqual({
        format: fixture.format,
        rows: fixture.rows,
      })
    }
  })

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

  it('reads every advertised table file MIME type through the file reader', async () => {
    for (const type of CANVAS_TABLE_CSV_MIME_TYPES) {
      await expect(readCanvasTableFileSource(createTableFile(
        'metrics.csv',
        type,
      ))).resolves.toEqual({
        format: 'text-csv',
        name: 'metrics.csv',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
      })
    }

    for (const type of CANVAS_TABLE_TSV_MIME_TYPES) {
      await expect(readCanvasTableFileSource(createTableFile(
        'metrics.tsv',
        type,
        0,
        'Metric\tValue\nUsers\t42',
      ))).resolves.toEqual({
        format: 'text-tsv',
        name: 'metrics.tsv',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
      })
    }
  })

  it('reads multiple table files into source arrays', async () => {
    const csvFile = createTableFile('metrics.csv', 'text/csv', 1)
    const ignoredFile = createTableFile('notes.txt', 'text/plain', 2)
    const failedFile = createFailingTableFile('broken.csv', 'text/csv')
    const tsvFile = createTableFile(
      'roadmap.tsv',
      'text/tab-separated-values',
      3,
      'Phase\tOwner\nImport\tMina',
    )

    await expect(readCanvasTableFileSources([
      csvFile,
      ignoredFile,
      failedFile,
      tsvFile,
    ])).resolves.toEqual([
      {
        format: 'text-csv',
        name: 'metrics.csv',
        rows: [
          ['Metric', 'Value'],
          ['Users', '42'],
        ],
      },
      {
        format: 'text-tsv',
        name: 'roadmap.tsv',
        rows: [
          ['Phase', 'Owner'],
          ['Import', 'Mina'],
        ],
      },
    ])
  })

  it('keeps the single DataTransfer file helper focused on DataTransfer.files', () => {
    const csvFile = createTableFile('metrics.csv', 'text/csv')
    const tsvFile = createTableFile('drop.tsv', 'text/tab-separated-values')
    const ignoredFile = createTableFile('notes.txt', 'text/plain')
    const dataTransfer = createDataTransferWithFiles({
      files: [ignoredFile, csvFile],
      items: [createFileItem(tsvFile)],
    })

    expect(getCanvasTableFileFromDataTransfer(dataTransfer)).toBe(csvFile)
  })

  it('collects CSV and TSV files from clipboard DataTransfer.files', () => {
    const csvFile = createTableFile('metrics.csv', 'text/csv', 1)
    const tsvFile = createTableFile('roadmap.tsv', 'text/tab-separated-values', 2)
    const extensionCsvFile = createTableFile('fallback.csv', 'text/plain', 3)
    const ignoredFile = createTableFile('notes.txt', 'text/plain', 4)

    expect(getCanvasTableFilesFromList(createFileList([
      ignoredFile,
      csvFile,
      tsvFile,
      extensionCsvFile,
    ]))).toEqual([
      csvFile,
      tsvFile,
      extensionCsvFile,
    ])
    expect(getCanvasTableFilesFromDataTransfer(createDataTransferWithFiles({
      files: [ignoredFile, csvFile, tsvFile, extensionCsvFile],
    }))).toEqual([
      csvFile,
      tsvFile,
      extensionCsvFile,
    ])
  })

  it('collects CSV and TSV files from drop DataTransfer items', () => {
    const csvFile = createTableFile('drop.csv', 'text/csv', 1)
    const tsvFile = createTableFile('drop.tsv', 'text/plain', 2)
    const ignoredFile = createTableFile('image.png', 'image/png', 3)
    const dataTransfer = createDataTransferWithFiles({
      files: [],
      items: [
        createStringItem(),
        createFileItem(csvFile),
        createFileItem(tsvFile),
        createFileItem(ignoredFile),
      ],
    })

    expect(getCanvasTableFilesFromDataTransfer(dataTransfer)).toEqual([
      csvFile,
      tsvFile,
    ])
  })

  it('dedupes files reported by both DataTransfer.files and items', () => {
    const csvFile = createTableFile('metrics.csv', 'text/csv', 1)
    const duplicateCsvFile = createTableFile('metrics.csv', 'text/csv', 1)
    const tsvFile = createTableFile('metrics.tsv', 'text/tab-separated-values', 2)
    const dataTransfer = createDataTransferWithFiles({
      files: [csvFile],
      items: [
        createFileItem(duplicateCsvFile),
        createFileItem(tsvFile),
      ],
    })

    expect(getCanvasTableFilesFromDataTransfer(dataTransfer)).toEqual([
      csvFile,
      tsvFile,
    ])
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

  it('parses Markdown table clipboard text into import sources', () => {
    expect(getCanvasTableSourceFromText(`
      | Metric | Value |
      | :--- | ---: |
      | Users | 42 |
      | Teams | 7 |
    `, {
      format: 'text-markdown',
    })).toEqual({
      format: 'text-markdown',
      rows: [
        ['Metric', 'Value'],
        ['Users', '42'],
        ['Teams', '7'],
      ],
    })
    expect(getCanvasTableSourceFromDataTransfer({
      getData: vi.fn((type: string) =>
        type === 'text/plain'
          ? '| Metric | Value |\n| --- | --- |\n| Users | 42 |'
          : '',
      ),
    } as unknown as DataTransfer)).toEqual({
      format: 'text-markdown',
      rows: [
        ['Metric', 'Value'],
        ['Users', '42'],
      ],
    })
    expect(getCanvasTableSourceFromDataTransfer({
      getData: vi.fn((type: string) =>
        type === 'text/markdown'
          ? '| Phase | Owner |\n| --- | --- |\n| Import | Mina |'
          : '',
      ),
    } as unknown as DataTransfer)).toEqual({
      format: 'text-markdown',
      rows: [
        ['Phase', 'Owner'],
        ['Import', 'Mina'],
      ],
    })
  })

  it('extracts a Markdown table block from surrounding text and normalizes cell text', () => {
    expect(getCanvasTableSourceFromText([
      'The table below should be imported.',
      '',
      '| Name | Notes | Link |',
      '| --- | --- | --- |',
      '| Alpha\\|Beta | `x|y` | [Docs](https://example.com) |',
      '| **Bold** | _Italic_ | Plain |',
      '| C:\\Temp | [Local](/guide) | Plain |',
      '',
      'Ignore this trailing paragraph.',
    ].join('\n'), {
      format: 'text-markdown',
    })).toEqual({
      format: 'text-markdown',
      rows: [
        ['Name', 'Notes', 'Link'],
        ['Alpha|Beta', 'x|y', 'Docs'],
        ['Bold', 'Italic', 'Plain'],
        ['C:\\Temp', 'Local', 'Plain'],
      ],
    })
  })

  it('does not treat non-table pipe text as a Markdown table source', () => {
    expect(getCanvasTableSourceFromText('Alpha | Beta', {
      format: 'text-markdown',
    })).toBeNull()
    expect(getCanvasTableSourceFromDataTransfer({
      getData: vi.fn((type: string) =>
        type === 'text/plain'
          ? 'Alpha | Beta'
          : '',
      ),
    } as unknown as DataTransfer)).toBeNull()
  })

  it('ignores HTML that is not a useful table', () => {
    expect(getCanvasTableSourceFromHTML('<p>hello</p>')).toBeNull()
    expect(getCanvasTableSourceFromHTML('<table><tr><td>One</td></tr></table>'))
      .toBeNull()
  })

  it('normalizes imported rows for consumer table constraints', () => {
    const rows = normalizeCanvasTableRows([
      [' Metric ', ' Current ', ' Target ', ' Ignored '],
      ['Drafts', ' two hours ', 'thirty minutes', 'Ignored'],
      ['', ' ', ''],
      ['Review passes', '4', '1', 'Ignored'],
    ], {
      maxCellLength: 6,
      maxColumns: 3,
      maxRows: 2,
    })

    expect(rows).toEqual([
      ['Metric', 'Curren', 'Target'],
      ['Drafts', 'two ho', 'thirty'],
    ])
    expect(getCanvasTableColumnCount(rows)).toBe(3)
  })

  it('routes selected table-like targets to rows replacement intent', () => {
    const sources = [
      getCanvasTableSourceFromText('Metric\tValue\nUsers\t42', {
        format: 'text-tsv',
      })!,
      getCanvasTableSourceFromText('Name,Owner\nImport,Mina', {
        format: 'text-csv',
      })!,
      getCanvasTableSourceFromHTML(
        '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>',
      )!,
      getCanvasTableSourceFromText(
        '| Phase | Owner |\n| --- | --- |\n| Import | Mina |',
        { format: 'text-markdown' },
      )!,
    ]
    const getTarget = vi.fn(({ selection }) => ({
      id: selection[0] ?? 'table-1',
      selection,
    }))

    for (const source of sources) {
      const route = routeCanvasTableImportTargetReplace({
        getTarget,
        selection: ['table-1'],
        source,
      })

      expect(route).toMatchObject({
        intent: {
          kind: 'table-rows-replace',
          rows: source.rows,
          source,
          target: {
            id: 'table-1',
            selection: ['table-1'],
          },
        },
        kind: 'table-rows-replace',
        rows: source.rows,
        status: 'routed',
      })
      expect(Object.isFrozen(route)).toBe(true)
    }
  })

  it('falls back to table insertion when no table target is available', () => {
    const source = getCanvasTableSourceFromText('Metric,Value\nUsers,42', {
      format: 'text-csv',
    })!
    const route = routeCanvasTableImportTargetReplace({
      getTarget: () => null,
      selection: [],
      source,
    })

    expect(route).toEqual({
      kind: 'table-insert',
      reason: 'no-target',
      rows: source.rows,
      source,
      status: 'fallback',
    })
    expect(Object.isFrozen(route)).toBe(true)
  })

  it('lets hosts disable or normalize table replacement before target lookup', () => {
    const source = getCanvasTableSourceFromText('A,B\n1,2\n3,4', {
      format: 'text-csv',
    })!
    const getTarget = vi.fn(() => ({
      id: 'table-1',
      selection: ['table-1'],
    }))

    expect(routeCanvasTableImportTargetReplace({
      disabled: true,
      getTarget,
      selection: ['table-1'],
      source,
    })).toEqual({
      kind: 'table-insert',
      reason: 'disabled',
      rows: source.rows,
      source,
      status: 'fallback',
    })
    expect(routeCanvasTableImportTargetReplace({
      getTarget,
      normalizeRows: () => [],
      selection: ['table-1'],
      source,
    })).toEqual({
      kind: 'table-insert',
      reason: 'empty-source',
      rows: [],
      source,
      status: 'fallback',
    })
    expect(routeCanvasTableImportTargetReplace({
      getTarget,
      normalizeRows: ({ source }) => normalizeCanvasTableRows(source.rows, {
        maxRows: 2,
      }),
      selection: ['table-1'],
      source,
    })).toMatchObject({
      intent: {
        rows: [
          ['A', 'B'],
          ['1', '2'],
        ],
      },
      kind: 'table-rows-replace',
      rows: [
        ['A', 'B'],
        ['1', '2'],
      ],
      status: 'routed',
    })
    expect(getTarget).toHaveBeenCalledTimes(1)
  })

  it('pads rows and applies fallback rows when normalized rows are empty', () => {
    expect(normalizeCanvasTableRows([
      ['Name', 'Owner', 'Status'],
      ['Import', 'Mina'],
    ])).toEqual([
      ['Name', 'Owner', 'Status'],
      ['Import', 'Mina', ''],
    ])

    expect(normalizeCanvasTableRows([
      ['  ', ''],
    ], {
      fallbackRows: [
        ['Metric', 'Value'],
        ['Users', '42'],
      ],
    })).toEqual([
      ['Metric', 'Value'],
      ['Users', '42'],
    ])
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

function createTableFile(
  name: string,
  type: string,
  lastModified = 0,
  text = 'Metric,Value\nUsers,42',
) {
  return Object.assign(new Blob([text], { type }), {
    lastModified,
    name,
  }) as File
}

function createFailingTableFile(
  name: string,
  type: string,
) {
  return {
    name,
    text: vi.fn(() => Promise.reject(new Error('read failed'))),
    type,
  } as unknown as File
}

function createFileList(files: readonly File[]): FileList {
  return Object.assign([...files], {
    item: (index: number) => files[index] ?? null,
  }) as unknown as FileList
}

function createDataTransferWithFiles({
  files = [],
  items = [],
}: {
  files?: readonly File[]
  items?: readonly DataTransferItem[]
}): DataTransfer {
  return {
    files: createFileList(files),
    getData: vi.fn(() => ''),
    items: createDataTransferItemList(items),
  } as unknown as DataTransfer
}

function createDataTransferItemList(
  items: readonly DataTransferItem[],
): DataTransferItemList {
  return Object.assign([...items], {
    item: (index: number) => items[index] ?? null,
  }) as unknown as DataTransferItemList
}

function createFileItem(file: File): DataTransferItem {
  return {
    getAsFile: vi.fn(() => file),
    kind: 'file',
  } as unknown as DataTransferItem
}

function createStringItem(): DataTransferItem {
  return {
    getAsFile: vi.fn(() => null),
    kind: 'string',
  } as unknown as DataTransferItem
}
