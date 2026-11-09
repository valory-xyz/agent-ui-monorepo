// theme.ts picks its colour set from agentMap, which reads process.env at module
// load time, so each agent shape needs a fresh module registry.

describe('COLOR danger zone colours', () => {
  const originalName = process.env.REACT_APP_AGENT_NAME;

  afterAll(() => {
    process.env.REACT_APP_AGENT_NAME = originalName;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('uses the Omenstrat pink pill and red button', () => {
    process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';

    const { COLOR } = require('../../src/constants/theme');
    expect(COLOR.DANGER_PILL_TEXT).toBe('#FF4D91');
    expect(COLOR.DANGER_PILL_BACKGROUND).toBe('rgba(255, 77, 145, 0.1)');
    expect(COLOR.DANGER_BUTTON).toBe('#E50058');
  });

  it('uses the Polystrat red pill and button', () => {
    process.env.REACT_APP_AGENT_NAME = 'polystrat_trader';

    const { COLOR } = require('../../src/constants/theme');
    expect(COLOR.DANGER_PILL_TEXT).toBe('#FF3355');
    expect(COLOR.DANGER_PILL_BACKGROUND).toBe('rgba(255, 51, 85, 0.2)');
    expect(COLOR.DANGER_BUTTON).toBe('#FF3355');
  });
});
