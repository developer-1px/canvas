export type CanvasAppCapabilitySnapshot = {
  comment: boolean
  editDocument: boolean
  export: boolean
  follow: boolean
  present: boolean
  view: boolean
}

export type CanvasAppCapabilityInput = Partial<CanvasAppCapabilitySnapshot>

export type CanvasAppCapabilityAssemblyInput = {
  capabilities?: CanvasAppCapabilityInput
}

export type CanvasAppCapabilityAssembly = {
  capabilities: CanvasAppCapabilitySnapshot
}
