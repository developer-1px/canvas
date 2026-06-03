import { describe, expect, it } from 'vitest'

import foundationInventory from '../../../docs/canvas-foundation-inventory.md?raw'
import foundationAdr from '../../../docs/adr/0003-canvas-foundation-extension-architecture.md?raw'
import extractionLedger from '../../../docs/canvas-product-extraction-ledger.md?raw'
import context from '../../../CONTEXT.md?raw'

describe('Canvas foundation architecture plan', () => {
  it('defines foundation and extension vocabulary in project context', () => {
    for (const term of [
      'Canvas Foundation',
      'Canvas Foundation Contract',
      'Canvas Extension',
      'Canvas First-party Whiteboard Extension',
    ]) {
      expect(context).toContain(term)
    }
  })

  it('records the foundation ownership decision as an ADR', () => {
    expect(foundationAdr).toContain(
      '# ADR 0003: Canvas Foundation and Extension Architecture',
    )
    expect(foundationAdr).toContain('ADR 0001')
    expect(foundationAdr).toContain('ADR 0002')
    expect(foundationAdr).toContain('zod-crud')
    expect(foundationAdr).toContain('must not import Host, App, UI, Renderer')
    expect(foundationAdr).toContain('or Engine')
    expect(foundationAdr).toContain('Demo `CanvasItem`')
    expect(foundationAdr).toContain('Issue #69')
  })

  it('keeps the inventory explicit about what can and cannot move', () => {
    for (const row of [
      '`src/canvas/foundation` | Foundation public facade',
      '`src/canvas/foundation/CanvasAlignmentSnap.ts` | Foundation',
      '`src/canvas/foundation/CanvasCommandAvailabilityRules.ts` | Foundation',
      '`src/canvas/foundation/CanvasCommandSelectionRules.ts` | Foundation',
      '`src/canvas/foundation/CanvasCommandTypes.ts` | Foundation',
      '`src/canvas/foundation/CanvasExtensionContracts.ts` | Foundation',
      '`src/canvas/foundation/CanvasFirstPartyExtensions.ts` | First-party extension',
      '`src/canvas/foundation/CanvasGestureEngine.ts` | Foundation',
      '`src/canvas/foundation/CanvasGridSnap.ts` | Foundation',
      '`src/canvas/foundation/CanvasSnapEngine.ts` | Foundation',
      '`src/canvas/foundation/CanvasSnapGeometry.ts` | Foundation',
      '`src/canvas/foundation/CanvasSnapGuides.ts` | Foundation',
      '`src/canvas/foundation/CanvasSpacingSnap.ts` | Foundation',
      '`src/canvas/foundation/CanvasSceneAdapter.ts` | Foundation',
      '`src/canvas/foundation/CanvasSelectionEngine.ts` | Foundation',
      '`src/canvas/foundation/CanvasToolGestureRouting.ts` | Foundation',
      '`src/canvas/foundation/CanvasTransformEngine.ts` | Foundation',
      '`src/canvas/core` | Foundation',
      '`src/canvas/engine` | Engine public facade',
      '`src/canvas/host/document` | Host adapter',
      '`src/canvas/app/workflow` | App',
      '`src/canvas/renderer` | Renderer',
    ]) {
      expect(foundationInventory).toContain(row)
    }

    expect(foundationInventory).toContain('must not mention Demo `CanvasItem`')
    expect(foundationInventory).toContain('zod-crud imports stay inside Host document adapters')
    expect(foundationInventory).toContain('`CanvasExtensionDescriptor` answers')
    expect(foundationInventory).toContain('first concrete first-party extension descriptor')
    expect(foundationInventory).toContain('CanvasAppExtensionBundle.foundationExtensions')
    expect(foundationInventory).toContain('getCanvasAppFoundationExtensionCommands')
    expect(foundationInventory).toContain('getCanvasAppFoundationExtensionRendererSlots')
    expect(foundationInventory).toContain('getCanvasAppFoundationExtensionTools')
    expect(foundationAdr).toContain('CanvasExtensionDescriptor')
    expect(foundationAdr).toContain('defineCanvasExtension')
    expect(foundationAdr).toContain('CANVAS_STICKY_NOTE_EXTENSION')
    expect(foundationAdr).toContain('CanvasAppExtensionBundle.foundationExtensions')
    expect(foundationAdr).toContain('getCanvasAppFoundationExtensionCommands')
    expect(foundationAdr).toContain('getCanvasAppFoundationExtensionRendererSlots')
    expect(foundationAdr).toContain('getCanvasAppFoundationExtensionTools')
  })

  it('records product pressure before promoting app-owned pieces', () => {
    expect(foundationInventory).toContain('docs/canvas-product-extraction-ledger.md')

    for (const section of [
      '# Canvas product extraction ledger',
      '## Promotion rule',
      '## App-owned product features',
      '## Foundation/package candidates',
      '## Hold list',
      '## Next extraction gate',
    ]) {
      expect(extractionLedger).toContain(section)
    }

    for (const row of [
      '| Product route `/` shell | App-owned product |',
      '| Workspace persistence | App-owned Host/App adapter |',
      '| Board JSON/SVG IO plugin | App-owned IO affordance |',
      '| Inline text editing adapter over `nano-edit` |',
      '| Whiteboard organize/mark tool bundle |',
      '| localStorage key and save debounce | Browser/runtime policy',
    ]) {
      expect(extractionLedger).toContain(row)
    }

    expect(extractionLedger).toContain('zod-crud stays behind Host document adapters')
  })
})
