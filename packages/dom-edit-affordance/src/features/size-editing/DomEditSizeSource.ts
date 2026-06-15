import type {
  DomEditAutoLayoutSizeMode,
  DomEditDisplay,
} from '../../shared/model/DomEditTypes'
import { canDomEditFillParent } from './DomEditSizeMode'

export type DomEditSizeSourceAxis = 'height' | 'width'
export type DomEditSizeSourceKind = DomEditAutoLayoutSizeMode | 'content'

export type DomEditSizeSourceDescriptor = {
  ariaLabel: string
  axis: DomEditSizeSourceAxis
  axisLabel: 'H' | 'W'
  isParentRelative: boolean
  kind: DomEditSizeSourceKind
  label: string
  valueLabel: string
}

export function getDomEditSizeSourceDescriptor({
  axis,
  mode,
  parentDisplay,
  value,
}: {
  axis: DomEditSizeSourceAxis
  mode: DomEditAutoLayoutSizeMode
  parentDisplay: DomEditDisplay | null
  value: number
}): DomEditSizeSourceDescriptor {
  const axisLabel = axis === 'width' ? 'W' : 'H'
  const label = getDomEditSizeSourceLabel(mode)
  const valueLabel = String(Math.round(value))

  return {
    ariaLabel: `${axisLabel} ${valueLabel} ${label}`,
    axis,
    axisLabel,
    isParentRelative: mode === 'fill' && canDomEditFillParent(parentDisplay),
    kind: mode,
    label,
    valueLabel,
  }
}

export function getDomEditSizeSourceLabel(
  mode: DomEditAutoLayoutSizeMode,
) {
  if (mode === 'fill') {
    return 'Fill'
  }

  if (mode === 'hug') {
    return 'Hug'
  }

  return 'Fixed'
}
