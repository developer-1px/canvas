import {
  Check,
  CircleSlash,
  PackagePlus,
  Power,
  PowerOff,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import type {
  CanvasMarketplaceFeaturePackRuntimeStateInput,
} from './CanvasMarketplaceFeaturePacks'
import type {
  CanvasMarketplaceItem,
  CanvasMarketplaceModel,
  CanvasMarketplacePrimaryAction,
  CanvasMarketplacePrimaryActionKind,
  CanvasMarketplaceSection,
  CanvasMarketplaceSectionKind,
} from './CanvasMarketplaceModel'
import {
  getCanvasMarketplacePanelActionKey,
  getCanvasMarketplacePanelItemId,
  type CanvasMarketplacePanelActionInput,
  type CanvasMarketplacePanelItemId,
  type CanvasMarketplacePanelTransaction,
} from './CanvasMarketplacePanelActions'
import './CanvasMarketplacePanel.css'

export type CanvasMarketplacePanelProps = Readonly<{
  baselineLabel?: string
  model: CanvasMarketplaceModel
  onApplyAction?: (input: CanvasMarketplacePanelActionInput) => void
  onReset?: () => void
  pendingActionKey?: string | null
  runtimeStates?: readonly CanvasMarketplaceFeaturePackRuntimeStateInput[]
  title?: string
  transactions?: readonly CanvasMarketplacePanelTransaction[]
}>

export function CanvasMarketplacePanel({
  baselineLabel = 'Core',
  model,
  onApplyAction,
  onReset,
  pendingActionKey = null,
  runtimeStates = [],
  title = 'Marketplace',
  transactions = [],
}: CanvasMarketplacePanelProps) {
  const [selectedSectionKind, setSelectedSectionKind] =
    useState<CanvasMarketplaceSectionKind>('profiles')
  const [selectedItemId, setSelectedItemId] =
    useState<CanvasMarketplacePanelItemId | null>(null)
  const [query, setQuery] = useState('')
  const sections = model.sections
  const selectedSection =
    sections.find((section) => section.kind === selectedSectionKind) ??
    sections[0] ??
    null
  const visibleItems = useMemo(
    () => selectedSection
      ? getCanvasMarketplacePanelVisibleItems({
        query,
        section: selectedSection,
      })
      : [],
    [query, selectedSection],
  )
  const selectedItem = visibleItems.find((item) =>
    getCanvasMarketplacePanelItemId(item) === selectedItemId
  ) ?? visibleItems[0] ?? null
  const packSummary = model.packs.items.length > 0
    ? model.sections.find((section) => section.kind === 'packs')?.summary
    : null
  const applyAction = (input: CanvasMarketplacePanelActionInput) => {
    onApplyAction?.(input)
  }
  const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value)
  }

  return (
    <aside className="canvas-marketplace-panel" aria-label={title}>
      <header className="canvas-marketplace-header">
        <h1>{title}</h1>
        {onReset ? (
          <button
            aria-label="Reset marketplace"
            onClick={onReset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        ) : null}
      </header>
      <label className="canvas-marketplace-search">
        <Search aria-hidden="true" size={14} strokeWidth={2} />
        <input
          aria-label="Search marketplace"
          onChange={updateQuery}
          placeholder="Search"
          type="search"
          value={query}
        />
      </label>
      <nav className="canvas-marketplace-tabs" aria-label="Marketplace sections">
        {sections.map((section) => (
          <button
            aria-pressed={section.kind === selectedSection?.kind}
            key={section.kind}
            onClick={() => {
              setSelectedSectionKind(section.kind)
              setSelectedItemId(null)
            }}
            type="button"
          >
            <span>{section.label}</span>
            <strong>{section.summary.itemCount}</strong>
          </button>
        ))}
      </nav>
      <div className="canvas-marketplace-body">
        <section
          className="canvas-marketplace-list"
          aria-label={selectedSection?.label ?? 'Marketplace items'}
        >
          {visibleItems.map((item) => {
            const itemId = getCanvasMarketplacePanelItemId(item)

            return (
              <CanvasMarketplaceItemButton
                item={item}
                itemId={itemId}
                key={itemId}
                onSelect={setSelectedItemId}
                selected={selectedItem !== null &&
                  getCanvasMarketplacePanelItemId(selectedItem) === itemId}
              />
            )
          })}
        </section>
        <section className="canvas-marketplace-detail" aria-label="Details">
          {selectedItem ? (
            <CanvasMarketplaceItemDetail
              canApply={Boolean(onApplyAction)}
              item={selectedItem}
              onApplyAction={applyAction}
              pendingActionKey={pendingActionKey}
            />
          ) : null}
        </section>
      </div>
      <CanvasMarketplaceStackLedger
        baselineLabel={baselineLabel}
        enabledCount={packSummary?.enabledItemCount ?? 0}
        installedCount={packSummary?.installedItemCount ?? 0}
        readyCount={packSummary?.primaryReadyItemCount ?? 0}
        runtimeStates={runtimeStates}
        transactions={transactions}
      />
    </aside>
  )
}

function CanvasMarketplaceItemButton({
  item,
  itemId,
  onSelect,
  selected,
}: {
  item: CanvasMarketplaceItem
  itemId: CanvasMarketplacePanelItemId
  onSelect: (itemId: CanvasMarketplacePanelItemId) => void
  selected: boolean
}) {
  return (
    <button
      aria-pressed={selected}
      className="canvas-marketplace-list-item"
      onClick={() => onSelect(itemId)}
      type="button"
    >
      <span className="canvas-marketplace-list-item__title">
        {item.packageContract.label}
      </span>
      <span className="canvas-marketplace-list-item__meta">
        {getCanvasMarketplaceItemMeta(item)}
      </span>
      <span
        className="canvas-marketplace-status"
        data-status={item.packageState.primaryStatus}
      >
        {item.packageState.primaryStatus}
      </span>
    </button>
  )
}

function CanvasMarketplaceItemDetail({
  canApply,
  item,
  onApplyAction,
  pendingActionKey,
}: {
  canApply: boolean
  item: CanvasMarketplaceItem
  onApplyAction: (input: CanvasMarketplacePanelActionInput) => void
  pendingActionKey: string | null
}) {
  const itemId = getCanvasMarketplacePanelItemId(item)
  const actions = item.actions as readonly CanvasMarketplacePrimaryAction[]
  const actionChangeIds = getCanvasMarketplaceDetailChangedIds(actions)

  return (
    <>
      <header className="canvas-marketplace-detail-header">
        <h2>{item.packageContract.label}</h2>
        <span
          className="canvas-marketplace-status"
          data-status={item.packageState.primaryStatus}
        >
          {item.packageState.primaryStatus}
        </span>
      </header>
      <div className="canvas-marketplace-detail-actions">
        {actions.map((action) => {
          const actionKey = getCanvasMarketplacePanelActionKey({
            actionKind: action.kind,
            itemId,
          })
          const busy = pendingActionKey === actionKey
          const disabled =
            !canApply || pendingActionKey !== null || !action.ready

          return (
            <button
              aria-label={`${getCanvasMarketplaceActionLabel(action.kind)} ${item.packageContract.label}`}
              disabled={disabled}
              key={action.kind}
              onClick={() => onApplyAction({ action, item, itemId })}
              title={getCanvasMarketplaceActionTitle(action)}
              type="button"
            >
              <CanvasMarketplaceActionIcon kind={action.kind} />
              <span>
                {busy ? '...' : getCanvasMarketplaceActionLabel(action.kind)}
              </span>
            </button>
          )
        })}
      </div>
      <dl className="canvas-marketplace-detail-facts">
        {getCanvasMarketplaceDetailFacts(item).map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {actionChangeIds.length > 0 ? (
        <section className="canvas-marketplace-detail-section">
          <h3>Next change</h3>
          <ul className="canvas-marketplace-token-list">
            {actionChangeIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <CanvasMarketplaceMembers item={item} />
    </>
  )
}

function CanvasMarketplaceMembers({
  item,
}: {
  item: CanvasMarketplaceItem
}) {
  const contract = item.packageContract

  if (contract.kind === 'pack') {
    const surfaces = contract.contributes.surfaces
    const deps = [...contract.requires, ...contract.optionalRequires]

    return (
      <>
        {surfaces.length > 0 ? (
          <section className="canvas-marketplace-detail-section">
            <h3>Surfaces</h3>
            <ul className="canvas-marketplace-token-list">
              {surfaces.map((surface) => (
                <li key={surface}>{surface}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {deps.length > 0 ? (
          <section className="canvas-marketplace-detail-section">
            <h3>Dependencies</h3>
            <ul className="canvas-marketplace-token-list">
              {deps.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </>
    )
  }

  return (
    <section className="canvas-marketplace-detail-section">
      <h3>Included packs</h3>
      <ul className="canvas-marketplace-member-list">
        {contract.memberPackages.map((member) => (
          <li key={member.featurePackId}>
            <span>{member.label}</span>
            <code>{member.featurePackId}</code>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CanvasMarketplaceStackLedger({
  baselineLabel,
  enabledCount,
  installedCount,
  readyCount,
  runtimeStates,
  transactions,
}: {
  baselineLabel: string
  enabledCount: number
  installedCount: number
  readyCount: number
  runtimeStates: readonly CanvasMarketplaceFeaturePackRuntimeStateInput[]
  transactions: readonly CanvasMarketplacePanelTransaction[]
}) {
  const activeStates = runtimeStates.filter((state) =>
    state.status !== 'uninstalled'
  )

  return (
    <section className="canvas-marketplace-ledger" aria-label="Current stack">
      <dl className="canvas-marketplace-summary">
        <div>
          <dt>Installed</dt>
          <dd>{installedCount}</dd>
        </div>
        <div>
          <dt>Enabled</dt>
          <dd>{enabledCount}</dd>
        </div>
        <div>
          <dt>Ready</dt>
          <dd>{readyCount}</dd>
        </div>
      </dl>
      <div className="canvas-marketplace-stack">
        <h2>Current stack</h2>
        <ol>
          <li data-status="core">
            <span>{baselineLabel}</span>
            <strong>base</strong>
          </li>
          {activeStates.map((state) => (
            <li data-status={state.status ?? 'enabled'} key={state.id}>
              <span>{state.id}</span>
              <strong>{state.status ?? 'enabled'}</strong>
            </li>
          ))}
        </ol>
      </div>
      {transactions.length > 0 ? (
        <div className="canvas-marketplace-history">
          <h2>History</h2>
          <ol>
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <strong>{transaction.actionKind}</strong>
                <span>{transaction.itemId}</span>
                <small>{transaction.status}</small>
                <em>{transaction.changedFeaturePackIds.length}</em>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}

function CanvasMarketplaceActionIcon({
  kind,
}: {
  kind: CanvasMarketplacePrimaryActionKind
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

function getCanvasMarketplacePanelVisibleItems({
  query,
  section,
}: {
  query: string
  section: CanvasMarketplaceSection
}) {
  const items = section.items as readonly CanvasMarketplaceItem[]
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) {
    return items
  }

  return items.filter((item) =>
    [
      item.packageContract.label,
      getCanvasMarketplacePanelItemId(item),
      getCanvasMarketplaceItemMeta(item),
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
  )
}

function getCanvasMarketplaceItemMeta(item: CanvasMarketplaceItem) {
  const contract = item.packageContract

  if (contract.kind === 'pack') {
    return contract.package.name ?? contract.id
  }

  if (contract.kind === 'suite') {
    return `${contract.memberPackages.length} packs`
  }

  return `${contract.targetInstalledFeaturePackIds.length} installed targets`
}

function getCanvasMarketplaceActionLabel(
  kind: CanvasMarketplacePrimaryActionKind,
) {
  if (kind === 'uninstall') {
    return 'Remove'
  }

  return kind.slice(0, 1).toUpperCase() + kind.slice(1)
}

function getCanvasMarketplaceActionTitle(
  action: CanvasMarketplacePrimaryAction,
) {
  const blocked =
    action.blockedReasons.length + action.marketplaceBlockedReasons.length

  if (blocked > 0) {
    return `${getCanvasMarketplaceActionLabel(action.kind)}: ${blocked} blocked`
  }

  return getCanvasMarketplaceActionLabel(action.kind)
}

function getCanvasMarketplaceDetailFacts(item: CanvasMarketplaceItem) {
  const contract = item.packageContract

  if (contract.kind === 'pack') {
    return [
      {
        label: 'Package',
        value: contract.package.name ?? contract.id,
      },
      {
        label: 'Version',
        value: contract.version,
      },
      {
        label: 'Category',
        value: contract.category,
      },
    ]
  }

  if (contract.kind === 'suite') {
    return [
      {
        label: 'Kind',
        value: 'suite',
      },
      {
        label: 'Members',
        value: String(contract.memberPackages.length),
      },
    ]
  }

  return [
    {
      label: 'Kind',
      value: 'profile',
    },
    {
      label: 'Targets',
      value: String(contract.targetInstalledFeaturePackIds.length),
    },
  ]
}

function getCanvasMarketplaceDetailChangedIds(
  actions: readonly CanvasMarketplacePrimaryAction[],
) {
  const primaryReadyAction = actions.find((action) => action.ready) ??
    actions.find((action) => action.applicable)

  return primaryReadyAction?.changedFeaturePackIds ?? []
}
