import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, notification } from 'antd';
import React, { useCallback, useState } from 'react';

import { COLOR } from '../../constants/colors';
import { mockChatList } from '../../mocks/mockChat';
import { CardTitle } from '../../ui/CardTitle';
import { DisplayChats, EachChat } from './DisplayChats';
import { useChats } from './useChats';

const { TextArea } = Input;
const CHAT_WINDOW_HEIGHT = 300;
const commonChatStyles = { height: CHAT_WINDOW_HEIGHT, margin: '16px 0' };

/**
 * - Display agent’s messages
 * - Display trading strategy
 * - Display operating protocols
 */

const EmptyChat = () => (
  <Flex align="center" justify="center" style={commonChatStyles}>
    <img
      src="/logos/modius-chat.png"
      alt="Update agent’s goal"
      style={{ width: 80, height: 80 }}
    />
  </Flex>
);

/**
 * Chat component for user to interact with the agent.
 */
export const Chat = () => {
  const [currentText, setCurrentText] = useState('');
  const [chats, setChats] = useState<EachChat[]>(mockChatList as EachChat[]); // TODO: remove dummy

  const { isPending: isSendingChat, mutateAsync: onSendChat } = useChats();
  const handleSend = useCallback(async () => {
    if (!currentText) return;

    setChats([...chats, { text: currentText, type: 'user' as const }]);
    setCurrentText('');

    // Send chat to agent
    onSendChat(currentText, {
      onSuccess: (data) => {
        setChats((prevChats) => [
          ...prevChats,
          { text: data.reasoning, type: 'agent' as const },
        ]);
      },
      onError: (error) => {
        notification.error({
          message: error?.message || 'Failed to send chat.',
        });
      },
    });
  }, [chats, currentText, onSendChat]);

  return (
    <Card className="card-border card-gradient">
      <CardTitle text="Update agent’s goal" />
      {chats.length === 0 ? <EmptyChat /> : <DisplayChats chats={chats} />}

      <Flex style={{ position: 'relative', width: '100%' }}>
        <TextArea
          rows={4}
          style={{ resize: 'none', paddingRight: 64 }}
          placeholder="Give the agent custom guidance"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        />
        <Button
          type="primary"
          loading={isSendingChat}
          icon={<ArrowLeftOutlined style={{ rotate: '90deg' }} />}
          onClick={handleSend}
          style={{ position: 'absolute', top: 8, right: 8, color: COLOR.black }}
        />
      </Flex>
    </Card>
  );
};
