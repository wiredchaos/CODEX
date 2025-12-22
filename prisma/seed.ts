import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding World Registry + Patch Registry + Timeline...');

  // Create Worlds
  const world3DT = await prisma.world.upsert({
    where: { id: '3DT' },
    update: {},
    create: {
      id: '3DT',
      name: '3DT World',
      description: 'The canonical 3D Traversal world for immersive experiences and timeline management',
      tokens: JSON.stringify(['3DT']),
      metadata: {
        category: 'primary',
        governance: 'health_swarm'
      }
    }
  });
  console.log('✓ Created world: 3DT');

  const worldAkira = await prisma.world.upsert({
    where: { id: 'AKIRA_CODEX' },
    update: {},
    create: {
      id: 'AKIRA_CODEX',
      name: 'AKIRA Codex World',
      description: 'The AKIRA Codex world managing canon integrity and timeline branching',
      tokens: JSON.stringify(['AKIRA_CODEX']),
      metadata: {
        category: 'primary',
        governance: 'canon_review'
      }
    }
  });
  console.log('✓ Created world: AKIRA_CODEX');

  // Create 3DT Patches
  const patches3DT = [
    {
      id: 'PATCH_001',
      worldId: '3DT',
      invariant: 'All artifacts must be assigned to a valid world based on token matching',
      scope: 'World membership and artifact classification',
      enforcement: 'Automatic token-based matching on artifact registration',
      observableEffects: 'Artifacts are correctly categorized by world affiliation, enabling proper governance routing'
    },
    {
      id: 'PATCH_002',
      worldId: '3DT',
      invariant: 'Timeline events are append-only and immutable once recorded',
      scope: 'Timeline ledger and event tracking',
      enforcement: 'Database constraints prevent updates/deletes on TimelineEvent records',
      observableEffects: 'Complete audit trail of all world events with verifiable chronological ordering'
    },
    {
      id: 'PATCH_003',
      worldId: '3DT',
      invariant: 'Governance decisions require health swarm consensus before execution',
      scope: 'Governance and decision-making processes',
      enforcement: 'Multi-signature approval gates on critical state transitions',
      observableEffects: 'Distributed authority prevents unilateral changes to world state'
    },
    {
      id: 'PATCH_004',
      worldId: '3DT',
      invariant: 'Structural boundaries between worlds must be explicitly declared and enforced',
      scope: 'Inter-world communication and isolation',
      enforcement: 'API gateway routing enforces world-specific access controls',
      observableEffects: 'Clear separation of concerns with controlled cross-world interactions'
    },
    {
      id: 'PATCH_005',
      worldId: '3DT',
      invariant: 'Experimental features must be sandboxed with explicit escape hatches',
      scope: 'Feature experimentation and sandbox environments',
      enforcement: 'Runtime isolation via feature flags and sandbox containers',
      observableEffects: 'Safe experimentation without compromising production stability'
    }
  ];

  for (const patchData of patches3DT) {
    await prisma.patch.upsert({
      where: { id: patchData.id },
      update: {},
      create: {
        ...patchData,
        metadata: {
          category: 'core',
          priority: 'high'
        }
      }
    });
    console.log(`✓ Created patch: ${patchData.id}`);
  }

  // Create AKIRA_CODEX Patches
  const patchesAkira = [
    {
      id: 'PATCH_AKIRA_001',
      worldId: 'AKIRA_CODEX',
      invariant: 'Canon integrity must be preserved across all timeline branches',
      scope: 'Canon validation and consistency checking',
      enforcement: 'Pre-commit hooks validate canon rules before accepting changes',
      observableEffects: 'Canonical narrative remains consistent across multiverse branches'
    },
    {
      id: 'PATCH_AKIRA_002',
      worldId: 'AKIRA_CODEX',
      invariant: 'All timeline events must be recorded with provenance metadata',
      scope: 'Timeline event tracking and audit',
      enforcement: 'Required metadata fields enforced at event creation time',
      observableEffects: 'Full provenance chain available for every timeline event'
    },
    {
      id: 'PATCH_AKIRA_003',
      worldId: 'AKIRA_CODEX',
      invariant: 'Source provenance must be traceable to original creator or authority',
      scope: 'Content attribution and authorship',
      enforcement: 'Cryptographic signatures verify content origin',
      observableEffects: 'Verifiable attribution for all canonical content'
    },
    {
      id: 'PATCH_AKIRA_004',
      worldId: 'AKIRA_CODEX',
      invariant: 'Multiverse branches must maintain proper parent-child relationships',
      scope: 'Timeline branching and fork management',
      enforcement: 'Graph database constraints ensure valid branching topology',
      observableEffects: 'Clear visualization of multiverse structure and branch points'
    },
    {
      id: 'PATCH_AKIRA_005',
      worldId: 'AKIRA_CODEX',
      invariant: 'Governance reviews are required for all canonical modifications',
      scope: 'Canon modification approval process',
      enforcement: 'Pull request reviews by designated canon maintainers',
      observableEffects: 'Democratic oversight of canonical changes with documented decisions'
    }
  ];

  for (const patchData of patchesAkira) {
    await prisma.patch.upsert({
      where: { id: patchData.id },
      update: {},
      create: {
        ...patchData,
        metadata: {
          category: 'core',
          priority: 'high'
        }
      }
    });
    console.log(`✓ Created patch: ${patchData.id}`);
  }

  // Create initial timeline events
  await prisma.timelineEvent.create({
    data: {
      worldId: '3DT',
      eventType: 'WORLD_CREATED',
      description: '3DT World initialized with core governance structure',
      metadata: {
        initializer: 'system',
        version: '1.0.0'
      }
    }
  });

  await prisma.timelineEvent.create({
    data: {
      worldId: 'AKIRA_CODEX',
      eventType: 'WORLD_CREATED',
      description: 'AKIRA Codex World initialized with canon integrity rules',
      metadata: {
        initializer: 'system',
        version: '1.0.0'
      }
    }
  });

  await prisma.timelineEvent.create({
    data: {
      worldId: '3DT',
      patchId: 'PATCH_001',
      eventType: 'PATCH_APPLIED',
      description: 'PATCH_001 (WORLD_MEMBERSHIP) applied to 3DT',
      metadata: {
        appliedBy: 'system',
        autoApplied: true
      }
    }
  });

  await prisma.timelineEvent.create({
    data: {
      worldId: 'AKIRA_CODEX',
      patchId: 'PATCH_AKIRA_001',
      eventType: 'PATCH_APPLIED',
      description: 'PATCH_AKIRA_001 (CANON_INTEGRITY) applied to AKIRA_CODEX',
      metadata: {
        appliedBy: 'system',
        autoApplied: true
      }
    }
  });

  console.log('✓ Created initial timeline events');
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log('- 2 Worlds created: 3DT, AKIRA_CODEX');
  console.log('- 10 Core Patches created (5 per world)');
  console.log('- 4 Timeline events recorded');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
