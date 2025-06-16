import { InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Flex, Modal, ModalProps, Table, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';

const { Text } = Typography;

const columns = [
  {
    title: 'Token',
    dataIndex: 'asset',
    key: 'asset',
    render: (asset: string) => (
      <Flex gap={2} align="center">
        <Avatar
          src={`/logos/tokens/${asset.toLowerCase()}.png`}
          alt={asset}
          style={{ width: 20, height: 20, marginRight: 8 }}
        />
        <Text>{asset}</Text>
      </Flex>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number) => (
      <Text style={{ display: 'block', textAlign: 'right' }}>
        {Intl.NumberFormat('en-US').format(amount)}
      </Text>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (price: number) => (
      <Text style={{ display: 'block', textAlign: 'right' }}>
        $
        {Intl.NumberFormat('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(price)}
      </Text>
    ),
  },
  {
    title: (
      <Flex align="center" justify="end" gap={8}>
        Exposure
        <Tooltip title="The percentage of the total portfolio value that each token holding represents.">
          <InfoCircleOutlined size={12} color="secondary" />
        </Tooltip>
      </Flex>
    ),
    dataIndex: 'ratio',
    key: 'ratio',
    render: (ratio: number) => (
      <Text style={{ display: 'block', textAlign: 'right' }}>
        {Intl.NumberFormat('en-US', {
          style: 'percent',
          maximumFractionDigits: 4,
          minimumFractionDigits: 0,
        }).format(ratio)}
      </Text>
    ),
  },
];

export const BreakdownModal = (props: ModalProps) => {
  const { data } = usePortfolio();

  const dataSource = useMemo(() => {
    if (!data) return null;

    // create object to sum balances from all
    return data?.portfolio_breakdown?.map(({ asset, balance, price, ratio }) => ({
      key: asset,
      asset,
      price,
      amount: balance,
      ratio,
    }));
  }, [data]);

  return (
    <Modal title="Portfolio breakdown" footer={null} closable={true} {...props}>
      {dataSource ? (
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      ) : (
        <Flex justify="center" align="middle" style={{ height: 200 }}>
          <Text type="secondary">No data available.</Text>
        </Flex>
      )}
    </Modal>
  );
};
