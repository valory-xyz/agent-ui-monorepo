import { Card, notification } from 'antd';
import { useCallback, useState } from 'react';

import { agentType } from '../../utils/agentMap';
import { OperatingProtocols, TradingStrategy } from './SystemChat';
import { useChats } from './useChats';
import { EachChat, Chat as UiChat } from '@agent-ui-monorepo/ui-chat';

export const Chat = () => {
  const [currentText, setCurrentText] = useState('');
  const [chats, setChats] = useState<EachChat[]>([]);

  const { isPending: isSendingChat, mutateAsync: onSendChat } = useChats();

  // Send chat to the agent
  const handleSend = useCallback(async () => {
    if (!currentText || currentText.trim().length === 0) return;

    setChats([...chats, { text: currentText, type: 'user' as const }]);
    setCurrentText('');

    onSendChat(currentText, {
      onSuccess: (data) => {
        setChats((prevChats) => {
          const chats = [...prevChats];

          if (data.reasoning) {
            chats.push({ type: 'agent' as const, text: data.reasoning });
          }

          if (data.previous_trading_type && data.trading_type) {
            chats.push({
              type: 'system' as const,
              text: <TradingStrategy from={data.previous_trading_type} to={data.trading_type} />,
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
    <Card className="card-gradient">
      <UiChat
        type="secondary"
        agentType={agentType}
        isLoading={isSendingChat}
        currentText={currentText}
        chats={chats}
        onCurrentTextChange={setCurrentText}
        onSend={handleSend}
      />
    </Card>
  );
};
