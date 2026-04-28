import type { AlertSeverity, Prisma, PrismaClient } from '@prisma/client';

import { sha256Hex } from '../../utils/crypto.js';
import { alertFingerprint } from './alertDeduper.js';

export type CreateAlertInput = {
  organizationId: string;
  severity: AlertSeverity;
  title: string;
  summary?: string | null;
  evidence: Record<string, unknown>;
  recommendedRemediation?: string[] | null;
  source: string;
};

function stableFindingHash(evidence: Record<string, unknown>): string {
  // Defensive: hash evidence JSON for chain-of-custody/dedupe without storing sensitive content.
  return sha256Hex(JSON.stringify(evidence));
}

export async function createOrUpdateAlert(prisma: PrismaClient, input: CreateAlertInput) {
  const findingHash = stableFindingHash(input.evidence);
  const dedupeKey = alertFingerprint({
    orgId: input.organizationId,
    type: input.source,
    dedupeKey: input.title,
    stableJson: { findingHash },
  });

  return prisma.$transaction(async (tx) => {
    const existing = await tx.alert.findUnique({
      where: { organizationId_dedupeKey: { organizationId: input.organizationId, dedupeKey } },
    });

    const data: Prisma.AlertUncheckedUpdateInput = {
      severity: input.severity,
      title: input.title,
      summary: input.summary ?? undefined,
      evidence: input.evidence as any,
      remediation: input.recommendedRemediation ? (input.recommendedRemediation as any) : undefined,
    };

    if (existing) {
      return tx.alert.update({
        where: { id: existing.id },
        data,
      });
    }

    return tx.alert.create({
      data: {
        organizationId: input.organizationId,
        severity: input.severity,
        status: 'open',
        title: input.title,
        summary: input.summary ?? null,
        evidence: input.evidence as any,
        remediation: input.recommendedRemediation ? (input.recommendedRemediation as any) : null,
        dedupeKey,
      },
    });
  });
}

