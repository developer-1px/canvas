import type { ReactNode } from 'react'
import type { Bounds } from '../../../../entities'
import type {
  CanvasObjectStyleControl,
} from './CanvasObjectStyleInspector'
import type { CanvasObjectInspectorCommentThread } from './CanvasObjectInspectorCommentThread'
import {
  CanvasObjectInspectorBoundsFields,
} from './CanvasObjectInspectorBoundsFields'
import {
  CanvasObjectInspectorCommentThreadView,
} from './CanvasObjectInspectorCommentThreadView'
import {
  CanvasObjectInspectorStyleControlView,
} from './CanvasObjectInspectorStyleControlView'

export {
  CANVAS_COMMENT_THREAD_MODEL,
} from './CanvasObjectInspectorCommentThreadView'

type CanvasObjectInspectorPanel = {
  content: ReactNode
  id: string
}

type CanvasObjectInspectorProps = {
  bounds: Bounds | null
  commentThread: CanvasObjectInspectorCommentThread | null
  customPanels: readonly CanvasObjectInspectorPanel[]
  disabled: boolean
  label: string | null
  styleControls: readonly CanvasObjectStyleControl[]
  onChangeBounds: (bounds: Bounds) => void
}

export function CanvasObjectInspector({
  bounds,
  commentThread,
  customPanels,
  disabled,
  label,
  styleControls,
  onChangeBounds,
}: CanvasObjectInspectorProps) {
  if (
    (!bounds || !label) &&
    !commentThread &&
    customPanels.length === 0 &&
    styleControls.length === 0
  ) {
    return null
  }

  return (
    <aside className="object-inspector" aria-label="Inspector">
      {bounds && label ? (
        <>
          <div className="inspector-header">{label}</div>
          <CanvasObjectInspectorBoundsFields
            bounds={bounds}
            disabled={disabled}
            onChangeBounds={onChangeBounds}
          />
        </>
      ) : null}
      {styleControls.length > 0 ? (
        <div className="inspector-style-controls">
          {styleControls.map((control) => (
            <CanvasObjectInspectorStyleControlView
              control={control}
              disabled={disabled}
              key={control.id}
            />
          ))}
        </div>
      ) : null}
      {commentThread ? (
        <CanvasObjectInspectorCommentThreadView thread={commentThread} />
      ) : null}
      {customPanels.map((panel) => (
        <div className="inspector-custom-panel" key={panel.id}>
          {panel.content}
        </div>
      ))}
    </aside>
  )
}
