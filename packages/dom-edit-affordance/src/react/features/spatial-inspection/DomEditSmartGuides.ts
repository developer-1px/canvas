import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'

export type DomEditSmartGuideAxis = 'x' | 'y'

export type DomEditSmartGuideSource = 'parent' | 'sibling'

export type DomEditSmartGuideFamily =
  | 'alignment'
  | 'distance'
  | 'equal-spacing'

export type DomEditSmartGuideEmphasis = 'normal' | 'snap'

export type DomEditSmartGuideLineOrientation = 'horizontal' | 'vertical'

export type DomEditSmartGuidePointKind = 'center' | 'edge' | 'spacing'

export type DomEditSmartGuidePointPosition =
  | 'bottom'
  | 'center-x'
  | 'center-y'
  | 'left'
  | 'right'
  | 'top'

export type DomEditSmartGuideSpacingKind = 'equal' | 'nearest'

export type DomEditSmartGuideSpacingSource =
  | 'css-gap'
  | 'margin'
  | 'visual-gap'

export type DomEditSmartGuideCandidate = {
  id?: string
  margin?: number
  rect: DomEditOverlayRect
  source: DomEditSmartGuideSource
}

export type DomEditSmartGuideSpacingContext = {
  parentGap?: number | null
  selectedMargin?: number
}

export type DomEditSmartGuide = {
  axis: DomEditSmartGuideAxis
  coordinate: number
  distance: number
  emphasis: DomEditSmartGuideEmphasis
  family: DomEditSmartGuideFamily
  from: number
  length: number
  orientation: DomEditSmartGuideLineOrientation
  pointKind: DomEditSmartGuidePointKind
  referencePosition?: DomEditSmartGuidePointPosition
  source: DomEditSmartGuideSource
  sourceId?: string
  spacingKind?: DomEditSmartGuideSpacingKind
  spacingSource?: DomEditSmartGuideSpacingSource
  targetPosition?: DomEditSmartGuidePointPosition
}

type DomEditSmartGuidePoint = {
  axis: DomEditSmartGuideAxis
  kind: Exclude<DomEditSmartGuidePointKind, 'spacing'>
  position: DomEditSmartGuidePointPosition
  spanEnd: number
  spanStart: number
  value: number
}

type DomEditSmartGuideRectEntry = {
  id?: string
  margin: number
  rect: DomEditOverlayRect
  role: 'reference' | 'selected'
  source?: DomEditSmartGuideSource
}

type DomEditSmartGuideGap = {
  after: DomEditSmartGuideRectEntry
  axis: DomEditSmartGuideAxis
  before: DomEditSmartGuideRectEntry
  coordinate: number
  from: number
  value: number
}

const DEFAULT_DOM_EDIT_SMART_GUIDE_THRESHOLD = 2

export function getDomEditSmartGuides({
  isDragging = false,
  parent,
  selected,
  siblings = [],
  spacingContext = {},
  spacingTolerance = DEFAULT_DOM_EDIT_SMART_GUIDE_THRESHOLD,
  threshold = DEFAULT_DOM_EDIT_SMART_GUIDE_THRESHOLD,
}: {
  isDragging?: boolean
  parent?: DomEditOverlayRect | null
  selected: DomEditOverlayRect
  siblings?: readonly DomEditSmartGuideCandidate[]
  spacingContext?: DomEditSmartGuideSpacingContext
  spacingTolerance?: number
  threshold?: number
}): DomEditSmartGuide[] {
  const selectedPoints = getDomEditSmartGuidePoints(selected)
  const candidates = [
    ...(parent ? [{ rect: parent, source: 'parent' as const }] : []),
    ...siblings,
  ]
  const alignmentGuides = candidates.flatMap((candidate) =>
    getDomEditCandidateAlignmentGuides({
      candidate,
      isDragging,
      selectedPoints,
      threshold,
    }))

  return dedupeDomEditSmartGuides([
    ...getClosestDomEditAlignmentGuidesByAxis(alignmentGuides),
    ...getDomEditNearestDistanceGuides({
      selected,
      siblings,
      spacingContext,
    }),
    ...getDomEditEqualSpacingGuides({
      isDragging,
      selected,
      siblings,
      spacingContext,
      spacingTolerance,
    }),
  ])
}

function getDomEditCandidateAlignmentGuides({
  candidate,
  isDragging,
  selectedPoints,
  threshold,
}: {
  candidate: DomEditSmartGuideCandidate
  isDragging: boolean
  selectedPoints: readonly DomEditSmartGuidePoint[]
  threshold: number
}): DomEditSmartGuide[] {
  const referencePoints = getDomEditSmartGuidePoints(candidate.rect)
  const guides: DomEditSmartGuide[] = []

  for (const selectedPoint of selectedPoints) {
    for (const referencePoint of referencePoints) {
      if (selectedPoint.axis !== referencePoint.axis) {
        continue
      }

      const distance = Math.abs(selectedPoint.value - referencePoint.value)

      if (distance > threshold) {
        continue
      }

      const from = Math.min(selectedPoint.spanStart, referencePoint.spanStart)
      const to = Math.max(selectedPoint.spanEnd, referencePoint.spanEnd)
      const length = to - from

      if (length <= 0.5) {
        continue
      }

      guides.push({
        axis: selectedPoint.axis,
        coordinate: referencePoint.value,
        distance,
        emphasis: getDomEditSmartGuideEmphasis({
          distance,
          isDragging,
          threshold,
        }),
        family: 'alignment',
        from,
        length,
        orientation: selectedPoint.axis === 'x' ? 'vertical' : 'horizontal',
        pointKind: selectedPoint.kind === 'center' ||
          referencePoint.kind === 'center'
          ? 'center'
          : 'edge',
        referencePosition: referencePoint.position,
        source: candidate.source,
        ...(candidate.id ? { sourceId: candidate.id } : {}),
        targetPosition: selectedPoint.position,
      })
    }
  }

  return guides
}

function getDomEditNearestDistanceGuides({
  selected,
  siblings,
  spacingContext,
}: {
  selected: DomEditOverlayRect
  siblings: readonly DomEditSmartGuideCandidate[]
  spacingContext: DomEditSmartGuideSpacingContext
}): DomEditSmartGuide[] {
  const selectedEntry = getDomEditSelectedRectEntry(
    selected,
    spacingContext.selectedMargin,
  )
  const closestGapByAxis = new Map<DomEditSmartGuideAxis, DomEditSmartGuideGap>()

  for (const sibling of siblings) {
    const siblingEntry = getDomEditReferenceRectEntry(sibling)

    for (const axis of ['x', 'y'] as const) {
      const gap = getDomEditRectGap(axis, selectedEntry, siblingEntry)

      if (!gap) {
        continue
      }

      const current = closestGapByAxis.get(axis)

      if (!current || gap.value < current.value) {
        closestGapByAxis.set(axis, gap)
      }
    }
  }

  return [...closestGapByAxis.values()].map((gap) =>
    createDomEditSpacingGuide({
      family: 'distance',
      gap,
      spacingContext,
      spacingKind: 'nearest',
    }))
}

function getDomEditEqualSpacingGuides({
  isDragging,
  selected,
  siblings,
  spacingContext,
  spacingTolerance,
}: {
  isDragging: boolean
  selected: DomEditOverlayRect
  siblings: readonly DomEditSmartGuideCandidate[]
  spacingContext: DomEditSmartGuideSpacingContext
  spacingTolerance: number
}): DomEditSmartGuide[] {
  if (siblings.length < 2) {
    return []
  }

  const entries = [
    getDomEditSelectedRectEntry(selected, spacingContext.selectedMargin),
    ...siblings.map(getDomEditReferenceRectEntry),
  ]

  return (['x', 'y'] as const).flatMap((axis) => {
    const gaps = getDomEditSortedRectGaps(axis, entries)
    const selectedGaps = gaps.filter(hasDomEditSelectedGapEntry)

    return selectedGaps.flatMap((selectedGap) => {
      const matchingGaps = gaps.filter((gap) =>
        Math.abs(gap.value - selectedGap.value) <= spacingTolerance)

      if (matchingGaps.length < 2) {
        return []
      }

      return matchingGaps.map((gap) =>
        createDomEditSpacingGuide({
          distance: Math.abs(gap.value - selectedGap.value),
          emphasis: isDragging ? 'snap' : 'normal',
          family: 'equal-spacing',
          gap,
          spacingContext,
          spacingKind: 'equal',
        }))
    })
  })
}

function getDomEditSmartGuidePoints(
  rect: DomEditOverlayRect,
): DomEditSmartGuidePoint[] {
  const right = rect.x + rect.w
  const bottom = rect.y + rect.h
  const centerX = rect.x + rect.w / 2
  const centerY = rect.y + rect.h / 2

  return [
    {
      axis: 'x',
      kind: 'edge',
      position: 'left',
      spanEnd: bottom,
      spanStart: rect.y,
      value: rect.x,
    },
    {
      axis: 'x',
      kind: 'center',
      position: 'center-x',
      spanEnd: bottom,
      spanStart: rect.y,
      value: centerX,
    },
    {
      axis: 'x',
      kind: 'edge',
      position: 'right',
      spanEnd: bottom,
      spanStart: rect.y,
      value: right,
    },
    {
      axis: 'y',
      kind: 'edge',
      position: 'top',
      spanEnd: right,
      spanStart: rect.x,
      value: rect.y,
    },
    {
      axis: 'y',
      kind: 'center',
      position: 'center-y',
      spanEnd: right,
      spanStart: rect.x,
      value: centerY,
    },
    {
      axis: 'y',
      kind: 'edge',
      position: 'bottom',
      spanEnd: right,
      spanStart: rect.x,
      value: bottom,
    },
  ]
}

function getDomEditSelectedRectEntry(
  rect: DomEditOverlayRect,
  margin = 0,
): DomEditSmartGuideRectEntry {
  return {
    margin,
    rect,
    role: 'selected',
  }
}

function getDomEditReferenceRectEntry(
  candidate: DomEditSmartGuideCandidate,
): DomEditSmartGuideRectEntry {
  return {
    id: candidate.id,
    margin: candidate.margin ?? 0,
    rect: candidate.rect,
    role: 'reference',
    source: candidate.source,
  }
}

function getDomEditSortedRectGaps(
  axis: DomEditSmartGuideAxis,
  entries: readonly DomEditSmartGuideRectEntry[],
): DomEditSmartGuideGap[] {
  const sorted = [...entries].sort((left, right) =>
    getDomEditRectStart(axis, left.rect) - getDomEditRectStart(axis, right.rect))
  const gaps: DomEditSmartGuideGap[] = []

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const before = sorted[index]
    const after = sorted[index + 1]

    if (!before || !after) {
      continue
    }

    const gap = getDomEditOrderedRectGap(axis, before, after)

    if (gap) {
      gaps.push(gap)
    }
  }

  return gaps
}

function getDomEditRectGap(
  axis: DomEditSmartGuideAxis,
  first: DomEditSmartGuideRectEntry,
  second: DomEditSmartGuideRectEntry,
): DomEditSmartGuideGap | null {
  const firstEnd = getDomEditRectEnd(axis, first.rect)
  const secondEnd = getDomEditRectEnd(axis, second.rect)

  if (firstEnd <= getDomEditRectStart(axis, second.rect)) {
    return getDomEditOrderedRectGap(axis, first, second)
  }

  if (secondEnd <= getDomEditRectStart(axis, first.rect)) {
    return getDomEditOrderedRectGap(axis, second, first)
  }

  return null
}

function getDomEditOrderedRectGap(
  axis: DomEditSmartGuideAxis,
  before: DomEditSmartGuideRectEntry,
  after: DomEditSmartGuideRectEntry,
): DomEditSmartGuideGap | null {
  const from = getDomEditRectEnd(axis, before.rect)
  const to = getDomEditRectStart(axis, after.rect)
  const value = to - from

  if (value <= 0.5) {
    return null
  }

  return {
    after,
    axis,
    before,
    coordinate: getDomEditGapLineCoordinate(axis, before.rect, after.rect),
    from,
    value,
  }
}

function hasDomEditSelectedGapEntry(gap: DomEditSmartGuideGap): boolean {
  return gap.before.role === 'selected' || gap.after.role === 'selected'
}

function createDomEditSpacingGuide({
  distance = 0,
  emphasis = 'normal',
  family,
  gap,
  spacingContext,
  spacingKind,
}: {
  distance?: number
  emphasis?: DomEditSmartGuideEmphasis
  family: Extract<DomEditSmartGuideFamily, 'distance' | 'equal-spacing'>
  gap: DomEditSmartGuideGap
  spacingContext: DomEditSmartGuideSpacingContext
  spacingKind: DomEditSmartGuideSpacingKind
}): DomEditSmartGuide {
  const sourceEntry = getDomEditGapSourceEntry(gap)
  const sourceId = getDomEditGapSourceId(gap)

  return {
    axis: gap.axis,
    coordinate: gap.coordinate,
    distance: family === 'distance' ? gap.value : distance,
    emphasis,
    family,
    from: gap.from,
    length: gap.value,
    orientation: gap.axis === 'x' ? 'horizontal' : 'vertical',
    pointKind: 'spacing',
    source: sourceEntry.source ?? 'sibling',
    ...(sourceId ? { sourceId } : {}),
    spacingKind,
    spacingSource: getDomEditSpacingSource(gap, spacingContext),
  }
}

function getDomEditSpacingSource(
  gap: DomEditSmartGuideGap,
  spacingContext: DomEditSmartGuideSpacingContext,
): DomEditSmartGuideSpacingSource {
  const parentGap = spacingContext.parentGap ?? 0
  const marginContribution = gap.before.margin + gap.after.margin

  if (
    marginContribution > 0 &&
    isCloseDomEditSmartGuideSpacingValue(
      gap.value,
      parentGap + marginContribution,
    )
  ) {
    return 'margin'
  }

  if (
    parentGap > 0 &&
    isCloseDomEditSmartGuideSpacingValue(gap.value, parentGap)
  ) {
    return 'css-gap'
  }

  return 'visual-gap'
}

function isCloseDomEditSmartGuideSpacingValue(
  actual: number,
  expected: number,
) {
  return Math.abs(actual - expected) <= DEFAULT_DOM_EDIT_SMART_GUIDE_THRESHOLD
}

function getDomEditGapSourceEntry(
  gap: DomEditSmartGuideGap,
): DomEditSmartGuideRectEntry {
  if (gap.before.role === 'selected') {
    return gap.after
  }

  if (gap.after.role === 'selected') {
    return gap.before
  }

  return gap.after
}

function getDomEditGapSourceId(gap: DomEditSmartGuideGap): string | undefined {
  const ids = [gap.before, gap.after]
    .filter((entry) => entry.role === 'reference' && entry.id)
    .map((entry) => entry.id)

  return ids.length > 0 ? ids.join(':') : undefined
}

function getDomEditRectStart(
  axis: DomEditSmartGuideAxis,
  rect: DomEditOverlayRect,
) {
  return axis === 'x' ? rect.x : rect.y
}

function getDomEditRectEnd(
  axis: DomEditSmartGuideAxis,
  rect: DomEditOverlayRect,
) {
  return getDomEditRectStart(axis, rect) + (axis === 'x' ? rect.w : rect.h)
}

function getDomEditRectCenter(
  axis: DomEditSmartGuideAxis,
  rect: DomEditOverlayRect,
) {
  return getDomEditRectStart(axis, rect) + (axis === 'x' ? rect.w : rect.h) / 2
}

function getDomEditGapLineCoordinate(
  axis: DomEditSmartGuideAxis,
  before: DomEditOverlayRect,
  after: DomEditOverlayRect,
) {
  const crossAxis = axis === 'x' ? 'y' : 'x'
  const overlapStart = Math.max(
    getDomEditRectStart(crossAxis, before),
    getDomEditRectStart(crossAxis, after),
  )
  const overlapEnd = Math.min(
    getDomEditRectEnd(crossAxis, before),
    getDomEditRectEnd(crossAxis, after),
  )

  return overlapEnd - overlapStart > 0.5
    ? overlapStart + (overlapEnd - overlapStart) / 2
    : (getDomEditRectCenter(crossAxis, before) +
      getDomEditRectCenter(crossAxis, after)) / 2
}

function getClosestDomEditAlignmentGuidesByAxis(
  guides: readonly DomEditSmartGuide[],
): DomEditSmartGuide[] {
  const closestDistanceByAxis = new Map<DomEditSmartGuideAxis, number>()

  for (const guide of guides) {
    const current = closestDistanceByAxis.get(guide.axis)

    if (current === undefined || guide.distance < current) {
      closestDistanceByAxis.set(guide.axis, guide.distance)
    }
  }

  return guides.filter((guide) =>
    guide.distance === closestDistanceByAxis.get(guide.axis))
}

function getDomEditSmartGuideEmphasis({
  distance,
  isDragging,
  threshold,
}: {
  distance: number
  isDragging: boolean
  threshold: number
}): DomEditSmartGuideEmphasis {
  return isDragging && distance <= threshold ? 'snap' : 'normal'
}

function dedupeDomEditSmartGuides(
  guides: readonly DomEditSmartGuide[],
): DomEditSmartGuide[] {
  const guideByKey = new Map<string, DomEditSmartGuide>()

  for (const guide of guides) {
    const key = getDomEditSmartGuideDedupeKey(guide)
    const current = guideByKey.get(key)

    if (current && compareDomEditSmartGuidePriority(current, guide) >= 0) {
      continue
    }

    guideByKey.set(key, guide)
  }

  return [...guideByKey.values()]
}

function getDomEditSmartGuideDedupeKey(guide: DomEditSmartGuide) {
  if (guide.family === 'alignment') {
    return [
      guide.family,
      guide.axis,
      roundDomEditSmartGuideKeyPart(guide.coordinate),
      guide.pointKind,
    ].join(':')
  }

  return [
    'spacing',
    guide.axis,
    roundDomEditSmartGuideKeyPart(guide.coordinate),
    roundDomEditSmartGuideKeyPart(guide.from),
    roundDomEditSmartGuideKeyPart(guide.length),
  ].join(':')
}

function compareDomEditSmartGuidePriority(
  current: DomEditSmartGuide,
  next: DomEditSmartGuide,
) {
  const currentPriority = getDomEditSmartGuidePriority(current)
  const nextPriority = getDomEditSmartGuidePriority(next)

  if (currentPriority !== nextPriority) {
    return currentPriority - nextPriority
  }

  if (current.distance !== next.distance) {
    return next.distance - current.distance
  }

  return current.length - next.length
}

function getDomEditSmartGuidePriority(guide: DomEditSmartGuide) {
  const familyPriority = guide.family === 'alignment'
    ? 300
    : guide.family === 'equal-spacing'
      ? 200
      : 100
  const emphasisPriority = guide.emphasis === 'snap' ? 1000 : 0
  const sourcePriority = guide.source === 'sibling' ? 10 : 0
  const centerPriority = guide.pointKind === 'center' ? 1 : 0

  return familyPriority + emphasisPriority + sourcePriority + centerPriority
}

function roundDomEditSmartGuideKeyPart(value: number) {
  return Math.round(value * 10) / 10
}
