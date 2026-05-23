import { describe, expect, it } from 'vitest'
import {
  snapshotCanvasAppDescriptorArray,
  snapshotCanvasAppRecord,
  snapshotCanvasAppShortcutDescriptor,
} from './CanvasAppDescriptorSnapshot'

describe('CanvasAppDescriptorSnapshot', () => {
  it('snapshots descriptor arrays against later external mutation', () => {
    const command = {
      id: 'publish',
      label: 'Publish',
      run: () => undefined,
      title: 'Publish',
    }
    const snapshot = snapshotCanvasAppDescriptorArray([command])

    command.title = 'Mutated'

    expect(snapshot).toEqual([{
      id: 'publish',
      label: 'Publish',
      run: command.run,
      title: 'Publish',
    }])
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot[0])).toBe(true)
  })

  it('snapshots shortcut descriptors with frozen nested shortcut data', () => {
    const tool = {
      createItem: () => null,
      id: 'risk',
      label: 'Risk',
      shortcut: {
        key: 'r',
      },
      title: 'Risk',
    }
    const snapshot = snapshotCanvasAppShortcutDescriptor(tool)

    tool.shortcut.key = 'x'

    expect(snapshot.shortcut).toEqual({ key: 'r' })
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.shortcut)).toBe(true)
  })

  it('snapshots records with a frozen record shell', () => {
    const renderRisk = () => null
    const renderers: Record<string, () => unknown> = {
      risk: renderRisk,
    }
    const snapshot = snapshotCanvasAppRecord(renderers)

    renderers.risk = () => 'mutated'

    expect(snapshot.risk).toBe(renderRisk)
    expect(Object.isFrozen(snapshot)).toBe(true)
  })
})
