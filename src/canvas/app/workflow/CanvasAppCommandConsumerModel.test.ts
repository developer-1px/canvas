import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppCommandConsumerModel } from './CanvasAppCommandConsumerModel'
import type { CanvasAppCommandRuntime } from './CanvasAppCommandConsumerContracts'

describe('CanvasAppCommandConsumerModel', () => {
  it('builds toolbar command handlers from command runtime callbacks', () => {
    const commands = createCommands()
    const model = getCanvasAppCommandConsumerModel(commands)

    model.control.commandHandlers.onAlign('alignLeft')
    model.control.commandHandlers.onDelete()
    model.control.commandHandlers.onDistribute('distributeHorizontal')
    model.control.commandHandlers.onDuplicate()
    model.control.commandHandlers.onGroup()
    model.control.commandHandlers.onLock()
    model.control.commandHandlers.onRedo()
    model.control.commandHandlers.onUndo()
    model.control.commandHandlers.onUngroup()
    model.control.commandHandlers.onUnlockAll()

    expect(commands.alignSelection).toHaveBeenCalledWith('alignLeft')
    expect(commands.deleteSelection).toHaveBeenCalledTimes(1)
    expect(commands.distributeSelection).toHaveBeenCalledWith(
      'distributeHorizontal',
    )
    expect(commands.duplicateSelection).toHaveBeenCalledTimes(1)
    expect(commands.groupSelection).toHaveBeenCalledTimes(1)
    expect(commands.lockSelection).toHaveBeenCalledTimes(1)
    expect(commands.redoHistory).toHaveBeenCalledTimes(1)
    expect(commands.undoHistory).toHaveBeenCalledTimes(1)
    expect(commands.ungroupSelection).toHaveBeenCalledTimes(1)
    expect(commands.unlockAll).toHaveBeenCalledTimes(1)
  })

  it('exposes document command handlers to keyboard without toolbar naming', () => {
    const commands = createCommands()
    const model = getCanvasAppCommandConsumerModel(commands)

    model.keyboard.copySelection()
    model.keyboard.cutSelection()
    model.keyboard.moveSelection(2, -1)
    model.keyboard.reorderSelection('bringToFront')
    model.keyboard.selectAll()

    expect(commands.copySelection).toHaveBeenCalledTimes(1)
    expect(commands.cutSelection).toHaveBeenCalledTimes(1)
    expect(commands.moveSelection).toHaveBeenCalledWith(2, -1)
    expect(commands.reorderSelection).toHaveBeenCalledWith('bringToFront')
    expect(commands.selectAll).toHaveBeenCalledTimes(1)
  })

  it('keeps clone command scoped to pointer consumers', () => {
    const commands = createCommands()
    const model = getCanvasAppCommandConsumerModel(commands)

    model.pointer.cloneItems(['item-1'], { x: 8, y: 8 })

    expect(commands.cloneItems).toHaveBeenCalledWith(
      ['item-1'],
      { x: 8, y: 8 },
    )
    expect(model.keyboard).not.toHaveProperty('cloneItems')
    expect(model.control.commandHandlers).not.toHaveProperty('cloneItems')
  })
})

function createCommands(): CanvasAppCommandRuntime {
  return {
    alignSelection: vi.fn(),
    cloneItems: vi.fn(() => []),
    copySelection: vi.fn(),
    cutSelection: vi.fn(),
    deleteSelection: vi.fn(),
    distributeSelection: vi.fn(),
    duplicateSelection: vi.fn(() => []),
    groupSelection: vi.fn(),
    lockSelection: vi.fn(),
    moveSelection: vi.fn(),
    pasteSelection: vi.fn(),
    redoHistory: vi.fn(),
    reorderSelection: vi.fn(),
    selectAll: vi.fn(),
    undoHistory: vi.fn(),
    ungroupSelection: vi.fn(),
    unlockAll: vi.fn(),
  }
}
