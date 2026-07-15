import { Select } from 'antd';

import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { ConnectSettings, Harness } from '../../types';
import { Section } from '../../ui/Section';

const HARNESS_OPTIONS: { value: Harness; label: string }[] = [
  { value: 'claude_code_desktop', label: 'Claude Desktop' },
  { value: 'claude_code_cli', label: 'Claude Code CLI' },
];

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
        loading={isPending}
        onChange={(value) => mutate({ harness: value })}
        popupMatchSelectWidth={false}
      />
    </Section>
  );
};
