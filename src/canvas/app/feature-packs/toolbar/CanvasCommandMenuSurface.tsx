import {
  Fragment,
  type CSSProperties,
} from 'react'
import {
  renderCanvasToolbarItem,
  type CanvasToolbarItemRenderContext,
} from './CanvasToolbarItemRenderer'
import {
  createCanvasMenuSurfaceDescriptor,
} from './CanvasMenuSurfaceDescriptor'
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

  const menuDescriptor = createCanvasMenuSurfaceDescriptor({ ariaLabel })

  return (
    <div
      {...menuRovingFocus}
      {...menuDescriptor.rootAttributes}
      className={className}
      onClick={onClose}
      style={style}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? (
            <div
              className="toolbar-divider"
              {...menuDescriptor.separatorAttributes}
            />
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
