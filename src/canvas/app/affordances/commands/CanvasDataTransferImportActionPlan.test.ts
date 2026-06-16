import { describe, expect, it, vi } from 'vitest'

import {
  createCanvasDataTransferImportActionPlan,
} from './CanvasDataTransferImportActionPlan'

describe('createCanvasDataTransferImportActionPlan', () => {
  it('returns the first exclusive action plan without evaluating later resolvers', () => {
    const later = vi.fn(() => 'text')

    expect(createCanvasDataTransferImportActionPlan<string>({
      resolvers: [
        { mode: 'append', resolve: () => null },
        { mode: 'exclusive', resolve: () => 'image-file' },
        { mode: 'append', resolve: later },
      ],
    })).toEqual(['image-file'])
    expect(later).not.toHaveBeenCalled()
  })

  it('accumulates append resolver actions and skips empty values', () => {
    expect(createCanvasDataTransferImportActionPlan<string>({
      resolvers: [
        { mode: 'append', resolve: () => undefined },
        { mode: 'append', resolve: () => 'media-source' },
        { mode: 'append', resolve: () => [] },
        { mode: 'append', resolve: () => ['rich-text-source', 'text-source'] },
      ],
    })).toEqual(['media-source', 'rich-text-source', 'text-source'])
  })

  it('lets later exclusive actions override previously appended fallbacks', () => {
    expect(createCanvasDataTransferImportActionPlan<string>({
      resolvers: [
        { mode: 'append', resolve: () => 'text-source' },
        { mode: 'exclusive', resolve: () => ['table-source'] },
      ],
    })).toEqual(['table-source'])
  })
})
