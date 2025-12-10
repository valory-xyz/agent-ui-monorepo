import type { TableProps } from 'antd';
import { Tag, Typography } from 'antd';
import { Table } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { Card } from '../components/ui/Card';
import { COLOR } from '../constants/theme';
import { usePredictionHistory } from '../hooks/usePredictionHistory';
import { PredictionHistoryItem } from '../types';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

const PredictionHistoryCard = styled(Card)`
  .ant-table {
    background: transparent;
    .ant-table-thead {
      .ant-table-cell {
        padding: 8px 16px;
        background: ${COLOR.WHITE_TRANSPARENT_5};
        border-bottom: none;
        &:first-child {
          border-bottom-left-radius: 8px;
        }
        &:last-child {
          border-bottom-right-radius: 8px;
        }
        &::before {
          background: transparent !important;
        }
      }
    }
    .ant-table-tbody {
      .ant-table-cell {
        padding: 8px 16px;
        border-color: ${COLOR.WHITE_TRANSPARENT_10} !important;
      }
      .ant-table-row:last-child .ant-table-cell {
        border-bottom: none;
      }
    }
  }
`;

const columns: TableProps<PredictionHistoryItem>['columns'] = [
  {
    title: 'Market',
    dataIndex: 'market',
    key: 'market',
    width: '60%',
    render: (market: PredictionHistoryItem['market']) => (
      <Text className="text-sm" type="secondary">
        {market.title}
      </Text>
    ),
  },
  {
    title: 'Prediction',
    dataIndex: 'prediction_side',
    key: 'prediction_side',
    width: '20%',
    render: (side: PredictionHistoryItem['prediction_side']) => (
      <Text className="text-sm" type="secondary">
        {side === 'yes' ? 'Yes' : 'No'}
      </Text>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '20%',
    render: (text) => (
      <Tag bordered={false} color="magenta">
        Lost $0.025
      </Tag>
    ),
  },
];

export const PredictionHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoading, data } = usePredictionHistory({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <PredictionHistoryCard $gap="24px">
      <Title level={4} className="m-0 font-normal">
        Prediction History
      </Title>

      <Table<PredictionHistoryItem>
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading}
        locale={{ emptyText: 'No data available.' }}
        rowHoverable={false}
      />
    </PredictionHistoryCard>
  );
};
