import {
  Chat as UiChat,
  type EachChat,
  handleChatError,
  useChats,
} from '@agent-ui-monorepo/ui-chat';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useCallback, useState } from 'react';

import { REACT_QUERY_KEYS } from '../../constants/reactQueryKeys';
import { mockChat } from '../../mocks/mockChat';
import { ChatResponse } from '../../types';
import { CardV2 } from '../ui/Card';
import { TradingStrategy } from './SystemChat';

export const Chat = () => {
  const queryClient = useQueryClient();
  const [, contextHolder] = notification.useNotification();

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
        queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.AGENT_DETAILS] });

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
        const rollback = handleChatError({ error, chats: updatedChats });
        if (rollback) {
          setChats(rollback.updatedChats);
          setCurrentText(rollback.restoredText);
        }
      },
    });
  }, [chats, currentText, onSendChat, queryClient]);

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
