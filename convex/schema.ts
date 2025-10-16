import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  hodlAlerts: defineTable({
    asset: v.string(),
    entryDate: v.string(),
    entryPrice: v.number(),
    currentPrice: v.optional(v.number()),
    alertType: v.string(),
  }).index('alertType', ['alertType']),
});
