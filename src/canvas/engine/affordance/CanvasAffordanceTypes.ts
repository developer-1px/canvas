import type {
  CANVAS_AFFORDANCE_CONFIG_DEFAULTS,
  CanvasAffordanceConfigGroup,
} from './CanvasAffordanceCatalog'

type CanvasAffordanceConfigDefaults =
  typeof CANVAS_AFFORDANCE_CONFIG_DEFAULTS

export type CanvasCommandId = keyof CanvasAffordanceConfigDefaults['commands']
export type CanvasGestureId = keyof CanvasAffordanceConfigDefaults['gestures']
export type CanvasOverlayId = keyof CanvasAffordanceConfigDefaults['overlays']
export type CanvasShortcutId =
  keyof CanvasAffordanceConfigDefaults['shortcuts']

type CanvasAffordanceGroupId<Group extends CanvasAffordanceConfigGroup> =
  keyof CanvasAffordanceConfigDefaults[Group] & string

type CanvasAffordanceGroupConfig<Group extends CanvasAffordanceConfigGroup> =
  Readonly<Record<CanvasAffordanceGroupId<Group>, boolean>>

type CanvasAffordanceGroupConfigInput<
  Group extends CanvasAffordanceConfigGroup,
> = Partial<Record<CanvasAffordanceGroupId<Group>, boolean>>

export type CanvasAffordanceConfig = {
  readonly [Group in CanvasAffordanceConfigGroup]: CanvasAffordanceGroupConfig<Group>
}

export type CanvasAffordanceConfigInput = {
  readonly [Group in CanvasAffordanceConfigGroup]?: CanvasAffordanceGroupConfigInput<Group>
}
