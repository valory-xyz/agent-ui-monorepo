// agentMap.ts reads process.env at module load time, so we use
// jest.resetModules() + dynamic require() to test different env shapes.

describe('agentMap (babydegen-ui)', () => {
  const originalName = process.env.REACT_APP_AGENT_NAME;

  afterAll(() => {
    process.env.REACT_APP_AGENT_NAME = originalName;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('sets agentType to "modius" when env var is "modius"', () => {
    process.env.REACT_APP_AGENT_NAME = 'modius';

    const { agentType, agentName, agentChainName } = require('../../src/utils/agentMap');
    expect(agentType).toBe('modius');
    expect(agentName).toBe('Modius');
    expect(agentChainName).toBe('mode');
  });

  it('defaults to "optimus" for any other value', () => {
    process.env.REACT_APP_AGENT_NAME = 'optimus';

    const { agentType, agentName, agentChainName } = require('../../src/utils/agentMap');
    expect(agentType).toBe('optimus');
    expect(agentName).toBe('Optimus');
    expect(agentChainName).toBe('optimism');
  });

  it('defaults to "optimus" when env var is undefined', () => {
    delete process.env.REACT_APP_AGENT_NAME;

    const { agentType } = require('../../src/utils/agentMap');
    expect(agentType).toBe('optimus');
  });

  it('does not throw for any env var value', () => {
    process.env.REACT_APP_AGENT_NAME = 'unknown_agent';

    expect(() => require('../../src/utils/agentMap')).not.toThrow();
  });
});
