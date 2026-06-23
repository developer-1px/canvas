import { useMemo, useState } from 'react'
import {
  CanvasApp,
  CanvasMarketplace,
} from '../canvas'
import {
  applyCanvasMarketplaceDemoOperation,
  createCanvasMarketplaceDemoModel,
  createCanvasMarketplaceDemoSource,
  type CanvasMarketplaceDemoApplyResult,
} from './CanvasMarketplaceDemoModel'
import './CanvasMarketplaceDemo.css'

export function CanvasMarketplaceDemo() {
  const [source, setSource] = useState(() => createCanvasMarketplaceDemoSource())
  const [transactions, setTransactions] =
    useState<readonly CanvasMarketplace.CanvasMarketplacePanelTransaction[]>([])
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null)
  const demoModel = useMemo(
    () => createCanvasMarketplaceDemoModel(source),
    [source],
  )
  const applyAction = async ({
    action,
    itemId,
  }: CanvasMarketplace.CanvasMarketplacePanelActionInput) => {
    const actionKey = CanvasMarketplace.getCanvasMarketplacePanelActionKey({
      actionKind: action.kind,
      itemId,
    })

    setPendingActionKey(actionKey)

    try {
      const result = await applyCanvasMarketplaceDemoOperation({
        actionKind: action.kind,
        itemId,
        source,
      })

      if (result.applied) {
        setSource(result.source)
      }

      setTransactions((current) =>
        [
          createCanvasMarketplaceDemoPanelTransaction({
            result,
            sequence: current.length + 1,
          }),
          ...current,
        ].slice(0, 12)
      )
    } finally {
      setPendingActionKey(null)
    }
  }
  const resetDemo = () => {
    setSource(createCanvasMarketplaceDemoSource())
    setTransactions([])
  }

  return (
    <main className="marketplace-demo">
      <section className="marketplace-demo-canvas" aria-label="Canvas app">
        <CanvasApp assemblyInput={demoModel.assemblyInput} />
      </section>
      <section className="marketplace-demo-market" aria-label="Marketplace">
        <CanvasMarketplace.CanvasMarketplacePanel
          baselineLabel="Core"
          model={demoModel.marketplaceModel}
          onApplyAction={applyAction}
          onReset={resetDemo}
          pendingActionKey={pendingActionKey}
          runtimeStates={demoModel.runtimeStates}
          title="Extensions"
          transactions={transactions}
        />
      </section>
    </main>
  )
}

function createCanvasMarketplaceDemoPanelTransaction({
  result,
  sequence,
}: {
  result: CanvasMarketplaceDemoApplyResult
  sequence: number
}): CanvasMarketplace.CanvasMarketplacePanelTransaction {
  return Object.freeze({
    actionKind: result.actionKind,
    changedFeaturePackIds: result.action?.changedFeaturePackIds ?? [],
    id: String(sequence),
    itemId: result.itemId,
    status: result.status,
  })
}
