import { Flex } from 'antd';
import { CSSProperties, useEffect, useMemo, useRef } from 'react';

import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { AgentType, EachChat } from './types';

import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const chatStyles = { height: 360, margin: '16px 0', overflow: 'auto' };

const AgentChatLogo = ({ agentType }: { agentType: AgentType }) => (
  <img
    src={`/logos/${agentType}-chat.png`}
    alt={`${agentType} chat logo`}
    style={{ width: 32, height: 32, borderRadius: 16 }}
  />
);

const components: Components = {
  ul: ({ children }) => <ul style={{ paddingLeft: 24, margin: '4px 0 8px 0' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 24, margin: '4px 0 8px 0' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
} as const;

export const ChatMarkdown = ({ className, children }: { className?: string; children: string }) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
      {children}
    </ReactMarkdown>
  </div>
);

type ViewEachChatProps = { chat: EachChat; isFirst: boolean; agentType: AgentType };
const ViewEachChat = ({ chat, isFirst, agentType }: ViewEachChatProps) => {
  const isUser = chat.type === 'user';
  const isAgent = chat.type === 'agent';
  const isSystem = chat.type === 'system';

  const chatLogo = useMemo(() => {
    if (isAgent) return <AgentChatLogo agentType={agentType} />;
    if (isSystem) return <div style={{ width: 32 }} />;
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

type ViewChatsProps = { chats: EachChat[] } & Pick<ViewEachChatProps, 'agentType'>;

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
        <ViewEachChat key={index} chat={chat} isFirst={index === 0} agentType={agentType} />
      ))}
    </Flex>
  );
};
