import { getDealStageMetrics, getActivityVolume, getPipelineSummary } from "@/features/analytics/server/actions";
import { DealStageChart } from "@/features/analytics/components/deal-stage-chart";
import { ActivityTrendChart } from "@/features/analytics/components/activity-trend-chart";

export const metadata = {
  title: "Analytics | Enterprise Agent",
};

export default async function AnalyticsPage() {
  const dealStageData = await getDealStageMetrics();
  const activityData = await getActivityVolume();
  const pipelineSummary = await getPipelineSummary();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground">Total Deals</div>
          <div className="text-2xl font-bold">{pipelineSummary.totalDeals}</div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground">Pipeline Value</div>
          <div className="text-2xl font-bold">${pipelineSummary.pipelineValue.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
          <div className="text-2xl font-bold">{pipelineSummary.winRate}%</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DealStageChart data={dealStageData} />
        <ActivityTrendChart data={activityData} />
      </div>
    </div>
  );
}
