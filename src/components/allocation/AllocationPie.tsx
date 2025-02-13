import { PieChartOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { ArcElement, Chart as ChartJS } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { usePortfolio } from '../../hooks/usePortfolio';
import { DonutCenterLogoPlugin } from '../../utils/chartjs/donut-center-plugin';
import { piePalette } from '../../utils/chartjs/palette';

// Register the ArcElement
ChartJS.register(ArcElement);

export const AllocationPie = () => {
  const { data } = usePortfolio();

  if (!data) {
    return (
      <Skeleton.Node
        style={{ width: 200, height: 200, borderRadius: '100%' }}
        active
      >
        <PieChartOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
      </Skeleton.Node>
    );
  }

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
      data={{
        labels: data.allocations.map((allocation) => allocation.type),
        datasets: [
          {
            data: data.allocations.map((allocation) => allocation.ratio),
            backgroundColor: piePalette,
          },
        ],
      }}
      plugins={[DonutCenterLogoPlugin]}
    />
  );
};
