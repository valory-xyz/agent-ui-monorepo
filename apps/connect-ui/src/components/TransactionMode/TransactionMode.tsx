import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Flex } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { ConnectSettings, TransactionMode as Mode } from '../../types';
import { Section } from '../../ui/Section';
import { PasswordModal } from '../PasswordModal/PasswordModal';

const MODES: { value: Mode; title: string; description: string }[] = [
  {
    value: 'restricted',
    title: 'Restricted',
    description: 'Agent can only interact with whitelisted addresses.',
  },
  {
    value: 'unrestricted',
    title: 'Unrestricted',
    description: 'Agent can interact with any recipient address.',
  },
];

const MODAL_COPY: Record<Mode, { title: string; body: string; confirm: string }> = {
  unrestricted: {
    title: 'Switch to Unrestricted mode?',
    body: 'Your agent will be able to send funds to any address. Consider only funding it with what it needs.',
    confirm: 'Switch to Unrestricted',
  },
  restricted: {
    title: 'Switch to Restricted mode?',
    body: 'Your agent will only be able to send funds to approved addresses.',
    confirm: 'Switch to Restricted',
  },
};

// Mirrors the Pearl app's blue info alert (.custom-alert--info).
const UnrestrictedOnAlert = styled(Alert)`
  padding: 12px;
  align-items: flex-start;
  background-color: ${COLOR.INFO_BG};
  border: 1px solid ${COLOR.INFO_BORDER};

  .ant-alert-icon {
    font-size: 20px;
    color: ${COLOR.INFO_ICON};
  }

  .ant-alert-message {
    margin-bottom: 4px;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: ${COLOR.INFO_TEXT};
  }

  .ant-alert-description {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: ${COLOR.INFO_TEXT};
  }
`;

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
  border: 1px solid ${({ $selected }) => ($selected ? COLOR.MODE_SELECTED_BORDER : COLOR.BORDER)};
  background-color: ${({ $selected }) => ($selected ? COLOR.MODE_SELECTED_BG : 'transparent')};
`;

const RadioDot = styled.span<{ $selected: boolean }>`
  flex: none;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border-radius: 50%;
  background-color: white;
  border: ${({ $selected }) =>
    $selected ? `5px solid ${COLOR.PRIMARY}` : `1px solid ${COLOR.RADIO_BORDER}`};
`;

// Card title — 14px / 500 / 20px (no <strong>, per design).
const ModeTitle = styled.span`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_PRIMARY};
`;

// Card hint — 14px / 400 / 20px, rgba(97, 112, 132, 1).
const ModeDescription = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_TERTIARY};
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
                  <ModeTitle>{mode.title}</ModeTitle>
                  <ModeDescription>{mode.description}</ModeDescription>
                </Flex>
              </ModeCard>
            );
          })}
        </Flex>
        {settings.protected.mode === 'unrestricted' && (
          <UnrestrictedOnAlert
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message="Unrestricted mode is on"
            description="Your agent can send funds to any address. Consider only funding it with what it needs."
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
