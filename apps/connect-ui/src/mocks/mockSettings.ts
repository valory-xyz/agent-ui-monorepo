import {
  ConnectSettings,
  HarnessOption,
  HarnessUnavailableReason,
  SessionResponse,
  SettingsPatch,
} from '../types';

// The three states "OCB CLI" can be in; swap one into the mock state below to
// see it. It ships as model_unavailable until its chat mechs are confirmed.
export const MOCK_OCB_OPTIONS: Record<'available' | HarnessUnavailableReason, HarnessOption> = {
  available: { id: 'ocb_cli', available: true },
  windows_unsupported: {
    id: 'ocb_cli',
    available: false,
    unavailable_reason: 'windows_unsupported',
  },
  model_unavailable: {
    id: 'ocb_cli',
    available: false,
    unavailable_reason: 'model_unavailable',
  },
};

// Mirrors pearl-connect's default_whitelist(): the Mech Marketplace on each
// supported chain, from mech_client/configs/mechs.json.
const mockSettingsState: Required<ConnectSettings> = {
  protected: {
    mode: 'restricted',
    whitelist: {
      gnosis: ['0x735faab1c4ec41128c367afb5c3bac73509f70bb'],
      base: ['0xf24ee42eda0fc9b33b7d41b06ee8ccd2ef7c5020'],
      polygon: ['0x343f2b005cf6d70ba610cd9f1f1927049414b582'],
      optimism: ['0x46c0d07f55d4f9b5eed2fc9680b5953e5fd7b461'],
    },
  },
  harness: 'claude_code_desktop',
  harnesses: [
    { id: 'claude_code_desktop', available: true },
    { id: 'claude_code_cli', available: true },
    { id: 'codex_desktop', available: true },
    { id: 'codex_cli', available: true },
    MOCK_OCB_OPTIONS.model_unavailable,
  ],
};

export const getMockSettings = (): ConnectSettings => ({
  protected: {
    mode: mockSettingsState.protected.mode,
    whitelist: { ...mockSettingsState.protected.whitelist },
  },
  harness: mockSettingsState.harness,
  harnesses: mockSettingsState.harnesses.map((option) => ({ ...option })),
});

// Stateful so changes survive the query invalidation refetch in mock mode.
export const applyMockSettingsPatch = (patch: SettingsPatch): ConnectSettings => {
  if (patch.harness) mockSettingsState.harness = patch.harness;
  if (patch.protected?.mode) mockSettingsState.protected.mode = patch.protected.mode;
  return getMockSettings();
};

export const mockSessionResponse: SessionResponse = {
  launched: true,
  harness: 'claude_code_desktop',
};
