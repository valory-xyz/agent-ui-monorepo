import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Typography } from 'antd';

import { EachChat } from './types';
import { ViewChats } from './ViewChats';
import { AgentType } from './types';
import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';

import modiusLogo from '../assets/modius-chat.png';
import optimusLogo from '../assets/optimus-chat.png';
import traderLogo from '../assets/predict-chat.png';

const { TextArea } = Input;
const { Title } = Typography;

const commonChatStyles = { height: 300, margin: '16px 0' };

const logoMap: Record<AgentType, string> = {
  modius: modiusLogo,
  optimus: optimusLogo,
  predict: traderLogo,
};

const EmptyChat = ({ agentType }: { agentType: AgentType }) => (
  <Flex align="center" justify="center" style={commonChatStyles}>
    <img src={logoMap[agentType]} alt="Update agent’s goal" style={{ width: 80, height: 80 }} />
  </Flex>
);

type ChatProps = {
  type?: 'secondary';
  agentType: AgentType;
  isLoading: boolean;
  currentText: string;
  chats: EachChat[];
  onCurrentTextChange: (text: string) => void;
  onSend: () => void;
};

/**
 * Chat component for user to interact with the agent.
 */
export const Chat = ({
  type,
  agentType,
  isLoading,
  currentText,
  chats,
  onCurrentTextChange,
  onSend,
}: ChatProps) => {
  return (
    <>
      <Title level={4} style={{ margin: 0 }} type={type}>
        Update agent’s goal
      </Title>

      {chats.length === 0 ? (
        <EmptyChat agentType={agentType} />
      ) : (
        <ViewChats agentType={agentType} chats={chats} />
      )}

      <Flex style={{ position: 'relative', width: '100%' }} className="agent-chat-input">
        <TextArea
          value={currentText}
          onChange={(e) => onCurrentTextChange(e.target.value)}
          rows={4}
          placeholder="Give the agent custom guidance"
          style={{ resize: 'none', paddingRight: 64 }}
        />
        <Button
          loading={isLoading}
          onClick={onSend}
          type="primary"
          icon={<ArrowLeftOutlined style={{ rotate: '90deg' }} />}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: agentType === 'modius' ? GLOBAL_COLORS.black : GLOBAL_COLORS.white,
          }}
        />
      </Flex>
    </>
  );
};
