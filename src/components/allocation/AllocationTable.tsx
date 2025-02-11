import { Table } from 'antd';
import React, { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';

const columns = [
  {
    title: 'Pool',
    dataIndex: 'pool',
    key: 'pool',
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
  },
  {
    title: 'APR',
    dataIndex: 'apr',
    key: 'apr',
  },
];

const mockDataSource = [
  {
    key: 'stable-USDC-USDT-Curve LP',
    pool: ['USDC', 'USDT'],
    details: 'Curve LP',
    apr: 4.5,
  },
  {
    key: 'stable-DAI-USDC-Aave lending',
    pool: ['DAI', 'USDC'],
    details: 'Aave lending',
    apr: 3.8,
  },
  {
    key: 'eth-stETH-rETH-Balancer pool',
    pool: ['stETH', 'rETH'],
    details: 'Balancer pool',
    apr: 5.2,
  },
];

export const AllocationTable = () => {
  const { data } = usePortfolio();

  // Use mock data when real data is not available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dataSource = useMemo(
    () =>
      data?.allocations.map(({ type, assets, details, apr }) => ({
        key: `${type}-${assets.join('-')}-${details}`,
        pool: `${assets.join(', ')}`,
        details: `${details}`,
        apr: `${apr}%`,
      })), // || mockDataSource,
    [data?.allocations],
  );

  return (
    <Table
      style={{ width: '100%' }}
      columns={columns}
      dataSource={mockDataSource}
    />
  );
};
