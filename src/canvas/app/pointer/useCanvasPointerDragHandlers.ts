import type {
  Dispatch,
  MutableRefObject,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine/affordance/CanvasAffordances'
import type {
  Bounds,
  Tool,
  Viewport
} from '../../core'
import type {
  CanvasItem,
  EditingText
} from '../../host/model'
import {
  DRAG_THRESHOLD,
  normalizeBounds,
  pointDistance,
} from '../../engine/primitives/CanvasPrimitives'
import {
  createCanvasRect,
  type CanvasCreationAdapter,
} from '../../engine/creation/CanvasCreationEngine'
import { releasePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import { getCanvasMarqueeSelection } from '../../engine/selection/CanvasSelectionEngine'
import type { CanvasSceneAdapter } from '../../engine/scene/CanvasSceneAdapter'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  getCanvasMoveSnap,
  snapCanvasPointToGrid,
  type CanvasSnapGuides,
} from '../../engine/snap/CanvasSnapEngine'
import {
  moveCanvasSelection,
  resizeCanvasSelection,
  type CanvasTransformAdapter,
} from '../../engine/transform/CanvasTransformEngine'
import type {
  CommitCanvasSelection,
  CommitCanvasItemsPatch,
} from '../document/useCanvasDocument'
import { createTransformCanvasItemsPatch } from '../../host/document/CanvasDocumentPatches'
import type { Interaction } from './CanvasInteractionState'

type UseCanvasPointerDragHandlersArgs = {
  commitSelection: CommitCanvasSelection
  commitItemsPatch: CommitCanvasItemsPatch
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  interactionRef: MutableRefObject<Interaction>
  scene: CanvasSceneAdapter
  selection: string[]
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setSnapGuides: Dispatch<SetStateAction<CanvasSnapGuides>>
  setTool: Dispatch<SetStateAction<Tool>>
  setViewport: Dispatch<SetStateAction<Viewport>>
  svgRef: RefObject<SVGSVGElement | null>
  transformAdapter: CanvasTransformAdapter<CanvasItem>
  viewport: Viewport
}

export function useCanvasPointerDragHandlers({
  commitSelection,
  commitItemsPatch,
  config,
  creationAdapter,
  createId,
  interactionRef,
  scene,
  selection,
  setDraftRect,
  setEditing,
  setGesture,
  setLiveItems,
  setMarquee,
  setSelection,
  setSnapGuides,
  setTool,
  setViewport,
  svgRef,
  transformAdapter,
  viewport,
}: UseCanvasPointerDragHandlersArgs) {
  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const interaction = interactionRef.current

    if (interaction.kind === 'none' || interaction.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()

    const currentScreen = screenPoint(svgRef, event)
    const currentWorld = screenToWorld(currentScreen, viewport)

    if (interaction.kind === 'pan') {
      if (!config.gestures.pan) {
        return
      }

      setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
      const dx = currentScreen.x - interaction.startScreen.x
      const dy = currentScreen.y - interaction.startScreen.y
      setViewport({
        ...interaction.origin,
        x: interaction.origin.x + dx,
        y: interaction.origin.y + dy,
      })
      return
    }

    if (interaction.kind === 'move') {
      if (!config.gestures.move) {
        return
      }

      const moved =
        interaction.moved ||
        pointDistance(currentScreen, interaction.startScreen) > DRAG_THRESHOLD

      if (!moved) {
        return
      }

      const dx = currentWorld.x - interaction.startWorld.x
      const dy = currentWorld.y - interaction.startWorld.y
      const snap = interaction.bounds
        ? getCanvasMoveSnap({
            bounds: interaction.bounds,
            config,
            dx,
            dy,
            scene,
            selection: interaction.ids,
            viewport,
          })
        : {
            ...EMPTY_CANVAS_SNAP_GUIDES,
            dx,
            dy,
          }

      const nextItems = moveCanvasSelection({
        adapter: transformAdapter,
        dx: snap.dx,
        dy: snap.dy,
        items: interaction.startItems,
        selection: interaction.ids,
      })

      interactionRef.current = {
        ...interaction,
        currentItems: nextItems,
        moved: true,
      }
      setSnapGuides({
        alignmentGuides: snap.alignmentGuides,
        spacingGuides: snap.spacingGuides,
      })
      setLiveItems(nextItems)
      return
    }

    if (interaction.kind === 'resize') {
      if (!config.gestures.resize) {
        return
      }

      const moved =
        interaction.moved ||
        pointDistance(currentScreen, interaction.startScreen) > DRAG_THRESHOLD

      if (!moved) {
        return
      }

      setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
      const snappedCurrentWorld = snapCanvasPointToGrid({
        config,
        point: currentWorld,
      })

      const nextItems = resizeCanvasSelection({
        adapter: transformAdapter,
        bounds: interaction.bounds,
        handle: interaction.handle,
        items: interaction.startItems,
        point: snappedCurrentWorld,
        preserveAspectRatio: event.shiftKey,
        resizeFromCenter: event.altKey,
        selection: interaction.ids,
      })

      interactionRef.current = {
        ...interaction,
        currentItems: nextItems,
        moved: true,
      }
      setLiveItems(nextItems)
      return
    }

    if (interaction.kind === 'marquee') {
      if (!config.gestures.marquee) {
        return
      }

      const moved =
        interaction.moved ||
        pointDistance(currentScreen, interaction.startScreen) > DRAG_THRESHOLD
      const bounds = normalizeBounds(interaction.startWorld, currentWorld)

      setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
      interactionRef.current = {
        ...interaction,
        currentWorld,
        moved,
      }

      if (!moved) {
        return
      }

      setMarquee(bounds)
      setSelection(
        getCanvasMarqueeSelection({
          additive: interaction.additive,
          baseSelection: interaction.baseSelection,
          bounds,
          scene,
        }),
      )
      return
    }

    if (interaction.kind === 'create-rect') {
      if (!config.gestures.createRect) {
        return
      }

      const moved =
        interaction.moved ||
        pointDistance(currentScreen, interaction.startScreen) > DRAG_THRESHOLD
      const snappedCurrentWorld = snapCanvasPointToGrid({
        config,
        point: currentWorld,
      })
      const bounds = normalizeBounds(interaction.startWorld, snappedCurrentWorld)

      setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
      interactionRef.current = {
        ...interaction,
        currentWorld: snappedCurrentWorld,
        moved,
      }
      setDraftRect(bounds)
    }
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    const interaction = interactionRef.current

    if (interaction.kind === 'none' || interaction.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    releasePointer(svgRef, event.pointerId)

    if (interaction.kind === 'create-rect') {
      const nextItem = createCanvasRect({
        adapter: creationAdapter,
        createId,
        currentWorld: interaction.currentWorld,
        startWorld: interaction.startWorld,
      })

      commitItemsPatch([{ op: 'add', path: '/-', value: nextItem }], {
        before: selection,
        after: [nextItem.id],
      })
      setTool('select')
    }

    if (interaction.kind === 'move' || interaction.kind === 'resize') {
      commitItemsPatch(
        createTransformCanvasItemsPatch(
          interaction.historyItems,
          interaction.currentItems,
        ),
        {
          before:
            interaction.kind === 'move'
              ? interaction.historySelection
              : interaction.ids,
          after: interaction.ids,
        },
      )
    }

    if (interaction.kind === 'move' && !interaction.moved && interaction.edit) {
      commitSelection([interaction.edit.id])
      setEditing(interaction.edit)
      setTool('select')
    }

    if (interaction.kind === 'marquee') {
      if (interaction.moved) {
        const nextSelection = getCanvasMarqueeSelection({
          additive: interaction.additive,
          baseSelection: interaction.baseSelection,
          bounds: normalizeBounds(
            interaction.startWorld,
            interaction.currentWorld,
          ),
          scene,
        })

        setSelection(interaction.baseSelection)
        commitSelection(nextSelection)
      } else if (!interaction.additive) {
        setSelection(interaction.baseSelection)
        commitSelection([])
      }
    }

    interactionRef.current = { kind: 'none' }
    setGesture('none')
    setMarquee(null)
    setDraftRect(null)
    setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
  }

  function handlePointerCancel(event: PointerEvent<SVGSVGElement>) {
    const interaction = interactionRef.current

    if (interaction.kind === 'move' || interaction.kind === 'resize') {
      setLiveItems(interaction.historyItems)
    } else if (interaction.kind === 'marquee') {
      setSelection(interaction.baseSelection)
    }

    releasePointer(svgRef, event.pointerId)
    interactionRef.current = { kind: 'none' }
    setGesture('none')
    setMarquee(null)
    setDraftRect(null)
    setSnapGuides(EMPTY_CANVAS_SNAP_GUIDES)
  }

  return {
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
  }
}
