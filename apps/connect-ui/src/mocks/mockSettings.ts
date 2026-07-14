import { ConnectSettings, SessionResponse, SettingsPatch } from '../types';

// Mirrors pearl-connect's default_whitelist(): the Mech Marketplace on each
// supported chain, from mech_client/configs/mechs.json.
const mockSettingsState: ConnectSettings = {
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
};

export const getMockSettings = (): ConnectSettings => ({
  protected: {
    mode: mockSettingsState.protected.mode,
    whitelist: { ...mockSettingsState.protected.whitelist },
  },
  harness: mockSettingsState.harness,
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
