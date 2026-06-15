import type {
  DomEditAutoLayoutSizeMode,
  DomEditDisplay,
} from '../../shared/model/DomEditTypes'

export function canDomEditFillParent(
  parentDisplay: DomEditDisplay | null,
): boolean {
  return parentDisplay === 'flex' || parentDisplay === 'grid'
}

export function getDomEditToggledAxisSizeMode({
  mode,
  parentDisplay,
}: {
  mode: DomEditAutoLayoutSizeMode
  parentDisplay: DomEditDisplay | null
}): DomEditAutoLayoutSizeMode {
  if (mode === 'fill') {
    return 'hug'
  }

  if (mode === 'hug' && canDomEditFillParent(parentDisplay)) {
    return 'fill'
  }

  return 'hug'
}
