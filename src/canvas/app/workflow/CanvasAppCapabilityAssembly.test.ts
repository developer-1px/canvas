import { describe, expect, it } from 'vitest'
import {
  createCanvasAffordanceConfig,
  getCanvasPointerGesture,
  type CanvasCommandAvailability,
} from '../../engine'
import { getCanvasKeyboardCommandShortcutIntent } from '../affordances/interaction/keyboard/CanvasKeyboardCommandShortcutIntent'
import { getCanvasToolbarCommandGroups } from '../affordances/controls/toolbar/CanvasToolbarCommandItems'
import { getCanvasToolbarToolItems } from '../affordances/controls/toolbar/CanvasToolbarToolItems'
import {
  CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  createCanvasAppCapabilities,
  createCanvasAppCapabilityAffordanceConfigInput,
  withCanvasAppCapabilities,
} from './CanvasAppCapabilityAssembly'

describe('CanvasAppCapabilityAssembly', () => {
  it('normalizes host-owned capability snapshots without role semantics', () => {
    expect(createCanvasAppCapabilities({
      editDocument: false,
      export: false,
    })).toEqual({
      comment: true,
      editDocument: false,
      export: false,
      follow: true,
      present: true,
      view: true,
    })

    expect(createCanvasAppCapabilities({ view: false })).toEqual({
      comment: false,
      editDocument: false,
      export: false,
      follow: false,
      present: false,
      view: false,
    })

    expect(createCanvasAffordanceConfig(
      createCanvasAppCapabilityAffordanceConfigInput({ view: false }),
    ).overlays.minimap).toBe(false)
  })

  it('keeps read-only mode viewable while blocking edit and export actions', () => {
    const config = createCanvasAffordanceConfig(
      createCanvasAppCapabilityAffordanceConfigInput(
        CANVAS_APP_READ_ONLY_CAPABILITIES,
      ),
    )

    expect(config.commands.delete).toBe(false)
    expect(config.commands.copy).toBe(false)
    expect(config.commands.zoomIn).toBe(true)
    expect(config.gestures.move).toBe(false)
    expect(config.gestures.pan).toBe(true)
    expect(config.gestures.textEdit).toBe(false)
    expect(config.overlays.inspector).toBe(false)
    expect(config.overlays.resizeHandles).toBe(false)
    expect(config.tools.rect).toBe(false)
    expect(config.tools.comment).toBe(false)
    expect(config.tools.select).toBe(true)

    expect(getCanvasToolbarToolItems({
      config,
      customTools: [],
      tool: 'select',
    }).map((item) => item.tool)).toEqual(['select', 'pan', 'laser'])
    expect(getCanvasToolbarCommandGroups({
      availability: createAvailableCommands(),
      config,
      surface: 'selection-floating-bar',
    })).toEqual([])
    expect(getCanvasKeyboardCommandShortcutIntent(createKeyboardInput({
      config,
      event: createKeyboardEvent({ key: 'Backspace' }),
      key: 'backspace',
    }))).toBeNull()
    expect(getCanvasKeyboardCommandShortcutIntent(createKeyboardInput({
      config,
      event: createKeyboardEvent({ key: 'c', metaKey: true }),
      key: 'c',
      mod: true,
    }))).toBeNull()
    expect(getCanvasKeyboardCommandShortcutIntent(createKeyboardInput({
      config,
      event: createKeyboardEvent({ key: '=' }),
      key: '=',
      mod: true,
    }))).toEqual({
      direction: 'in',
      kind: 'zoom-viewport',
      preventDefault: true,
    })
    expect(getCanvasPointerGesture({
      config,
      input: createPointerInput(),
      spaceDown: false,
      tool: 'rect',
    })).toBe('marquee')
  })

  it('keeps comment-only mode limited to comment creation plus view gestures', () => {
    const config = createCanvasAffordanceConfig(
      createCanvasAppCapabilityAffordanceConfigInput(
        CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
      ),
    )

    expect(config.commands.delete).toBe(false)
    expect(config.gestures.createComment).toBe(true)
    expect(config.gestures.createShape).toBe(false)
    expect(config.overlays.inspector).toBe(true)
    expect(config.tools.comment).toBe(true)
    expect(config.tools.rect).toBe(false)

    expect(getCanvasToolbarToolItems({
      config,
      customTools: [],
      tool: 'comment',
    }).map((item) => item.tool)).toEqual([
      'select',
      'pan',
      'comment',
      'laser',
    ])
    expect(getCanvasPointerGesture({
      config,
      input: createPointerInput(),
      spaceDown: false,
      tool: 'comment',
    })).toBe('create-comment')
    expect(getCanvasPointerGesture({
      config,
      input: createPointerInput(),
      spaceDown: false,
      tool: 'sticky',
    })).toBe('marquee')
  })

  it('does not let product affordance config re-enable denied capabilities', () => {
    const config = createCanvasAffordanceConfig(
      withCanvasAppCapabilities({
        commands: {
          copy: true,
          delete: true,
        },
        gestures: {
          createShape: true,
          textEdit: true,
        },
        overlays: {
          inspector: true,
          resizeHandles: true,
        },
        tools: {
          rect: true,
        },
      }, CANVAS_APP_READ_ONLY_CAPABILITIES),
    )

    expect(config.commands.copy).toBe(false)
    expect(config.commands.delete).toBe(false)
    expect(config.gestures.createShape).toBe(false)
    expect(config.gestures.textEdit).toBe(false)
    expect(config.overlays.inspector).toBe(false)
    expect(config.overlays.resizeHandles).toBe(false)
    expect(config.tools.rect).toBe(false)
  })
})

function createAvailableCommands(): CanvasCommandAvailability {
  return {
    alignBottom: true,
    alignCenter: true,
    alignLeft: true,
    alignMiddle: true,
    alignRight: true,
    alignTop: true,
    bringForward: true,
    bringToFront: true,
    delete: true,
    distributeHorizontal: true,
    distributeVertical: true,
    duplicate: true,
    group: true,
    lockSelection: true,
    redo: true,
    selectAll: true,
    sendBackward: true,
    sendToBack: true,
    undo: true,
    ungroup: true,
    unlockAll: true,
  }
}

function createKeyboardInput(
  overrides: Partial<Parameters<
    typeof getCanvasKeyboardCommandShortcutIntent
  >[0]> = {},
): Parameters<typeof getCanvasKeyboardCommandShortcutIntent>[0] {
  return {
    config: createCanvasAffordanceConfig(),
    event: createKeyboardEvent(),
    key: 'a',
    mod: false,
    selection: ['item-1'],
    ...overrides,
  }
}

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    altKey: false,
    code: 'KeyA',
    ctrlKey: false,
    key: 'a',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

function createPointerInput() {
  return {
    altKey: false,
    button: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  }
}
