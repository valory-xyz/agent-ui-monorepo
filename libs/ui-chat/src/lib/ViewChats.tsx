import { Flex } from 'antd';
import { CSSProperties, useEffect, useMemo, useRef } from 'react';

import { ChatMarkdown } from './ChatMarkdown';
import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { EachChat } from './types';

const chatStyles = { height: 360, margin: '16px 0', overflow: 'auto' };

type AgentType = 'modius' | 'optimus' | 'predict';

const AgentChatLogo = ({ agentType }: { agentType: AgentType }) => (
  <img
    src={`/logos/${agentType}-chat.png`}
    alt={`${agentType} chat logo`}
    style={{ width: 32, height: 32, borderRadius: 16 }}
  />
);

const EmptyLogo = () => <div style={{ width: 32 }} />;

type ChatProps = { chat: EachChat; isFirst: boolean; agentType: AgentType };
const Chat = ({ chat, isFirst, agentType }: ChatProps) => {
  const isUser = chat.type === 'user';
  const isAgent = chat.type === 'agent';
  const isSystem = chat.type === 'system';

  const chatLogo = useMemo(() => {
    if (isAgent) return <AgentChatLogo agentType={agentType} />;
    if (isSystem) return <EmptyLogo />;
    return null;
  }, [isAgent, isSystem, agentType]);

  const styles = useMemo(() => {
    const commonStyles: CSSProperties = {
      width: '100%',
      marginTop: isFirst ? 0 : 12,
    };

    const backgroundColor =
      agentType === 'predict' ? GLOBAL_COLORS.darkGrey : GLOBAL_COLORS.darkGrey;

    return {
      ...commonStyles,
      ...(isUser && {
        padding: 8,
        width: '60%',
        alignSelf: 'flex-end',
        borderRadius: '8px 8px 4px 8px',
        backgroundColor,
        color: GLOBAL_COLORS.white,
      }),
      ...(isAgent && { alignSelf: 'flex-start' }),
      ...(isSystem && { borderRadius: 8, marginTop: 8 }),
    };
  }, [isUser, isAgent, isSystem, isFirst, agentType]);

  return (
    <Flex vertical style={styles}>
      <Flex gap={16}>
        {chatLogo}
        {typeof chat.text === 'string' ? <ChatMarkdown>{chat.text}</ChatMarkdown> : chat.text}
      </Flex>
    </Flex>
  );
};

type ViewChatsProps = { chats: EachChat[] } & Pick<ChatProps, 'agentType'>;

/**
 * Chat component to display messages.
 */
export const ViewChats = ({ agentType, chats }: ViewChatsProps) => {
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
        <Chat key={index} chat={chat} isFirst={index === 0} agentType={agentType} />
      ))}
    </Flex>
  );
};
