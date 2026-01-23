/// <reference lib="webworker" />

import * as THREE from "three"
import { WebGPURenderer } from "three/webgpu"

type InitMessage = {
  type: "init"
  canvas: OffscreenCanvas
  size: { width: number; height: number }
  dpr: number
}

type ResizeMessage = {
  type: "resize"
  size: { width: number; height: number }
  dpr: number
}

type LayoutMessage = {
  type: "layout"
  rects: Array<{ id: string; x: number; y: number; width: number; height: number }>
  size: { width: number; height: number }
}

type ScrollMessage = {
  type: "scroll"
  progress: number
}

type IncomingMessage = InitMessage | ResizeMessage | LayoutMessage | ScrollMessage

let renderer: THREE.Renderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let accentGroup: THREE.Group | null = null
let scrollProgress = 0
let clock: THREE.Clock | null = null
const mirrorMeshes = new Map<string, THREE.Mesh>()

const ensureScene = () => {
  if (!scene) {
    scene = new THREE.Scene()
  }
  if (!clock) {
    clock = new THREE.Clock()
  }
  if (!accentGroup) {
    accentGroup = new THREE.Group()
    scene.add(accentGroup)
  }
}

const updateCamera = (width: number, height: number) => {
  if (!camera) {
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -500, 1000)
    camera.position.set(0, 0, 500)
    camera.lookAt(0, 0, 0)
  } else {
    camera.left = -width / 2
    camera.right = width / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.updateProjectionMatrix()
  }
}

const setSize = (width: number, height: number, dpr: number) => {
  if (!renderer) return
  updateCamera(width, height)
  renderer.setSize(width, height, false)
  if ("setPixelRatio" in renderer) {
    ;(renderer as THREE.WebGLRenderer).setPixelRatio(dpr)
  }
}

const initRenderer = async (canvas: OffscreenCanvas, width: number, height: number, dpr: number) => {
  ensureScene()

  if ("gpu" in self.navigator) {
    const webgpuRenderer = new WebGPURenderer({ canvas, antialias: true, alpha: true })
    await webgpuRenderer.init()
    renderer = webgpuRenderer
  } else {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  }

  renderer.setClearColor(0x000000, 0)
  setSize(width, height, dpr)

  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  const key = new THREE.DirectionalLight(0xffffff, 0.6)
  key.position.set(0, 0, 300)
  const fill = new THREE.DirectionalLight(0x6677ff, 0.3)
  fill.position.set(200, 100, 150)
  scene?.add(ambient, key, fill)

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshBasicMaterial({ color: 0x0b0b0c, transparent: true, opacity: 0.6 })
  )
  backdrop.position.z = -300
  scene?.add(backdrop)

  renderer.setAnimationLoop(() => renderFrame())
}

const syncMirrors = (rects: LayoutMessage["rects"], viewport: { width: number; height: number }) => {
  if (!accentGroup) return

  rects.forEach((rect, index) => {
    const existing = mirrorMeshes.get(rect.id)
    const depth = -50 - index * 8
    const centerX = rect.x + rect.width / 2 - viewport.width / 2
    const centerY = -(rect.y + rect.height / 2 - viewport.height / 2)

    if (existing) {
      if (existing.geometry instanceof THREE.PlaneGeometry) {
        existing.geometry.dispose()
        existing.geometry = new THREE.PlaneGeometry(rect.width, rect.height)
      }
      existing.position.set(centerX, centerY, depth)
      existing.userData.depth = depth
      return
    }

    const geometry = new THREE.PlaneGeometry(rect.width, rect.height)
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      metalness: 0.2,
      roughness: 0.1,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(centerX, centerY, depth)
    mesh.userData.depth = depth
    accentGroup?.add(mesh)
    mirrorMeshes.set(rect.id, mesh)
  })
}

const renderFrame = () => {
  if (!renderer || !scene || !camera || !accentGroup || !clock) return

  const elapsed = clock.getElapsedTime()
  accentGroup.rotation.z = scrollProgress * 0.08

  mirrorMeshes.forEach((mesh, index) => {
    const baseDepth = mesh.userData.depth ?? 0
    mesh.position.z = baseDepth + Math.sin(elapsed * 0.6 + index) * 6 + scrollProgress * 40
    mesh.rotation.x = Math.sin(elapsed * 0.4 + index) * 0.02
    mesh.rotation.y = Math.cos(elapsed * 0.3 + index) * 0.02
  })

  renderer.render(scene, camera)
}

self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const message = event.data

  if (message.type === "init") {
    void initRenderer(message.canvas, message.size.width, message.size.height, message.dpr)
    return
  }

  if (message.type === "resize") {
    setSize(message.size.width, message.size.height, message.dpr)
    return
  }

  if (message.type === "layout") {
    updateCamera(message.size.width, message.size.height)
    syncMirrors(message.rects, message.size)
    return
  }

  if (message.type === "scroll") {
    scrollProgress = message.progress
  }
}

export {}
