import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  applyCanvasItemPointerInteractionStartEffect,
  applyCanvasPointerInteractionStartEffect,
  applyCanvasResizePointerInteractionStartEffect,
  applyCanvasTextEditInteractionStartEffect,
} from './CanvasPointerInteractionStartEffects'
import type {
  CanvasPointerInteractionStartEffectContext,
} from './CanvasPointerInteractionEffectContracts'

describe('CanvasPointerInteractionStartEffects', () => {
  it('commits created text and enters editing without pointer capture', () => {
    const context = createContext()
    const event = createPointerInput()
    const item = rect('text-1')

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: false,
        edit: { id: 'text-1', value: 'Draft' },
        item,
        kind: 'created-text',
      },
    })

    expect(applied).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(context.stageElement.capturePointer).not.toHaveBeenCalled()
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [item] },
      {
        before: ['rect-1'],
        after: ['text-1'],
      },
    )
    expect(context.setEditing).toHaveBeenCalledWith({
      id: 'text-1',
      value: 'Draft',
    })
    expect(context.setTool).toHaveBeenCalledWith('select')
  })

  it('commits immediately created items without entering text editing', () => {
    const context = createContext()
    const event = createPointerInput()
    const item = rect('comment-1')

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: false,
        item,
        kind: 'created-item',
      },
    })

    expect(applied).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(context.stageElement.capturePointer).not.toHaveBeenCalled()
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [item] },
      {
        before: ['rect-1'],
        after: ['comment-1'],
      },
    )
    expect(context.setEditing).not.toHaveBeenCalled()
    expect(context.setTool).not.toHaveBeenCalled()
  })

  it('commits immediately created items and enters editing when requested', () => {
    const context = createContext()
    const event = createPointerInput()
    const item = rect('component-1')

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: false,
        edit: { id: 'component-1', value: '' },
        item,
        kind: 'created-item',
      },
    })

    expect(applied).toBe(true)
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { type: 'add', items: [item] },
      {
        before: ['rect-1'],
        after: ['component-1'],
      },
    )
    expect(context.setEditing).toHaveBeenCalledWith({
      id: 'component-1',
      value: '',
    })
    expect(context.setTool).not.toHaveBeenCalled()
  })

  it('applies a requested tool after immediate item creation', () => {
    const context = createContext()
    const event = createPointerInput()
    const item = rect('comment-1')

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: false,
        edit: { id: 'comment-1', value: 'Comment' },
        item,
        kind: 'created-item',
        toolAfterCreate: 'select',
      },
    })

    expect(applied).toBe(true)
    expect(context.setEditing).toHaveBeenCalledWith({
      id: 'comment-1',
      value: 'Comment',
    })
    expect(context.setTool).toHaveBeenCalledWith('select')
  })

  it('does not enter editing when immediate creation is rejected', () => {
    const context = createContext()
    vi.mocked(context.commitItemsChange).mockReturnValue(false)

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event: createPointerInput(),
      start: {
        capturePointer: false,
        edit: { id: 'comment-1', value: 'Comment' },
        item: rect('comment-1'),
        kind: 'created-item',
        toolAfterCreate: 'select',
      },
    })

    expect(applied).toBe(false)
    expect(context.setEditing).not.toHaveBeenCalled()
    expect(context.setTool).not.toHaveBeenCalled()
  })

  it('executes extension creation through one document transaction before editing', () => {
    const context = createContext()
    const event = createPointerInput()
    const item = rect('sticky-1')
    const commitItemsChange = vi.mocked(context.commitItemsChange)
    const setEditing = vi.mocked(context.setEditing)

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: false,
        effects: [
          {
            patch: [{ items: [item], type: 'add' }],
            selection: { after: ['sticky-1'], before: ['rect-1'] },
            type: 'document-patch',
          },
          {
            editing: { id: 'sticky-1', value: '' },
            type: 'editing',
          },
        ],
        kind: 'extension-effects',
      },
    })

    expect(applied).toBe(true)
    expect(context.commitItemsChange).toHaveBeenCalledTimes(1)
    expect(context.commitItemsChange).toHaveBeenCalledWith(
      { items: [item], type: 'add' },
      { after: ['sticky-1'], before: ['rect-1'] },
    )
    expect(context.setEditing).toHaveBeenCalledWith({
      id: 'sticky-1',
      value: '',
    })
    expect(commitItemsChange.mock.invocationCallOrder[0]).toBeLessThan(
      setEditing.mock.invocationCallOrder[0] ?? Infinity,
    )
  })

  it('contains extension transaction failure and skips later editing effects', () => {
    const context = createContext()
    const event = createPointerInput()
    vi.mocked(context.commitItemsChange).mockReturnValue(false)

    const applied = applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: false,
        effects: [
          {
            patch: [{ items: [rect('sticky-1')], type: 'add' }],
            selection: { after: ['sticky-1'], before: ['rect-1'] },
            type: 'document-patch',
          },
          {
            editing: { id: 'sticky-1', value: '' },
            type: 'editing',
          },
        ],
        kind: 'extension-effects',
      },
    })

    expect(applied).toBe(false)
    expect(context.commitItemsChange).toHaveBeenCalledTimes(1)
    expect(context.setEditing).not.toHaveBeenCalled()
  })

  it('applies item pointer start state and clears double-click memory', () => {
    const context = createContext()
    const event = createPointerInput()
    const clearLastClick = vi.fn()
    const liveItems = [rect('clone-1')]

    applyCanvasItemPointerInteractionStartEffect({
      clearLastClick,
      context,
      event,
      start: {
        capturePointer: true,
        clearLastClick: true,
        commitSelection: ['rect-1'],
        interaction: {
          bounds: { h: 40, w: 40, x: 0, y: 0 },
          currentItems: liveItems,
          historyItems: [rect('rect-1')],
          historySelection: ['rect-1'],
          ids: ['clone-1'],
          kind: 'move',
          moved: false,
          pointerId: 1,
          startItems: liveItems,
          startScreen: { x: 0, y: 0 },
          startWorld: { x: 0, y: 0 },
        },
        kind: 'move',
        liveItems,
        selection: ['clone-1'],
      },
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(clearLastClick).toHaveBeenCalledTimes(1)
    expect(context.commitSelection).toHaveBeenCalledWith(['rect-1'])
    expect(context.setLiveItems).toHaveBeenCalledWith(liveItems)
    expect(context.setSelection).toHaveBeenCalledWith(['clone-1'])
    expect(context.stageElement.capturePointer).toHaveBeenCalledWith(1)
    expect(context.interactionRef.current.kind).toBe('move')
    expect(context.setGesture).toHaveBeenCalledWith('move')
  })

  it('applies resize and text edit starts', () => {
    const context = createContext()
    const event = createPointerInput()

    applyCanvasResizePointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: true,
        gesture: 'resize',
        interaction: {
          bounds: { h: 40, w: 40, x: 0, y: 0 },
          currentItems: [rect('rect-1')],
          handle: 'se',
          historyItems: [rect('rect-1')],
          ids: ['rect-1'],
          kind: 'resize',
          moved: false,
          pointerId: 1,
          startItems: [rect('rect-1')],
          startScreen: { x: 0, y: 0 },
          startWorld: { x: 0, y: 0 },
        },
        kind: 'resize',
      },
    })
    applyCanvasTextEditInteractionStartEffect({
      context,
      start: {
        editing: { id: 'rect-1', value: 'Label' },
        kind: 'text-edit',
        selection: ['rect-1'],
        tool: 'select',
      },
    })

    expect(context.stageElement.capturePointer).toHaveBeenCalledWith(1)
    expect(context.interactionRef.current.kind).toBe('resize')
    expect(context.setGesture).toHaveBeenCalledWith('resize')
    expect(context.commitSelection).toHaveBeenCalledWith(['rect-1'])
    expect(context.setEditing).toHaveBeenCalledWith({
      id: 'rect-1',
      value: 'Label',
    })
    expect(context.setTool).toHaveBeenCalledWith('select')
  })

  it('applies transient laser trail start state', () => {
    const context = createContext()
    const event = createPointerInput()

    applyCanvasPointerInteractionStartEffect({
      context,
      event,
      start: {
        capturePointer: true,
        gesture: 'laser',
        interaction: {
          currentWorld: { x: 10, y: 12 },
          kind: 'laser',
          moved: false,
          pointerId: 1,
          points: [{ x: 10, y: 12 }],
          startScreen: { x: 10, y: 12 },
          startWorld: { x: 10, y: 12 },
        },
        kind: 'interaction',
        laserTrail: {
          points: [{ x: 10, y: 12 }],
        },
      },
    })

    expect(context.interactionRef.current.kind).toBe('laser')
    expect(context.setLaserTrail).toHaveBeenCalledWith({
      points: [{ x: 10, y: 12 }],
    })
    expect(context.setGesture).toHaveBeenCalledWith('laser')
  })
})

function createContext(): CanvasPointerInteractionStartEffectContext {
  return {
    commitItemsChange: vi.fn(() => true),
    commitSelection: vi.fn(() => true),
    interactionRef: { current: { kind: 'none' } },
    selection: ['rect-1'],
    setDraftArrow: vi.fn(),
    setDraftRect: vi.fn(),
    setDraftStroke: vi.fn(),
    setLaserTrail: vi.fn(),
    setEditing: vi.fn(),
    setGesture: vi.fn(),
    setLiveItems: vi.fn(),
    setSelection: vi.fn(),
    setTool: vi.fn(),
    stageElement: {
      addWheelListener: vi.fn(),
      capturePointer: vi.fn(),
      getRect: vi.fn(() => null),
      getScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
      getViewportCenter: vi.fn(() => null),
      releasePointer: vi.fn(),
    },
  }
}

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}

function rect(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}
