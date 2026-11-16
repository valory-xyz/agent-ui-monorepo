import { Alert, Flex, Select, Typography } from 'antd';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import {
  ConnectSettings,
  Harness,
  HarnessOption,
  HarnessUnavailableReason,
} from '../../types';
import { Section } from '../../ui/Section';

// The server owns which harnesses exist and their order (GET /settings
// `harnesses`); this only names them. An id missing here is skipped.
const HARNESS_LABELS: Record<Harness, string> = {
  claude_code_desktop: 'Claude Desktop',
  claude_code_cli: 'Claude Code CLI',
  codex_desktop: 'Codex Desktop',
  codex_cli: 'Codex CLI',
  ocb_cli: 'OCB CLI',
};

const UNAVAILABLE_TEXT: Record<HarnessUnavailableReason, string> = {
  windows_unsupported: 'Not available on Windows yet',
  model_unavailable: 'Not available on this chain yet',
};

const toOption = ({ id, available, unavailable_reason }: HarnessOption) => {
  const label = HARNESS_LABELS[id];
  const reason = unavailable_reason && UNAVAILABLE_TEXT[unavailable_reason];
  return {
    value: id,
    disabled: !available,
    label: reason ? (
      <Flex vertical>
        <span>{label}</span>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {reason}
        </Typography.Text>
      </Flex>
    ) : (
      label
    ),
  };
};

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
  const { mutate, isPending, error, reset } = useUpdateSettings();
  const options = settings.harnesses
    .filter(({ id }) =>
      Object.prototype.hasOwnProperty.call(HARNESS_LABELS, id),
    )
    .map(toOption);

  return (
    <Section
      title="Coding tool"
      description="Choose where you run your Connect agent."
    >
      <Flex vertical align="flex-start" gap={12}>
        <StyledSelect
          variant="filled"
          value={settings.harness}
          options={options}
          loading={isPending}
          onChange={(value) => mutate({ harness: value })}
          popupMatchSelectWidth={false}
          popupClassName="connect-harness-popup"
        />
        {error && (
          <Alert
            type="error"
            showIcon
            closable
            onClose={reset}
            message={error.message}
          />
        )}
      </Flex>
    </Section>
  );
};
