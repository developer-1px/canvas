import {
  Fragment,
  type CSSProperties,
} from 'react'
import {
  renderCanvasToolbarItem,
  type CanvasToolbarItemRenderContext,
} from './CanvasToolbarItemRenderer'
import { useCanvasMenuRovingFocus } from './CanvasMenuRovingFocus'
import type { CanvasToolbarGroup } from './CanvasToolbarItems'

type CanvasCommandMenuSurfaceProps = {
  ariaLabel: string
  className: string
  context: CanvasToolbarItemRenderContext
  groups: readonly CanvasToolbarGroup[]
  onClose: () => void
  restoreFocus?: boolean
  style?: CSSProperties
}

export function CanvasCommandMenuSurface({
  ariaLabel,
  className,
  context,
  groups,
  onClose,
  restoreFocus = false,
  style,
}: CanvasCommandMenuSurfaceProps) {
  const menuRovingFocus = useCanvasMenuRovingFocus<HTMLDivElement>({
    onClose,
    restoreFocus,
  })

  if (groups.length === 0) {
    return null
  }

  return (
    <div
      {...menuRovingFocus}
      className={className}
      role="menu"
      aria-label={ariaLabel}
      onClick={onClose}
      style={style}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? (
            <div className="toolbar-divider" role="separator" />
          ) : null}
          {group.items.map((item) =>
            renderCanvasToolbarItem({
              context: { ...context, surface: 'menu' },
              item,
            }),
          )}
        </Fragment>
      ))}
    </div>
  )
}
