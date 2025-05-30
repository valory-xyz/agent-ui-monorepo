import { Flex } from 'antd';
import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { COLOR } from '../../constants/colors';
import { Markdown } from '../../ui/Markdown';
import { agentName, agentType } from '../../utils/agentMap';

const chatStyles = { height: 360, margin: '16px 0', overflow: 'auto' };

const AgentChatLogo = () => (
  <img
    src={`/logos/${agentType}-chat.png`}
    alt={`${agentName} chat logo`}
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
      ...(isSystem && { borderRadius: 8, marginTop: 8 }),
    };
  }, [isUser, isAgent, isSystem, isFirst]);

  return (
    <Flex vertical style={styles}>
      <Flex gap={16}>
        {chatLogo}
        {typeof chat.text === 'string' ? (
          <Markdown>{chat.text}</Markdown>
        ) : (
          chat.text
        )}
      </Flex>
    </Flex>
  );
};

/**
 * Chat component to display messages
 */
export const DisplayAllChats = ({ chats }: { chats: EachChat[] }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        const { scrollHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTop = scrollHeight;
      }
    }, 0);
  }, [chats]);

  return (
    <Flex ref={chatContainerRef} vertical style={chatStyles}>
      {chats.map((chat, index) => (
        <Chat key={index} chat={chat} isFirst={index === 0} />
      ))}
    </Flex>
  );
};
