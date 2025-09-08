import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Typography } from 'antd';
import { CSSProperties, useMemo } from 'react';

import { LOGO_MAP } from './constants';
import { ChatSize, EachChat } from './types';
import { AgentType } from './types';
import { ViewChats } from './ViewChats';

const { TextArea } = Input;
const { Title } = Typography;

const commonChatStyles: CSSProperties = { height: 300, margin: '16px 0' };
const commonBtnStyles: CSSProperties = { position: 'absolute', top: 8, right: 8 };

const EmptyChat = ({ agentType }: { agentType: AgentType }) => (
  <Flex align="center" justify="center" style={commonChatStyles}>
    <img src={LOGO_MAP[agentType]} alt="Update agent’s goal" style={{ width: 80, height: 80 }} />
  </Flex>
);

type ChatProps = {
  isLoading: boolean;
  currentText: string;
  chats: EachChat[];
  onCurrentTextChange: (text: string) => void;
  onSend: () => void;
  agentType: AgentType;
  type?: 'secondary';
  size?: ChatSize;
};

/**
 * Chat component for user to interact with the agent.
 */
export const Chat = ({
  isLoading,
  currentText,
  chats,
  onCurrentTextChange,
  onSend,
  agentType,
  type,
  size = 'small',
}: ChatProps) => {
  const btnStyle = useMemo(() => {
    if (agentType === 'predict') {
      return {
        ...commonBtnStyles,
        color: GLOBAL_COLORS.BLACK,
        background: GLOBAL_COLORS.WHITE,
      };
    }

    if (agentType === 'modius') {
      return { ...commonBtnStyles, color: GLOBAL_COLORS.BLACK };
    }

    return { ...commonBtnStyles, color: GLOBAL_COLORS.WHITE };
  }, [agentType]);

  return (
    <>
      <Title level={4} style={{ margin: 0 }} type={type}>
        Update agent’s goal
      </Title>

      {chats.length === 0 ? (
        <EmptyChat agentType={agentType} />
      ) : (
        <ViewChats size={size} agentType={agentType} chats={chats} />
      )}

      <Flex style={{ position: 'relative', width: '100%' }} className="agent-chat-input">
        <TextArea
          value={currentText}
          onChange={(e) => onCurrentTextChange(e.target.value)}
          rows={4}
          placeholder="Give the agent custom guidance"
          style={{
            resize: 'none',
            paddingRight: 64,
            fontSize: size === 'large' ? 16 : 14,
          }}
        />
        <Button
          loading={isLoading}
          onClick={onSend}
          type="primary"
          icon={<ArrowLeftOutlined style={{ rotate: '90deg' }} />}
          style={btnStyle}
        />
      </Flex>
    </>
  );
};
