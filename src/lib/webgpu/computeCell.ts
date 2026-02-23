import {
  createEmptyStorageBuffer,
  createStorageBuffer,
  createUniformBuffer,
  readBuffer,
} from "./buffers"

export type ComputeSubmission = {
  inputBuffers: ArrayBufferView[]
  outputByteLengths: number[]
  shader: string
  uniforms?: ArrayBufferView
  workgroupCount: [number, number, number]
  entryPoint?: string
  label?: string
}

export type ComputeResult = {
  outputBuffers: ArrayBuffer[]
}

export class WebGPUComputeCell {
  private pipelineCache = new Map<string, GPUComputePipeline>()

  constructor(private readonly device: GPUDevice) {}

  static async create(): Promise<WebGPUComputeCell> {
    if (typeof navigator === "undefined" || !navigator.gpu) {
      throw new Error("WebGPU is not available in this runtime.")
    }

    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      throw new Error("WebGPU adapter not available.")
    }

    const device = await adapter.requestDevice()
    return new WebGPUComputeCell(device)
  }

  async submit(submission: ComputeSubmission): Promise<ComputeResult> {
    const {
      inputBuffers,
      outputByteLengths,
      shader,
      uniforms,
      workgroupCount,
      entryPoint = "main",
      label,
    } = submission

    const bindGroupEntries: GPUBindGroupEntry[] = []
    const layoutEntries: GPUBindGroupLayoutEntry[] = []

    const inputStorageBuffers = inputBuffers.map((input, index) => {
      const buffer = createStorageBuffer(this.device, input, {
        label: `${label ?? "compute"}-input-${index}`,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
      bindGroupEntries.push({ binding: index, resource: { buffer } })
      layoutEntries.push({
        binding: index,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage" },
      })
      return buffer
    })

    const outputOffset = inputStorageBuffers.length
    const outputBuffers = outputByteLengths.map((byteLength, index) => {
      const buffer = createEmptyStorageBuffer(this.device, byteLength, {
        label: `${label ?? "compute"}-output-${index}`,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      })
      bindGroupEntries.push({ binding: outputOffset + index, resource: { buffer } })
      layoutEntries.push({
        binding: outputOffset + index,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" },
      })
      return buffer
    })

    let uniformBuffer: GPUBuffer | undefined
    if (uniforms) {
      const uniformBinding = outputOffset + outputBuffers.length
      uniformBuffer = createUniformBuffer(this.device, uniforms, {
        label: `${label ?? "compute"}-uniforms`,
      })
      bindGroupEntries.push({ binding: uniformBinding, resource: { buffer: uniformBuffer } })
      layoutEntries.push({
        binding: uniformBinding,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "uniform" },
      })
    }

    const cacheKey = `${shader}::${layoutEntries.length}::${entryPoint}`
    let pipeline = this.pipelineCache.get(cacheKey)
    if (!pipeline) {
      const module = this.device.createShaderModule({ code: shader })
      const bindGroupLayout = this.device.createBindGroupLayout({ entries: layoutEntries })
      pipeline = this.device.createComputePipeline({
        layout: this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        compute: { module, entryPoint },
      })
      this.pipelineCache.set(cacheKey, pipeline)
    }

    const bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: bindGroupEntries,
    })

    const encoder = this.device.createCommandEncoder({ label })
    const pass = encoder.beginComputePass({ label })
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.dispatchWorkgroups(...workgroupCount)
    pass.end()
    this.device.queue.submit([encoder.finish()])

    const outputData = await Promise.all(
      outputBuffers.map((buffer, index) =>
        readBuffer(this.device, buffer, outputByteLengths[index]),
      ),
    )

    outputBuffers.forEach((buffer) => buffer.destroy())
    inputStorageBuffers.forEach((buffer) => buffer.destroy())
    uniformBuffer?.destroy()

    return { outputBuffers: outputData }
  }
}
