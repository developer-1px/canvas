import type {
  DomEditAutoLayoutDirection,
  DomEditAutoLayoutSizeMode,
  DomEditDisplay,
} from '../../shared/model/DomEditTypes'

export type DomEditFlexParticipationAxis = 'height' | 'width'

export type DomEditFlexParticipationDescriptor = {
  axis: DomEditFlexParticipationAxis
  detail: string
  direction: DomEditAutoLayoutDirection
  kind: 'fill'
  label: string
  mode: DomEditAutoLayoutSizeMode
}

export function getDomEditFlexParticipationDescriptor({
  heightMode,
  parentDirection,
  parentDisplay,
  widthMode,
}: {
  heightMode: DomEditAutoLayoutSizeMode
  parentDirection: DomEditAutoLayoutDirection | null
  parentDisplay: DomEditDisplay | null
  widthMode: DomEditAutoLayoutSizeMode
}): DomEditFlexParticipationDescriptor | null {
  if (parentDisplay !== 'flex' || !parentDirection) {
    return null
  }

  const axis = parentDirection === 'row' ? 'width' : 'height'
  const mode = axis === 'width' ? widthMode : heightMode

  if (mode !== 'fill') {
    return null
  }

  return {
    axis,
    detail: 'grow 1 / shrink 1',
    direction: parentDirection,
    kind: 'fill',
    label: `${axis === 'width' ? 'W' : 'H'} Fill`,
    mode,
  }
}
