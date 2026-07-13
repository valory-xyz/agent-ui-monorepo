import { ConnectSettings, SessionResponse, SettingsPatch } from '../types';

const mockSettingsState: ConnectSettings = {
  protected: {
    mode: 'restricted',
    whitelist: {
      gnosis: ['0x4554fe75c1f5576c1d7f765b2a036c199adae329'],
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
  if (patch.protected?.whitelist) {
    mockSettingsState.protected.whitelist = patch.protected.whitelist;
  }
  return getMockSettings();
};

export const mockSessionResponse: SessionResponse = {
  launched: true,
  harness: 'claude_code_desktop',
};
