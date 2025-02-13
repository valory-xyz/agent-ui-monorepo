import { Modal, ModalProps, Table } from 'antd';
import React, { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';

const columns = [
  {
    title: 'Token',
    dataIndex: 'asset',
    key: 'asset',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Exposure',
    dataIndex: 'ratio',
    key: 'ratio',
  },
];

export const BreakdownModal = (props: ModalProps) => {
  const { data } = usePortfolio();

  const dataSource = useMemo(() => {
    if (!data) {
      return null;
    }

    // create object to sum balances from all

    return data?.['portfolio-breakdown']?.map(
      ({ asset, balance, price, ratio }) => ({
        key: asset,
        asset,
        price,
        amount: balance,
        ratio,
      }),
    );
  }, [data]);

  return (
    <Modal title="Portfolio breakdown" footer={null} closable={true} {...props}>
      <Table columns={columns} dataSource={dataSource} />
    </Modal>
  );
};
