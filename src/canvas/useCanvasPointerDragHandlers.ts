import type {
  Dispatch,
  MutableRefObject,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from './CanvasAffordances'
import {
  DRAG_THRESHOLD,
  normalizeBounds,
  pointDistance,
  resizeBounds,
  unique,
  type Bounds,
  type CanvasItem,
  type EditingText,
  type Interaction,
  type RectItem,
  type Tool,
  type Viewport,
} from './CanvasModel'
import { releasePointer, screenPoint, screenToWorld } from './CanvasPointerGeometry'
import { resizeCanvasItems, translateCanvasItems } from './CanvasOperations'
import {
  boundsIntersect,
  findParentGroupId,
  flattenCanvasItems,
  getItemBounds,
} from './CanvasTree'

type UseCanvasPointerDragHandlersArgs = {
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  interactionRef: MutableRefObject<Interaction>
  items: CanvasItem[]
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
  viewport: Viewport
}

export function useCanvasPointerDragHandlers({
  config,
  createId,
  interactionRef,
  items,
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
        translateCanvasItems(interaction.startItems, interaction.ids, dx, dy),
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

      const bounds = resizeBounds(
        interaction.bounds,
        interaction.handle,
        currentWorld,
      )

      interactionRef.current = {
        ...interaction,
        moved: true,
      }
      setLiveItems(
        resizeCanvasItems(
          interaction.startItems,
          interaction.ids,
          interaction.bounds,
          bounds,
        ),
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

      const hitIds = unique(
        flattenCanvasItems(items)
          .filter((entry) => boundsIntersect(bounds, getItemBounds(entry.item)))
          .map((entry) => findParentGroupId(items, entry.item.id) ?? entry.item.id),
      )

      setMarquee(bounds)
      setSelection(
        interaction.additive
          ? unique([...interaction.baseSelection, ...hitIds])
          : hitIds,
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
      const rawBounds = normalizeBounds(
        interaction.startWorld,
        interaction.currentWorld,
      )
      const bounds =
        rawBounds.w > 6 && rawBounds.h > 6
          ? rawBounds
          : {
              x: interaction.startWorld.x,
              y: interaction.startWorld.y,
              w: 168,
              h: 112,
            }
      const id = createId('rect')
      const nextItem: RectItem = {
        id,
        type: 'rect',
        ...bounds,
        fill: '#fef3c7',
        stroke: '#d97706',
      }

      setItems((current) => [...current, nextItem])
      setSelection([id])
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
