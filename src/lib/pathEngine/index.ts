import { CreateTimelineEvent } from '../../types/registry.js';
import {
  PathDefinition,
  PathEngine as PathEngineType,
  PathEngineOptions,
  PathNode,
  TimelinePublisher,
  WorldId
} from '../../types/pathEngine.js';
import { pathDefinitions } from './paths.js';

const DEFAULT_ENTER_EVENT = 'PATH_NODE_ENTERED';
const DEFAULT_COMPLETE_EVENT = 'PATH_NODE_COMPLETED';

function hasRequiredPatches(node: PathNode, patches: Set<string>): boolean {
  const required = node.gate?.required ?? [];
  return required.every(req => patches.has(req));
}

function isBlockedByPatches(node: PathNode, patches: Set<string>): boolean {
  const blocked = node.gate?.blocked ?? [];
  return blocked.some(block => patches.has(block));
}

async function emitTimeline(
  publisher: TimelinePublisher | undefined,
  worldId: WorldId,
  node: PathNode,
  eventType: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  if (!publisher) return;

  const event: CreateTimelineEvent = {
    worldId,
    eventType,
    description,
    metadata: {
      nodeId: node.id,
      nodeTitle: node.title,
      ...node.timeline?.metadata,
      ...metadata
    }
  };

  await publisher(event);
}

class DefaultPathEngine implements PathEngineType {
  world: WorldId;
  path: PathDefinition;
  currentNode: PathNode;
  history: string[];
  private patches: Set<string>;
  private publisher?: TimelinePublisher;

  constructor(path: PathDefinition, options?: PathEngineOptions) {
    this.path = path;
    this.world = path.world;
    this.patches = new Set(options?.patches?.map(patch => patch.id) ?? []);
    this.publisher = options?.timelinePublisher;
    this.currentNode = this.path.nodes[this.path.start];
    this.history = [this.currentNode.id];
  }

  getAvailableNext(): PathNode[] {
    const nextIds = this.currentNode.next ?? [];
    return nextIds
      .map(id => this.path.nodes[id])
      .filter(node => !!node && this.canEnter(node.id));
  }

  canEnter(nodeId: string): boolean {
    const node = this.path.nodes[nodeId];
    if (!node) return false;
    if (!hasRequiredPatches(node, this.patches)) return false;
    if (isBlockedByPatches(node, this.patches)) return false;
    return true;
  }

  async enter(nodeId: string, metadata?: Record<string, unknown>): Promise<PathNode> {
    const node = this.path.nodes[nodeId];
    if (!node) {
      throw new Error(`Path node ${nodeId} not found for world ${this.world}`);
    }

    if (!this.currentNode.next?.includes(nodeId)) {
      throw new Error(`Node ${nodeId} is not reachable from ${this.currentNode.id}`);
    }

    if (!this.canEnter(nodeId)) {
      throw new Error(`Node ${nodeId} cannot be entered because of patch gating`);
    }

    this.currentNode = node;
    this.history.push(node.id);

    await emitTimeline(
      this.publisher,
      this.world,
      node,
      node.timeline?.enterEventType ?? DEFAULT_ENTER_EVENT,
      `Entered ${node.title}`,
      metadata
    );

    return this.currentNode;
  }

  async complete(
    nextNodeId?: string,
    metadata?: Record<string, unknown>
  ): Promise<PathNode | null> {
    const completed = this.currentNode;

    await emitTimeline(
      this.publisher,
      this.world,
      completed,
      completed.timeline?.completeEventType ?? DEFAULT_COMPLETE_EVENT,
      `Completed ${completed.title}`,
      metadata
    );

    if (!nextNodeId) {
      return null;
    }

    return this.enter(nextNodeId, metadata);
  }
}

const pathEngineCache = new Map<WorldId, DefaultPathEngine>();

export function usePathEngine(world: WorldId, options?: PathEngineOptions): PathEngineType {
  const path = pathDefinitions[world];
  if (!path) {
    throw new Error(`No path definition registered for world ${world}`);
  }

  if (!options) {
    const existingEngine = pathEngineCache.get(world);
    if (existingEngine) {
      return existingEngine;
    }
  }

  const engine = new DefaultPathEngine(path, options);

  if (!options) {
    pathEngineCache.set(world, engine);
  }

  return engine;
}

export type PathEngine = PathEngineType;
export { pathDefinitions };
