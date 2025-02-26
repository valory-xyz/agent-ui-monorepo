import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input } from 'antd';
import React from 'react';

import { CardTitle } from '../../ui/CardTitle';

const { TextArea } = Input;

/**
 * - Textarea for user input
 * - Button to send message
 * - Display user’s messages
 * - Display agent’s messages
 * - Display trading strategy
 * - Display operating protocols
 * - Add appropriate scrollbars
 */

const EmptyChat = () => (
  <Flex align="center" justify="center" style={{ height: 300 }}>
    <img
      src="/logos/modius-chat.png"
      alt="Update agent’s goal"
      style={{ width: 80, height: 80 }}
    />
  </Flex>
);

/**
 * Chat component
 */
export const Chat = () => {
  return (
    <Card className="card-border card-gradient">
      <CardTitle text="Update agent’s goal" />
      <EmptyChat />
      <Flex style={{ position: 'relative', width: '100%' }}>
        <TextArea
          rows={4}
          style={{ resize: 'none', paddingRight: 64 }}
          placeholder="Give the agent custom guidance "
        />
        <Button
          type="primary"
          style={{ position: 'absolute', top: 8, right: 8 }}
        >
          <ArrowLeftOutlined style={{ rotate: '90deg' }} />
        </Button>
      </Flex>
    </Card>
  );
};
