import { Patch, CreateTimelineEvent } from './registry.js';

export type WorldId = '3DT' | 'AKIRA_CODEX' | 'CREATOR_CODEX';

export interface PatchGate {
  /** Patches that must be present for the node to be enterable */
  required?: string[];
  /** Patches that block progress if present */
  blocked?: string[];
  description?: string;
}

export interface TimelineConfig {
  /** Event type for entering the node (defaults to PATH_NODE_ENTERED) */
  enterEventType?: string;
  /** Event type for completing the node (defaults to PATH_NODE_COMPLETED) */
  completeEventType?: string;
  /** Additional metadata that should always be included on emitted events */
  metadata?: Record<string, unknown>;
}

export interface PathNode {
  id: string;
  title: string;
  description?: string;
  world: WorldId;
  /** Next node IDs available from this node */
  next?: string[];
  gate?: PatchGate;
  timeline?: TimelineConfig;
  metadata?: Record<string, unknown>;
}

export interface PathDefinition {
  world: WorldId;
  start: string;
  nodes: Record<string, PathNode>;
}

export type TimelinePublisher = (event: CreateTimelineEvent) => Promise<void> | void;

export interface PathEngineOptions {
  patches?: Patch[];
  timelinePublisher?: TimelinePublisher;
}

export interface PathEngine {
  world: WorldId;
  path: PathDefinition;
  currentNode: PathNode;
  history: string[];
  getAvailableNext(): PathNode[];
  canEnter(nodeId: string): boolean;
  enter(nodeId: string, metadata?: Record<string, unknown>): Promise<PathNode>;
  complete(nextNodeId?: string, metadata?: Record<string, unknown>): Promise<PathNode | null>;
}
