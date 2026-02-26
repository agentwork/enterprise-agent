export interface DealStageMetric {
  stage: string;
  count: number;
  totalValue: number;
}

export interface ActivityVolumeMetric {
  date: string;
  count: number;
  type: string;
}

export interface PipelineSummary {
  totalDeals: number;
  pipelineValue: number;
  winRate: number;
}
