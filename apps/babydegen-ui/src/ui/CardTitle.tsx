import { Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

export const CardTitle = ({ text }: { text: string }) => (
  <Title level={4} style={{ margin: 0 }} type="secondary">
    {text}
  </Title>
);
