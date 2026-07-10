import {
  Component,
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import type {
  DesignDocumentRead,
  DesignNode,
  DesignNodeId,
} from '../design-document'
import type { DomProjection } from '../dom-projection'
import {
  type ReactDesignDefinitionRegistry,
  type ReactDesignRootProps,
} from './ReactDesignDefinitionRegistry'
import { createReactDesignNodeDomProps } from './ReactDesignNodeDomProps'

export type ReactDesignRendererProps = {
  readonly projection: DomProjection
  readonly read: DesignDocumentRead
  readonly registry: ReactDesignDefinitionRegistry
}

export function ReactDesignRenderer({
  projection,
  read,
  registry,
}: ReactDesignRendererProps) {
  return (
    <Fragment>
      {read.roots().map((node) => (
        <ReactDesignNodeRenderer
          key={node.id}
          node={node}
          parent={null}
          projection={projection}
          read={read}
          registry={registry}
        />
      ))}
    </Fragment>
  )
}

function ReactDesignNodeRenderer({
  node,
  parent,
  projection,
  read,
  registry,
}: {
  readonly node: DesignNode
  readonly parent: DesignNode | null
  readonly projection: DomProjection
  readonly read: DesignDocumentRead
  readonly registry: ReactDesignDefinitionRegistry
}) {
  const ref = useDomProjectionRegistration(projection, node.id)
  const resolution = registry.resolve(node.definition)
  const children: ReactNode = node.text ?? read.children(node.id).map((child) => (
    <ReactDesignNodeRenderer
      key={child.id}
      node={child}
      parent={node}
      projection={projection}
      read={read}
      registry={registry}
    />
  ))
  const rootProps = {
    ...createReactDesignNodeDomProps(node, parent),
    ref,
    'data-design-node-id': node.id,
    'data-design-definition-id': node.definition.id,
  } satisfies ReactDesignRootProps

  if (!resolution) {
    return createRenderFallback(rootProps, children, 'unknown-definition')
  }

  const renderedNode = resolution.kind === 'intrinsic'
    ? createElement(resolution.tag, rootProps, children)
    : createElement(resolution.definition.render, {
        children,
        node,
        rootProps,
      })

  return (
    <ReactDesignNodeErrorBoundary
      fallback={createRenderFallback(rootProps, children, 'render-failed')}
      resetDefinition={resolution.kind === 'registered'
        ? resolution.definition
        : resolution.tag}
      resetNode={node}
    >
      {renderedNode}
    </ReactDesignNodeErrorBoundary>
  )
}

type ReactDesignNodeErrorBoundaryProps = {
  readonly children: ReactNode
  readonly fallback: ReactNode
  readonly resetDefinition: unknown
  readonly resetNode: DesignNode
}

type ReactDesignNodeErrorBoundaryState = {
  readonly failed: boolean
}

class ReactDesignNodeErrorBoundary extends Component<
  ReactDesignNodeErrorBoundaryProps,
  ReactDesignNodeErrorBoundaryState
> {
  state: ReactDesignNodeErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ReactDesignNodeErrorBoundaryState {
    return { failed: true }
  }

  componentDidUpdate(previous: ReactDesignNodeErrorBoundaryProps) {
    if (
      this.state.failed &&
      (
        previous.resetNode !== this.props.resetNode ||
        previous.resetDefinition !== this.props.resetDefinition
      )
    ) {
      this.setState({ failed: false })
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function createRenderFallback(
  rootProps: ReactDesignRootProps,
  children: ReactNode,
  error: 'render-failed' | 'unknown-definition',
) {
  return createElement(
    'div',
    { ...rootProps, 'data-design-render-error': error },
    children,
  )
}

function useDomProjectionRegistration(
  projection: DomProjection,
  nodeId: DesignNodeId,
) {
  const cleanupRef = useRef<(() => void) | null>(null)
  const ref = useCallback((element: HTMLElement | null) => {
    cleanupRef.current?.()
    cleanupRef.current = element ? projection.register(nodeId, element) : null
  }, [nodeId, projection])

  useEffect(() => () => {
    cleanupRef.current?.()
    cleanupRef.current = null
  }, [])

  return ref
}
