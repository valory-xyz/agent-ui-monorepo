import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, notification } from 'antd';
import React, { useCallback, useState } from 'react';

import { COLOR } from '../../constants/colors';
import { CardTitle } from '../../ui/CardTitle';
import { DisplayAllChats, EachChat } from './DisplayAllChats';
import { OperatingProtocols, TradingStrategy } from './SystemChat';
import { useChats } from './useChats';

const { TextArea } = Input;
const commonChatStyles = { height: 300, margin: '16px 0' };

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
  const [chats, setChats] = useState<EachChat[]>([]);

  const { isPending: isSendingChat, mutateAsync: onSendChat } = useChats();

  // Send chat to the agent
  const handleSend = useCallback(async () => {
    if (!currentText) return;

    setChats([...chats, { text: currentText, type: 'user' as const }]);
    setCurrentText('');

    onSendChat(currentText, {
      onSuccess: (data) => {
        setChats((prevChats) => {
          const chats = [...prevChats];

          if (data.reasoning) {
            chats.push({ type: 'agent', text: data.reasoning });
          }

          if (data.trading_type) {
            chats.push({
              type: 'system' as const,
              text: (
                <TradingStrategy
                  from={data.previous_trading_type}
                  to={data.trading_type}
                />
              ),
            });
          }

          if (data.selected_protocols && data.selected_protocols.length > 0) {
            chats.push({
              type: 'system' as const,
              text: <OperatingProtocols protocols={data.selected_protocols} />,
            });
          }

          return chats;
        });
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
      {chats.length === 0 ? <EmptyChat /> : <DisplayAllChats chats={chats} />}

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
