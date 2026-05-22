import type {
  Dispatch,
  MutableRefObject,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../engine/CanvasAffordances'
import {
  DRAG_THRESHOLD,
  normalizeBounds,
  pointDistance,
  type Bounds,
  type Tool,
  type Viewport,
} from '../engine/CanvasPrimitives'
import type {
  CanvasItem,
  EditingText,
  Interaction,
} from '../host/CanvasModel'
import {
  createCanvasRect,
  type CanvasCreationAdapter,
} from '../engine/CanvasCreationEngine'
import { releasePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import { getCanvasMarqueeSelection } from '../engine/CanvasSelectionEngine'
import type { CanvasSceneAdapter } from '../engine/CanvasSceneAdapter'
import {
  moveCanvasSelection,
  resizeCanvasSelection,
  type CanvasTransformAdapter,
} from '../engine/CanvasTransformEngine'

type UseCanvasPointerDragHandlersArgs = {
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  interactionRef: MutableRefObject<Interaction>
  scene: CanvasSceneAdapter
  recordHistoryFrom: (before: CanvasItem[]) => void
  setItems: Dispatch<SetStateAction<CanvasItem[]>>
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setLiveItems: Dispatch<SetStateAction<CanvasItem[]>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSelection: Dispatch<SetStateAction<string[]>>
  setTool: Dispatch<SetStateAction<Tool>>
  setViewport: Dispatch<SetStateAction<Viewport>>
  svgRef: RefObject<SVGSVGElement | null>
  transformAdapter: CanvasTransformAdapter<CanvasItem>
  viewport: Viewport
}

export function useCanvasPointerDragHandlers({
  config,
  creationAdapter,
  createId,
  interactionRef,
  scene,
  recordHistoryFrom,
  setItems,
  setDraftRect,
  setEditing,
  setGesture,
  setLiveItems,
  setMarquee,
  setSelection,
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

      interactionRef.current = {
        ...interaction,
        moved: true,
      }
      setLiveItems(
        moveCanvasSelection({
          adapter: transformAdapter,
          dx,
          dy,
          items: interaction.startItems,
          selection: interaction.ids,
        }),
      )
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

      interactionRef.current = {
        ...interaction,
        moved: true,
      }
      setLiveItems(
        resizeCanvasSelection({
          adapter: transformAdapter,
          bounds: interaction.bounds,
          handle: interaction.handle,
          items: interaction.startItems,
          point: currentWorld,
          selection: interaction.ids,
        }),
      )
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
      const bounds = normalizeBounds(interaction.startWorld, currentWorld)

      interactionRef.current = {
        ...interaction,
        currentWorld,
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

      setItems((current) => [...current, nextItem])
      setSelection([nextItem.id])
      setTool('select')
    }

    if (interaction.kind === 'move' || interaction.kind === 'resize') {
      recordHistoryFrom(interaction.historyItems)
    }

    if (interaction.kind === 'move' && !interaction.moved && interaction.edit) {
      setSelection([interaction.edit.id])
      setEditing(interaction.edit)
      setTool('select')
    }

    if (interaction.kind === 'marquee' && !interaction.moved) {
      if (!interaction.additive) {
        setSelection([])
      }
    }

    interactionRef.current = { kind: 'none' }
    setGesture('none')
    setMarquee(null)
    setDraftRect(null)
  }

  function handlePointerCancel(event: PointerEvent<SVGSVGElement>) {
    const interaction = interactionRef.current

    if (interaction.kind === 'move' || interaction.kind === 'resize') {
      setLiveItems(interaction.historyItems)
    }

    releasePointer(svgRef, event.pointerId)
    interactionRef.current = { kind: 'none' }
    setGesture('none')
    setMarquee(null)
    setDraftRect(null)
  }

  return {
    handlePointerCancel,
    handlePointerMove,
    handlePointerUp,
  }
}
