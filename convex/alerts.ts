import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getClassicAlerts = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query('hodlAlerts')
      .withIndex('alertType', (q) => q.eq('alertType', 'classic'))
      .order('desc')
      .collect();
    return alerts;
  },
});

export const getVisionAlerts = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query('hodlAlerts')
      .withIndex('alertType', (q) => q.eq('alertType', 'vision'))
      .order('desc')
      .collect();
    return alerts;
  },
});

export const createAlert = mutation({
  args: {
    asset: v.string(),
    entryDate: v.string(),
    entryPrice: v.number(),
    alertType: v.union(v.literal('classic'), v.literal('vision')),
  },
  handler: async (ctx, args) => {
    const { ...rest } = args;
    const doc = {
      ...rest,
    };
    return ctx.db.insert('hodlAlerts', doc);
  },
});
