import { Alert, Flex, Typography } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { ConnectSettings, TransactionMode as Mode } from '../../types';
import { Section } from '../../ui/Section';
import { PasswordModal } from '../PasswordModal/PasswordModal';

const { Text } = Typography;

const MODES: { value: Mode; title: string; description: string }[] = [
  {
    value: 'restricted',
    title: 'Restricted',
    description: 'Agent can only send funds to whitelisted addresses.',
  },
  {
    value: 'unrestricted',
    title: 'Unrestricted',
    description: 'Agent can send funds to any recipient address.',
  },
];

const MODAL_COPY: Record<Mode, { title: string; body: string; confirm: string }> = {
  unrestricted: {
    title: 'Switch to Unrestricted mode?',
    body: 'Your agent will be able to send funds to any address. We recommend funding it with only what it needs.',
    confirm: 'Switch to Unrestricted',
  },
  restricted: {
    title: 'Switch to Restricted mode?',
    body: 'Your agent will only be able to send funds to approved addresses.',
    confirm: 'Switch to Restricted',
  },
};

const ModeCard = styled.button<{ $selected: boolean }>`
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  text-align: left;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  border: 1px solid ${({ $selected }) => ($selected ? '#D3ADF7' : '#E4E4E4')};
  background-color: ${({ $selected }) => ($selected ? '#F9F0FF' : 'transparent')};
`;

const RadioDot = styled.span<{ $selected: boolean }>`
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border-radius: 50%;
  background-color: white;
  border: ${({ $selected }) => ($selected ? '5px solid #7E22CE' : '1px solid #D9D9D9')};
`;

type TransactionModeProps = {
  settings: ConnectSettings;
};

export const TransactionMode = ({ settings }: TransactionModeProps) => {
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);

  const handleSelect = (mode: Mode) => {
    if (mode === settings.protected.mode) return;
    setPendingMode(mode);
  };

  return (
    <Section
      title="Transaction mode"
      description="Defines the way your agent can interact with external web3 addresses."
    >
      <Flex vertical gap={16}>
        <Flex gap={12}>
          {MODES.map((mode) => {
            const isSelected = mode.value === settings.protected.mode;
            return (
              <ModeCard
                key={mode.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                $selected={isSelected}
                onClick={() => handleSelect(mode.value)}
              >
                <RadioDot $selected={isSelected} />
                <Flex vertical gap={4}>
                  <Text strong>{mode.title}</Text>
                  <Text type="secondary">{mode.description}</Text>
                </Flex>
              </ModeCard>
            );
          })}
        </Flex>
        {settings.protected.mode === 'unrestricted' && (
          <Alert
            type="info"
            showIcon
            message="Unrestricted mode is on"
            description="Your agent can send funds to any address. We recommend funding it with only what it needs."
          />
        )}
      </Flex>
      {pendingMode && (
        <PasswordModal
          title={MODAL_COPY[pendingMode].title}
          body={MODAL_COPY[pendingMode].body}
          confirmLabel={MODAL_COPY[pendingMode].confirm}
          patch={{ protected: { mode: pendingMode } }}
          onClose={() => setPendingMode(null)}
        />
      )}
    </Section>
  );
};
