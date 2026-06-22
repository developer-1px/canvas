import {
  Check,
  CircleSlash,
  PackagePlus,
  Power,
  PowerOff,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  CanvasApp,
  type CanvasAppFeaturePackMarketplaceItem,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackMarketplacePrimaryActionKind,
  type CanvasAppFeaturePackMarketplaceSection,
} from '../canvas'
import {
  applyCanvasMarketplaceDemoOperation,
  createCanvasMarketplaceDemoModel,
  createCanvasMarketplaceDemoSource,
  getCanvasMarketplaceDemoItemId,
  type CanvasMarketplaceDemoApplyResult,
  type CanvasMarketplaceDemoItemId,
} from './CanvasMarketplaceDemoModel'
import './CanvasMarketplaceDemo.css'

export function CanvasMarketplaceDemo() {
  const [source, setSource] = useState(() => createCanvasMarketplaceDemoSource())
  const [lastResult, setLastResult] =
    useState<CanvasMarketplaceDemoApplyResult | null>(null)
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null)
  const demoModel = useMemo(
    () => createCanvasMarketplaceDemoModel(source),
    [source],
  )
  const packSection = demoModel.sections.find((section) =>
    section.kind === 'packs'
  )
  const applyAction = async ({
    action,
    itemId,
  }: {
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    itemId: CanvasMarketplaceDemoItemId
  }) => {
    const actionKey = getMarketplaceActionKey({ actionKind: action.kind, itemId })

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

      setLastResult(result)
    } finally {
      setPendingActionKey(null)
    }
  }
  const resetDemo = () => {
    setSource(createCanvasMarketplaceDemoSource())
    setLastResult(null)
  }

  return (
    <main className="marketplace-demo">
      <section className="marketplace-demo-canvas" aria-label="Canvas app">
        <CanvasApp assemblyInput={demoModel.assemblyInput} />
      </section>
      <aside className="marketplace-demo-rail" aria-label="Marketplace">
        <header className="marketplace-demo-rail-header">
          <h1>Marketplace</h1>
          <button
            aria-label="Reset marketplace demo"
            onClick={resetDemo}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        </header>
        <MarketplaceRuntimeSummary
          enabled={packSection?.summary.enabledItemCount ?? 0}
          installed={packSection?.summary.installedItemCount ?? 0}
          ready={packSection?.summary.primaryReadyItemCount ?? 0}
        />
        <div className="marketplace-demo-sections">
          {demoModel.sections.map((section) => (
            <MarketplaceSection
              key={section.kind}
              onApply={applyAction}
              pendingActionKey={pendingActionKey}
              section={section}
            />
          ))}
        </div>
        <MarketplaceActivity result={lastResult} />
      </aside>
    </main>
  )
}

function MarketplaceRuntimeSummary({
  enabled,
  installed,
  ready,
}: {
  enabled: number
  installed: number
  ready: number
}) {
  return (
    <dl className="marketplace-runtime-summary">
      <div>
        <dt>Installed</dt>
        <dd>{installed}</dd>
      </div>
      <div>
        <dt>Enabled</dt>
        <dd>{enabled}</dd>
      </div>
      <div>
        <dt>Ready</dt>
        <dd>{ready}</dd>
      </div>
    </dl>
  )
}

function MarketplaceSection({
  onApply,
  pendingActionKey,
  section,
}: {
  onApply: (input: {
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    itemId: CanvasMarketplaceDemoItemId
  }) => void
  pendingActionKey: string | null
  section: CanvasAppFeaturePackMarketplaceSection
}) {
  const items = section.items as readonly CanvasAppFeaturePackMarketplaceItem[]

  return (
    <section className="marketplace-section" aria-label={section.label}>
      <header className="marketplace-section-header">
        <h2>{section.label}</h2>
        <span>{section.summary.itemCount}</span>
      </header>
      <ul className="marketplace-item-list">
        {items.map((item) => (
          <MarketplaceItemRow
            item={item}
            key={getCanvasMarketplaceDemoItemId(item)}
            onApply={onApply}
            pendingActionKey={pendingActionKey}
          />
        ))}
      </ul>
    </section>
  )
}

function MarketplaceItemRow({
  item,
  onApply,
  pendingActionKey,
}: {
  item: CanvasAppFeaturePackMarketplaceItem
  onApply: (input: {
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    itemId: CanvasMarketplaceDemoItemId
  }) => void
  pendingActionKey: string | null
}) {
  const itemId = getCanvasMarketplaceDemoItemId(item)
  const actions =
    item.actions as readonly CanvasAppFeaturePackMarketplacePrimaryAction[]
  const meta = getMarketplaceItemMeta(item)

  return (
    <li className="marketplace-item">
      <div className="marketplace-item-main">
        <div className="marketplace-item-title-row">
          <h3>{item.packageContract.label}</h3>
          <span>{item.packageState.primaryStatus}</span>
        </div>
        <p>{meta}</p>
      </div>
      <div className="marketplace-item-actions">
        {actions.map((action) => {
          const actionKey = getMarketplaceActionKey({
            actionKind: action.kind,
            itemId,
          })
          const busy = pendingActionKey === actionKey
          const disabled = pendingActionKey !== null || !action.ready

          return (
            <button
              aria-label={`${getMarketplaceActionLabel(action.kind)} ${item.packageContract.label}`}
              disabled={disabled}
              key={action.kind}
              onClick={() => onApply({ action, itemId })}
              title={getMarketplaceActionTitle(action)}
              type="button"
            >
              <MarketplaceActionIcon kind={action.kind} />
              <span>{busy ? '...' : getMarketplaceActionLabel(action.kind)}</span>
            </button>
          )
        })}
      </div>
    </li>
  )
}

function MarketplaceActivity({
  result,
}: {
  result: CanvasMarketplaceDemoApplyResult | null
}) {
  if (!result) {
    return null
  }

  return (
    <section className="marketplace-activity" aria-label="Last transaction">
      <strong>{result.status}</strong>
      <span>{result.actionKind}</span>
      <code>{result.itemId}</code>
      {result.action ? <span>{result.action.changedFeaturePackIds.length}</span> : null}
    </section>
  )
}

function MarketplaceActionIcon({
  kind,
}: {
  kind: CanvasAppFeaturePackMarketplacePrimaryActionKind
}) {
  if (kind === 'install') {
    return <PackagePlus aria-hidden="true" size={13} strokeWidth={2} />
  }

  if (kind === 'enable') {
    return <Power aria-hidden="true" size={13} strokeWidth={2} />
  }

  if (kind === 'disable') {
    return <PowerOff aria-hidden="true" size={13} strokeWidth={2} />
  }

  if (kind === 'uninstall') {
    return <Trash2 aria-hidden="true" size={13} strokeWidth={2} />
  }

  if (kind === 'apply') {
    return <Check aria-hidden="true" size={13} strokeWidth={2} />
  }

  return <CircleSlash aria-hidden="true" size={13} strokeWidth={2} />
}

function getMarketplaceActionLabel(
  kind: CanvasAppFeaturePackMarketplacePrimaryActionKind,
) {
  if (kind === 'uninstall') {
    return 'Remove'
  }

  return kind.slice(0, 1).toUpperCase() + kind.slice(1)
}

function getMarketplaceActionTitle(
  action: CanvasAppFeaturePackMarketplacePrimaryAction,
) {
  const blocked =
    action.blockedReasons.length + action.marketplaceBlockedReasons.length

  if (blocked > 0) {
    return `${getMarketplaceActionLabel(action.kind)}: ${blocked} blocked`
  }

  return getMarketplaceActionLabel(action.kind)
}

function getMarketplaceActionKey({
  actionKind,
  itemId,
}: {
  actionKind: CanvasAppFeaturePackMarketplacePrimaryActionKind
  itemId: CanvasMarketplaceDemoItemId
}) {
  return `${itemId}:${actionKind}`
}

function getMarketplaceItemMeta(item: CanvasAppFeaturePackMarketplaceItem) {
  const contract = item.packageContract

  if (contract.kind === 'pack') {
    return contract.package.name ?? contract.id
  }

  if (contract.kind === 'suite') {
    return `${contract.memberPackages.length} packs`
  }

  return `${contract.targetInstalledFeaturePackIds.length} installed targets`
}
