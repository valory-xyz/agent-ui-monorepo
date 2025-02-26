import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { COLOR } from '../../constants/colors';
import { mockChatList } from '../../mocks/mockChat';
import { CardTitle } from '../../ui/CardTitle';

const { TextArea } = Input;
const CHAT_WINDOW_HEIGHT = 300;
const commonChatStyles = { height: CHAT_WINDOW_HEIGHT, margin: '16px 0' };

/**
 * - Display agent’s messages
 * - Display trading strategy
 * - Display operating protocols
 */

const EmptyChat = () => (
  <Flex align="center" justify="center" style={commonChatStyles}>
    <img
      src="/logos/modius-chat.png"
      alt="Update agent’s goal"
      style={{ width: 80, height: 80 }}
    />
  </Flex>
);

type EachChat = {
  text: string;
  type: 'user' | 'agent';
};

const DisplayChats = ({ chats }: { chats: EachChat[] }) => {
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
      style={{
        ...commonChatStyles,
        overflow: 'auto',
        // flexDirection: 'column-reverse',
      }}
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
              {isUser ? null : (
                <img
                  src="/logos/modius-chat.png"
                  alt="Modius"
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                />
              )}
              {chat.text}
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};

/**
 * Chat component for user to interact with the agent.
 */
export const Chat = () => {
  const [currentText, setCurrentText] = useState('');
  const [chats, setChats] = useState<EachChat[]>(mockChatList as EachChat[]);

  const handleSend = useCallback(() => {
    setChats([...chats, { text: currentText, type: 'user' }]);
    setCurrentText('');
  }, [chats, currentText]);

  return (
    <Card className="card-border card-gradient">
      <CardTitle text="Update agent’s goal" />
      {chats.length === 0 ? <EmptyChat /> : <DisplayChats chats={chats} />}

      <Flex style={{ position: 'relative', width: '100%' }}>
        <TextArea
          rows={4}
          style={{ resize: 'none', paddingRight: 64 }}
          placeholder="Give the agent custom guidance"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        />
        <Button
          type="primary"
          // loading
          icon={<ArrowLeftOutlined style={{ rotate: '90deg' }} />}
          onClick={handleSend}
          style={{ position: 'absolute', top: 8, right: 8, color: COLOR.black }}
        />
      </Flex>
    </Card>
  );
};
