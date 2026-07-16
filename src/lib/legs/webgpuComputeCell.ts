import { WebGPUComputeCell } from "../webgpu"

export async function createWebGPUComputeCell(): Promise<WebGPUComputeCell> {
  return WebGPUComputeCell.create()
}
