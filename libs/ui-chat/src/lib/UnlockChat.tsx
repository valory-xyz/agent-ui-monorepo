import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { LockOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';

const { Text, Title } = Typography;

type UnlockChatProps = {
  type?: 'secondary';
  iconColor?: string;
};

/**
 * Component to display when chat is locked.
 */
export const UnlockChat = ({ type, iconColor = GLOBAL_COLORS.MEDIUM_GRAY }: UnlockChatProps) => {
  return (
    <>
      <Title level={4} className="m-0 font-normal" type={type}>
        Update agent's goal
      </Title>

      <Flex
        vertical
        align="center"
        justify="center"
        gap={24}
        style={{ height: 240, margin: '16px 0', width: '100%' }}
      >
        <LockOutlined style={{ fontSize: 48, color: iconColor }} />
        <Text type="secondary" style={{ fontSize: 16, maxWidth: 360, textAlign: 'center' }}>
          Add your Gemini API key in Agent Settings on the Pearl Home screen to unlock this feature.
        </Text>
      </Flex>
    </>
  );
};
