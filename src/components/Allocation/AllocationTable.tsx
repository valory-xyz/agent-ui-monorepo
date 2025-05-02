import { Avatar, Badge, BadgeProps, Flex, Table, Typography } from 'antd';
import React, { useMemo } from 'react';

import { PROTOCOLS_MAP } from '../../constants/textMaps';
import { usePortfolio } from '../../hooks/usePortfolio';
import { SelectedProtocol } from '../../types';
import { piePalette } from '../../utils/chartjs/palette';
import { AssetBadges } from './AllocationAssets';

const { Text } = Typography;

type AllocationRow = {
  key: string;
  pool: string[];
  details: string;
  apr: string;
  type: SelectedProtocol;
};

const badgeStyles: BadgeProps['styles'] = {
  indicator: {
    width: 10,
    height: 10,
    boxShadow: '0px 0 1px rgb(0, 0, 0, 0.5)',
  },
};

const columns = [
  {
    title: 'Pool',
    dataIndex: 'pool',
    key: 'pool',
    render: (assets: string[], record: AllocationRow, index: number) => (
      <Flex gap={6} align="center">
        <Badge
          color={piePalette[Math.min(index, piePalette.length - 1)]}
          styles={badgeStyles}
        />
        <Flex>
          <Avatar size={24} src={PROTOCOLS_MAP[record.type].logo} />
        </Flex>
        <Flex style={{ paddingLeft: 28 }}>
          <AssetBadges assets={assets} />
        </Flex>
      </Flex>
    ),
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
    width: 100,
    render: (text: string) => <Text>{text}</Text>,
  },
  {
    title: 'APR',
    dataIndex: 'apr',
    key: 'apr',
    render: (text: string) => (
      <Text style={{ textAlign: 'right', display: 'block' }}>{text}%</Text>
    ),
    width: 75,
  },
];

export const AllocationTable = () => {
  const { data, isLoading } = usePortfolio();

  const dataSource = useMemo(
    () =>
      data?.allocations?.map(({ type, assets, details, apr }) => ({
        key: `${type}-${assets.join('-')}-${details}`,
        pool: assets,
        details: `${details}`,
        apr: `${apr}`,
        type,
      })),
    [data?.allocations],
  );

  return (
    <Table<AllocationRow>
      style={{ width: '100%' }}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      loading={isLoading}
    />
  );
};
