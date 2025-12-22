export type TokenPack = {
  id: string;
  name: string;
  tokens: number;
  priceFiatCents: number;
  fiatCurrency: string;
  description?: string;
  promoCodes?: string[];
};

export const DEFAULT_TOKEN = 'WC_TOKEN';

export const tokenPacks: TokenPack[] = [
  {
    id: 'starter-500',
    name: 'Starter',
    tokens: 500,
    priceFiatCents: 499,
    fiatCurrency: 'USD',
    description: 'Baseline pack for new explorers.'
  },
  {
    id: 'booster-1200',
    name: 'Booster',
    tokens: 1200,
    priceFiatCents: 999,
    fiatCurrency: 'USD',
    description: 'Bundle with bonus tokens for power users.'
  },
  {
    id: 'creator-5000',
    name: 'Creator',
    tokens: 5000,
    priceFiatCents: 3499,
    fiatCurrency: 'USD',
    description: 'High-volume rail for event drops and boosts.'
  }
];

export function resolveTokenAmountFromPack(packId: string): { tokens: number; currency: string; priceCents: number } {
  const pack = tokenPacks.find((p) => p.id === packId);
  if (!pack) {
    throw new Error('Invalid token pack');
  }
  return { tokens: pack.tokens, currency: pack.fiatCurrency, priceCents: pack.priceFiatCents };
}
