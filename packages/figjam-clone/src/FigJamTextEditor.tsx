import type { EditorEnginePreviewSession } from '@interactive-os/canvas/editor'
import type {
  DesignNodeId,
  DomProjection,
} from '@interactive-os/canvas/react-design'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CompositionEvent,
  type KeyboardEvent,
} from 'react'

const COMPOSITION_SETTLE_DELAY_MS = 30

type CompositionPhase = 'composing' | 'idle' | 'settling'

export type FigJamTextEdit = {
  readonly draft: string
  readonly label: string
  readonly nodeId: DesignNodeId
  readonly session: EditorEnginePreviewSession
}

export function FigJamTextEditor({
  edit,
  projection,
  onCancel,
  onChange,
  onCommit,
}: {
  readonly edit: FigJamTextEdit
  readonly projection: DomProjection
  readonly onCancel: () => void
  readonly onChange: (value: string) => void
  readonly onCommit: () => void
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const compositionPhaseRef = useRef<CompositionPhase>('idle')
  const pendingBlurCommitRef = useRef(false)
  const commitGenerationRef = useRef(0)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCommitRef = useRef(onCommit)
  const measurement = projection.measure(edit.nodeId)

  useLayoutEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  useLayoutEffect(() => {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }

    const generation = commitGenerationRef.current + 1

    commitGenerationRef.current = generation
    compositionPhaseRef.current = 'idle'
    pendingBlurCommitRef.current = false

    return () => {
      if (commitGenerationRef.current === generation) {
        commitGenerationRef.current += 1
      }

      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }

      compositionPhaseRef.current = 'idle'
      pendingBlurCommitRef.current = false
    }
  }, [edit.nodeId, edit.session])

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [edit.nodeId, edit.session])

  if (!measurement) {
    return null
  }

  const clearSettleTimer = () => {
    if (settleTimerRef.current === null) {
      return
    }

    clearTimeout(settleTimerRef.current)
    settleTimerRef.current = null
  }
  const commit = () => {
    clearSettleTimer()
    compositionPhaseRef.current = 'idle'
    pendingBlurCommitRef.current = false
    commitGenerationRef.current += 1
    onCommitRef.current()
  }
  const scheduleCompositionSettle = () => {
    clearSettleTimer()
    const generation = commitGenerationRef.current + 1

    commitGenerationRef.current = generation
    settleTimerRef.current = setTimeout(() => {
      if (commitGenerationRef.current !== generation) {
        return
      }

      settleTimerRef.current = null
      if (compositionPhaseRef.current !== 'settling') {
        return
      }

      compositionPhaseRef.current = 'idle'
      if (!pendingBlurCommitRef.current) {
        return
      }

      pendingBlurCommitRef.current = false
      commitGenerationRef.current += 1
      onCommitRef.current()
    }, COMPOSITION_SETTLE_DELAY_MS)
  }
  const handleComposition = (event: CompositionEvent<HTMLTextAreaElement>) => {
    if (event.type === 'compositionstart') {
      clearSettleTimer()
      compositionPhaseRef.current = 'composing'
      commitGenerationRef.current += 1
      return
    }

    compositionPhaseRef.current = 'settling'
    scheduleCompositionSettle()
  }
  const handleBlur = () => {
    if (compositionPhaseRef.current !== 'idle') {
      pendingBlurCommitRef.current = true

      if (compositionPhaseRef.current === 'settling') {
        scheduleCompositionSettle()
      }
      return
    }

    commit()
  }
  const handleChange = (value: string) => {
    onChange(value)

    if (compositionPhaseRef.current === 'settling') {
      scheduleCompositionSettle()
    }
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.nativeEvent.isComposing ||
      compositionPhaseRef.current !== 'idle'
    ) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      clearSettleTimer()
      commitGenerationRef.current += 1
      pendingBlurCommitRef.current = false
      onCancel()
      return
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      event.stopPropagation()
      commit()
    }
  }

  return (
    <textarea
      ref={inputRef}
      aria-label={edit.label}
      className="figjam-react-text-editor"
      data-dom-edit-editor-control
      data-figjam-text-editor={edit.nodeId}
      spellCheck={false}
      style={{
        height: measurement.worldBounds.h,
        left: measurement.worldBounds.x,
        top: measurement.worldBounds.y,
        width: measurement.worldBounds.w,
      }}
      value={edit.draft}
      onBlur={handleBlur}
      onChange={(event) => handleChange(event.currentTarget.value)}
      onCompositionEnd={handleComposition}
      onCompositionStart={handleComposition}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
    />
  )
}
