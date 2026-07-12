import { createElement, type ComponentType } from 'react'
import {
  defineReactDesignDefinition,
  type DesignJSONObject,
  type ReactDesignDefinitionRegistration,
  type ReactDesignIntrinsicTag,
  type ReactRegisteredDesignFallbackProps,
  type ReactRegisteredDesignRenderProps,
} from '@interactive-os/canvas/react-design'
import {
  defineRegisteredDesignDefinition,
} from '@interactive-os/canvas/editor'
import type {
  FigmaWorkspaceComponentDefinitionId,
} from '../design-document/FigmaWorkspaceComponentMetadata'
import {
  FIGMA_WORKSPACE_COMPONENT_METADATA,
} from '../design-document/FigmaWorkspaceComponentMetadata'
import {
  FIGMA_HOME_COMPONENT_METADATA,
} from '../design-document/FigmaHomeDesignDocumentSeed'
import {
  FIGMA_WIDGET_DEFINITION_ID,
} from '../design-document/FigmaWidgetDesignDocumentSeed'
import {
  FigmaHomeMetaCard,
  FigmaReactWidget,
  FigmaWorkspaceDealRow,
  FigmaWorkspaceFailingDefinition,
  FigmaWorkspaceStatCard,
} from './FigmaWorkspaceReactDefinitionViews'
import {
  createFigmaComponentDefinitionInspector,
  type FigmaComponentDefinitionInspectorMetadata,
} from './FigmaComponentDefinitionInspector'

export const FIGMA_REACT_INTRINSICS = [
  'article',
  'aside',
  'button',
  'div',
  'em',
  'footer',
  'h1',
  'h2',
  'header',
  'main',
  'nav',
  'p',
  'section',
  'span',
  'strong',
] as const satisfies readonly ReactDesignIntrinsicTag[]

export const FIGMA_WORKSPACE_REACT_DEFINITIONS = [
  createFigmaComponentDefinition({
    metadata: FIGMA_WORKSPACE_COMPONENT_METADATA[0],
    renderer: FigmaWorkspaceStatCard,
  }),
  createFigmaComponentDefinition({
    metadata: FIGMA_WORKSPACE_COMPONENT_METADATA[1],
    renderer: FigmaWorkspaceDealRow,
  }),
] as const satisfies readonly ReactDesignDefinitionRegistration[]

export const FIGMA_REACT_DEFINITIONS = [
  ...FIGMA_WORKSPACE_REACT_DEFINITIONS,
  createFigmaComponentDefinition({
    metadata: FIGMA_HOME_COMPONENT_METADATA[0],
    renderer: FigmaHomeMetaCard,
  }),
  defineReactDesignDefinition({
    definition: defineRegisteredDesignDefinition({
      id: FIGMA_WIDGET_DEFINITION_ID,
      kind: 'widget',
      props: {
        defaults: {
          delta: '+12.4%',
          label: 'Activation',
          value: '84.2',
        },
        safeParse: parseFigmaWidgetProps,
      },
      create: ({ nodeId, x, y }) => createFigmaDefinitionNode({
        definitionId: FIGMA_WIDGET_DEFINITION_ID,
        kind: 'widget',
        nodeId,
        props: {
          delta: '+12.4%',
          label: 'Activation',
          value: '84.2',
        },
        x,
        y,
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    }),
    renderer: FigmaReactWidget,
    fallback: FigmaDefinitionFallback,
  }),
] as const satisfies readonly ReactDesignDefinitionRegistration[]

export function createFigmaReactDefinitions({
  failDefinitionId,
}: {
  readonly failDefinitionId?: FigmaWorkspaceComponentDefinitionId
} = {}): readonly ReactDesignDefinitionRegistration[] {
  if (!failDefinitionId) {
    return FIGMA_REACT_DEFINITIONS
  }

  return FIGMA_REACT_DEFINITIONS.map((definition) =>
    definition.id === failDefinitionId
      ? {
          ...definition,
          renderer: FigmaWorkspaceFailingDefinition,
          render: FigmaWorkspaceFailingDefinition,
        }
      : definition)
}

function createFigmaComponentDefinition({
  metadata,
  renderer,
}: {
  readonly metadata: FigmaComponentDefinitionInspectorMetadata
  readonly renderer: ComponentType<
    ReactRegisteredDesignRenderProps<DesignJSONObject>
  >
}) {
  const id = metadata.id

  return defineReactDesignDefinition({
    definition: defineRegisteredDesignDefinition({
      id,
      kind: 'component',
      props: {
        defaults: {},
        safeParse: parseFigmaComponentProps,
      },
      create: ({ nodeId, x, y }) => createFigmaDefinitionNode({
        definitionId: id,
        kind: 'component',
        nodeId,
        props: {},
        x,
        y,
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    }),
    renderer,
    fallback: FigmaDefinitionFallback,
    Inspector: createFigmaComponentDefinitionInspector(metadata),
  })
}

function createFigmaDefinitionNode({
  definitionId,
  kind,
  nodeId,
  props,
  x,
  y,
}: {
  readonly definitionId: string
  readonly kind: 'component' | 'widget'
  readonly nodeId: string
  readonly props: DesignJSONObject
  readonly x: number
  readonly y: number
}) {
  return {
    id: nodeId,
    label: definitionId,
    definition: { id: definitionId, kind },
    children: [],
    props,
    text: null,
    layout: {},
    style: {},
    frame: {
      x,
      y,
      width: 160,
      height: 96,
      rotation: 0,
      widthMode: 'fixed' as const,
      heightMode: 'fixed' as const,
      overflow: 'visible' as const,
    },
    component: null,
  }
}

function FigmaDefinitionFallback({
  children,
  reason,
  rootProps,
}: ReactRegisteredDesignFallbackProps<DesignJSONObject>) {
  return createElement(
    'div',
    { ...rootProps, 'data-figma-definition-fallback': reason },
    children,
  )
}

function parseFigmaComponentProps(value: unknown) {
  return isRecord(value)
    ? { ok: true as const, value: value as DesignJSONObject }
    : { ok: false as const, reason: 'Figma component props must be an object' }
}

function parseFigmaWidgetProps(value: unknown) {
  if (
    isRecord(value) &&
    typeof value.delta === 'string' &&
    typeof value.label === 'string' &&
    typeof value.value === 'string'
  ) {
    return {
      ok: true as const,
      value: {
        delta: value.delta,
        label: value.label,
        value: value.value,
      },
    }
  }

  return { ok: false as const, reason: 'Figma widget props are invalid' }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
