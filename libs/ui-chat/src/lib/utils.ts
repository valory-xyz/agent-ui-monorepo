import { notification } from 'antd';

import { EachChat } from './types';

type HandleChatErrorParams = {
  error: Error;
  chats: EachChat[];
};

type HandleChatErrorResult = {
  updatedChats: EachChat[];
  restoredText: string;
} | null;

export const handleChatError = ({ error, chats }: HandleChatErrorParams): HandleChatErrorResult => {
  notification.error({ message: error?.message || 'Failed to send chat.' });

  // Check if we need to rollback
  const lastChat = chats[chats.length - 1];
  if (!lastChat || !lastChat.text || lastChat.type !== 'user') {
    return null;
  }

  // Return rollback state
  if (typeof lastChat.text === 'string') {
    return {
      updatedChats: chats.slice(0, -1),
      restoredText: lastChat.text,
    };
  }

  return null;
};
