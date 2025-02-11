import { Table } from 'antd';
import React, { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { mockDataSource } from '../../mock/mock-data-source';

const columns = [
  {
    title: 'Pool',
    dataIndex: 'pool',
    key: 'pool',
    render: (text: string[]) => <span>{text.join('/')}</span>,
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
    render: (text: string) => <span>{text}%</span>,
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
        pool: assets,
        details: `${details}`,
        apr: `${apr}%`,
      })), // || mockDataSource,
    [data?.allocations],
  );

  return (
    <Table
      bordered
      style={{ width: '100%' }}
      columns={columns}
      dataSource={mockDataSource}
      pagination={false}
    />
  );
};
