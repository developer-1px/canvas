import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  getDomEditInteractionCommandShortcut,
  resolveDomEditKeyboardCommand,
} from './DomEditInteractionCommands'

describe('DomEditInteractionCommands', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves overlay shortcuts through interaction keyboard input', () => {
    expect(resolveDomEditKeyboardCommand({ key: 'm' })?.action).toEqual({
      type: 'dom-edit.overlay.toggle-measure',
    })
    expect(resolveDomEditKeyboardCommand({ key: 'x' })?.action).toEqual({
      type: 'dom-edit.overlay.toggle-xray',
    })
  })

  it('resolves primary modifier shortcuts by platform', () => {
    expect(
      resolveDomEditKeyboardCommand({
        key: 'd',
        metaKey: true,
      }, {
        platform: 'mac',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.duplicate',
    })
    expect(
      resolveDomEditKeyboardCommand({
        ctrlKey: true,
        key: 'd',
      }, {
        platform: 'windows',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.duplicate',
    })
    expect(
      resolveDomEditKeyboardCommand({
        key: 'z',
        metaKey: true,
      }, {
        platform: 'mac',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.undo',
    })
    expect(
      resolveDomEditKeyboardCommand({
        key: 'Z',
        metaKey: true,
        shiftKey: true,
      }, {
        platform: 'mac',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.redo',
    })
    expect(
      resolveDomEditKeyboardCommand({
        ctrlKey: true,
        key: 'y',
      }, {
        platform: 'windows',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.redo',
    })
  })

  it('allows undo and redo from focused native controls', () => {
    const target = createKeyboardTarget('native-control')

    expect(
      resolveDomEditKeyboardCommand({
        key: 'z',
        metaKey: true,
        target,
      }, {
        platform: 'mac',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.undo',
    })
    expect(
      resolveDomEditKeyboardCommand({
        key: 'z',
        metaKey: true,
        shiftKey: true,
        target,
      }, {
        platform: 'mac',
      })?.action,
    ).toEqual({
      type: 'dom-edit.command.redo',
    })
  })

  it('keeps editing shortcuts out of focused native controls', () => {
    const target = createKeyboardTarget('native-control')

    expect(resolveDomEditKeyboardCommand({
      key: 'd',
      metaKey: true,
      target,
    }, {
      platform: 'mac',
    })).toBeNull()
    expect(resolveDomEditKeyboardCommand({
      key: 'ArrowRight',
      target,
    }, {
      platform: 'mac',
    })).toBeNull()
  })

  it('keeps history shortcuts out of text entry targets', () => {
    for (const targetKind of [
      'contenteditable',
      'select',
      'text-input',
      'textarea',
    ] as const) {
      expect(resolveDomEditKeyboardCommand({
        key: 'z',
        metaKey: true,
        target: createKeyboardTarget(targetKind),
      }, {
        platform: 'mac',
      })).toBeNull()
    }
  })

  it('formats shortcuts through interaction command bindings', () => {
    expect(getDomEditInteractionCommandShortcut({
      commandId: 'domEditDuplicate',
      platform: 'mac',
    })).toBe('Cmd+D')
    expect(getDomEditInteractionCommandShortcut({
      commandId: 'domEditDuplicate',
      platform: 'windows',
    })).toBe('Ctrl+D')
    expect(getDomEditInteractionCommandShortcut({
      commandId: 'domEditUndo',
      platform: 'mac',
    })).toBe('Cmd+Z')
    expect(getDomEditInteractionCommandShortcut({
      commandId: 'domEditRedo',
      platform: 'mac',
    })).toBe('Cmd+Shift+Z')
  })
})

function createKeyboardTarget(targetKind: string): EventTarget {
  class KeyboardTargetElement {
    getAttribute(name: string) {
      return name === 'data-interaction-target-kind' ? targetKind : null
    }
  }

  vi.stubGlobal('Element', KeyboardTargetElement)

  return new KeyboardTargetElement() as unknown as EventTarget
}
