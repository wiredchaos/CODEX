import { prisma } from '../prisma.js';
import { DEFAULT_TOKEN } from '../../config/tokenPacks.js';
import { LedgerEntryType, LedgerStatus, Prisma, PrismaClient } from '@prisma/client';

export type BillingMetadata = Record<string, unknown>;

type DbClient = PrismaClient | Prisma.TransactionClient;

async function ensureAccount(client: DbClient, userId: string, tokenType: string = DEFAULT_TOKEN) {
  const existing = await client.tokenAccount.findFirst({ where: { userId, tokenType } });
  if (existing) return existing;
  return client.tokenAccount.create({ data: { userId, tokenType } });
}

export async function creditTokens(
  userId: string,
  amount: number,
  reasonCode: string,
  metadata?: BillingMetadata,
  tokenType: string = DEFAULT_TOKEN,
  currency = DEFAULT_TOKEN,
  entryType: LedgerEntryType = LedgerEntryType.CREDIT_FIAT_PURCHASE
) {
  if (amount <= 0) throw new Error('Amount must be positive');
  return prisma.$transaction(async (tx) => {
    const account = await ensureAccount(tx, userId, tokenType);
    const updatedAccount = await tx.tokenAccount.update({
      where: { id: account.id },
      data: { balance: { increment: amount } }
    });
    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        accountId: updatedAccount.id,
        type: entryType,
        amount,
        currency,
        status: LedgerStatus.SETTLED,
        reasonCode,
        metadata: (metadata ?? {}) as any
      }
    });
    return { balance: updatedAccount.balance, entry };
  });
}

export async function spendTokens(
  userId: string,
  amount: number,
  reasonCode: string,
  metadata?: BillingMetadata,
  tokenType: string = DEFAULT_TOKEN,
  currency = DEFAULT_TOKEN,
  entryType: LedgerEntryType = LedgerEntryType.DEBIT_SPEND
) {
  if (amount <= 0) throw new Error('Amount must be positive');
  return prisma.$transaction(async (tx) => {
    const account = await ensureAccount(tx, userId, tokenType);
    if (account.balance < amount) {
      throw new Error('Insufficient balance');
    }
    const updatedAccount = await tx.tokenAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: amount } }
    });
    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        accountId: updatedAccount.id,
        type: entryType,
        amount: -Math.abs(amount),
        currency,
        status: LedgerStatus.SETTLED,
        reasonCode,
        metadata: (metadata ?? {}) as any
      }
    });
    return { balance: updatedAccount.balance, entry };
  });
}

export async function getBalance(userId: string, tokenType: string = DEFAULT_TOKEN) {
  const account = await ensureAccount(prisma, userId, tokenType);
  const ledger = await prisma.ledgerEntry.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  return { balance: account.balance, ledger };
}

export async function createLedgerForRefund(
  userId: string,
  amount: number,
  reasonCode: string,
  metadata?: BillingMetadata,
  tokenType: string = DEFAULT_TOKEN,
  currency = DEFAULT_TOKEN
) {
  if (amount <= 0) throw new Error('Amount must be positive');
  return prisma.$transaction(async (tx) => {
    const account = await ensureAccount(tx, userId, tokenType);
    const updatedAccount = await tx.tokenAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: amount } }
    });
    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        accountId: updatedAccount.id,
        type: LedgerEntryType.DEBIT_REFUND_REVERSAL,
        amount: -Math.abs(amount),
        currency,
        status: LedgerStatus.REVERSED,
        reasonCode,
        metadata: (metadata ?? {}) as any
      }
    });
    return { balance: updatedAccount.balance, entry };
  });
}
