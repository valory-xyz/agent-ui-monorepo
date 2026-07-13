import { Flex, Select } from 'antd';

import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { ConnectSettings, Harness } from '../../types';
import { Section } from '../../ui/Section';

type HarnessOption = { value: Harness; label: string; icon: string };

const HARNESS_OPTIONS: HarnessOption[] = [
  { value: 'claude_code_desktop', label: 'Claude Desktop', icon: 'claude-desktop.svg' },
  { value: 'claude_code_cli', label: 'Claude Code CLI', icon: 'claude-cli.svg' },
];

const HARNESS_BY_VALUE = Object.fromEntries(
  HARNESS_OPTIONS.map((option) => [option.value, option]),
) as Record<Harness, HarnessOption>;

const ToolLabel = ({ option }: { option: HarnessOption }) => (
  <Flex align="center" gap={8} style={{ display: 'inline-flex' }}>
    <img src={`/logos/${option.icon}`} alt="" width={18} height={18} style={{ borderRadius: 4 }} />
    {option.label}
  </Flex>
);

type CodingToolProps = {
  settings: ConnectSettings;
};

export const CodingTool = ({ settings }: CodingToolProps) => {
  // The harness is a plain preference — PATCH /settings needs no password
  // for it (only the `protected` object is password-gated).
  const { mutate, isPending } = useUpdateSettings();

  return (
    <Section title="Coding tool" description="Choose where you run your Connect agent.">
      <Select<Harness>
        variant="filled"
        value={settings.harness}
        options={HARNESS_OPTIONS}
        optionRender={(option) => <ToolLabel option={option.data as HarnessOption} />}
        labelRender={(props) => <ToolLabel option={HARNESS_BY_VALUE[props.value as Harness]} />}
        loading={isPending}
        onChange={(value) => mutate({ harness: value })}
        popupMatchSelectWidth={false}
      />
    </Section>
  );
};
