import { describe, expect, it } from 'vitest'

import { parseFigJamClipboardTable } from './FigJamClipboardImport'

describe('FigJam clipboard table import', () => {
  it('normalizes TSV and fills missing cells', () => {
    expect(parseFigJamClipboardTable({
      plainText: 'Owner\tStatus\nAda\tDone\nLin',
    })).toEqual({
      columns: ['Owner', 'Status'],
      rows: [['Ada', 'Done'], ['Lin', '']],
    })
  })

  it('parses quoted CSV without claiming ordinary multiline text', () => {
    expect(parseFigJamClipboardTable({
      plainText: 'Name,Note\nAda,"Hello, world"',
    })).toEqual({
      columns: ['Name', 'Note'],
      rows: [['Ada', 'Hello, world']],
    })
    expect(parseFigJamClipboardTable({
      plainText: 'A regular\nmultiline note',
    })).toBeNull()
  })
})
