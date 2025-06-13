import { LockOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import React from 'react';

import { COLOR } from '../../constants/colors';
import { CardTitle } from '../../ui/CardTitle';

const { Text } = Typography;

/**
 * Component to display when chat is locked.
 */
export const UnlockChat = () => {
  return (
    <Card className="card-border card-gradient">
      <CardTitle text="Update agent’s goal" />

      <Flex
        vertical
        align="center"
        justify="center"
        gap={24}
        style={{ height: 240, margin: '16px 0' }}
      >
        <LockOutlined style={{ fontSize: 48, color: COLOR.mediumGrey }} />
        <Text
          type="secondary"
          style={{ fontSize: 16, maxWidth: '75%', textAlign: 'center' }}
        >
          Add your Gemini API key in Agent Settings on the Pearl Home screen to
          unlock this feature.
        </Text>
      </Flex>
    </Card>
  );
};
