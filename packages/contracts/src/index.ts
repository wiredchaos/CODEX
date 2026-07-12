import { readFile } from 'node:fs/promises';
import { z } from 'zod';
export const contractConfigSchema = z.object({ environment: z.string(), chainId: z.number().int().positive(), rpcUrl: z.string().url().optional(), addresses: z.record(z.string(), z.string().regex(/^0x[a-fA-F0-9]{40}$/)).default({}) });
export type ContractConfig = z.infer<typeof contractConfigSchema>;
export class ContractAdapter { constructor(public readonly config: ContractConfig) { contractConfigSchema.parse(config); } async loadAbi(path: string) { return JSON.parse(await readFile(path, 'utf8')); } getAddress(name: string) { return this.config.addresses[name]; } prepareTransaction(contract: string, method: string, args: unknown[]) { return { contract, to: this.getAddress(contract), method, args, broadcast: false, requiresExternalSigner: true }; } parseEvent(event: unknown) { return { raw: event, parsedAt: new Date().toISOString() }; } }
