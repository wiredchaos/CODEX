import type { FastifyInstance } from 'fastify';
import { FeatureFlagScanRequestSchema } from '../schemas/featureFlags.js';
import { scanFeatureFlags } from '../services/scanning/featureFlagScanner.js';
import { createOrUpdateAlert } from '../services/alerts/alertEngine.js';
import { writeAuditLog } from '../services/auditLog.js';

export async function featureFlagsRoutes(app: FastifyInstance) {
  app.post('/feature-flags/scan', async (req, reply) => {
    const parsed = FeatureFlagScanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid body', details: parsed.error.flatten() });
    }
    const { orgId, source, flags } = parsed.data;

    const scan = scanFeatureFlags({
      flags: flags.map((f) => ({ key: f.key, value: f.raw })),
    });

    const severity = scan.reasons.includes('secret-like-token') || scan.reasons.includes('pii-email') ? 'HIGH' : 'MEDIUM';
    const alert = await createOrUpdateAlert(app.prisma, {
      organizationId: orgId,
      source: 'FEATURE_FLAG_FIREWALL',
      severity: severity as any,
      title:
        severity === 'HIGH'
          ? 'HIGH: Feature flag payload contains sensitive content'
          : 'MEDIUM: Feature flag payload contains risky markers',
      summary: `Detected ${scan.findings.length} finding(s) across ${flags.length} flag(s).`,
      evidence: { source, findings: scan.findings, reasons: scan.reasons },
      recommendedRemediation: [
        'Remove secrets/PII/internal endpoints from flags immediately.',
        'Rotate any affected credentials and invalidate leaked keys.',
        'Move sensitive config to server-side runtime configuration.',
      ],
    });

    await writeAuditLog({
      orgId,
      actorApiKeyId: req.auth?.apiKeyId,
      actorUserId: undefined,
      action: 'feature_flags.scan',
      targetType: 'Organization',
      targetId: orgId,
      request: req,
      metadata: { source, findingCount: scan.findings.length, reasons: scan.reasons, severity: alert.severity },
    });

    return reply.send({
      orgId,
      source,
      findings: scan.findings,
      reasons: scan.reasons,
      alertId: alert.id,
    });
  });
}

