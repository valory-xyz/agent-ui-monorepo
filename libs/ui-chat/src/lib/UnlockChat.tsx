import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { LockOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';

const { Text, Title } = Typography;

/**
 * Component to display when chat is locked.
 */
export const UnlockChat = ({ type }: { type?: 'secondary' }) => {
  return (
    <>
      <Title level={4} style={{ margin: 0 }} type={type}>
        Update agent’s goal
      </Title>

      <Flex
        vertical
        align="center"
        justify="center"
        gap={24}
        style={{ height: 240, margin: '16px 0', width: '100%' }}
      >
        <LockOutlined style={{ fontSize: 48, color: GLOBAL_COLORS.MEDIUM_GRAY }} />
        <Text type="secondary" style={{ fontSize: 16, maxWidth: 360, textAlign: 'center' }}>
          Add your Gemini API key in Agent Settings on the Pearl Home screen to unlock this feature.
        </Text>
      </Flex>
    </>
  );
};
