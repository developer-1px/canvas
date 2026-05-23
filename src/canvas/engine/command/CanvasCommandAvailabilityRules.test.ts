import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  CANVAS_COMMAND_AVAILABILITY_RULES,
  getCanvasCommandAvailability,
} from './CanvasCommandAvailabilityRules'

describe('CanvasCommandAvailabilityRules', () => {
  it('keeps built-in command availability as a command-to-rule table', () => {
    expect(CANVAS_COMMAND_AVAILABILITY_RULES).toMatchObject({
      alignLeft: 'canAlign',
      delete: 'hasSelection',
      distributeHorizontal: 'canDistribute',
      group: 'canGroup',
      redo: 'canRedo',
      selectAll: 'always',
      undo: 'canUndo',
      ungroup: 'hasSelectedGroup',
      unlockAll: 'always',
    })
  })

  it('combines feature toggles with rule state', () => {
    expect(
      getCanvasCommandAvailability({
        canRedo: false,
        canUndo: true,
        config: createCanvasAffordanceConfig({
          commands: {
            alignLeft: false,
            delete: false,
          },
        }),
        hasSelectedGroup: true,
        selection: ['rect-1', 'rect-2', 'rect-3'],
      }),
    ).toMatchObject({
      alignLeft: false,
      alignRight: true,
      delete: false,
      distributeHorizontal: true,
      group: true,
      redo: false,
      selectAll: true,
      undo: true,
      ungroup: true,
      unlockAll: true,
    })
  })

  it('uses selection and document state without repeating thresholds', () => {
    expect(
      getCanvasCommandAvailability({
        canRedo: true,
        canUndo: false,
        config: createCanvasAffordanceConfig(),
        hasSelectedGroup: false,
        selection: ['rect-1'],
      }),
    ).toMatchObject({
      alignLeft: false,
      bringForward: true,
      delete: true,
      distributeHorizontal: false,
      group: false,
      redo: true,
      selectAll: true,
      undo: false,
      ungroup: false,
      unlockAll: true,
    })
  })
})
