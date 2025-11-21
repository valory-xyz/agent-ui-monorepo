import {
  Chat as UiChat,
  type EachChat,
  handleChatError,
  useChats,
} from '@agent-ui-monorepo/ui-chat';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useCallback, useState } from 'react';

import { mockChat } from '../../mocks/mock';
import { ChatResponse } from '../../types';
import { Card } from '../ui/Card';

export const Chat = () => {
  const queryClient = useQueryClient();
  const [notificationApi, contextHolder] = notification.useNotification();

  const [currentText, setCurrentText] = useState('');
  const [chats, setChats] = useState<EachChat[]>([]);

  const { isPending: isSendingChat, mutateAsync: onSendChat } = useChats<ChatResponse>(mockChat);

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
        const rollback = handleChatError({ error, chats: updatedChats });
        if (rollback) {
          setChats(rollback.updatedChats);
          setCurrentText(rollback.restoredText);
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
