import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { DEFAULT_TOKEN, resolveTokenAmountFromPack, tokenPacks } from '../config/tokenPacks.js';
import { creditTokens, spendTokens, getBalance, createLedgerForRefund } from '../lib/economy/billing.js';
import { CheckoutStatus, PaymentStatus } from '@prisma/client';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const RATE_CENTS_PER_TOKEN = 1; // fallback when explicit pack not provided
const DEFAULT_PROVIDER = 'mock-provider';

function computeFiatForTokens(tokens: number) {
  return tokens * RATE_CENTS_PER_TOKEN;
}

function validateSignature(body: string, signature: string | undefined, secret: string | undefined) {
  if (!secret) return true; // allow open validation in dev
  if (!signature) return false;
  const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/api/checkout/create', async (req, res) => {
  try {
    const schema = z.object({
      tokenPackId: z.string().optional(),
      tokensAmount: z.number().int().positive().optional(),
      returnUrl: z.string().url(),
      userId: z.string().min(1)
    });
    const parsed = schema.parse(req.body);
    if (!parsed.tokenPackId && !parsed.tokensAmount) {
      return res.status(400).json({ error: 'tokenPackId or tokensAmount is required' });
    }

    const idempotencyKey = (req.headers['idempotency-key'] as string) || crypto.randomUUID();

    let tokens = parsed.tokensAmount ?? 0;
    let fiatCurrency = 'USD';
    let priceCents = 0;

    if (parsed.tokenPackId) {
      const pack = resolveTokenAmountFromPack(parsed.tokenPackId);
      tokens = pack.tokens;
      fiatCurrency = pack.currency;
      priceCents = pack.priceCents;
    } else if (parsed.tokensAmount) {
      tokens = parsed.tokensAmount;
      priceCents = computeFiatForTokens(tokens);
    }

    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        userId: parsed.userId,
        provider: DEFAULT_PROVIDER,
        providerIntentId: crypto.randomUUID(),
        amountFiat: priceCents,
        fiatCurrency,
        idempotencyKey,
        status: PaymentStatus.CREATED,
        metadata: { tokenPackId: parsed.tokenPackId, tokensPurchased: tokens }
      }
    });

    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        userId: parsed.userId,
        paymentIntentId: paymentIntent.id,
        status: CheckoutStatus.CREATED,
        returnUrl: parsed.returnUrl
      }
    });

    const checkoutUrl = `https://payments.example.com/checkout/${checkoutSession.id}`;
    res.json({ checkoutUrl, checkoutSessionId: checkoutSession.id, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create checkout', detail: (err as Error).message });
  }
});

app.post('/api/webhooks/payment-provider', express.text({ type: '*/*' }), async (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string | undefined;
  const secret = process.env.WEBHOOK_SECRET;
  const verified = validateSignature(req.body, signature, secret);
  if (!verified) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  try {
    const parsedBody = JSON.parse(req.body);
    const schema = z.object({
      provider: z.string(),
      providerIntentId: z.string(),
      eventId: z.string(),
      status: z.enum(['succeeded', 'failed', 'canceled', 'refunded']),
      tokensPurchased: z.number().int().nonnegative().optional(),
      userId: z.string().min(1),
      reasonCode: z.string().default('fiat_purchase'),
      metadata: z.record(z.any()).optional()
    });
    const event = schema.parse(parsedBody);

    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: { provider_providerIntentId: { provider: event.provider, providerIntentId: event.providerIntentId } }
    });
    if (!paymentIntent) {
      return res.status(404).json({ error: 'PaymentIntent not found' });
    }

    const existingLedger = await prisma.ledgerEntry.findFirst({
      where: { account: { userId: paymentIntent.userId }, reasonCode: event.eventId }
    });
    if (existingLedger) {
      return res.json({ status: 'already-processed' });
    }

    if (event.status === 'succeeded') {
      await prisma.$transaction(async (tx) => {
        await tx.paymentIntent.update({
          where: { id: paymentIntent.id },
          data: { status: PaymentStatus.SUCCEEDED }
        });
        const tokens = event.tokensPurchased ?? (paymentIntent.metadata as any)?.tokensPurchased ?? 0;
        const { entry } = await creditTokens(paymentIntent.userId, tokens, event.eventId, {
          providerIntentId: paymentIntent.providerIntentId,
          provider: paymentIntent.provider,
          eventId: event.eventId,
          metadata: event.metadata
        });
        return entry;
      });
    } else if (event.status === 'failed') {
      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { status: PaymentStatus.FAILED }
      });
    } else if (event.status === 'canceled') {
      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { status: PaymentStatus.CANCELED }
      });
    } else if (event.status === 'refunded') {
      await prisma.$transaction(async (tx) => {
        await tx.paymentIntent.update({
          where: { id: paymentIntent.id },
          data: { status: PaymentStatus.REFUNDED }
        });
        const tokens = event.tokensPurchased ?? (paymentIntent.metadata as any)?.tokensPurchased ?? 0;
        await createLedgerForRefund(paymentIntent.userId, tokens, event.eventId, {
          providerIntentId: paymentIntent.providerIntentId,
          provider: paymentIntent.provider,
          eventId: event.eventId,
          metadata: event.metadata
        });
      });
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'webhook processing failed', detail: (err as Error).message });
  }
});

app.post('/api/tokens/spend', async (req, res) => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      amount: z.number().int().positive(),
      reasonCode: z.string(),
      metadata: z.record(z.any()).optional()
    });
    const body = schema.parse(req.body);

    const result = await spendTokens(body.userId, body.amount, body.reasonCode, body.metadata);
    res.json({ balance: result.balance, entry: result.entry });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.get('/api/tokens/balance', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const result = await getBalance(userId);
  res.json(result);
});

app.get('/api/token-packs', (_req, res) => {
  res.json(tokenPacks);
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dual-rail economy server ready on port ${PORT}`);
});
