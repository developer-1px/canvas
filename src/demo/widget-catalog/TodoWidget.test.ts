import { describe, expect, it } from 'vitest'
import {
  isTodoWidgetData,
  toggleTodoWidgetItemDone,
  type TodoWidgetData,
} from './TodoWidget'

function data(): TodoWidgetData {
  return {
    items: [
      { done: false, text: 'a' },
      { done: true, text: 'b' },
    ],
    title: 'T',
  }
}

describe('toggleTodoWidgetItemDone', () => {
  it('flips the done state of the targeted item', () => {
    expect(toggleTodoWidgetItemDone(data(), 0).items[0]).toEqual({
      done: true,
      text: 'a',
    })
    expect(toggleTodoWidgetItemDone(data(), 1).items[1]).toEqual({
      done: false,
      text: 'b',
    })
  })

  it('does not mutate the original data', () => {
    const original = data()
    toggleTodoWidgetItemDone(original, 0)
    expect(original.items[0].done).toBe(false)
  })

  it('leaves other items untouched and stays valid widget data', () => {
    const next = toggleTodoWidgetItemDone(data(), 0)
    expect(next.items[1]).toEqual({ done: true, text: 'b' })
    expect(isTodoWidgetData(next)).toBe(true)
  })

  it('is a no-op for an out-of-range index', () => {
    const original = data()
    expect(toggleTodoWidgetItemDone(original, 9)).toBe(original)
    expect(toggleTodoWidgetItemDone(original, -1)).toBe(original)
  })
})
