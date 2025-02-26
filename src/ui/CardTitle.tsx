import { Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

export const CardTitle = ({ text }: { text: string }) => (
  <Title level={4} style={{ marginBottom: 0, marginTop: 8 }} type="secondary">
    {text}
  </Title>
);
