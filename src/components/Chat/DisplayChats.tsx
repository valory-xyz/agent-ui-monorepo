import { Flex } from 'antd';
import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { COLOR } from '../../constants/colors';

const chatStyles = { height: 360, margin: '16px 0' };

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

const Chat = ({ chat, isFirst }: { chat: EachChat; isFirst: boolean }) => {
  const isUser = chat.type === 'user';
  const isAgent = chat.type === 'agent';
  const isSystem = chat.type === 'system';

  const chatLogo = useMemo(() => {
    if (isAgent) return <AgentChatLogo />;
    if (isSystem) return <EmptyLogo />;
    return null;
  }, [isAgent, isSystem]);

  const styles = useMemo(() => {
    const commonStyles: CSSProperties = {
      width: '100%',
      marginTop: isFirst ? 0 : 12,
    };

    return {
      ...commonStyles,
      ...(isUser && {
        padding: 8,
        width: '60%',
        alignSelf: 'flex-end',
        borderRadius: '8px 8px 4px 8px',
        backgroundColor: COLOR.darkGrey,
        color: COLOR.white,
      }),
      ...(isAgent && { alignSelf: 'flex-start' }),
      ...(isSystem && { borderRadius: 8, marginTop: isFirst ? 0 : 8 }),
    };
  }, [isUser, isAgent, isSystem, isFirst]);

  return (
    <Flex vertical style={{ ...styles }}>
      <Flex gap={16}>
        {chatLogo}
        {chat.text}
      </Flex>
    </Flex>
  );
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
      style={{ ...chatStyles, overflow: 'auto' }}
    >
      {chats.map((chat, index) => (
        <Chat key={index} chat={chat} isFirst={index === 0} />
      ))}
    </Flex>
  );
};
