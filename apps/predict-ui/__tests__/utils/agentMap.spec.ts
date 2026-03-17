// agentMap.ts reads process.env at module load time, so we use
// jest.resetModules() + dynamic require() to test different env shapes.

describe('agentMap', () => {
  const originalName = process.env.REACT_APP_AGENT_NAME;

  afterAll(() => {
    process.env.REACT_APP_AGENT_NAME = originalName;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('sets agentType to omenstrat_trader when env var matches', () => {
    process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';

    const { agentType, isOmenstratAgent, isPolystratAgent } = require('../../src/utils/agentMap');
    expect(agentType).toBe('omenstrat_trader');
    expect(isOmenstratAgent).toBe(true);
    expect(isPolystratAgent).toBe(false);
  });

  it('sets agentType to polystrat_trader when env var matches', () => {
    process.env.REACT_APP_AGENT_NAME = 'polystrat_trader';

    const { agentType, isOmenstratAgent, isPolystratAgent } = require('../../src/utils/agentMap');
    expect(agentType).toBe('polystrat_trader');
    expect(isOmenstratAgent).toBe(false);
    expect(isPolystratAgent).toBe(true);
  });

  it('defaults to omenstrat_trader when env var is invalid (BUG-001 fix)', () => {
    process.env.REACT_APP_AGENT_NAME = 'invalid_agent';

    const { agentType } = require('../../src/utils/agentMap');
    expect(agentType).toBe('omenstrat_trader');
  });

  it('defaults to omenstrat_trader when env var is undefined (BUG-001 fix)', () => {
    delete process.env.REACT_APP_AGENT_NAME;

    const { agentType } = require('../../src/utils/agentMap');
    expect(agentType).toBe('omenstrat_trader');
  });

  it('does not throw when env var is missing (BUG-001 regression)', () => {
    delete process.env.REACT_APP_AGENT_NAME;

    expect(() => require('../../src/utils/agentMap')).not.toThrow();
  });
});
