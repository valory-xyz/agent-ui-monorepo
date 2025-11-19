import { Chat as UiChat, type EachChat } from '@agent-ui-monorepo/ui-chat';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useCallback, useState } from 'react';

import { Card } from '../ui/Card';
import { useChats } from './useChats';

export const Chat = () => {
  const queryClient = useQueryClient();
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
        // refetch the latest data
        queryClient.invalidateQueries({ queryKey: ['agentInfo'] });

        setChats((prevChats) => {
          const chatsAfterConfig = [...prevChats];

          if (data.reasoning) {
            chatsAfterConfig.push({ type: 'agent' as const, text: data.reasoning });
          }

          return chatsAfterConfig;
        });
      },
      onError: (error) => {
        notificationApi.error({ message: error?.message || 'Failed to send chat.' });

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
  }, [chats, currentText, onSendChat, notificationApi, queryClient]);

  return (
    <Card>
      <UiChat
        isLoading={isSendingChat}
        currentText={currentText}
        chats={chats}
        onCurrentTextChange={setCurrentText}
        onSend={handleSend}
        agentType="agentsFun"
        size="small"
      />
      {contextHolder}
    </Card>
  );
};
