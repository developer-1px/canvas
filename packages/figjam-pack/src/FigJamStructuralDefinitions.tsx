/* eslint-disable react-refresh/only-export-components */
import type {
  DesignNode,
  ReactDesignDefinitionRenderProps,
} from '@interactive-os/canvas/react-design'
import {
  defineRegisteredDesignDefinition,
  defineReactDesignDefinition,
} from '@interactive-os/canvas/react-design'

import {
  assertFinitePlacement,
  assertPositiveSize,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_BOARD_DEFINITION_ID = 'figjam.board'
export const FIGJAM_SECTION_DEFINITION_ID = 'figjam.section'
export const FIGJAM_GROUP_DEFINITION_ID = 'figjam.group'

export type CreateFigJamBoardNodeInput = Partial<FigJamPlacementInput> &
  FigJamSizeInput & {
    readonly label?: string
    readonly nodeId: string
  }

export type CreateFigJamSectionNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly label?: string
  }

export type CreateFigJamGroupNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly label?: string
  }

const FIGJAM_BOARD_PROPS = Object.freeze({ className: 'figjam-board' })
const FIGJAM_STRUCTURAL_PROPS = Object.freeze({ position: 'absolute' })

export const FIGJAM_BOARD_DEFINITION = defineReactDesignDefinition({
  definition: defineRegisteredDesignDefinition({
    id: FIGJAM_BOARD_DEFINITION_ID,
    kind: 'component',
    props: {
      defaults: FIGJAM_BOARD_PROPS,
      safeParse: parseFigJamBoardProps,
    },
    create: ({ nodeId, x, y }) => createFigJamBoardNode({
      height: 800,
      nodeId,
      width: 1200,
      x,
      y,
    }),
    capabilities: {
      textEdit: false,
      transform: { move: false, resize: false },
    },
  }),
  renderer: FigJamBoard,
  fallback: FigJamStructuralFallback,
})

export const FIGJAM_SECTION_DEFINITION = defineReactDesignDefinition({
  definition: defineRegisteredDesignDefinition({
    id: FIGJAM_SECTION_DEFINITION_ID,
    kind: 'component',
    props: {
      defaults: FIGJAM_STRUCTURAL_PROPS,
      safeParse: parseFigJamStructuralProps,
    },
    create: ({ nodeId, x, y }) => createFigJamSectionNode({
      height: 340,
      nodeId,
      width: 340,
      x,
      y,
    }),
    capabilities: {
      textEdit: false,
      transform: { move: true, resize: true },
    },
  }),
  renderer: FigJamSection,
  fallback: FigJamStructuralFallback,
})

export const FIGJAM_GROUP_DEFINITION = defineReactDesignDefinition({
  definition: defineRegisteredDesignDefinition({
    id: FIGJAM_GROUP_DEFINITION_ID,
    kind: 'component',
    props: {
      defaults: FIGJAM_STRUCTURAL_PROPS,
      safeParse: parseFigJamStructuralProps,
    },
    create: ({ nodeId, x, y }) => createFigJamGroupNode({
      height: 160,
      nodeId,
      width: 240,
      x,
      y,
    }),
    capabilities: {
      textEdit: false,
      transform: { move: true, resize: true },
    },
  }),
  renderer: FigJamGroup,
  fallback: FigJamStructuralFallback,
})

export const FIGJAM_STRUCTURAL_DEFINITIONS = Object.freeze([
  FIGJAM_BOARD_DEFINITION,
  FIGJAM_SECTION_DEFINITION,
  FIGJAM_GROUP_DEFINITION,
] as const)

export function createFigJamBoardNode({
  height = 800,
  label = 'FigJam board',
  nodeId,
  width = 1200,
  x = 0,
  y = 0,
}: CreateFigJamBoardNodeInput): DesignNode {
  assertFinitePlacement({ nodeId, x, y })
  assertPositiveSize(width, 'board width')
  assertPositiveSize(height, 'board height')

  return {
    id: nodeId,
    label,
    definition: { id: FIGJAM_BOARD_DEFINITION_ID, kind: 'component' },
    children: [],
    props: { className: 'figjam-board' },
    text: null,
    layout: {},
    style: {},
    frame: {
      x,
      y,
      width,
      height,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'fixed',
      overflow: 'visible',
    },
    component: null,
  }
}

export function createFigJamSectionNode({
  height = 340,
  label = 'Section',
  nodeId,
  width = 340,
  x,
  y,
}: CreateFigJamSectionNodeInput) {
  return createFigJamStructuralNode({
    definitionId: FIGJAM_SECTION_DEFINITION_ID,
    height,
    label,
    nodeId,
    width,
    x,
    y,
  })
}

export function createFigJamGroupNode({
  height = 160,
  label = 'Group',
  nodeId,
  width = 240,
  x,
  y,
}: CreateFigJamGroupNodeInput) {
  return createFigJamStructuralNode({
    definitionId: FIGJAM_GROUP_DEFINITION_ID,
    height,
    label,
    nodeId,
    width,
    x,
    y,
  })
}

function createFigJamStructuralNode({
  definitionId,
  height,
  label,
  nodeId,
  width,
  x,
  y,
}: FigJamPlacementInput & {
  readonly definitionId: string
  readonly height: number
  readonly label: string
  readonly width: number
}): DesignNode {
  assertFinitePlacement({ nodeId, x, y })
  assertPositiveSize(width, `${label} width`)
  assertPositiveSize(height, `${label} height`)

  return {
    id: nodeId,
    label,
    definition: { id: definitionId, kind: 'component' },
    children: [],
    props: { position: 'absolute' },
    text: null,
    layout: {
      x,
      y,
      w: width,
      h: height,
      widthMode: 'fixed',
      heightMode: 'fixed',
    },
    style: {},
    frame: null,
    component: null,
  }
}

function FigJamBoard({
  children,
  node,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return (
    <section
      {...rootProps}
      aria-label={node.label}
      className={joinClassNames(rootProps.className, 'figjam-board')}
      data-figjam-structure="board"
    >
      {children}
    </section>
  )
}

function FigJamSection({
  children,
  node,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return (
    <section
      {...rootProps}
      aria-label={node.label}
      className={joinClassNames(rootProps.className, 'figjam-section')}
      data-figjam-structure="section"
    >
      <header>{node.label}</header>
      {children}
    </section>
  )
}

function FigJamGroup({
  children,
  node,
  rootProps,
}: ReactDesignDefinitionRenderProps) {
  return (
    <div
      {...rootProps}
      aria-label={node.label}
      className={joinClassNames(rootProps.className, 'figjam-group')}
      data-figjam-structure="group"
    >
      {children}
    </div>
  )
}

function FigJamStructuralFallback({
  children,
  reason,
  rootProps,
}: ReactDesignDefinitionRenderProps & { readonly reason: string }) {
  return (
    <div
      {...rootProps}
      data-figjam-structure-fallback={reason}
    >
      {children}
    </div>
  )
}

function parseFigJamBoardProps(value: unknown) {
  return isRecord(value) && value.className === FIGJAM_BOARD_PROPS.className
    ? { ok: true as const, value: FIGJAM_BOARD_PROPS }
    : { ok: false as const, reason: 'FigJam board props are invalid' }
}

function parseFigJamStructuralProps(value: unknown) {
  return isRecord(value) && value.position === 'absolute'
    ? { ok: true as const, value: FIGJAM_STRUCTURAL_PROPS }
    : { ok: false as const, reason: 'FigJam structural props are invalid' }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
