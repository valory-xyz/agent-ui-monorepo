import { PieChartOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { ArcElement, Chart as ChartJS } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { COLOR } from '../../constants/colors';
import { usePortfolio } from '../../hooks/usePortfolio';
import { DonutCenterLogoPlugin } from '../../utils/chartjs/donut-center-plugin';
import { piePalette } from '../../utils/chartjs/palette';

ChartJS.register(ArcElement);

// Fallback chart data when no allocations are available
const emptyChartData = {
  labels: [],
  datasets: [
    {
      data: [1],
      backgroundColor: ['#f0f0f0'],
    },
  ],
};

export const AllocationPie = () => {
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <Skeleton.Node
        style={{ width: 200, height: 200, borderRadius: '100%' }}
        active
      >
        <PieChartOutlined style={{ fontSize: 32, color: COLOR.grey }} />
      </Skeleton.Node>
    );
  }

  const hasValidAllocations =
    data?.allocations?.length > 0 &&
    data?.allocations?.every(
      (allocation) =>
        allocation &&
        typeof allocation.ratio === 'number' &&
        typeof allocation.type === 'string',
    );

  const chartData = hasValidAllocations
    ? {
        labels: data.allocations.map((allocation) => allocation.type),
        datasets: [
          {
            data: data.allocations.map((allocation) => allocation.ratio),
            backgroundColor: piePalette,
          },
        ],
      }
    : emptyChartData;

  return (
    <Doughnut
      width={200}
      height={200}
      options={{
        responsive: false,
        rotation: 0,
        maintainAspectRatio: false,
        cutout: '75%',
        hover: { mode: null },
      }}
      data={chartData}
      plugins={[DonutCenterLogoPlugin]}
    />
  );
};
