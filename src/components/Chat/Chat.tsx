import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, notification, Typography } from 'antd';
import React, { CSSProperties, ReactNode, useCallback, useState } from 'react';

import { COLOR } from '../../constants/colors';
import {
  protocolImageMap,
  protocolMap,
  tradingTypeMap,
} from '../../constants/textMaps';
import { mockChatList } from '../../mocks/mockChat';
import { SelectedProtocol, TradingType } from '../../types';
import { CardTitle } from '../../ui/CardTitle';
import { Pill } from '../../ui/Pill';
import { DisplayChats, EachChat } from './DisplayChats';
import { useChats } from './useChats';

const { Text } = Typography;
const { TextArea } = Input;
const CHAT_WINDOW_HEIGHT = 300;
const commonChatStyles = { height: CHAT_WINDOW_HEIGHT, margin: '16px 0' };

const SystemContainerStyles: CSSProperties = {
  marginTop: 0,
  width: '100%',
  backgroundColor: COLOR.lightGrey,
  padding: '8px 16px',
  borderRadius: 8,
};

type SystemMessageProps = { label: string; children: ReactNode };
const SystemMessage = ({ label, children }: SystemMessageProps) => {
  return (
    <Flex align="center" gap={12} style={SystemContainerStyles}>
      <Text type="secondary">{label}</Text>
      {children}
    </Flex>
  );
};

type TradingStrategyProps = { from: TradingType; to: TradingType };
const TradingStrategy = ({ from, to }: TradingStrategyProps) => {
  const getType = useCallback((type: TradingType) => {
    if (type === 'balanced') return 'primary';
    if (type === 'risky') return 'danger';
    return undefined;
  }, []);

  return (
    <SystemMessage label="Trading strategy updated:">
      <Pill type={getType(from)} size="large" style={{ marginLeft: 0 }}>
        {tradingTypeMap[from]}
      </Pill>
      {to && (
        <>
          <ArrowRightOutlined />
          <Pill type={getType(to)} size="large" style={{ marginLeft: 0 }}>
            {tradingTypeMap[to]}
          </Pill>
        </>
      )}
    </SystemMessage>
  );
};

type OperatingProtocolsProps = { protocol: SelectedProtocol };
const OperatingProtocols = ({ protocol }: OperatingProtocolsProps) => {
  return (
    <SystemMessage label="Operating protocols excluded:">
      <Pill size="large" style={{ marginLeft: 0 }}>
        <img
          src={protocolImageMap[protocol]}
          alt={protocol}
          style={{ width: 24, height: 24 }}
        />
        {protocolMap[protocol]}
      </Pill>
    </SystemMessage>
  );
};

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

/**
 * Chat component for user to interact with the agent.
 */
export const Chat = () => {
  const [currentText, setCurrentText] = useState('');
  const [chats, setChats] = useState<EachChat[]>(mockChatList as EachChat[]); // TODO: remove dummy

  const { isPending: isSendingChat, mutateAsync: onSendChat } = useChats();
  const handleSend = useCallback(async () => {
    if (!currentText) return;

    setChats([...chats, { text: currentText, type: 'user' as const }]);
    setCurrentText('');

    // Send chat to agent
    onSendChat(currentText, {
      onSuccess: (data) => {
        setChats((prevChats) => [
          ...prevChats,
          { type: 'agent' as const, text: data.reasoning },
          {
            type: 'system' as const,
            text: (
              <TradingStrategy
                from={data.previous_trading_type}
                to={data.trading_type}
              />
            ),
          },
          {
            type: 'system' as const,
            text: <OperatingProtocols protocol={data.selected_protocols[0]} />,
          },
        ]);
      },
      onError: (error) => {
        notification.error({
          message: error?.message || 'Failed to send chat.',
        });
      },
    });
  }, [chats, currentText, onSendChat]);

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
          loading={isSendingChat}
          icon={<ArrowLeftOutlined style={{ rotate: '90deg' }} />}
          onClick={handleSend}
          style={{ position: 'absolute', top: 8, right: 8, color: COLOR.black }}
        />
      </Flex>
    </Card>
  );
};
