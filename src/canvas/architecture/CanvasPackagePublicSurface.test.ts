import { describe, expect, it } from 'vitest'

import * as CanvasPackage from '../index'
import * as CanvasApp from '../app'
import * as CanvasAppAuthoring from '../app/authoring'
import * as CanvasCore from '../core'
import * as CanvasEditor from '../editor-engine'
import * as CanvasFoundation from '../foundation'
import * as CanvasEngine from '../engine'
import * as CanvasEntities from '../entities'
import * as CanvasHost from '../host'
import * as CanvasReactDesign from '../react-design'
import * as CanvasRenderer from '../renderer'

describe('Canvas package public surface', () => {
  const facades = {
    app: CanvasApp,
    appAuthoring: CanvasAppAuthoring,
    core: CanvasCore,
    editor: CanvasEditor,
    engine: CanvasEngine,
    entities: CanvasEntities,
    foundation: CanvasFoundation,
    host: CanvasHost,
    package: CanvasPackage,
    reactDesign: CanvasReactDesign,
    renderer: CanvasRenderer,
  } as const

  it('snapshots facade runtime value exports', () => {
    const publicSurface = Object.fromEntries(
      Object.entries(facades).map(([name, facade]) => [
        name,
        Object.keys(facade).sort(),
      ]),
    )

    expect(publicSurface).toMatchSnapshot()
  })

  it('keeps entities facade type-only at runtime', () => {
    expect(Object.keys(CanvasEntities)).toEqual([])
  })
})
