import type { DesignNode } from '@interactive-os/canvas/react-design'
import {
  FIGJAM_STICKY_NOTE_DEFINITION,
  type FigJamStickyNoteTone,
} from '@interactive-os/figjam-pack'

export type FigJamStickyQuickCreateContribution = {
  readonly tone: FigJamStickyNoteTone
}

export function resolveFigJamStickyQuickCreateContribution(
  node: DesignNode | null,
): FigJamStickyQuickCreateContribution | null {
  if (
    !node ||
    node.definition.kind !== FIGJAM_STICKY_NOTE_DEFINITION.kind ||
    node.definition.id !== FIGJAM_STICKY_NOTE_DEFINITION.id
  ) {
    return null
  }

  const parsed = FIGJAM_STICKY_NOTE_DEFINITION.props.safeParse(node.props)

  return parsed.ok ? { tone: parsed.value.tone } : null
}
