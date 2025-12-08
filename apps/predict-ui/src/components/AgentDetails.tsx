import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { Col, Flex, Row, Typography } from 'antd';

import { Card } from '../components/ui/Card';
import { getTimeAgo } from '../utils/time';

const { Text } = Typography;

const getTime = (isoString?: string) => {
  if (!isoString) return null;
  const date = new Date(isoString).getTime();
  return getTimeAgo(date);
};

type AgentDetailsProps = {
  createdAt?: string;
  lastActiveAt?: string;
};

export const AgentDetails = ({ createdAt, lastActiveAt }: AgentDetailsProps) => (
  <Card $padding="16px 32px">
    <Row gutter={24} align="middle" justify="space-between" className="m-0">
      <Col lg={12} sm={12} xs={24} className="p-0">
        <Flex gap={12}>
          <Text type="secondary">Created:</Text>
          <Text>{createdAt ? getTime(createdAt) : NA}</Text>
        </Flex>
      </Col>
      <Col lg={12} sm={12} xs={24} className="p-0">
        <Flex gap={12}>
          <Text type="secondary">Last active:</Text>
          <Text>{lastActiveAt ? getTime(lastActiveAt) : NA}</Text>
        </Flex>
      </Col>
    </Row>
  </Card>
);
