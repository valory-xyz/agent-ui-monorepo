import { Select } from 'antd';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { ConnectSettings, Harness } from '../../types';
import { Section } from '../../ui/Section';

const HARNESS_OPTIONS: { value: Harness; label: string }[] = [
  { value: 'claude_code_desktop', label: 'Claude Desktop' },
  { value: 'claude_code_cli', label: 'Claude Code CLI' },
];

// Filled, rounded gray control per Figma — no border, subtle gray fill that
// darkens on hover, 36px tall (Select `controlHeight` token in theme.ts).
const StyledSelect = styled(Select<Harness>)`
  width: max-content;

  .ant-select-selector {
    border-radius: 10px !important;
    background-color: ${COLOR.SELECT_BG} !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .ant-select-selection-item {
    font-size: 14px;
  }

  &:hover .ant-select-selector {
    background-color: ${COLOR.SELECT_BG_HOVER} !important;
  }

  .ant-select-arrow {
    color: ${COLOR.SELECT_ARROW};
  }
`;

type CodingToolProps = {
  settings: ConnectSettings;
};

export const CodingTool = ({ settings }: CodingToolProps) => {
  // The harness is a plain preference — PATCH /settings needs no password
  // for it (only the `protected` object is password-gated).
  const { mutate, isPending } = useUpdateSettings();

  return (
    <Section title="Coding tool" description="Choose where you run your Connect agent.">
      <StyledSelect
        variant="filled"
        value={settings.harness}
        options={HARNESS_OPTIONS}
        loading={isPending}
        onChange={(value) => mutate({ harness: value })}
        popupMatchSelectWidth={false}
        popupClassName="connect-harness-popup"
      />
    </Section>
  );
};
