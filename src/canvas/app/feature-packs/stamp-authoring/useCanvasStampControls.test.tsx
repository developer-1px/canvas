import { CANVAS_APP_TEXT_TARGET } from '../../affordances/editing/text-editor/CanvasAppTextTarget'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import {
  useCanvasStampControls,
  type CanvasStampControlsModel,
} from './useCanvasStampControls'

describe('useCanvasStampControls', () => {
  it('keeps optional stamp controls hidden by default', () => {
    const model = renderStampControlsModel({
      itemReadModel: createReadModel(null),
      selection: [],
    })

    expect(model.visible).toBe(false)
    expect(model.anchor).toBeNull()
    expect(model.canInsertStamp).toBe(false)
  })

  it('shows independent stamp controls when the affordance is enabled', () => {
    const model = renderStampControlsModel({
      config: createCanvasAffordanceConfig({
        overlays: { stampControls: true },
      }),
      itemReadModel: createReadModel({ h: 80, w: 120, x: 10, y: 20 }),
      selection: ['rect-1'],
    })

    expect(model.visible).toBe(true)
    expect(model.anchor).toBeNull()
    expect(model.canInsertStamp).toBe(true)
  })

  it('shows stamp controls during active voting even without selection', () => {
    const model = renderStampControlsModel({
      itemReadModel: createReadModel(null),
      selection: [],
      votingSession: createVotingSessionContext(),
    })

    expect(model.visible).toBe(true)
    expect(model.anchor).toBeNull()
    expect(model.canInsertStamp).toBe(true)
  })

  it('blocks stamps when the active voting quota is spent', () => {
    const model = renderStampControlsModel({
      itemReadModel: createReadModel(null),
      selection: [],
      votingSession: createVotingSessionContext({ canCastVote: false }),
    })

    expect(model.visible).toBe(true)
    expect(model.canInsertStamp).toBe(false)
  })

  it('counts a vote only after stamp insertion succeeds', () => {
    const commitItemsChange = vi.fn(() => true)
    const onVoteCast = vi.fn(() => true)
    const model = renderStampControlsModel({
      commitItemsChange,
      itemReadModel: createReadModel(null),
      selection: [],
      votingSession: createVotingSessionContext({ onVoteCast }),
    })

    expect(model.onInsertStamp({
      label: '+1',
      stamp: 'thumbs-up',
      title: 'Thumbs up',
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledTimes(1)
    expect(onVoteCast).toHaveBeenCalledTimes(1)
  })
})

function renderStampControlsModel({
  commitItemsChange = vi.fn(() => true),
  config = createCanvasAffordanceConfig(),
  itemReadModel,
  selection,
  votingSession,
}: {
  config?: Parameters<typeof useCanvasStampControls>[0]['config']
  commitItemsChange?: Parameters<
    typeof useCanvasStampControls
  >[0]['commitItemsChange']
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  votingSession?: Parameters<typeof useCanvasStampControls>[0]['votingSession']
}) {
  let model: CanvasStampControlsModel | null = null

  function Harness() {
    model = useCanvasStampControls({
      commitItemsChange,
      config,
      createId: vi.fn(() => 'stamp-1'),
      itemReadModel,
      selection,
      stageElement: createStageElement(),
      viewport: { scale: 1, x: 0, y: 0 },
      votingSession,
    })

    return null
  }

  renderToStaticMarkup(<Harness />)

  const renderedModel = model as CanvasStampControlsModel | null

  if (!renderedModel) {
    throw new Error('Expected stamp controls model to render')
  }

  return renderedModel
}

function createVotingSessionContext(
  overrides: Partial<NonNullable<
    Parameters<typeof useCanvasStampControls>[0]['votingSession']
  >> = {},
): NonNullable<Parameters<typeof useCanvasStampControls>[0]['votingSession']> {
  return {
    active: true,
    canCastVote: true,
    votesCast: 0,
    votesPerParticipant: 3,
    onVoteCast: vi.fn(() => true),
    ...overrides,
  }
}

function createReadModel(
  bounds: ReturnType<CanvasAppItemReadModel['getSelectionBounds']>,
): CanvasAppItemReadModel {
  return {
    findTextEditTarget: vi.fn(() => null),
    textTarget: CANVAS_APP_TEXT_TARGET,
    findItem: vi.fn(() => undefined),
    getAllIds: vi.fn(() => []),
    getAllItems: vi.fn(() => []),
    getItemBounds: vi.fn(() => {
      throw new Error('Unexpected item bounds read')
    }),
    getSelection: vi.fn((ids) => ids),
    getSelectionBounds: vi.fn(() => bounds),
    getSelectedItems: vi.fn(() => []),
  }
}

function createStageElement(): CanvasAppStageElement {
  return {
    addWheelListener: vi.fn(() => () => undefined),
    capturePointer: vi.fn(),
    getRect: vi.fn(() => null),
    getScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
    getViewportCenter: vi.fn(() => ({ x: 0, y: 0 })),
    releasePointer: vi.fn(),
  }
}
