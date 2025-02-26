import { Flex } from 'antd';
import React, { ReactNode, useEffect, useRef } from 'react';

import { COLOR } from '../../constants/colors';

const CHAT_WINDOW_HEIGHT = 300;
const commonChatStyles = { height: CHAT_WINDOW_HEIGHT, margin: '16px 0' };

/**
 * - Display agent’s messages
 * - Display trading strategy
 * - Display operating protocols
 */

const AgentChatLogo = () => (
  <img
    src="/logos/modius-chat.png"
    alt="Modius"
    style={{ width: 32, height: 32, borderRadius: 16 }}
  />
);

export type EachChat = {
  text: string | ReactNode;
  type: 'user' | 'agent' | 'system';
};

/**
 * Chat component to display messages
 */
export const DisplayChats = ({ chats }: { chats: EachChat[] }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  return (
    <Flex
      ref={chatContainerRef}
      vertical
      gap={12}
      style={{ ...commonChatStyles, overflow: 'auto' }}
    >
      {chats.map((chat, index) => {
        const isUser = chat.type === 'user';
        return (
          <Flex
            key={index}
            vertical
            style={{
              padding: isUser ? 8 : 0,
              borderRadius: '8px 8px 4px 8px',
              backgroundColor: isUser ? COLOR.darkGrey : 'inherit',
              color: isUser ? 'white' : COLOR.black,
              maxWidth: isUser ? '60%' : '100%',
              alignSelf: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            <Flex gap={16}>
              {isUser ? null : <AgentChatLogo />}
              {chat.text}
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
