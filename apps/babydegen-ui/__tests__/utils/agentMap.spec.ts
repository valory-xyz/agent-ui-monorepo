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

  it('sets agentType to "basius" when env var is "basius"', () => {
    process.env.REACT_APP_AGENT_NAME = 'basius';

    const { agentType, agentName, agentChainName } = require('../../src/utils/agentMap');
    expect(agentType).toBe('basius');
    expect(agentName).toBe('Basius');
    expect(agentChainName).toBe('base');
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

  describe('normalizeProtocol', () => {
    it('maps velodrome to aerodrome for basius', () => {
      process.env.REACT_APP_AGENT_NAME = 'basius';

      const { normalizeProtocol } = require('../../src/utils/agentMap');
      expect(normalizeProtocol('velodrome')).toBe('aerodrome');
    });

    it('leaves other protocols untouched for basius', () => {
      process.env.REACT_APP_AGENT_NAME = 'basius';

      const { normalizeProtocol } = require('../../src/utils/agentMap');
      expect(normalizeProtocol('balancerPool')).toBe('balancerPool');
      expect(normalizeProtocol('uniswapV3')).toBe('uniswapV3');
      expect(normalizeProtocol('aerodrome')).toBe('aerodrome');
    });

    it('leaves velodrome untouched for modius', () => {
      process.env.REACT_APP_AGENT_NAME = 'modius';

      const { normalizeProtocol } = require('../../src/utils/agentMap');
      expect(normalizeProtocol('velodrome')).toBe('velodrome');
    });

    it('leaves velodrome untouched for optimus', () => {
      process.env.REACT_APP_AGENT_NAME = 'optimus';

      const { normalizeProtocol } = require('../../src/utils/agentMap');
      expect(normalizeProtocol('velodrome')).toBe('velodrome');
    });
  });

  describe('normalizeDetails', () => {
    it('relabels velodrome case-insensitively for basius', () => {
      process.env.REACT_APP_AGENT_NAME = 'basius';

      const { normalizeDetails } = require('../../src/utils/agentMap');
      expect(normalizeDetails('Velodrome pool')).toBe('Aerodrome pool');
      expect(normalizeDetails('velodrome CL pool')).toBe('Aerodrome CL pool');
    });

    it('leaves details without velodrome untouched for basius', () => {
      process.env.REACT_APP_AGENT_NAME = 'basius';

      const { normalizeDetails } = require('../../src/utils/agentMap');
      expect(normalizeDetails('Balancer pool')).toBe('Balancer pool');
    });

    it('leaves details untouched for modius', () => {
      process.env.REACT_APP_AGENT_NAME = 'modius';

      const { normalizeDetails } = require('../../src/utils/agentMap');
      expect(normalizeDetails('Velodrome pool')).toBe('Velodrome pool');
    });

    it('leaves details untouched for optimus', () => {
      process.env.REACT_APP_AGENT_NAME = 'optimus';

      const { normalizeDetails } = require('../../src/utils/agentMap');
      expect(normalizeDetails('Velodrome pool')).toBe('Velodrome pool');
    });
  });
});
