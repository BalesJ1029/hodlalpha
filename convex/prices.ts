import { internalAction, internalMutation, query } from './_generated/server';
import { internal } from './_generated/api';

export const refreshBtc = internalAction(async (ctx) => {
  const price = await getBtcUsd();
  await ctx.runMutation(internal.prices.saveBtcPrice, { price });
});

export const saveBtcPrice = internalMutation(async ({ db }, { price }: { price: number }) => {
  const existing = await db
    .query('prices')
    .withIndex('asset', (q) => q.eq('asset', 'BTC-USD'))
    .first();
  const now = Date.now();

  if (existing) {
    await db.patch(existing._id, { price, updatedAt: now });
    return;
  }

  await db.insert('prices', { asset: 'BTC-USD', price, updatedAt: now });
});

export const getCurrentBtc = query(async ({ db }) => {
  const doc = await db
    .query('prices')
    .withIndex('asset', (q) => q.eq('asset', 'BTC-USD'))
    .first();

  if (!doc) {
    return null;
  }

  return {
    price: doc.price,
    updatedAt: doc.updatedAt,
  };
});

export async function getBtcUsd(): Promise<number> {
  const url = 'https://api.exchange.coinbase.com/products/BTC-USD/ticker';
  for (let i = 0; i < 2; i++) {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (r.ok) {
      const j = await r.json();
      return Number(j.price);
    }
    if (r.status !== 429) break;
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 500));
  }
  throw new Error('Failed to fetch BTC-USD');
}
