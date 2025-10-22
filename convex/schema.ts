import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  hodlAlerts: defineTable({
    asset: v.string(),
    entryDate: v.string(),
    entryPrice: v.number(),
    alertType: v.string(),
  }).index('alertType', ['alertType']),
  prices: defineTable({
    asset: v.string(),
    price: v.number(),
    updatedAt: v.number(),
  }).index('asset', ['asset']),
});
