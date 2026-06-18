import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type {
  CanvasAppItemsChange,
} from './CanvasAppDocumentContracts'
import {
  commitCanvasAppHostItemsChange,
  createCanvasAppHostItemsChangeCommitter,
} from './CanvasAppItemsChangeCommitter'
import type {
  CanvasAppItemsChangeTransformer,
} from '../../extensions/items-change-transformers'

type HostItem = {
  id: string
  kind: 'ppt-shape'
  slideId: string
  x: number
}

describe('CanvasAppItemsChangeCommitter', () => {
  it('transforms and commits host item changes without a Canvas document controller', () => {
    const currentItems = [createHostItem('ppt-shape-before', 1)]
    const replacement = createHostItem('ppt-shape-after', 10)
    const selection = {
      after: [replacement.id],
      before: [currentItems[0].id],
    }
    const commitItemsChange = vi.fn(() => true)
    const itemsChangeTransformer: CanvasAppItemsChangeTransformer<HostItem> = {
      id: 'ppt-line-sync',
      transform: ({ change, currentItems }) =>
        change.type === 'replace-changed'
          ? {
              ...change,
              items: change.items.map((item) => ({
                ...item,
                slideId: currentItems[0]?.slideId ?? item.slideId,
                x: item.x + currentItems.length,
              })),
            }
          : change,
    }

    const result = commitCanvasAppHostItemsChange({
      change: {
        items: [replacement],
        type: 'replace-changed',
      },
      commitItemsChange,
      currentItems,
      itemsChangeTransformers: [itemsChangeTransformer],
      selection,
    })

    const transformedChange: CanvasAppItemsChange<HostItem> = {
      items: [{
        ...replacement,
        slideId: currentItems[0].slideId,
        x: 11,
      }],
      type: 'replace-changed',
    }
    expect(result).toEqual({
      committed: true,
      currentItems,
      selection,
      transformedChange,
    })
    expect(commitItemsChange).toHaveBeenCalledWith(
      transformedChange,
      selection,
    )
  })

  it('creates a callable committer that reads the latest host items for each commit', () => {
    let currentItems = [createHostItem('ppt-shape-initial', 0)]
    const getCurrentItems = vi.fn(() => currentItems)
    const committedChanges: CanvasAppItemsChange<HostItem>[] = []
    const itemsChangeTransformer: CanvasAppItemsChangeTransformer<HostItem> = {
      id: 'ppt-add-slide-sync',
      transform: ({ change, currentItems }) =>
        change.type === 'add'
          ? {
              ...change,
              items: change.items.map((item) => ({
                ...item,
                slideId: currentItems[0]?.slideId ?? item.slideId,
              })),
            }
          : change,
    }
    const committer = createCanvasAppHostItemsChangeCommitter<HostItem>({
      commitItemsChange: (change) => {
        committedChanges.push(change)

        return true
      },
      getCurrentItems,
      itemsChangeTransformers: [itemsChangeTransformer],
    })

    currentItems = [createHostItem('ppt-shape-latest', 20, 'slide-latest')]

    expect(committer({
      items: [createHostItem('ppt-shape-new', 2, 'slide-stale')],
      type: 'add',
    })).toBe(true)

    expect(getCurrentItems).toHaveBeenCalledTimes(1)
    expect(committedChanges).toEqual([{
      items: [createHostItem('ppt-shape-new', 2, 'slide-latest')],
      type: 'add',
    }])

    currentItems = [createHostItem('ppt-shape-final', 30, 'slide-final')]

    const result = committer.commit({
      change: {
        items: [createHostItem('ppt-shape-second', 3, 'slide-stale')],
        type: 'add',
      },
    })

    expect(result).toEqual({
      committed: true,
      currentItems,
      selection: undefined,
      transformedChange: {
        items: [createHostItem('ppt-shape-second', 3, 'slide-final')],
        type: 'add',
      },
    })
  })

  it('returns a skipped result when the host refuses the transformed commit', () => {
    const currentItems = [createHostItem('ppt-shape-1', 0)]
    const change: CanvasAppItemsChange<HostItem> = {
      selection: [currentItems[0].id],
      type: 'remove-selection',
    }

    expect(commitCanvasAppHostItemsChange({
      change,
      commitItemsChange: () => false,
      currentItems,
    })).toEqual({
      committed: false,
      currentItems,
      selection: undefined,
      transformedChange: change,
    })
  })
})

function createHostItem(
  id: string,
  x: number,
  slideId = 'slide-1',
): HostItem {
  return {
    id,
    kind: 'ppt-shape',
    slideId,
    x,
  }
}
