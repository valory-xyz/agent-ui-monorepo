import { Alert, Button, Flex } from 'antd';
import styled from 'styled-components';

import { useNewSession } from '../../hooks/useNewSession';
import { Section } from '../../ui/Section';

const GradientDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b57bff 0%, #4e5de4 100%);
  vertical-align: -2px;
`;

export const GetStarted = () => {
  const { mutate, isPending, error, reset } = useNewSession();

  return (
    <Section
      title="Get started with Connect"
      description="Work with your Connect agent from your coding tool."
    >
      <Flex vertical align="flex-start" gap={12}>
        <Button icon={<GradientDot />} loading={isPending} onClick={() => mutate()}>
          New Connect Session
        </Button>
        {error && <Alert type="error" showIcon closable onClose={reset} message={error.message} />}
      </Flex>
    </Section>
  );
};
