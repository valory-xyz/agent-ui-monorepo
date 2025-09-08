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

  const { isPending: isSendingChat, mutateAsync: onSendChat, ...rest } = useChats();
  console.log({ isSendingChat, rest });

  // Send chat to the agent
  const handleSend = useCallback(async () => {
    if (!currentText || currentText.trim().length === 0) return;

    setChats([...chats, { text: currentText, type: 'user' as const }]);
    setCurrentText('');

    try {
      const data = await onSendChat(currentText);
      console.log({ data });
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

        return chats;
      });
    } catch (error) {
      console.error({ error });
      // message.error('Failed to send chat, please try again.');
      notificationApi.error({ message: 'Failed to send chat, please try again.' });

      console.log({ chats, currentText });
      // Remove the last chat if it was the one that failed to send
      const lastChat = chats[chats.length - 1];
      if (!lastChat || !lastChat.text) return;

      console.log({ lastChat });

      if (lastChat.type !== 'user') return;

      // Remove the last chat and restore the current text
      setChats((prevChats) => prevChats.slice(0, -1));
      if (typeof lastChat.text === 'string') {
        setCurrentText(lastChat.text);
      }
    }
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
