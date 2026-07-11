import type {
  ReactDesignWidgetFallbackProps,
  ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import type { FigJamStickyNoteProps } from './FigJamStickyNoteDefinition'

export function FigJamStickyNote({
  node,
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamStickyNoteProps>) {
  return (
    <article
      {...rootProps}
      className={joinClassNames(
        rootProps.className,
        'figjam-sticky-note',
      )}
      data-figjam-widget="sticky-note"
      data-sticky-tone={props.tone}
    >
      {node.text}
    </article>
  )
}

export function FigJamStickyNoteFallback({
  props,
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamStickyNoteProps>) {
  return (
    <article
      {...rootProps}
      className={joinClassNames(
        rootProps.className,
        'figjam-sticky-note',
        'figjam-widget-fallback',
      )}
      data-figjam-widget="sticky-note"
      data-figjam-widget-error={reason}
      data-sticky-tone={props.tone}
    >
      Sticky note unavailable
    </article>
  )
}

function joinClassNames(...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}
