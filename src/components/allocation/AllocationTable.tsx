import { Badge, Flex, Table, Typography } from 'antd';
import React, { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { mockDataSource } from '../../mock/mock-data-source';
import { piePalette } from '../../utils/chartjs/palette';
import { AllocationAssets } from './AllocationAssets';

const columns = [
  {
    title: 'Pool',
    dataIndex: 'pool',
    key: 'pool',
    render: (assets: string[], _record: unknown, index: number) => (
      <Flex gap={4} align="center">
        <Badge
          color={piePalette[Math.min(index, piePalette.length - 1)]}
          styles={{
            indicator: {
              width: 10,
              height: 10,
              boxShadow: '0px 0 1px rgb(0, 0, 0, 0.5)',
            },
          }}
        />
        <div style={{ paddingLeft: 32, display: 'flex' }}>
          <AllocationAssets assets={assets} />
        </div>
      </Flex>
    ),
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
    width: 100,
    render: (text: string) => <Typography.Text>{text}</Typography.Text>,
  },
  {
    title: 'APR',
    dataIndex: 'apr',
    key: 'apr',
    render: (text: string) => <Typography.Text>{text}%</Typography.Text>,
    width: 64,
  },
];

export const AllocationTable = () => {
  const { data, isFetched } = usePortfolio();

  const dataSource = useMemo(
    () =>
      data?.allocations?.map(({ type, assets, details, apr }) => ({
        key: `${type}-${assets.join('-')}-${details}`,
        pool: assets,
        details: `${details}`,
        apr: `${apr}%`,
      })),
    [data?.allocations],
  );

  if (!dataSource && isFetched) {
    return (
      <Typography.Text type="secondary">
        Modius has not yet allocated funds.
      </Typography.Text>
    );
  }

  return (
    <Table
      style={{ width: '100%' }}
      columns={columns}
      dataSource={mockDataSource}
      pagination={false}
    />
  );
};
