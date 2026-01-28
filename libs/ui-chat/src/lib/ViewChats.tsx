import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { Flex } from 'antd';
import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { LOGO_MAP } from './constants';
import { AgentType, ChatSize, EachChat } from './types';

const chatStyles = { width: '100%', height: 360, overflow: 'auto' };

const AgentChatLogo = ({ agentType }: { agentType: AgentType }) => (
  <img
    src={LOGO_MAP[agentType]}
    alt={`${agentType} chat logo`}
    style={{ width: 32, height: 32, borderRadius: 16 }}
  />
);

type ChatMarkdownProps = { size: ChatSize; className?: string; children: string };
const ChatMarkdown = ({ size, className, children }: ChatMarkdownProps) => {
  const listStyles: CSSProperties = {
    paddingLeft: 24,
    margin: size === 'large' ? '8px 0 8px 0' : '4px 0 8px 0',
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          ul: ({ children }) => <ul style={listStyles}>{children}</ul>,
          ol: ({ children }) => <ol style={listStyles}>{children}</ol>,
          li: ({ children }) => (
            <li style={{ marginBottom: size === 'large' ? 8 : 4 }}>{children}</li>
          ),
          p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

type ViewEachChatProps = {
  chat: EachChat;
  isFirst: boolean;
  agentType: AgentType;
  size: ChatSize;
};
const ViewEachChat = ({ chat, isFirst, agentType, size }: ViewEachChatProps) => {
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
      marginTop: isFirst ? 0 : size === 'large' ? 24 : 12,
    };

    const backgroundStyles: CSSProperties = (() => {
      if (agentType === 'polystrat_trader' || agentType === 'omenstrat_trader') {
        return {
          background: GLOBAL_COLORS.WHITE_TRANSPARENT_10,
          backdropFilter: 'blur(10px)',
        };
      }
      if (agentType === 'agentsFun') {
        return { background: GLOBAL_COLORS.NEUTRAL_GRAY };
      }
      return { background: GLOBAL_COLORS.DARK_GRAY };
    })();

    return {
      ...commonStyles,
      ...(isUser && {
        padding: 8,
        width: '60%',
        alignSelf: 'flex-end',
        borderRadius: '8px 8px 4px 8px',
        color: GLOBAL_COLORS.WHITE,
        ...backgroundStyles,
      }),
      ...(isAgent && { alignSelf: 'flex-start' }),
      ...(isSystem && { borderRadius: 8, marginTop: size === 'large' ? 16 : 8 }),
    };
  }, [isUser, isAgent, isSystem, isFirst, agentType, size]);

  return (
    <Flex vertical style={styles}>
      <Flex gap={16}>
        {chatLogo}
        {typeof chat.text === 'string' ? (
          <ChatMarkdown size={size}>{chat.text}</ChatMarkdown>
        ) : (
          chat.text
        )}
      </Flex>
    </Flex>
  );
};

type ViewChatsProps = { chats: EachChat[] } & Pick<ViewEachChatProps, 'agentType' | 'size'>;

export const ViewChats = ({ chats, agentType, size }: ViewChatsProps) => {
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
    <Flex
      ref={chatContainerRef}
      vertical
      style={{ ...chatStyles, margin: size === 'large' ? '24px 0' : '16px 0' }}
    >
      {chats.map((chat, index) => (
        <ViewEachChat
          size={size}
          key={index}
          chat={chat}
          isFirst={index === 0}
          agentType={agentType}
        />
      ))}
    </Flex>
  );
};
