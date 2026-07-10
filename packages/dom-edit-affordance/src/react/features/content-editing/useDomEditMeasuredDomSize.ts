import {
  useLayoutEffect,
  useState,
} from 'react'
import type {
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'

type DomEditMeasuredDomSize = {
  h: number
  w: number
}

type DomEditMeasuredDomSizeState<TNodeId extends DomEditNodeId> = {
  nodeId: TNodeId
  size: DomEditMeasuredDomSize
}

export function useDomEditMeasuredDomSize<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  selectedNodeId,
  state,
  viewport,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  selectedNodeId: TNodeId | null
  state: TState
  viewport: DomEditViewport
}): DomEditMeasuredDomSize | null {
  const [measurement, setMeasurement] =
    useState<DomEditMeasuredDomSizeState<TNodeId> | null>(null)

  useLayoutEffect(() => {
    if (!selectedNodeId) {
      const frame = requestAnimationFrame(() => {
        setMeasurement(null)
      })

      return () => cancelAnimationFrame(frame)
    }

    const target = adapter.getElement(selectedNodeId)

    if (adapter.measure) {
      const frame = requestAnimationFrame(() => {
        const nextSize = adapter.measure?.(selectedNodeId) ?? null

        setMeasurement(nextSize
          ? { nodeId: selectedNodeId, size: nextSize }
          : null)
      })

      return () => cancelAnimationFrame(frame)
    }

    if (!target) {
      const frame = requestAnimationFrame(() => {
        setMeasurement(null)
      })

      return () => cancelAnimationFrame(frame)
    }

    let frame = 0
    const measure = () => {
      const rect = target.getBoundingClientRect()
      const scale = viewport.scale > 0 ? viewport.scale : 1
      const nextSize = {
        h: Math.round(rect.height / scale),
        w: Math.round(rect.width / scale),
      }

      setMeasurement((current) =>
        current &&
        current.nodeId === selectedNodeId &&
        current.size.h === nextSize.h &&
        current.size.w === nextSize.w
          ? current
          : { nodeId: selectedNodeId, size: nextSize })
    }
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    scheduleMeasure()

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(target)
    window.addEventListener('resize', scheduleMeasure)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [adapter, selectedNodeId, state, viewport.scale])

  return measurement?.nodeId === selectedNodeId ? measurement.size : null
}
