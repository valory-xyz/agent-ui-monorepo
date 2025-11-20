import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';

import { mockPerformanceSummary } from '../mocks/mock';
import { PerformanceSummary } from '../types';

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const METRIC_NAMES_MAPPING = {
  TOTAL_IMPRESSIONS: 'Total Impressions',
  TOTAL_LIKES: 'Total Likes',
} as const;

type PerformanceMetrics = {
  totalImpressions: number;
  totalLikes: number;
  impressionsTooltip?: string;
  likesTooltip?: string;
};

export const usePerformance = () => {
  const query = useQuery<PerformanceSummary | null>({
    queryKey: ['performanceSummary'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(mockPerformanceSummary), 2000));
      }

      const response = await fetch(`${LOCAL}/performance-summary`);
      if (!response.ok) throw new Error('Failed to fetch performance summary');
      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchInterval: FORTYFIVE_SECONDS,
  });

  const metricsData = query.data?.metrics;
  const metrics: PerformanceMetrics = {
    totalImpressions: 0,
    totalLikes: 0,
  };

  if (metricsData) {
    const impressions = metricsData.find(
      (metric) => metric.name === METRIC_NAMES_MAPPING.TOTAL_IMPRESSIONS,
    );
    const likes = metricsData.find((metric) => metric.name === METRIC_NAMES_MAPPING.TOTAL_LIKES);

    metrics.totalImpressions = parseInt(impressions?.value || '0', 10);
    metrics.totalLikes = parseInt(likes?.value || '0', 10);
    metrics.impressionsTooltip = impressions?.description;
    metrics.likesTooltip = likes?.description;
  }

  return {
    ...query,
    totalImpressions: metrics.totalImpressions,
    totalLikes: metrics.totalLikes,
    impressionsTooltip: metrics.impressionsTooltip,
    likesTooltip: metrics.likesTooltip,
  };
};
