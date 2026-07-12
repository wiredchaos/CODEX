export type SpatialRenderProfile = {
  enabled: boolean
  reducedMotion: boolean
  lowPower: boolean
  mobile: boolean
  dpr: [number, number]
  objectCount: number
  frameloop: "always" | "demand" | "never"
}

export const SPATIAL_DPR_CAP: [number, number] = [1, 1.5]
export const SPATIAL_STATIC_BREAKPOINT = 640

export function getSpatialRenderProfile(options: {
  reducedMotion?: boolean
  width?: number
  saveData?: boolean
  hardwareConcurrency?: number
  disabled?: boolean
}): SpatialRenderProfile {
  const reducedMotion = Boolean(options.reducedMotion)
  const mobile = typeof options.width === "number" ? options.width < SPATIAL_STATIC_BREAKPOINT : false
  const lowPower = Boolean(options.saveData) || mobile || (typeof options.hardwareConcurrency === "number" && options.hardwareConcurrency <= 4)
  const enabled = !options.disabled && !reducedMotion && !lowPower

  return {
    enabled,
    reducedMotion,
    lowPower,
    mobile,
    dpr: SPATIAL_DPR_CAP,
    objectCount: lowPower ? 8 : 18,
    frameloop: enabled ? "demand" : "never",
  }
}
