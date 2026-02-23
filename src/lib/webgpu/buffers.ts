export const UNIFORM_ALIGNMENT = 256

export function alignTo(value: number, alignment: number = UNIFORM_ALIGNMENT): number {
  return Math.ceil(value / alignment) * alignment
}

export function createStorageBuffer(
  device: GPUDevice,
  data: ArrayBufferView,
  options: { label?: string; usage?: GPUBufferUsageFlags } = {},
): GPUBuffer {
  const usage = options.usage ?? (GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST)
  const buffer = device.createBuffer({
    label: options.label,
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
  })
  const mapped = buffer.getMappedRange()
  new Uint8Array(mapped).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength))
  buffer.unmap()
  return buffer
}

export function createEmptyStorageBuffer(
  device: GPUDevice,
  byteLength: number,
  options: { label?: string; usage?: GPUBufferUsageFlags } = {},
): GPUBuffer {
  const usage = options.usage ?? (GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
  return device.createBuffer({
    label: options.label,
    size: byteLength,
    usage,
  })
}

export function createUniformBuffer(
  device: GPUDevice,
  data: ArrayBufferView,
  options: { label?: string } = {},
): GPUBuffer {
  const size = alignTo(data.byteLength)
  const buffer = device.createBuffer({
    label: options.label,
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(buffer, 0, data.buffer, data.byteOffset, data.byteLength)
  return buffer
}

export async function readBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  byteLength: number,
): Promise<ArrayBuffer> {
  const readback = device.createBuffer({
    size: byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  const encoder = device.createCommandEncoder()
  encoder.copyBufferToBuffer(buffer, 0, readback, 0, byteLength)
  device.queue.submit([encoder.finish()])
  await readback.mapAsync(GPUMapMode.READ)
  const mapped = readback.getMappedRange()
  const copy = mapped.slice(0)
  readback.unmap()
  readback.destroy()
  return copy
}
