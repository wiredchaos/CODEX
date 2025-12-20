import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import {
  CreateTimelineEventSchema,
  GetPatchesQuerySchema,
  GetTimelineQuerySchema
} from '../types/registry.js';
import { parseTokens } from '../lib/registry/worldMembership.js';

const router = Router();

/**
 * GET /api/worlds
 * Returns all registered worlds
 */
router.get('/worlds', async (req, res) => {
  try {
    const worlds = await prisma.world.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Parse tokens from JSON string to array
    const worldsWithTokens = worlds.map(world => ({
      ...world,
      tokens: parseTokens(world.tokens)
    }));

    res.json({ worlds: worldsWithTokens });
  } catch (err) {
    console.error('Error fetching worlds:', err);
    res.status(500).json({ error: 'Internal server error while fetching worlds from database', detail: (err as Error).message });
  }
});

/**
 * GET /api/patches?world=<worldId>
 * Returns patches for a specific world (if world param provided) or all patches
 */
router.get('/patches', async (req, res) => {
  try {
    const query = GetPatchesQuerySchema.parse(req.query);

    const where = query.world ? { worldId: query.world } : {};

    const patches = await prisma.patch.findMany({
      where,
      include: {
        world: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ patches });
  } catch (err) {
    console.error('Error fetching patches:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', detail: err.errors });
    }
    res.status(500).json({ error: 'Internal server error while fetching patches from database', detail: (err as Error).message });
  }
});

/**
 * POST /api/timeline/event
 * Creates a new timeline event (append-only)
 */
router.post('/timeline/event', async (req, res) => {
  try {
    const eventData = CreateTimelineEventSchema.parse(req.body);

    // Verify world exists
    const world = await prisma.world.findUnique({
      where: { id: eventData.worldId }
    });

    if (!world) {
      return res.status(404).json({ error: 'World not found' });
    }

    // Verify patch exists if patchId is provided
    if (eventData.patchId) {
      const patch = await prisma.patch.findUnique({
        where: { id: eventData.patchId }
      });

      if (!patch) {
        return res.status(404).json({ error: 'Patch not found' });
      }
    }

    const event = await prisma.timelineEvent.create({
      data: {
        worldId: eventData.worldId,
        patchId: eventData.patchId,
        eventType: eventData.eventType,
        description: eventData.description,
        metadata: eventData.metadata || {}
      },
      include: {
        world: true,
        patch: true
      }
    });

    res.status(201).json({ event });
  } catch (err) {
    console.error('Error creating timeline event:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', detail: err.errors });
    }
    res.status(500).json({ error: 'Internal server error while creating timeline event', detail: (err as Error).message });
  }
});

/**
 * GET /api/timeline?world=<worldId>
 * Returns timeline events for a specific world (if world param provided) or all events
 * Timeline is append-only and ordered by timestamp
 */
router.get('/timeline', async (req, res) => {
  try {
    const query = GetTimelineQuerySchema.parse(req.query);

    const where = query.world ? { worldId: query.world } : {};

    const events = await prisma.timelineEvent.findMany({
      where,
      include: {
        world: true,
        patch: true
      },
      orderBy: { timestamp: 'asc' }
    });

    res.json({ events });
  } catch (err) {
    console.error('Error fetching timeline:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', detail: err.errors });
    }
    res.status(500).json({ error: 'Internal server error while fetching timeline from database', detail: (err as Error).message });
  }
});

export default router;
