import { Flex } from 'antd';
import React, { CSSProperties, ReactNode, useEffect, useRef } from 'react';

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

const EmptyLogo = () => <div style={{ width: 32 }} />;

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
      style={{ ...commonChatStyles, overflow: 'auto' }}
    >
      {chats.map((chat, index) => {
        const isUser = chat.type === 'user';
        const isAgent = chat.type === 'agent';
        const isSystem = chat.type === 'system';

        const chatLogo = () => {
          if (isAgent) return <AgentChatLogo />;
          if (isSystem) return <EmptyLogo />;
          return null;
        };

        const getStyles = () => {
          const commonStyles: CSSProperties = {
            width: '100%',
            marginTop: 12,
          };
          if (isUser) {
            commonStyles.padding = 8;
            commonStyles.borderRadius = '8px 8px 4px 8px';
            commonStyles.backgroundColor = COLOR.darkGrey;
            commonStyles.color = 'white';
            commonStyles.width = '60%';
            commonStyles.alignSelf = 'flex-end';
          } else if (isAgent) {
            commonStyles.alignSelf = 'flex-start';
          } else if (isSystem) {
            commonStyles.borderRadius = 8;
            commonStyles.marginTop = 4;
          }

          if (index === 0) {
            commonStyles.marginTop = 0;
          }

          return commonStyles;
        };

        return (
          <Flex key={index} vertical style={{ ...getStyles() }}>
            <Flex gap={16}>
              {chatLogo()}
              {chat.text}
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
