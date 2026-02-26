"use server";

import { db } from "@/lib/db";
import { deals, activities } from "@/lib/db/schema";
import { sql, gte } from "drizzle-orm";
import { DealStageMetric, ActivityVolumeMetric, PipelineSummary } from "../types";

export async function getDealStageMetrics(): Promise<DealStageMetric[]> {
  const result = await db
    .select({
      stage: deals.stage,
      count: sql<number>`count(*)`.mapWith(Number),
      totalValue: sql<number>`sum(${deals.amount})`.mapWith(Number),
    })
    .from(deals)
    .groupBy(deals.stage);

  // Normalize stages to ensure consistent order/formatting if needed
  return result.map((r) => ({
    stage: r.stage,
    count: r.count,
    totalValue: r.totalValue || 0,
  }));
}

export async function getActivityVolume(days = 30): Promise<ActivityVolumeMetric[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`to_char(${activities.performedAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)`.mapWith(Number),
      type: activities.type,
    })
    .from(activities)
    .where(gte(activities.performedAt, cutoffDate))
    .groupBy(sql`to_char(${activities.performedAt}, 'YYYY-MM-DD')`, activities.type)
    .orderBy(sql`to_char(${activities.performedAt}, 'YYYY-MM-DD')`);

  return result;
}

export async function getPipelineSummary(): Promise<PipelineSummary> {
  const [metrics] = await db
    .select({
      totalDeals: sql<number>`count(*)`.mapWith(Number),
      pipelineValue: sql<number>`sum(case when ${deals.stage} not in ('closed_lost', 'closed_won') then ${deals.amount} else 0 end)`.mapWith(Number),
      wonDeals: sql<number>`sum(case when ${deals.stage} = 'closed_won' then 1 else 0 end)`.mapWith(Number),
    })
    .from(deals);

  const winRate = metrics.totalDeals > 0 ? (metrics.wonDeals / metrics.totalDeals) * 100 : 0;

  return {
    totalDeals: metrics.totalDeals,
    pipelineValue: metrics.pipelineValue || 0,
    winRate: Math.round(winRate * 10) / 10,
  };
}
