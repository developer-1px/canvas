import { describe, expect, it, vi } from 'vitest'

import {
  createCanvasDataTransferImportActionPlanFromRegistry,
  createCanvasDataTransferImportRegistry,
  getCanvasDataTransferImportRegistryMetadata,
  type CanvasDataTransferImportRegistryResolver,
} from './CanvasDataTransferImportRegistry'

type ImportAction =
  | {
    kind: 'image-file'
    source: string
  }
  | {
    kind: 'table-source'
    source: string
  }
  | {
    kind: 'text-source'
    source: string
  }

type ImportScope = 'drop' | 'paste'

describe('CanvasDataTransferImportRegistry', () => {
  it('exposes scope-specific resolver metadata in execution order', () => {
    const registry = createCanvasDataTransferImportRegistry<
      ImportAction,
      ImportScope
    >({
      resolvers: [
        createResolver({
          id: 'text',
          order: 30,
          scope: ['paste', 'drop'],
          supportedFormats: ['text/plain'],
        }),
        createResolver({
          id: 'image-file',
          order: 10,
          scope: 'paste',
          supportedFormats: ['image/png'],
          title: 'Image file',
        }),
        createResolver({
          id: 'table-file',
          order: 5,
          scope: 'drop',
          supportedFormats: ['text/csv'],
        }),
      ],
    })

    expect(getCanvasDataTransferImportRegistryMetadata({
      registry,
      scope: 'paste',
    })).toEqual([
      {
        id: 'image-file',
        mode: 'append',
        order: 0,
        scope: 'paste',
        supportedFormats: ['image/png'],
        title: 'Image file',
      },
      {
        id: 'text',
        mode: 'append',
        order: 1,
        scope: 'paste',
        supportedFormats: ['text/plain'],
        title: 'text',
      },
    ])
    expect(getCanvasDataTransferImportRegistryMetadata({
      registry,
      scope: 'drop',
    }).map((item) => item.id)).toEqual([
      'table-file',
      'text',
    ])
  })

  it('short-circuits later resolvers when an exclusive resolver returns actions', () => {
    const later = vi.fn(() => ({
      kind: 'text-source',
      source: 'plain',
    } as const))
    const registry = createCanvasDataTransferImportRegistry<
      ImportAction,
      ImportScope
    >({
      resolvers: [
        createResolver({
          id: 'image-file',
          mode: 'exclusive',
          resolve: () => ({
            kind: 'image-file',
            source: 'clipboard.png',
          }),
          scope: 'paste',
        }),
        createResolver({
          id: 'text',
          resolve: later,
          scope: 'paste',
        }),
      ],
    })

    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer: createDataTransfer({}),
      registry,
      scope: 'paste',
    })).toEqual([
      {
        kind: 'image-file',
        source: 'clipboard.png',
      },
    ])
    expect(later).not.toHaveBeenCalled()
  })

  it('accumulates append resolver actions and skips empty results', () => {
    const registry = createCanvasDataTransferImportRegistry<
      ImportAction,
      ImportScope
    >({
      resolvers: [
        createResolver({
          id: 'empty',
          resolve: () => null,
          scope: 'paste',
        }),
        createResolver({
          id: 'table',
          resolve: () => [{
            kind: 'table-source',
            source: 'csv',
          }],
          scope: 'paste',
        }),
        createResolver({
          id: 'text',
          resolve: ({ dataTransfer }) => ({
            kind: 'text-source',
            source: dataTransfer?.getData('text/plain') ?? '',
          }),
          scope: 'paste',
        }),
      ],
    })

    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer: createDataTransfer({
        'text/plain': 'hello',
      }),
      registry,
      scope: 'paste',
    })).toEqual([
      {
        kind: 'table-source',
        source: 'csv',
      },
      {
        kind: 'text-source',
        source: 'hello',
      },
    ])
  })

  it('keeps existing action planner semantics for later exclusive overrides', () => {
    const registry = createCanvasDataTransferImportRegistry<
      ImportAction,
      ImportScope
    >({
      resolvers: [
        createResolver({
          id: 'text',
          mode: 'append',
          order: 1,
          resolve: () => ({
            kind: 'text-source',
            source: 'fallback',
          }),
          scope: 'paste',
        }),
        createResolver({
          id: 'table',
          mode: 'exclusive',
          order: 2,
          resolve: () => ({
            kind: 'table-source',
            source: 'html-table',
          }),
          scope: 'paste',
        }),
      ],
    })

    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer: createDataTransfer({}),
      registry,
      scope: 'paste',
    })).toEqual([
      {
        kind: 'table-source',
        source: 'html-table',
      },
    ])
  })

  it('returns an empty plan when scoped resolvers produce no actions', () => {
    const registry = createCanvasDataTransferImportRegistry<
      ImportAction,
      ImportScope
    >({
      resolvers: [
        createResolver({
          id: 'image',
          mode: 'exclusive',
          resolve: () => undefined,
          scope: 'drop',
        }),
      ],
    })

    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer: null,
      registry,
      scope: 'drop',
    })).toEqual([])
    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer: null,
      registry,
      scope: 'paste',
    })).toEqual([])
  })
})

function createResolver(
  input: Partial<CanvasDataTransferImportRegistryResolver<
    ImportAction,
    ImportScope
  >> & Pick<CanvasDataTransferImportRegistryResolver<
    ImportAction,
    ImportScope
  >, 'id' | 'scope'>,
): CanvasDataTransferImportRegistryResolver<ImportAction, ImportScope> {
  return {
    mode: 'append',
    resolve: () => null,
    ...input,
  }
}

function createDataTransfer(values: Record<string, string>): DataTransfer {
  return {
    getData: vi.fn((type: string) => values[type] ?? ''),
  } as unknown as DataTransfer
}
