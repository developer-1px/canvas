export type DomEditNodeId = string

export type DomEditNode<TNodeId extends DomEditNodeId = DomEditNodeId> = {
  children?: readonly DomEditNode<TNodeId>[]
  id: TNodeId
  label: string
}

export type DomEditContentType = 'container' | 'control' | 'text'
export type DomEditDisplay = 'block' | 'flex' | 'grid' | 'inline'
export type DomEditPosition = 'absolute' | 'static'

export type DomEditLayoutContext<
  TNodeId extends DomEditNodeId = DomEditNodeId,
> = {
  contentType: DomEditContentType
  display: DomEditDisplay
  hasChildren: boolean
  label: string
  nodeId: TNodeId
  parentDisplay: DomEditDisplay | null
  parentId: TNodeId | null
  position: DomEditPosition
  showBox: boolean
  showContent: boolean
  showFlexLayout: boolean
  showGeometry: boolean
  showGridLayout: boolean
  showParentParticipation: boolean
  showSelfLayout: boolean
}

export type DomEditField =
  | 'gap'
  | 'h'
  | 'margin'
  | 'order'
  | 'opacity'
  | 'padding'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingTop'
  | 'radius'
  | 'rotation'
  | 'w'
  | 'x'
  | 'y'

export type DomEditAutoLayoutField =
  | 'align'
  | 'alignSelf'
  | 'direction'
  | 'distribution'
  | 'heightMode'
  | 'widthMode'

export type DomEditAutoLayoutDirection = 'column' | 'row'
export type DomEditAutoLayoutAlign =
  | 'auto'
  | 'center'
  | 'end'
  | 'start'
  | 'stretch'
export type DomEditAutoLayoutDistribution =
  | 'packed'
  | 'space-between'
export type DomEditAutoLayoutSizeMode =
  | 'fill'
  | 'fixed'
  | 'hug'

export type DomEditStyle = Record<DomEditField, number>

export type DomEditAutoLayout = {
  align: DomEditAutoLayoutAlign
  alignSelf: DomEditAutoLayoutAlign
  direction: DomEditAutoLayoutDirection
  distribution: DomEditAutoLayoutDistribution
  heightMode: DomEditAutoLayoutSizeMode
  widthMode: DomEditAutoLayoutSizeMode
}

export type DomEditNodeState = DomEditStyle & DomEditAutoLayout

export type DomEditState<TNodeId extends DomEditNodeId = DomEditNodeId> =
  Record<TNodeId, DomEditNodeState>

export type DomEditTextState<
  TNodeId extends DomEditNodeId = DomEditNodeId,
> = Partial<Record<TNodeId, string>>

export type DomEditViewport = {
  scale: number
  x: number
  y: number
}

export type DomEditModelAdapter<
  TNodeId extends DomEditNodeId = DomEditNodeId,
  TState extends DomEditState<TNodeId> = DomEditState<TNodeId>,
> = {
  getElement: (nodeId: TNodeId) => HTMLElement | null
  getLayoutContext: (nodeId: TNodeId) => DomEditLayoutContext<TNodeId>
  getParentId: (nodeId: TNodeId) => TNodeId | null
  getStyle: (state: TState, nodeId: TNodeId) => DomEditNodeState
  readNodeId: (element: HTMLElement | null) => TNodeId | null
}
