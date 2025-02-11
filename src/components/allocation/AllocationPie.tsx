import { ArcElement, Chart as ChartJS } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

// Register the ArcElement
ChartJS.register(ArcElement);

export const AllocationPie = () => {
  return (
    <Doughnut
      width={200}
      height={200}
      options={{
        responsive: false,
        maintainAspectRatio: false,
      }}
      data={{
        labels: ['Stocks', 'Bonds', 'Cash'],
        datasets: [
          {
            data: [60, 30, 10],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      }}
    />
  );
};
