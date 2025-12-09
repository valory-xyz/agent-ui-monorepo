import type { TableProps } from 'antd';
import { Flex, Spin, Typography } from 'antd';
import { Space, Table, Tag } from 'antd';

import { Card } from '../components/ui/Card';
import { NoDataContainer } from '../components/ui/NoDataContainer';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
      <Flex gap="small" align="center" wrap>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </Flex>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

export const PredictionHistory = () => {
  const isLoading = false;

  return (
    <Card>
      <Title level={4} className="m-0 font-normal">
        Prediction History
      </Title>

      {isLoading ? (
        <NoDataContainer>
          <Spin />
        </NoDataContainer>
      ) : data.length === 0 ? (
        <NoDataContainer>
          <Text>No data available</Text>
        </NoDataContainer>
      ) : (
        <Table<DataType> columns={columns} dataSource={data} />
      )}
    </Card>
  );
};
