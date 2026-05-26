import {
  Fragment,
  type CSSProperties,
} from 'react'
import { ToolbarDivider } from './CanvasToolbarButtons'
import {
  renderCanvasToolbarItem,
  type CanvasToolbarItemRenderContext,
} from './CanvasToolbarItemRenderer'
import type { CanvasToolbarGroup } from './CanvasToolbarItems'

type CanvasCommandSurfaceProps = {
  ariaLabel: string
  className: string
  context: CanvasToolbarItemRenderContext
  dataPlacement?: string
  groups: readonly CanvasToolbarGroup[]
  onClick?: () => void
  style?: CSSProperties
}

export function CanvasCommandSurface({
  ariaLabel,
  className,
  context,
  dataPlacement,
  groups,
  onClick,
  style,
}: CanvasCommandSurfaceProps) {
  if (groups.length === 0) {
    return null
  }

  return (
    <div
      className={className}
      role="toolbar"
      aria-label={ariaLabel}
      data-placement={dataPlacement}
      onClick={onClick}
      style={style}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? <ToolbarDivider /> : null}
          {group.items.map((item) =>
            renderCanvasToolbarItem({ context, item }),
          )}
        </Fragment>
      ))}
    </div>
  )
}
