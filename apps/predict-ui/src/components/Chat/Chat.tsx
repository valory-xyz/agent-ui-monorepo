import { notification } from 'antd';
import { useCallback, useState } from 'react';

import { TradingStrategy } from './SystemChat';
import { useChats } from './useChats';
import { type EachChat, Chat as UiChat } from '@agent-ui-monorepo/ui-chat';
import { CardV2 } from '../ui/Card';

export const Chat = () => {
  const [notificationApi, contextHolder] = notification.useNotification();

  const [currentText, setCurrentText] = useState('');
  const [chats, setChats] = useState<EachChat[]>([]);

  const { isPending: isSendingChat, mutateAsync: onSendChat } = useChats();

  // Send chat to the agent
  const handleSend = useCallback(async () => {
    if (!currentText || currentText.trim().length === 0) return;

    const updatedChats = [...chats, { text: currentText, type: 'user' as const }];
    setChats(updatedChats);
    setCurrentText('');

    onSendChat(currentText, {
      onSuccess: (data) => {
        setChats((prevChats) => {
          const chatsAfterConfig = [...prevChats];

          if (data.reasoning) {
            chatsAfterConfig.push({ type: 'agent' as const, text: data.reasoning });
          }

          if (data.previous_trading_type && data.trading_type) {
            chatsAfterConfig.push({
              type: 'system' as const,
              text: <TradingStrategy from={data.previous_trading_type} to={data.trading_type} />,
            });
          }

          return chatsAfterConfig;
        });
      },
      onError: (error) => {
        notificationApi.error({ message: 'Failed to send chat, please try again.' });

        // Remove the last chat if it was the one that failed to send
        const lastChat = updatedChats[updatedChats.length - 1];
        if (!lastChat || !lastChat.text) return;

        if (lastChat.type !== 'user') return;

        // Remove the last chat and restore the current text
        setChats(updatedChats.slice(0, -1));
        if (typeof lastChat.text === 'string') {
          setCurrentText(lastChat.text);
        }
      },
    });
  }, [chats, currentText, onSendChat, notificationApi]);

  return (
    <CardV2>
      <UiChat
        isLoading={isSendingChat}
        currentText={currentText}
        chats={chats}
        onCurrentTextChange={setCurrentText}
        onSend={handleSend}
        agentType="predict"
        size="large"
      />
      {contextHolder}
    </CardV2>
  );
};
