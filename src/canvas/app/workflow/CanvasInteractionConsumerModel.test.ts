import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type {
  CanvasOverlayState,
  CanvasSnapGuides,
} from '../../engine'
import type { Tool } from '../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'
import { getCanvasInteractionConsumerModel } from './CanvasInteractionConsumerModel'

describe('CanvasInteractionConsumerModel', () => {
  it('routes tool state to component and control consumers', () => {
    const runtime = createInteractionRuntime({ tool: 'rect' })
    const model = getCanvasInteractionConsumerModel(runtime)

    model.component.setTool('text')
    model.control.onToolChange('pan')

    expect(model.control.tool).toBe('rect')
    expect(model.control.gesture).toBe('none')
    expect(runtime.setTool).toHaveBeenCalledWith('text')
    expect(runtime.setTool).toHaveBeenCalledWith('pan')
  })

  it('routes keyboard and pointer interaction writers to the consumers that need them', () => {
    const runtime = createInteractionRuntime({ spaceDown: true })
    const model = getCanvasInteractionConsumerModel(runtime)
    const nextGuides: CanvasSnapGuides = {
      alignmentGuides: [],
      spacingGuides: [],
    }

    model.keyboard.setDraftRect({ h: 40, w: 30, x: 10, y: 20 })
    model.keyboard.setMarquee(null)
    model.keyboard.setSpaceDown(false)
    model.pointer.setSnapGuides(nextGuides)
    model.pointer.setGesture('pan')

    expect(runtime.draft.setDraftRect).toHaveBeenCalledWith({
      h: 40,
      w: 30,
      x: 10,
      y: 20,
    })
    expect(runtime.marquee.setMarquee).toHaveBeenCalledWith(null)
    expect(runtime.setSpaceDown).toHaveBeenCalledWith(false)
    expect(runtime.setSnapGuides).toHaveBeenCalledWith(nextGuides)
    expect(runtime.setGesture).toHaveBeenCalledWith('pan')
    expect(model.pointer.spaceDown).toBe(true)
    expect(model.pointer.tool).toBe('select')
  })

  it('builds stage context with temporary pan mode precedence', () => {
    const overlays = createOverlays()
    const normalModel = getCanvasInteractionConsumerModel(
      createInteractionRuntime({
        gesture: 'move',
        overlays,
        spaceDown: false,
        tool: 'text',
      }),
    )
    const temporaryPanModel = getCanvasInteractionConsumerModel(
      createInteractionRuntime({
        gesture: 'pan',
        overlays,
        spaceDown: true,
        tool: 'text',
      }),
    )

    expect(normalModel.stage).toEqual({
      activeMode: 'text',
      gesture: 'move',
      overlays,
    })
    expect(temporaryPanModel.stage).toEqual({
      activeMode: 'pan',
      gesture: 'pan',
      overlays,
    })
  })
})

function createInteractionRuntime({
  gesture = 'none',
  overlays = createOverlays(),
  spaceDown = false,
  tool = 'select',
}: {
  gesture?: Interaction['kind']
  overlays?: CanvasOverlayState
  spaceDown?: boolean
  tool?: Tool
} = {}): Parameters<typeof getCanvasInteractionConsumerModel>[0] {
  return {
    draft: {
      setDraftArrow: vi.fn(),
      setDraftRect: vi.fn(),
      setDraftStroke: vi.fn(),
    },
    gesture,
    marquee: {
      setMarquee: vi.fn(),
    },
    overlays,
    setGesture: vi.fn(),
    setSnapGuides: vi.fn(),
    setSpaceDown: vi.fn(),
    setTool: vi.fn(),
    spaceDown,
    tool,
  }
}

function createOverlays(): CanvasOverlayState {
  return {
    alignmentGuides: [],
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    grid: true,
    itemOutlineIds: new Set(['item-1']),
    marquee: null,
    resizeHandles: [],
    selectionBounds: null,
    spacingGuides: [],
  }
}
