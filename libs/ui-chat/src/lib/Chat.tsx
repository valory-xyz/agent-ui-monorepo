import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Typography } from 'antd';
import { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';

import { LOGO_MAP } from './constants';
import { ChatSize, EachChat } from './types';
import { AgentType } from './types';
import { ViewChats } from './ViewChats';

const { TextArea } = Input;
const { Title } = Typography;

const commonBtnStyles: CSSProperties = { position: 'absolute', top: 8, right: 8 };

const TextAreaContainer = styled(Flex)`
  position: relative;
  width: 100%;
  border-radius: 8px;
`;

const getPlaceholder = (agentType: AgentType) => {
  if (agentType === 'agentsFun') {
    return "Describe the agent's persona";
  }
  return 'Give the agent custom guidance';
};

const getLogoSize = (agentType: AgentType) => {
  if (agentType === 'agentsFun') {
    return { width: 48, height: 48 };
  }
  return { width: 80, height: 80 };
};

const getContainerStyles = (agentType: AgentType) => {
  if (agentType === 'agentsFun') {
    return { width: '100%', height: 96 };
  }
  return { width: '100%', height: 300, margin: '16px 0' };
};

const EmptyChat = ({ agentType }: { agentType: AgentType }) => (
  <Flex align="center" justify="center" style={getContainerStyles(agentType)}>
    <img src={LOGO_MAP[agentType]} alt="Update agent’s goal" style={getLogoSize(agentType)} />
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
    if (agentType === 'trader') {
      return {
        ...commonBtnStyles,
        color: GLOBAL_COLORS.BLACK,
        background: GLOBAL_COLORS.WHITE,
      };
    }

    if (agentType === 'polymarket_trader') {
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
      <Title level={4} className="m-0 font-normal" type={type}>
        Update agent's goal
      </Title>

      {chats.length === 0 ? (
        <EmptyChat agentType={agentType} />
      ) : (
        <ViewChats size={size} agentType={agentType} chats={chats} />
      )}

      <TextAreaContainer className="agent-chat-input">
        <TextArea
          value={currentText}
          onChange={(e) => onCurrentTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={3}
          placeholder={getPlaceholder(agentType)}
          style={{
            resize: 'none',
            paddingRight: 64,
            fontSize: size === 'large' ? 16 : 14,
            borderColor:
              agentType === 'polymarket_trader' ? GLOBAL_COLORS.WHITE_TRANSPARENT_10 : undefined,
          }}
        />
        <Button
          loading={isLoading}
          onClick={onSend}
          type="primary"
          icon={<ArrowLeftOutlined style={{ rotate: '90deg' }} />}
          style={btnStyle}
        />
      </TextAreaContainer>
    </>
  );
};
